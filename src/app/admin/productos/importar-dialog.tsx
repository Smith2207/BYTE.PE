"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { toast } from "sonner";
import { Download, FileUp, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { COLUMNAS_PLANTILLA, type FilaImportacion } from "@/lib/validations/importar-productos";
import { importarProductosAction } from "./actions";

function descargarPlantilla() {
  const encabezado = COLUMNAS_PLANTILLA.join(",");
  const ejemplo = [
    "LAP-001",
    "Laptop Ejemplo 15\"",
    "Ejemplo",
    "laptops",
    "3499.90",
    "3199.90",
    "2600",
    "10",
    "12",
    "no",
    "Descripción del producto",
    "https://ejemplo.com/img1.jpg|https://ejemplo.com/img2.jpg",
  ].join(",");
  const csv = `${encabezado}\n${ejemplo}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla-productos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function ImportarProductosDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [filas, setFilas] = React.useState<FilaImportacion[]>([]);
  const [nombreArchivo, setNombreArchivo] = React.useState("");
  const [importando, setImportando] = React.useState(false);
  const [resultado, setResultado] = React.useState<{
    creados: number;
    errores: { fila: number; mensaje: string }[];
  } | null>(null);

  function onArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setResultado(null);
    setNombreArchivo(archivo.name);
    Papa.parse<FilaImportacion>(archivo, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => setFilas(res.data),
      error: () => toast.error("No se pudo leer el archivo CSV"),
    });
  }

  async function onImportar() {
    if (filas.length === 0) return;
    setImportando(true);
    try {
      const res = await importarProductosAction(filas);
      setResultado(res);
      if (res.creados > 0) {
        toast.success(`${res.creados} producto(s) importado(s)`);
        router.refresh();
      }
      if (res.errores.length === 0) {
        setFilas([]);
        setNombreArchivo("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo importar el archivo");
    } finally {
      setImportando(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setFilas([]);
          setNombreArchivo("");
          setResultado(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="size-4" /> Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar productos desde CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <button
            type="button"
            onClick={descargarPlantilla}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Download className="size-4" /> Descargar plantilla CSV
          </button>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-8 text-center hover:bg-secondary/40">
            <FileUp className="size-8 text-muted-foreground" />
            <span className="text-sm font-medium">
              {nombreArchivo || "Selecciona un archivo .csv"}
            </span>
            {filas.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {filas.length} fila(s) detectada(s)
              </span>
            )}
            <input type="file" accept=".csv" className="hidden" onChange={onArchivo} />
          </label>

          {resultado && (
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg bg-secondary/50 p-3 text-sm">
              <p className="font-medium">
                {resultado.creados} creado(s), {resultado.errores.length} con error
              </p>
              {resultado.errores.map((e, i) => (
                <p key={i} className="text-xs text-destructive">
                  Fila {e.fila}: {e.mensaje}
                </p>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onImportar} disabled={filas.length === 0 || importando}>
            {importando ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              `Importar ${filas.length || ""} producto(s)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
