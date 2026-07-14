"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const opciones = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nuevo", label: "Más nuevo" },
];

export function OrdenSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orden = searchParams.get("orden") ?? "relevancia";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "relevancia") params.delete("orden");
    else params.set("orden", value);
    params.delete("page");
    router.push(`/productos?${params.toString()}`);
  }

  return (
    <Select value={orden} onValueChange={onChange}>
      <SelectTrigger className="w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opciones.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
