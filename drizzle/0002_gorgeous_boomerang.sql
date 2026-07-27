CREATE TYPE "public"."estado_resena" AS ENUM('pendiente', 'publicada', 'rechazada');--> statement-breakpoint
CREATE TABLE "intentos_seguridad" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clave" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pedidos" ADD COLUMN "costo_envio_real" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "resenas" ADD COLUMN "compra_verificada" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "resenas" ADD COLUMN "estado" "estado_resena" DEFAULT 'pendiente' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "resenas_usuario_producto_unq" ON "resenas" USING btree ("usuario_id","producto_id");