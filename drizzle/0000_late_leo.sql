CREATE TYPE "public"."estado_pedido" AS ENUM('pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado', 'reembolsado');--> statement-breakpoint
CREATE TYPE "public"."estado_reclamo" AS ENUM('registrado', 'en_proceso', 'resuelto');--> statement-breakpoint
CREATE TYPE "public"."metodo_pago" AS ENUM('tarjeta', 'yape', 'plin', 'transferencia', 'contra_entrega');--> statement-breakpoint
CREATE TYPE "public"."rol_usuario" AS ENUM('cliente', 'admin');--> statement-breakpoint
CREATE TYPE "public"."tipo_cupon" AS ENUM('porcentaje', 'monto_fijo', 'envio_gratis');--> statement-breakpoint
CREATE TYPE "public"."tipo_documento" AS ENUM('dni', 'ruc', 'ce', 'pasaporte');--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"dni" varchar(20),
	"telefono" varchar(20),
	"rol" "rol_usuario" DEFAULT 'cliente' NOT NULL,
	"imagen" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "direcciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"departamento" text NOT NULL,
	"provincia" text NOT NULL,
	"distrito" text NOT NULL,
	"direccion_exacta" text NOT NULL,
	"referencia" text,
	"es_principal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categorias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"slug" text NOT NULL,
	"categoria_padre_id" uuid,
	"imagen" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categorias_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "productos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"slug" text NOT NULL,
	"descripcion" text,
	"precio" numeric(10, 2) NOT NULL,
	"precio_oferta" numeric(10, 2),
	"stock" integer DEFAULT 0 NOT NULL,
	"sku" text,
	"marca" text,
	"categoria_id" uuid,
	"peso_kg" numeric(6, 2),
	"alto_cm" numeric(6, 2),
	"ancho_cm" numeric(6, 2),
	"largo_cm" numeric(6, 2),
	"imagenes" text[] DEFAULT '{}' NOT NULL,
	"specs_json" jsonb DEFAULT '{}'::jsonb,
	"garantia_meses" integer DEFAULT 0 NOT NULL,
	"destacado" boolean DEFAULT false NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "productos_slug_unique" UNIQUE("slug"),
	CONSTRAINT "productos_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "variantes_producto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"producto_id" uuid NOT NULL,
	"atributo" text NOT NULL,
	"valor" text NOT NULL,
	"precio_extra" numeric(10, 2) DEFAULT '0' NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"sku" text
);
--> statement-breakpoint
CREATE TABLE "carrito_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carrito_id" uuid NOT NULL,
	"producto_id" uuid NOT NULL,
	"variante_id" uuid,
	"cantidad" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carritos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid,
	"session_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cupones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"tipo" "tipo_cupon" NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"monto_minimo_compra" numeric(10, 2) DEFAULT '0' NOT NULL,
	"fecha_inicio" timestamp with time zone NOT NULL,
	"fecha_fin" timestamp with time zone NOT NULL,
	"usos_maximos" integer,
	"usos_actuales" integer DEFAULT 0 NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"categorias_aplicables" uuid[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cupones_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "tarifas_envio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"departamento" text NOT NULL,
	"costo" numeric(10, 2) NOT NULL,
	"dias_estimados_min" integer DEFAULT 2 NOT NULL,
	"dias_estimados_max" integer DEFAULT 5 NOT NULL,
	CONSTRAINT "tarifas_envio_departamento_unique" UNIQUE("departamento")
);
--> statement-breakpoint
CREATE TABLE "cupon_usos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cupon_id" uuid NOT NULL,
	"usuario_id" uuid,
	"pedido_id" uuid,
	"usado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pedido_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pedido_id" uuid NOT NULL,
	"producto_id" uuid,
	"variante_id" uuid,
	"nombre_producto" text NOT NULL,
	"cantidad" integer NOT NULL,
	"precio_unitario" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pedidos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid,
	"numero_pedido" text NOT NULL,
	"estado" "estado_pedido" DEFAULT 'pendiente' NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"igv" numeric(10, 2) NOT NULL,
	"descuento" numeric(10, 2) DEFAULT '0' NOT NULL,
	"costo_envio" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"cupon_id" uuid,
	"direccion_envio_id" uuid,
	"courier" text,
	"numero_tracking" text,
	"metodo_pago" "metodo_pago",
	"comprobante_pago_url" text,
	"tipo_documento" "tipo_documento" NOT NULL,
	"doc_comprador" text NOT NULL,
	"nombre_comprador" text NOT NULL,
	"telefono_comprador" text NOT NULL,
	"email_comprador" text NOT NULL,
	"requiere_factura" boolean DEFAULT false NOT NULL,
	"ruc" varchar(11),
	"razon_social" text,
	"tipo_documento_destinatario" "tipo_documento",
	"doc_destinatario" text,
	"nombre_destinatario" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pedidos_numero_pedido_unique" UNIQUE("numero_pedido")
);
--> statement-breakpoint
CREATE TABLE "resenas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"producto_id" uuid NOT NULL,
	"usuario_id" uuid NOT NULL,
	"calificacion" integer NOT NULL,
	"comentario" text,
	"foto_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"producto_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_usuario_id_producto_id_unique" UNIQUE("usuario_id","producto_id")
);
--> statement-breakpoint
CREATE TABLE "avisos_stock" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"producto_id" uuid NOT NULL,
	"email" text NOT NULL,
	"notificado" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reclamos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"folio" text NOT NULL,
	"tipo" text NOT NULL,
	"tipo_documento" "tipo_documento" NOT NULL,
	"numero_documento" text NOT NULL,
	"nombre" text NOT NULL,
	"apellidos" text,
	"domicilio" text,
	"telefono" text,
	"email" text NOT NULL,
	"es_menor_edad" boolean DEFAULT false NOT NULL,
	"tipo_bien" text,
	"monto_reclamado" numeric(10, 2),
	"descripcion_bien" text,
	"detalle_reclamo" text NOT NULL,
	"pedido_asociado_id" uuid,
	"estado" "estado_reclamo" DEFAULT 'registrado' NOT NULL,
	"respuesta" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reclamos_folio_unique" UNIQUE("folio")
);
--> statement-breakpoint
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_categoria_padre_id_categorias_id_fk" FOREIGN KEY ("categoria_padre_id") REFERENCES "public"."categorias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variantes_producto" ADD CONSTRAINT "variantes_producto_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carrito_items" ADD CONSTRAINT "carrito_items_carrito_id_carritos_id_fk" FOREIGN KEY ("carrito_id") REFERENCES "public"."carritos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carrito_items" ADD CONSTRAINT "carrito_items_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carrito_items" ADD CONSTRAINT "carrito_items_variante_id_variantes_producto_id_fk" FOREIGN KEY ("variante_id") REFERENCES "public"."variantes_producto"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carritos" ADD CONSTRAINT "carritos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cupon_usos" ADD CONSTRAINT "cupon_usos_cupon_id_cupones_id_fk" FOREIGN KEY ("cupon_id") REFERENCES "public"."cupones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cupon_usos" ADD CONSTRAINT "cupon_usos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cupon_usos" ADD CONSTRAINT "cupon_usos_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_pedido_id_pedidos_id_fk" FOREIGN KEY ("pedido_id") REFERENCES "public"."pedidos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_variante_id_variantes_producto_id_fk" FOREIGN KEY ("variante_id") REFERENCES "public"."variantes_producto"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cupon_id_cupones_id_fk" FOREIGN KEY ("cupon_id") REFERENCES "public"."cupones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_direccion_envio_id_direcciones_id_fk" FOREIGN KEY ("direccion_envio_id") REFERENCES "public"."direcciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resenas" ADD CONSTRAINT "resenas_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resenas" ADD CONSTRAINT "resenas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avisos_stock" ADD CONSTRAINT "avisos_stock_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reclamos" ADD CONSTRAINT "reclamos_pedido_asociado_id_pedidos_id_fk" FOREIGN KEY ("pedido_asociado_id") REFERENCES "public"."pedidos"("id") ON DELETE no action ON UPDATE no action;