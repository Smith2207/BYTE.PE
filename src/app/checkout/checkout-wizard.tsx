"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Check, Copy, Loader2, Search, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { Magnetic } from "@/components/fx/magnetic";
import { FloatingIndicator } from "@/components/fx/floating-indicator";
import { TextScramble } from "@/components/fx/text-scramble";
import { ELASTIC_EASE } from "@/lib/motion";
import { useCart } from "@/lib/cart/cart-context";
import { formatoPEN, formatoDireccion, desglosarIGV } from "@/lib/format";
import { departamentosPeru, getProvinciasDe, getDistritosDe } from "@/lib/peru-data";
import { direccionSchema, documentoSchema } from "@/lib/validations/checkout";
import { datosPago, siteConfig } from "@/lib/site-config";
import type { OpcionCourierCheckout } from "@/lib/couriers/store";
import {
  confirmarPedidoAction,
  confirmarPedidoConTarjetaAction,
  consultarDocumentoAction,
  obtenerCouriersPorDepartamentoAction,
  validarCuponAction,
} from "./actions";
import { crearDireccionAction } from "@/app/cuenta/direcciones/actions";
import { actualizarPerfilAction } from "@/app/cuenta/actions";
import type { ResultadoCupon } from "@/lib/cupones/validar";
import type { UsuarioAlmacenado } from "@/lib/usuarios/store";
import type { DireccionAlmacenada } from "@/lib/direcciones/store";

const PASOS = ["Envío", "Método de envío", "Pago", "Confirmación"] as const;

type Facturacion = {
  tipoDocumento: "dni" | "ruc";
  numeroDocumento: string;
  nombreComprador: string;
  telefonoComprador: string;
  emailComprador: string;
  requiereFactura: boolean;
  ruc: string;
  razonSocial: string;
};

function copiar(valor: string, etiqueta: string) {
  navigator.clipboard.writeText(valor);
  toast.success(`${etiqueta} copiado`);
}

/** Fila con un dato de pago (cuenta, CCI, titular...) y botón para copiarlo —
 * evita que el cliente tenga que transcribir números largos a mano. */
