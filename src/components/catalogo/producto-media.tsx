import Image from "next/image";
import {
  Cpu,
  Headphones,
  Keyboard,
  Laptop,
  HardDrive,
  Smartphone,
  Tablet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Foto de producto real cuando hay una subida (ver
 * src/components/admin/imagen-uploader.tsx); si no hay ninguna, cae a un
 * ícono representativo sobre fondo neutro, al estilo de las fotos de
 * producto de Apple (fondo gris claro/blanco liso).
 */

const iconoPorCategoria: Record<string, LucideIcon> = {
  laptops: Laptop,
  "laptops-gaming": Laptop,
  ultrabooks: Laptop,
  celulares: Smartphone,
  "celulares-gama-alta": Smartphone,
  "celulares-gama-media": Smartphone,
  tablets: Tablet,
  "pcs-escritorio": Cpu,
  "pcs-gaming": Cpu,
  accesorios: Headphones,
  audio: Headphones,
  perifericos: Keyboard,
  almacenamiento: HardDrive,
};

export function ProductoMedia({
  categoriaSlug,
  imagenUrl,
  alt,
  className,
  iconClassName,
  sizes,
  priority,
}: {
  categoriaSlug: string;
  imagenUrl?: string | null;
  alt?: string;
  className?: string;
  iconClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const Icono = iconoPorCategoria[categoriaSlug] ?? Cpu;

  if (imagenUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-secondary", className)}>
        <Image
          src={imagenUrl}
          alt={alt ?? ""}
          fill
          sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-secondary",
        className,
      )}
    >
      <Icono
        className={cn("relative size-16 text-muted-foreground", iconClassName)}
        strokeWidth={1}
      />
    </div>
  );
}
