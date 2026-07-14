"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function BuscarCuponInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState(searchParams.get("q") ?? "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valor = q.trim();
    router.push(valor ? `/admin/cupones?q=${encodeURIComponent(valor)}` : "/admin/cupones");
  }

  return (
    <form onSubmit={onSubmit} className="relative mb-4 max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por código..."
        className="h-9 pl-9"
      />
    </form>
  );
}