function FilaDato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{etiqueta}</p>
        <p className="truncate font-mono text-sm">{valor}</p>
      </div>
      <button
        type="button"
        onClick={() => copiar(valor, etiqueta)}
        aria-label={`Copiar ${etiqueta}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      >
        <Copy className="size-4" />
      </button>
    </div>
  );
}

/** QR de pago (Yape/Plin, Prex) — se muestra inline al elegir el método en
 * vez de "te lo enviaremos", para que el cliente pague ahí mismo. */
function QrDePago({ qr, titular, monto }: { qr: string; titular: string; monto: number }) {
  return (
    <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-start">
      <Image
        src={qr}
        alt={`QR de pago — ${titular}`}
        width={160}
        height={160}
        className="rounded-lg border border-border/60"
      />
      <div className="w-full space-y-2 text-center sm:text-left">
        <p className="text-sm">
          Escanea y paga <span className="font-semibold">{formatoPEN(monto)}</span>
        </p>
        <FilaDato etiqueta="Titular" valor={titular} />
      </div>
    </div>
  );
}

/** Datos de la cuenta Interbank — mismo patrón que QrDePago pero sin imagen. */
function DatosBancarios({ monto }: { monto: number }) {
  return (
    <div className="mt-4 space-y-2 rounded-lg border border-border/60 bg-muted/20 p-4">
      <p className="text-sm">
        Transfiere <span className="font-semibold">{formatoPEN(monto)}</span> a:
      </p>
      <FilaDato etiqueta="Banco" valor={datosPago.interbank.banco} />
      <FilaDato etiqueta={datosPago.interbank.tipoCuenta} valor={datosPago.interbank.numeroCuenta} />
      <FilaDato etiqueta="CCI (otros bancos)" valor={datosPago.interbank.cci} />
      <FilaDato etiqueta="Titular" valor={datosPago.interbank.titular} />
    </div>
  );
}

/** Sube la captura/foto del pago a /api/pedidos/comprobante — obligatorio
 * para confirmar el pedido con Yape/Prex/transferencia, ver `requiereComprobante`
 * en CheckoutWizard. Un solo widget compartido entre los tres métodos en vez
 * de repetirlo, porque el estado subido no depende de cuál esté elegido. */
function SubirComprobante({
  url,
  subiendo,
  onSubiendoChange,
  onUrlChange,
}: {
  url: string | null;
  subiendo: boolean;
  onSubiendoChange: (v: boolean) => void;
  onUrlChange: (url: string | null) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    onSubiendoChange(true);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      const res = await fetch("/api/pedidos/comprobante", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo subir el comprobante");
      onUrlChange(data.url);
      toast.success("Comprobante subido");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo subir el comprobante");
    } finally {
      onSubiendoChange(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-4 space-y-2 rounded-lg border border-border/60 bg-muted/20 p-4">
      <p className="text-sm font-semibold">Comprobante de pago</p>
      {url ? (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm text-primary underline underline-offset-2"
          >
            Ver comprobante subido
          </a>
          <button
            type="button"
            onClick={() => onUrlChange(null)}
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
          >
            Quitar
          </button>
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={onFileChange}
            disabled={subiendo}
            className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-secondary/80"
          />
          {subiendo && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" /> Subiendo…
            </p>
          )}
        </>
      )}
      <p className="text-xs text-muted-foreground">
        Foto o captura de pantalla del pago (JPG, PNG o PDF, máx. 10MB). Obligatorio para
        confirmar el pedido con este método.
      </p>
    </div>
  );
}

export function CheckoutWizard({
  usuario,
  direccionPrincipal,
}: {
  usuario: UsuarioAlmacenado | null;
  direccionPrincipal: DireccionAlmacenada | null;
}) {
  const router = useRouter();
  const { items, subtotal, vaciarCarrito } = useCart();
  const [paso, setPaso] = React.useState(0);
  const [enviando, setEnviando] = React.useState(false);
  const pasosRef = React.useRef<HTMLDivElement>(null);

  // Autocompletado desde el perfil — el usuario puede editar libremente
  // acá sin que se toque su perfil real hasta que confirme "guardar en
  // mi perfil" más abajo (son useState locales, no hay mutación previa).
  const [direccion, setDireccion] = React.useState({
    departamento: direccionPrincipal?.departamento ?? "",
    provincia: direccionPrincipal?.provincia ?? "",
    distrito: direccionPrincipal?.distrito ?? "",
    direccionExacta: direccionPrincipal?.direccionExacta ?? "",
    referencia: direccionPrincipal?.referencia ?? "",
  });
  const [facturacion, setFacturacion] = React.useState<Facturacion>({
    tipoDocumento: "dni",
    numeroDocumento: usuario?.dni ?? "",
    nombreComprador: usuario?.nombre ?? "",
    telefonoComprador: usuario?.telefono ?? "",
    emailComprador: usuario?.email ?? "",
    requiereFactura: false,
    ruc: "",
    razonSocial: "",
  });
  const [guardarEnPerfil, setGuardarEnPerfil] = React.useState(false);
  const [metodoPago, setMetodoPago] =
    React.useState<"tarjeta" | "yape" | "plin" | "prex" | "transferencia" | "contra_entrega">(
      "yape",
    );
  const [cuponInput, setCuponInput] = React.useState("");
  const [cuponAplicado, setCuponAplicado] = React.useState<ResultadoCupon | null>(null);
  const [validandoCupon, setValidandoCupon] = React.useState(false);
  const [errores, setErrores] = React.useState<Record<string, string>>({});
  const [buscandoDocumento, setBuscandoDocumento] = React.useState(false);
  const [couriers, setCouriers] = React.useState<OpcionCourierCheckout[]>([]);
  const [courierId, setCourierId] = React.useState<string | null>(null);
  const [cargandoCouriers, setCargandoCouriers] = React.useState(false);
  const [comprobanteUrl, setComprobanteUrl] = React.useState<string | null>(null);
  const [subiendoComprobante, setSubiendoComprobante] = React.useState(false);

  // El costo real de envío se recalcula server-side según el courier
  // elegido — esto solo trae las opciones disponibles para mostrarlas.
  React.useEffect(() => {
    if (!direccion.departamento) {
      setCouriers([]);
      setCourierId(null);
      return;
    }
    let cancelado = false;
    setCargandoCouriers(true);
    obtenerCouriersPorDepartamentoAction(direccion.departamento)
      .then((opciones) => {
        if (cancelado) return;
        setCouriers(opciones);
        setCourierId((actual) =>
          actual && opciones.some((o) => o.courierId === actual) ? actual : (opciones[0]?.courierId ?? null),
        );
      })
      .finally(() => {
        if (!cancelado) setCargandoCouriers(false);
      });
    return () => {
      cancelado = true;
    };
  }, [direccion.departamento]);

  const provinciasDisponibles = React.useMemo(
    () => (direccion.departamento ? getProvinciasDe(direccion.departamento) : []),
    [direccion.departamento],
  );
  const distritosDisponibles = React.useMemo(
    () =>
      direccion.departamento && direccion.provincia
        ? getDistritosDe(direccion.departamento, direccion.provincia)
        : [],
    [direccion.departamento, direccion.provincia],
  );

  // Los precios ya incluyen IGV — se descompone para mostrarlo, nunca se
  // suma aparte (el total nunca debe subir respecto al precio mostrado).
  const { igv } = desglosarIGV(subtotal);
  const courierSeleccionado = couriers.find((c) => c.courierId === courierId) ?? null;
  const costoEnvio =
    siteConfig.envioGratis || (cuponAplicado?.ok && cuponAplicado.envioGratis)
      ? 0
      : (courierSeleccionado?.costo ?? 0);
  const descuento = cuponAplicado?.ok ? cuponAplicado.descuento : 0;
  const total = Math.max(0, subtotal + costoEnvio - descuento);

  if (items.length === 0) {
    return (
      <RevealOnScroll className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-24 text-center">
        <p className="text-lg font-semibold">Tu carrito está vacío</p>
        <p className="mt-2 text-sm text-muted-foreground">Agrega productos antes de continuar.</p>
        <Magnetic strength={0.15} className="mt-6 inline-block">
          <Button onClick={() => router.push("/productos")}>Ver catálogo</Button>
        </Magnetic>
      </RevealOnScroll>
    );
  }

  function validarPasoEnvio() {
    const resDireccion = direccionSchema.safeParse(direccion);
    const resDocumento = documentoSchema.safeParse({
      tipoDocumento: facturacion.tipoDocumento,
      numeroDocumento: facturacion.numeroDocumento,
    });
    const nuevosErrores: Record<string, string> = {};
    if (!resDireccion.success) {
      for (const issue of resDireccion.error.issues) nuevosErrores[String(issue.path[0])] = issue.message;
    }
    if (!resDocumento.success) {
      for (const issue of resDocumento.error.issues) nuevosErrores[String(issue.path[0])] = issue.message;
    }
    if (!facturacion.nombreComprador || facturacion.nombreComprador.length < 2)
      nuevosErrores.nombreComprador = "Ingresa tu nombre completo";
    if (!facturacion.telefonoComprador || facturacion.telefonoComprador.length < 6)
      nuevosErrores.telefonoComprador = "Ingresa un teléfono válido";
    if (!/^\S+@\S+\.\S+$/.test(facturacion.emailComprador))
      nuevosErrores.emailComprador = "Ingresa un correo válido";
    if (facturacion.requiereFactura && !/^(10|15|17|20)\d{9}$/.test(facturacion.ruc)) {
      nuevosErrores.ruc = "Ingresa un RUC válido (11 dígitos)";
    }
    if (facturacion.requiereFactura && !facturacion.razonSocial) {
      nuevosErrores.razonSocial = "Ingresa la razón social";
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  const requiereComprobante = metodoPago === "yape" || metodoPago === "prex" || metodoPago === "transferencia";

  function siguiente() {
    if (paso === 0 && !validarPasoEnvio()) {
      toast.error("Revisa los campos marcados");
      return;
    }
    if (paso === 1 && !courierId) {
      toast.error("Elige un courier para continuar");
      return;
    }
    if (paso === 2 && requiereComprobante && !comprobanteUrl) {
      toast.error("Sube tu comprobante de pago para continuar");
      return;
    }
    setPaso((p) => Math.min(PASOS.length - 1, p + 1));
  }

  async function buscarDocumento() {
    setBuscandoDocumento(true);
    try {
      const resultado = await consultarDocumentoAction(
        facturacion.tipoDocumento,
        facturacion.numeroDocumento,
      );
      if (!resultado.ok) {
        toast.error("No encontramos datos para ese documento. Complétalos manualmente.");
        return;
      }
      if (resultado.tipo === "dni") {
        const nombre = resultado.nombre;
        setFacturacion((f) => ({ ...f, nombreComprador: nombre }));
      }
      if (resultado.tipo === "ruc") {
        const razonSocial = resultado.razonSocial;
        setFacturacion((f) => ({
          ...f,
          razonSocial,
          requiereFactura: true,
          ruc: f.numeroDocumento,
        }));
      }
      toast.success("Datos encontrados y completados");
    } catch {
      toast.error("No se pudo consultar el documento, complétalo manualmente");
    } finally {
      setBuscandoDocumento(false);
    }
  }

  async function aplicarCupon() {
    if (!cuponInput) return;
    setValidandoCupon(true);
    try {
      const resultado = await validarCuponAction(cuponInput, subtotal);
      setCuponAplicado(resultado);
      if (resultado.ok) toast.success("Cupón aplicado");
      else toast.error(resultado.motivo);
    } finally {
      setValidandoCupon(false);
    }
  }

  /** Guarda los datos de ESTA orden en el perfil real del usuario — solo
   * se llama si tildó "guardar permanentemente". Si falla, no debe tumbar
   * la compra (ya se confirmó el pedido en ese punto): solo se avisa. */
  async function guardarDatosEnPerfil() {
    try {
      await Promise.all([
        crearDireccionAction({ ...direccion, esPrincipal: true }),
        actualizarPerfilAction({
          nombre: facturacion.nombreComprador,
          telefono: facturacion.telefonoComprador,
          dni: facturacion.tipoDocumento === "dni" ? facturacion.numeroDocumento : usuario?.dni ?? "",
        }),
      ]);
    } catch {
      toast.error("El pedido se confirmó, pero no pudimos guardar estos datos en tu perfil");
    }
  }

  async function confirmarPedido() {
    if (!courierId) {
      toast.error("Elige un courier de envío antes de confirmar");
      return;
    }
    if (requiereComprobante && !comprobanteUrl) {
      toast.error("Sube tu comprobante de pago antes de confirmar");
      return;
    }
    setEnviando(true);
    try {
      const payload = {
        checkout: {
          direccion,
          facturacion: {
            ...facturacion,
            ruc: facturacion.requiereFactura ? facturacion.ruc : undefined,
            razonSocial: facturacion.requiereFactura ? facturacion.razonSocial : undefined,
          },
          metodoPago,
          courierId,
          comprobantePagoUrl: comprobanteUrl ?? undefined,
          cuponCodigo: cuponAplicado?.ok ? cuponInput : undefined,
        },
        items: items.map((i) => ({
          productoId: i.productoId,
          varianteId: i.varianteId,
          nombreProducto: i.nombre,
          varianteLabel: i.varianteLabel,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
        })),
        cuponCodigo: cuponAplicado?.ok ? cuponInput : undefined,
      };

      if (guardarEnPerfil) await guardarDatosEnPerfil();

      if (metodoPago === "tarjeta") {
        // Checkout Pro: se crea el pedido "pendiente" y se redirige a
        // Mercado Pago; el webhook lo pasa a "pagado" al aprobarse.
        const { checkoutUrl } = await confirmarPedidoConTarjetaAction(payload);
        vaciarCarrito();
        window.location.href = checkoutUrl;
        return;
      }

      const { numeroPedido } = await confirmarPedidoAction(payload);
      vaciarCarrito();
      router.push(`/pedido/${numeroPedido}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No pudimos confirmar tu pedido");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div ref={pasosRef} className="relative mb-8 flex flex-wrap gap-2">
          <FloatingIndicator
            containerRef={pasosRef}
            activeKey={paso}
            className="border border-primary/40 bg-primary/10"
          />
          {PASOS.map((nombre, i) => (
            <div
              key={nombre}
              data-indicator-item
              data-active={i === paso}
              className={`relative flex items-center gap-2 rounded-full border border-transparent px-3 py-1.5 text-xs font-medium ${
                i === paso
                  ? "text-primary"
                  : i < paso
                    ? "text-primary/80"
                    : "text-muted-foreground"
              }`}
            >
              {i < paso ? <Check className="size-3.5" /> : <span>{i + 1}</span>}
              {nombre}
            </div>
          ))}
        </div>

        <RevealOnScroll key={paso} y={16} ease={ELASTIC_EASE}>
        {paso === 0 && (
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold">Dirección de envío</h3>
                <p className="mb-4 text-xs text-muted-foreground">
                  Por ahora no hacemos despacho a domicilio: el envío es por agencia (Olva,
                  Shalom, etc.) a la oficina más cercana a tu distrito. Departamento, provincia y
                  distrito son obligatorios para calcular el costo; la dirección exacta es solo
                  una referencia opcional.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="departamento">Departamento</Label>
                    <Select
                      value={direccion.departamento}
                      onValueChange={(v) =>
                        setDireccion((d) => ({ ...d, departamento: v, provincia: "", distrito: "" }))
                      }
                    >
                      <SelectTrigger id="departamento" className="mt-1.5">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {departamentosPeru.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errores.departamento && (
                      <p className="mt-1 text-xs text-destructive">{errores.departamento}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="provincia">Provincia</Label>
                    <Select
                      value={direccion.provincia}
                      disabled={!direccion.departamento}
                      onValueChange={(v) => setDireccion((d) => ({ ...d, provincia: v, distrito: "" }))}
                    >
                      <SelectTrigger id="provincia" className="mt-1.5">
                        <SelectValue
                          placeholder={
                            direccion.departamento ? "Selecciona" : "Elige un departamento primero"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {provinciasDisponibles.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errores.provincia && (
                      <p className="mt-1 text-xs text-destructive">{errores.provincia}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="distrito">Distrito</Label>
                    <Select
                      value={direccion.distrito}
                      disabled={!direccion.provincia}
                      onValueChange={(v) => setDireccion((d) => ({ ...d, distrito: v }))}
                    >
                      <SelectTrigger id="distrito" className="mt-1.5">
                        <SelectValue
                          placeholder={direccion.provincia ? "Selecciona" : "Elige una provincia primero"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {distritosDisponibles.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errores.distrito && (
                      <p className="mt-1 text-xs text-destructive">{errores.distrito}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="direccionExacta">Dirección exacta (opcional)</Label>
                    <Input
                      id="direccionExacta"
                      className="mt-1.5"
                      placeholder="Referencial — recojo en agencia"
                      value={direccion.direccionExacta}
                      onChange={(e) =>
                        setDireccion((d) => ({ ...d, direccionExacta: e.target.value }))
                      }
                    />
                    {errores.direccionExacta && (
                      <p className="mt-1 text-xs text-destructive">{errores.direccionExacta}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="referencia">Referencia (opcional)</Label>
                    <Input
                      id="referencia"
                      className="mt-1.5"
                      value={direccion.referencia}
                      onChange={(e) =>
                        setDireccion((d) => ({ ...d, referencia: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-sm font-semibold">Datos de facturación</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="tipoDocumento">Tipo de documento</Label>
                    <Select
                      value={facturacion.tipoDocumento}
                      onValueChange={(v) =>
                        setFacturacion((f) => ({ ...f, tipoDocumento: v as Facturacion["tipoDocumento"] }))
                      }
                    >
                      <SelectTrigger id="tipoDocumento" className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dni">DNI</SelectItem>
                        <SelectItem value="ruc">RUC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="numeroDocumento">Número de documento</Label>
                    <div className="mt-1.5 flex gap-2">
                      <Input
                        id="numeroDocumento"
                        value={facturacion.numeroDocumento}
                        onChange={(e) =>
                          setFacturacion((f) => ({ ...f, numeroDocumento: e.target.value }))
                        }
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        disabled={buscandoDocumento || !facturacion.numeroDocumento}
                        onClick={buscarDocumento}
                        aria-label="Buscar datos del documento"
                      >
                        {buscandoDocumento ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Search className="size-4" />
                        )}
                      </Button>
                    </div>
                    {errores.numeroDocumento && (
                      <p className="mt-1 text-xs text-destructive">{errores.numeroDocumento}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="nombreComprador">Nombre completo</Label>
                    <Input
                      id="nombreComprador"
                      className="mt-1.5"
                      value={facturacion.nombreComprador}
                      onChange={(e) =>
                        setFacturacion((f) => ({ ...f, nombreComprador: e.target.value }))
                      }
                    />
                    {errores.nombreComprador && (
                      <p className="mt-1 text-xs text-destructive">{errores.nombreComprador}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="telefonoComprador">Teléfono</Label>
                    <Input
                      id="telefonoComprador"
                      className="mt-1.5"
                      value={facturacion.telefonoComprador}
                      onChange={(e) =>
                        setFacturacion((f) => ({ ...f, telefonoComprador: e.target.value }))
                      }
                    />
                    {errores.telefonoComprador && (
                      <p className="mt-1 text-xs text-destructive">{errores.telefonoComprador}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="emailComprador">Correo electrónico</Label>
                    <Input
                      id="emailComprador"
                      type="email"
                      className="mt-1.5"
                      value={facturacion.emailComprador}
                      onChange={(e) =>
                        setFacturacion((f) => ({ ...f, emailComprador: e.target.value }))
                      }
                    />
                    {errores.emailComprador && (
                      <p className="mt-1 text-xs text-destructive">{errores.emailComprador}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Checkbox
                    id="requiere-factura"
                    checked={facturacion.requiereFactura}
                    onCheckedChange={(v) =>
                      setFacturacion((f) => ({ ...f, requiereFactura: Boolean(v) }))
                    }
                  />
                  <Label htmlFor="requiere-factura" className="font-normal">
                    Necesito factura (con RUC)
                  </Label>
                </div>

                {facturacion.requiereFactura && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="ruc">RUC</Label>
                      <Input
                        id="ruc"
                        className="mt-1.5"
                        value={facturacion.ruc}
                        onChange={(e) => setFacturacion((f) => ({ ...f, ruc: e.target.value }))}
                      />
                      {errores.ruc && <p className="mt-1 text-xs text-destructive">{errores.ruc}</p>}
                    </div>
                    <div>
                      <Label htmlFor="razonSocial">Razón social</Label>
                      <Input
                        id="razonSocial"
                        className="mt-1.5"
                        value={facturacion.razonSocial}
                        onChange={(e) =>
                          setFacturacion((f) => ({ ...f, razonSocial: e.target.value }))
                        }
                      />
                      {errores.razonSocial && (
                        <p className="mt-1 text-xs text-destructive">{errores.razonSocial}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {usuario && (
                <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-secondary/40 p-3">
                  <Checkbox
                    id="guardarEnPerfil"
                    checked={guardarEnPerfil}
                    onCheckedChange={(v) => setGuardarEnPerfil(Boolean(v))}
                    className="mt-0.5"
                  />
                  <Label htmlFor="guardarEnPerfil" className="text-sm font-normal leading-snug">
                    Guardar estos datos de entrega permanentemente en mi perfil
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {paso === 1 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 text-sm font-semibold">Método de envío</h3>
              {!direccion.departamento ? (
                <p className="text-sm text-muted-foreground">
                  Selecciona un departamento en el paso anterior para ver couriers disponibles.
                </p>
              ) : cargandoCouriers ? (
                <p className="text-sm text-muted-foreground">Buscando couriers disponibles…</p>
              ) : couriers.length === 0 ? (
                <p className="text-sm text-destructive">
                  No hay couriers disponibles para {direccion.departamento} por ahora.
                </p>
              ) : (
                <RadioGroup value={courierId ?? undefined} onValueChange={setCourierId}>
                  {couriers.map((c) => (
                    <label
                      key={c.courierId}
                      className="flex items-center gap-3 rounded-xl border border-border/60 p-4"
                    >
                      <RadioGroupItem value={c.courierId} />
                      <Truck className="size-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {c.nombre} — {siteConfig.envioGratis ? "Gratis" : formatoPEN(c.costo)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Llega en {c.diasEstimadosMin}-{c.diasEstimadosMax} días hábiles a{" "}
                          {direccion.departamento}.
                        </p>
                      </div>
                    </label>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Envío por agencia — recibirás el número de tracking por correo.
                  </p>
                </RadioGroup>
              )}
            </CardContent>
          </Card>
        )}

        {paso === 2 && (
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="mb-4 text-sm font-semibold">¿Tienes un cupón?</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: BIENVENIDO10"
                    value={cuponInput}
                    onChange={(e) => setCuponInput(e.target.value.toUpperCase())}
                    className="max-w-xs"
                  />
                  <Button variant="secondary" onClick={aplicarCupon} disabled={validandoCupon}>
                    {validandoCupon ? <Loader2 className="size-4 animate-spin" /> : "Aplicar"}
                  </Button>
                </div>
                {cuponAplicado && (
                  <p
                    className={`mt-3 text-sm ${cuponAplicado.ok ? "text-primary" : "text-destructive"}`}
                  >
                    {cuponAplicado.ok
                      ? cuponAplicado.envioGratis
                        ? "¡Envío gratis aplicado!"
                        : `Descuento aplicado: ${formatoPEN(cuponAplicado.descuento)}`
                      : cuponAplicado.motivo}
                  </p>
                )}
                <p className="mt-4 text-xs text-muted-foreground">
                  Puedes continuar sin cupón si no tienes uno.
                </p>
              </div>

              <Separator />

              <div>
              <h3 className="mb-4 text-sm font-semibold">Método de pago</h3>
              <RadioGroup value={metodoPago} onValueChange={(v) => setMetodoPago(v as typeof metodoPago)}>
                <div className="rounded-xl border border-border/60 p-4">
                  <label className="flex items-center gap-3">
                    <RadioGroupItem value="yape" />
                    <div>
                      <p className="text-sm font-semibold">Yape / Plin</p>
                      <p className="text-xs text-muted-foreground">
                        Escanea el QR y sube tu comprobante para validación manual.
                      </p>
                    </div>
                  </label>
                  {metodoPago === "yape" && (
                    <QrDePago qr={datosPago.yape.qr} titular={datosPago.yape.titular} monto={total} />
                  )}
                </div>

                <div className="rounded-xl border border-border/60 p-4">
                  <label className="flex items-center gap-3">
                    <RadioGroupItem value="prex" />
                    <div>
                      <p className="text-sm font-semibold">Prex</p>
                      <p className="text-xs text-muted-foreground">
                        Escanea el QR y sube tu comprobante para validación manual.
                      </p>
                    </div>
                  </label>
                  {metodoPago === "prex" && (
                    <QrDePago qr={datosPago.prex.qr} titular={datosPago.prex.titular} monto={total} />
                  )}
                </div>

                <div className="rounded-xl border border-border/60 p-4">
                  <label className="flex items-center gap-3">
                    <RadioGroupItem value="transferencia" />
                    <div>
                      <p className="text-sm font-semibold">Transferencia / depósito bancario</p>
                      <p className="text-xs text-muted-foreground">
                        Transfiere y sube tu comprobante; el pedido se confirma al verificar el pago.
                      </p>
                    </div>
                  </label>
                  {metodoPago === "transferencia" && <DatosBancarios monto={total} />}
                </div>

                <label className="flex items-center gap-3 rounded-xl border border-border/60 p-4">
                  <RadioGroupItem value="contra_entrega" />
                  <div>
                    <p className="text-sm font-semibold">Pago contra entrega</p>
                    <p className="text-xs text-muted-foreground">
                      Pagas en efectivo al recibir el pedido (según cobertura).
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-border/60 p-4">
                  <RadioGroupItem value="tarjeta" />
                  <div>
                    <p className="text-sm font-semibold">Tarjeta de crédito/débito</p>
                    <p className="text-xs text-muted-foreground">
                      Te redirige a Mercado Pago (modo sandbox/pruebas) para pagar de forma segura.
                    </p>
                  </div>
                </label>
              </RadioGroup>

              {requiereComprobante && (
                <SubirComprobante
                  url={comprobanteUrl}
                  subiendo={subiendoComprobante}
                  onSubiendoChange={setSubiendoComprobante}
                  onUrlChange={setComprobanteUrl}
                />
              )}
              </div>
            </CardContent>
          </Card>
        )}

        {paso === 3 && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h3 className="text-sm font-semibold">Revisa tu pedido</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="text-foreground">Envío a:</span> {formatoDireccion(direccion)}
                </p>
                <p>
                  <span className="text-foreground">Comprobante:</span>{" "}
                  {facturacion.requiereFactura
                    ? `Factura — RUC ${facturacion.ruc}`
                    : `Boleta — ${facturacion.tipoDocumento.toUpperCase()} ${facturacion.numeroDocumento}`}
                </p>
                <p>
                  <span className="text-foreground">Pago:</span>{" "}
                  {metodoPago === "yape"
                    ? "Yape / Plin"
                    : metodoPago === "prex"
                      ? "Prex"
                      : metodoPago === "transferencia"
                        ? "Transferencia bancaria"
                        : metodoPago === "contra_entrega"
                          ? "Contra entrega"
                          : "Tarjeta"}
                </p>
              </div>
              <Magnetic strength={0.15} className="mt-2 block">
                <Button size="lg" className="w-full" onClick={confirmarPedido} disabled={enviando}>
                  {enviando ? <Loader2 className="size-4 animate-spin" /> : "Confirmar pedido"}
                </Button>
              </Magnetic>
            </CardContent>
          </Card>
        )}
        </RevealOnScroll>

        <div className="mt-6 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setPaso((p) => Math.max(0, p - 1))}
            disabled={paso === 0}
          >
            Atrás
          </Button>
          {paso < PASOS.length - 1 && (
            <Magnetic strength={0.15} className="inline-block">
              <Button onClick={siguiente}>Continuar</Button>
            </Magnetic>
          )}
        </div>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardContent className="space-y-3 pt-6">
            <h3 className="text-sm font-semibold">Resumen del pedido</h3>
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={`${i.productoId}-${i.varianteId}`} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {i.cantidad}x {i.nombre}
                    {i.varianteLabel ? ` (${i.varianteLabel})` : ""}
                  </span>
                  <span className="font-mono">{formatoPEN(i.precioUnitario * i.cantidad)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Op. gravada</span>
                <span className="font-mono">{formatoPEN(subtotal - igv)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IGV (18%, incluido)</span>
                <span className="font-mono">{formatoPEN(igv)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span className="font-mono">
                  {!courierSeleccionado
                    ? "Por calcular"
                    : siteConfig.envioGratis
                      ? "Gratis"
                      : formatoPEN(costoEnvio)}
                </span>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Descuento</span>
                  <span className="font-mono">-{formatoPEN(descuento)}</span>
                </div>
              )}
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <TextScramble value={formatoPEN(total)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Precio final — el IGV ya está incluido, sin cargos ocultos.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
