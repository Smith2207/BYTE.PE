"use server";

import { Preference } from "mercadopago";
import { auth } from "@/auth";
import { db } from "@/db";
import { getCuponPorCodigo, incrementarUso } from "@/lib/cupones/store";
import { validarCupon } from "@/lib/cupones/validar";
import { decrementarStock, getProductoPorId } from "@/lib/mock/repo";
import { getTarifaEnvioPorDepartamento } from "@/lib/mock/tarifas-envio";
import { getMercadoPagoClient } from "@/lib/mercadopago/client";
import {
  actualizarEstadoPedido,
  generarNumeroPedido,
  guardarPedido,
  type PedidoItemMock,
} from "@/lib/pedidos/store";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import { consultarDni, consultarRuc } from "@/lib/documento/apiperu";

const IGV = 0.18;

type ResultadoConsultaDocumento =
  | { ok: true; tipo: "dni"; nombre: string }
  | { ok: true; tipo: "ruc"; razonSocial: string }
  | { ok: false };

export async function consultarDocumentoAction(
  tipoDocumento: string,
  numeroDocumento: string,
): Promise<ResultadoConsultaDocumento> {
  if (tipoDocumento === "dni" && /^\d{8}$/.test(numeroDocumento)) {
    const resultado = await consultarDni(numeroDocumento);
    return resultado ? { ok: true, tipo: "dni", nombre: resultado.nombreCompleto } : { ok: false };
  }
  if (tipoDocumento === "ruc" && /^\d{11}$/.test(numeroDocumento)) {
    const resultado = await consultarRuc(numeroDocumento);
    return resultado ? { ok: true, tipo: "ruc", razonSocial: resultado.razonSocial } : { ok: false };
  }
  // Formato inválido (DNI sin 8 dígitos, RUC sin 11): se completa a mano.
  return { ok: false };
}

export async function validarCuponAction(codigo: string, subtotal: number) {
  const cupon = await getCuponPorCodigo(codigo);
  const resultado = validarCupon(cupon, { subtotal });
  return resultado;
}

export type ItemCarritoServidor = {
  productoId: string;
  varianteId: string | null;
  nombreProducto: string;
  varianteLabel?: string;
  cantidad: number;
  precioUnitario: number;
};

type ConfirmarPedidoInput = {
  checkout: CheckoutInput;
  items: ItemCarritoServidor[];
  cuponCodigo?: string;
};

/**
 * Valida stock/cupón, descuenta stock y guarda el pedido en estado
 * "pendiente". Lo comparten el flujo de pago manual (Yape/transferencia/
 * contra entrega) y el flujo de tarjeta vía Mercado Pago: ambos crean el
 * pedido primero; para tarjeta, el webhook lo pasa a "pagado" después.
 */
