DROP INDEX CONCURRENTLY IF EXISTS "resenas_usuario_producto_unq";--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "pedido_items_pedido_idx" ON "pedido_items" USING btree ("pedido_id");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "pedido_items_producto_idx" ON "pedido_items" USING btree ("producto_id");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "pedidos_usuario_idx" ON "pedidos" USING btree ("usuario_id");--> statement-breakpoint
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "resenas_producto_usuario_unq" ON "resenas" USING btree ("producto_id","usuario_id");--> statement-breakpoint
CREATE INDEX CONCURRENTLY IF NOT EXISTS "intentos_seguridad_clave_idx" ON "intentos_seguridad" USING btree ("clave");
