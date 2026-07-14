"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { reclamoSchema, type ReclamoInput } from "@/lib/validations/reclamo";
import { registrarReclamo } from "./actions";

export function ReclamoForm() {
  const [resultado, setResultado] = React.useState<{ folio: string } | null>(null);
  const [enviando, setEnviando] = React.useState(false);

  const form = useForm<ReclamoInput>({
    resolver: zodResolver(reclamoSchema),
    defaultValues: {
      tipo: "reclamo",
      tipoDocumento: "dni",
      numeroDocumento: "",
      nombre: "",
      apellidos: "",
      domicilio: "",
      telefono: "",
      email: "",
      esMenorEdad: false,
      tipoBien: "producto",
      montoReclamado: "",
      descripcionBien: "",
      detalleReclamo: "",
    },
  });

  async function onSubmit(values: ReclamoInput) {
    // `values` llega ya validado y transformado por zodResolver (tipo de salida del schema).
    setEnviando(true);
    try {
      const res = await registrarReclamo(values);
      setResultado(res);
      form.reset();
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="size-10 text-primary" />
          <h2 className="text-lg font-semibold">Tu reclamo fue registrado</h2>
          <p className="text-sm text-muted-foreground">
            Número de folio: <span className="font-mono font-semibold text-foreground">{resultado.folio}</span>
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Guarda este folio para hacerle seguimiento. Te responderemos al correo indicado en un
            plazo máximo de 30 días calendario, conforme a la normativa de INDECOPI.
          </p>
          <Button variant="outline" onClick={() => setResultado(null)} className="mt-2">
            Registrar otro reclamo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de registro</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-6"
                >
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="reclamo" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Reclamo (disconformidad con el producto/servicio)
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="queja" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Queja (disconformidad con la atención)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="tipoDocumento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de documento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dni">DNI</SelectItem>
                    <SelectItem value="ruc">RUC</SelectItem>
                    <SelectItem value="ce">Carnet de Extranjería</SelectItem>
                    <SelectItem value="pasaporte">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numeroDocumento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de documento</FormLabel>
                <FormControl>
                  <Input placeholder="12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apellidos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellidos</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="domicilio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domicilio (opcional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="esMenorEdad"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="font-normal">Soy menor de edad</FormLabel>
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="tipoBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de bien contratado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="producto">Producto</SelectItem>
                    <SelectItem value="servicio">Servicio</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="montoReclamado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto reclamado en S/ (opcional)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descripcionBien"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción del producto o servicio</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Laptop ASUS ROG Strix G16, pedido #ORD-000123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="detalleReclamo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detalle del reclamo</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={enviando} size="lg" className="w-full sm:w-auto">
          {enviando ? "Enviando..." : "Registrar reclamo"}
        </Button>
      </form>
    </Form>
  );
}