async function crearPedidoPendiente(input: ConfirmarPedidoInput) {
  const checkout = checkoutSchema.parse(input.checkout);
  const session = await auth();

  if (input.items.length === 0) {
    throw new Error("El carrito está vacío.");
  }

  // Recalculamos todo en el servidor: nunca confiar en los totales del cliente.
  const subtotal = input.items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);
  const igv = Math.round(subtotal * IGV * 100) / 100;

  let descuento = 0;
  let envioGratis = false;
  if (input.cuponCodigo) {
    const cupon = await getCuponPorCodigo(input.cuponCodigo);
    const resultado = validarCupon(cupon, { subtotal });
    if (!resultado.ok) throw new Error(resultado.motivo);
    descuento = resultado.descuento;
    envioGratis = resultado.envioGratis;
  }

  const tarifa = getTarifaEnvioPorDepartamento(checkout.direccion.departamento);
  const costoEnvio = envioGratis ? 0 : tarifa.costo;

  const total = Math.round((subtotal + igv + costoEnvio - descuento) * 100) / 100;

  const itemsPedido: PedidoItemMock[] = input.items.map((i) => ({
    productoId: i.productoId,
    varianteId: i.varianteId,
    nombreProducto: i.nombreProducto,
    varianteLabel: i.varianteLabel,
    cantidad: i.cantidad,
    precioUnitario: i.precioUnitario,
  }));

  // Todo en una sola transacción: si algo falla (sin stock, error al
  // guardar), no debe quedar stock descontado ni un cupón "gastado" sin
  // pedido real detrás.
  const numeroPedido = await db.transaction(async (tx) => {
    // Verificar stock disponible antes de confirmar (puede haber cambiado).
    for (const item of input.items) {
      const producto = await getProductoPorId(item.productoId);
      if (!producto || producto.stock < item.cantidad) {
        throw new Error(`"${item.nombreProducto}" ya no tiene stock suficiente.`);
      }
    }

    for (const item of input.items) {
      await decrementarStock(item.productoId, item.varianteId, item.cantidad, tx);
    }

    if (input.cuponCodigo) {
      await incrementarUso(input.cuponCodigo, tx);
    }

    const numeroPedido = await generarNumeroPedido(tx);

    await guardarPedido(
      {
        numeroPedido,
        usuarioId: session?.user?.id,
        estado: "pendiente",
        items: itemsPedido,
        subtotal,
        igv,
        descuento,
        costoEnvio,
        total,
        cuponCodigo: input.cuponCodigo,
        direccion: checkout.direccion,
        tipoDocumento: checkout.facturacion.tipoDocumento,
        docComprador: checkout.facturacion.numeroDocumento,
        nombreComprador: checkout.facturacion.nombreComprador,
        telefonoComprador: checkout.facturacion.telefonoComprador,
        emailComprador: checkout.facturacion.emailComprador,
        requiereFactura: checkout.facturacion.requiereFactura,
        ruc: checkout.facturacion.ruc,
        razonSocial: checkout.facturacion.razonSocial,
        metodoPago: checkout.metodoPago,
        createdAt: new Date().toISOString(),
      },
      tx,
    );

    return numeroPedido;
  });

  return { numeroPedido, total, items: itemsPedido };
}

export async function confirmarPedidoAction(input: ConfirmarPedidoInput) {
  // Yape/Plin/transferencia/contra-entrega: queda "pendiente" hasta que el
  // admin verifique el pago manualmente (ver /admin/pedidos).
  const { numeroPedido } = await crearPedidoPendiente(input);
  return { numeroPedido };
}

export async function confirmarPedidoConTarjetaAction(input: ConfirmarPedidoInput) {
  // Se valida ANTES de crear el pedido/descontar stock: si Mercado Pago no
  // está configurado, no debe quedar un pedido huérfano con stock descontado.
  const client = getMercadoPagoClient();

  const { numeroPedido, total, items } = await crearPedidoPendiente(input);

  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const preference = new Preference(client);

    const resultado = await preference.create({
      body: {
        items: items.map((item, i) => ({
          id: item.productoId || `item-${i}`,
          title: item.nombreProducto,
          quantity: item.cantidad,
          unit_price: item.precioUnitario,
          currency_id: "PEN",
        })),
        external_reference: numeroPedido,
        back_urls: {
          success: `${baseUrl}/pedido/${numeroPedido}`,
          pending: `${baseUrl}/pedido/${numeroPedido}`,
          failure: `${baseUrl}/checkout?pedido=${numeroPedido}&pago=fallido`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      },
    });

    const checkoutUrl = resultado.sandbox_init_point ?? resultado.init_point;
    if (!checkoutUrl) {
      throw new Error("Mercado Pago no devolvió una URL de pago.");
    }

    return { numeroPedido, checkoutUrl, total };
  } catch (error) {
    // El pedido ya se creó y el stock ya se descontó: si Mercado Pago
    // falla al generar el link de pago, no lo dejamos "pendiente" colgado.
    await actualizarEstadoPedido(numeroPedido, "cancelado");
    throw error instanceof Error
      ? error
      : new Error("No se pudo generar el link de pago con Mercado Pago.");
  }
}
