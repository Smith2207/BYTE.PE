CREATE TYPE "public"."categoria_gasto" AS ENUM('alquiler', 'marketing', 'sueldos', 'servicios', 'otros');--> statement-breakpoint
CREATE TYPE "public"."estado_compra" AS ENUM('pedido', 'en_almacen_usa', 'en_transito', 'aduana', 'recibido', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."estado_devolucion" AS ENUM('pendiente', 'aprobada', 'rechazada', 'completada');--> statement-breakpoint
CREATE TYPE "public"."proveedor_compra" AS ENUM('amazon', 'ebay', 'otro');--> statement-breakpoint
CREATE TYPE "public"."tipo_devolucion" AS ENUM('reembolso', 'cambio');--> statement-breakpoint
CREATE TYPE "public"."tipo_envio_compra" AS ENUM('directo_peru', 'almacen_usa', 'local');--> statement-breakpoint
ALTER TYPE "public"."metodo_pago" ADD VALUE 'prex' BEFORE 'transferencia';--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expira_en" timestamp with time zone NOT NULL,
	"usado_en" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "compra_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"compra_id" uuid NOT NULL,
	"producto_id" uuid,
	"descripcion" text NOT NULL,
	"cantidad" integer NOT NULL,
	"costo_unitario" numeric(10, 2) NOT NULL,
	"categoria_id" uuid,
	"marca" text,
	"precio_venta" numeric(10, 2),
	"imagenes" text[] DEFAULT '{}' NOT NULL,
	"peso_kg" numeric(10, 3)
);
--> statement-breakpoint
CREATE TABLE "compras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proveedor" "proveedor_compra" NOT NULL,
	"proveedor_nombre" text,
	"numero_orden_externo" text,
	"tipo_envio" "tipo_envio_compra" DEFAULT 'almacen_usa' NOT NULL,
	"estado" "estado_compra" DEFAULT 'pedido' NOT NULL,
	"fecha_compra" timestamp with time zone DEFAULT now() NOT NULL,
	"fecha_llegada_almacen" timestamp with time zone,
	"fecha_recibido" timestamp with time zone,
	"subtotal" numeric(10, 2) NOT NULL,
	"costo_envio_importacion" numeric(10, 2) DEFAULT '0' NOT NULL,
	"otros_costos" numeric(10, 2) DEFAULT '0' NOT NULL,
	"pago_impuestos" boolean DEFAULT false NOT NULL,
	"monto_impuestos" numeric(10, 2),
	"costo_total" numeric(10, 2) NOT NULL,
	"comprobante_urls" text[] DEFAULT '{}' NOT NULL,
	"notas" text,
	"courier_internacional" text,
	"courier_internacional_id" integer,
	"tracking_internacional" text,
	"tracking_internacional_provider_id" text,
	"tracking_internacional_estado" text,
	"tracking_internacional_enlace" text,
	"tracking_internacional_actualizado_en" timestamp with time zone,
	"courier_nacional" text,
	"courier_nacional_id" integer,
	"tracking_nacional" text,
	"tracking_nacional_provider_id" text,
	"tracking_nacional_estado" text,
	"tracking_nacional_enlace" text,
	"tracking_nacional_actualizado_en" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "couriers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"tracking_url_pattern" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "couriers_nombre_unique" UNIQUE("nombre")
);
--> statement-breakpoint
CREATE TABLE "tarifas_courier" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"courier_id" uuid NOT NULL,
	"departamento" text NOT NULL,
	"costo" numeric(10, 2) NOT NULL,
	"dias_estimados_min" integer DEFAULT 2 NOT NULL,
	"dias_estimados_max" integer DEFAULT 5 NOT NULL,
	CONSTRAINT "tarifas_courier_courier_id_departamento_unique" UNIQUE("courier_id","departamento")
);
--> statement-breakpoint
CREATE TABLE "solicitudes_devolucion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"usuario_id" uuid,
	"tipo" "tipo_devolucion" NOT NULL,
	"motivo" text NOT NULL,
	"estado" "estado_devolucion" DEFAULT 'pendiente' NOT NULL,
	"nota_admin" text,
	"monto_reembolsado" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resuelto_en" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "gastos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"categoria" "categoria_gasto" NOT NULL,
	"descripcion" text NOT NULL,
	"monto" numeric(10, 2) NOT NULL,
	"fecha" timestamp with time zone DEFAULT now() NOT NULL,
	"comprobante_url" text,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "direcciones" ALTER COLUMN "usuario_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "direcciones" ALTER COLUMN "direccion_exacta" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "productos" ADD COLUMN "costo_adquisicion" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "carritos" ADD COLUMN "recordatorio_enviado" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "pedido_items" ADD COLUMN "variante_label" text;--> statement-breakpoint
ALTER TABLE "wishlist" ADD COLUMN "precio_notificado" numeric(10, 2);--> statement-breakpoint
UPDATE "wishlist" w SET "precio_notificado" = (
	SELECT COALESCE(p."precio_oferta", p."precio") FROM "productos" p WHERE p."id" = w."producto_id"
) WHERE w."precio_notificado" IS NULL;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compra_items" ADD CONSTRAINT "compra_items_compra_id_compras_id_fk" FOREIGN KEY ("compra_id") REFERENCES "public"."compras"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compra_items" ADD CONSTRAINT "compra_items_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compra_items" ADD CONSTRAINT "compra_items_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarifas_courier" ADD CONSTRAINT "tarifas_courier_courier_id_couriers_id_fk" FOREIGN KEY ("courier_id") REFERENCES "public"."couriers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitudes_devolucion" ADD CONSTRAINT "solicitudes_devolucion_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitudes_devolucion" ADD CONSTRAINT "solicitudes_devolucion_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;