"use client";

import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";

/**
 * Link a un producto que intenta usar la View Transitions API nativa del
 * navegador (fade + escala suave definidos en globals.css) para que la
 * transición grilla → detalle se sienta fluida, sin pantallas blancas.
 * En navegadores sin soporte, cae de forma transparente a un <Link>
 * normal — no requiere ninguna librería nueva.
 */
export function ProductoLink({
  href,
  children,
  className,
  ...rest
}: React.PropsWithChildren<LinkProps & { className?: string }>) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (!("startViewTransition" in document)) return;

    e.preventDefault();
    document.startViewTransition(() => {
      router.push(href.toString());
    });
  }

  return (
    <Link href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
