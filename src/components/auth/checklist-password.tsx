"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { REGLAS_PASSWORD } from "@/lib/validations/password";

export function ChecklistPassword({ password }: { password: string }) {
  return (
    <ul className="mt-1.5 space-y-1" aria-live="polite">
      {REGLAS_PASSWORD.map((regla) => {
        const cumple = regla.cumple(password);
        return (
          <li
            key={regla.id}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              cumple ? "text-emerald-500" : "text-muted-foreground",
            )}
          >
            {cumple ? (
              <Check className="size-3.5 shrink-0" />
            ) : (
              <Circle className="size-3.5 shrink-0" />
            )}
            {regla.label}
          </li>
        );
      })}
    </ul>
  );
}
