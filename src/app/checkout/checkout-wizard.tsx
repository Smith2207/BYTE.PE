"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, Search, Truck } from "lucide-react";

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
import { useCart } from "@/lib/cart/cart-context";
import { formatoPEN, formatoDireccion, desglosarIGV } from "@/lib/format";
import { departamentosPeru, getProvinciasDe, getDistritosDe } from "@/lib/peru-data";
import { getTarifaEnvioPorDepartamento } from "@/lib/mock/tarifas-envio";
import { direccionSchema, documentoSchema } from "@/lib/validations/checkout";
import {
  confirmarPedidoAction,
  confirmarPedidoConTarjetaAction,
  consultarDocumentoAction,
  validarCuponAction,
} from "./actions";
import type { ResultadoCupon } from "@/lib/cupones/validar";

const PASOS = ["Envío", "Método de envío", "Cupón", "Pago", "Confirmación"] as const;

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

export function CheckoutWizard() {
  const router = useRouter();
  const { items, subtotal, vaciarCarrito } = useCart();
  const [paso, setPaso] = React.useState(0);
  const [enviando, setEnviando] = React.useState(false);

  const [direccion, setDireccion] = React.useState({
    departamento: "",
    provincia: "",
    distrito: "",
    direccionExacta: "",
    referencia: "",
  });
  const [facturacion, setFacturacion] = React.useState<Facturacion>({
    tipoDocumento: "dni",
    numeroDocumento: "",
    nombreComprador: "",
    telefonoComprador: "",
    emailComprador: "",
    requiereFactura: false,
    ruc: "",
    razonSocial: "",
  });
  const [metodoPago, setMetodoPago] =
    React.useState<"tarjeta" | "yape" | "plin" | "transferencia" | "contra_entrega">(
      "yape",
    );
  const [cuponInput, setCuponInput] = React.useState("");
  const [cuponAplicado, setCuponAplicado] = React.useState<ResultadoCupon | null>(null);
  const [validandoCupon, setValidandoCupon] = React.useState(false);
  const [errores, setErrores] = React.useState<Record<string, string>>({});
  const [buscandoDocumento, setBuscandoDocumento] = React.useState(false);

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
  const tarifa = direccion.departamento
    ? getTarifaEnvioPorDepartamento(direccion.departamento)
    : null;
  const costoEnvio = cuponAplicado?.ok && cuponAplicado.envioGratis ? 0 : (tarifa?.costo ?? 0);
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

  function siguiente() {
    if (paso === 0 && !validarPasoEnvio()) {
      toast.error("Revisa los campos marcados");
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

  async function confirmarPedido() {
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
        <div className="mb-8 flex flex-wrap gap-2">
          {PASOS.map((nombre, i) => (
            <div
              key={nombre}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                i === paso
                  ? "border-primary bg-primary/10 text-primary"
                  : i < paso
                    ? "border-primary/40 text-primary/80"
                    : "border-border/60 text-muted-foreground"
              }`}
            >
              {i < paso ? <Check className="size-3.5" /> : <span>{i + 1}</span>}
              {nombre}
            </div>
          ))}
        </div>

        <RevealOnScroll key={paso} y={16}>
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
            </CardContent>
          </Card>
        )}

        {paso === 1 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 text-sm font-semibold">Método de envío</h3>
              {tarifa ? (
                <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-secondary/40 p-4">
                  <Truck className="mt-0.5 size-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">
                      Envío a {direccion.departamento} — {formatoPEN(tarifa.costo)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Llega en {tarifa.diasEstimadosMin}-{tarifa.diasEstimadosMax} días hábiles.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      El courier (Olva, Shalom u otro según cobertura) se asigna al despachar tu
                      pedido y recibirás el número de tracking por correo.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Selecciona un departamento en el paso anterior para calcular el envío.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {paso === 2 && (
          <Card>
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>
        )}

        {paso === 3 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 text-sm font-semibold">Método de pago</h3>
              <RadioGroup value={metodoPago} onValueChange={(v) => setMetodoPago(v as typeof metodoPago)}>
                <label className="flex items-center gap-3 rounded-xl border border-border/60 p-4">
                  <RadioGroupItem value="yape" />
                  <div>
                    <p className="text-sm font-semibold">Yape / Plin</p>
                    <p className="text-xs text-muted-foreground">
                      Escanea el QR que te enviaremos y sube tu comprobante para validación manual.
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-border/60 p-4">
                  <RadioGroupItem value="transferencia" />
                  <div>
                    <p className="text-sm font-semibold">Transferencia / depósito bancario</p>
                    <p className="text-xs text-muted-foreground">
                      Te enviamos los datos de la cuenta; el pedido se confirma al verificar el pago.
                    </p>
                  </div>
                </label>
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
            </CardContent>
          </Card>
        )}

        {paso === 4 && (
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
                  <span>{formatoPEN(i.precioUnitario * i.cantidad)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Op. gravada</span>
                <span>{formatoPEN(subtotal - igv)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IGV (18%, incluido)</span>
                <span>{formatoPEN(igv)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span>{tarifa ? formatoPEN(costoEnvio) : "Por calcular"}</span>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Descuento</span>
                  <span>-{formatoPEN(descuento)}</span>
                </div>
              )}
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatoPEN(total)}</span>
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
