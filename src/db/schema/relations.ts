import { relations } from "drizzle-orm";
import { usuarios } from "./usuarios";
import { direcciones } from "./direcciones";
import { categorias, productos, variantesProducto } from "./catalogo";
import { carritos, carritoItems } from "./carrito";
import { cupones } from "./cupones";
import { pedidos, pedidoItems, cuponUsos } from "./pedidos";
import { resenas } from "./resenas";
import { wishlist } from "./wishlist";
import { compras, compraItems } from "./compras";

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  direcciones: many(direcciones),
  pedidos: many(pedidos),
  resenas: many(resenas),
  wishlist: many(wishlist),
  carritos: many(carritos),
}));

export const direccionesRelations = relations(direcciones, ({ one }) => ({
  usuario: one(usuarios, { fields: [direcciones.usuarioId], references: [usuarios.id] }),
}));

export const categoriasRelations = relations(categorias, ({ one, many }) => ({
  categoriaPadre: one(categorias, {
    fields: [categorias.categoriaPadreId],
    references: [categorias.id],
    relationName: "subcategorias",
  }),
  subcategorias: many(categorias, { relationName: "subcategorias" }),
  productos: many(productos),
}));

export const productosRelations = relations(productos, ({ one, many }) => ({
  categoria: one(categorias, { fields: [productos.categoriaId], references: [categorias.id] }),
  variantes: many(variantesProducto),
  resenas: many(resenas),
  wishlistedBy: many(wishlist),
}));

export const variantesProductoRelations = relations(variantesProducto, ({ one }) => ({
  producto: one(productos, {
    fields: [variantesProducto.productoId],
    references: [productos.id],
  }),
}));

export const carritosRelations = relations(carritos, ({ one, many }) => ({
  usuario: one(usuarios, { fields: [carritos.usuarioId], references: [usuarios.id] }),
  items: many(carritoItems),
}));

export const carritoItemsRelations = relations(carritoItems, ({ one }) => ({
  carrito: one(carritos, { fields: [carritoItems.carritoId], references: [carritos.id] }),
  producto: one(productos, { fields: [carritoItems.productoId], references: [productos.id] }),
  variante: one(variantesProducto, {
    fields: [carritoItems.varianteId],
    references: [variantesProducto.id],
  }),
}));

export const pedidosRelations = relations(pedidos, ({ one, many }) => ({
  usuario: one(usuarios, { fields: [pedidos.usuarioId], references: [usuarios.id] }),
  direccionEnvio: one(direcciones, {
    fields: [pedidos.direccionEnvioId],
    references: [direcciones.id],
  }),
  cupon: one(cupones, { fields: [pedidos.cuponId], references: [cupones.id] }),
  items: many(pedidoItems),
}));

export const pedidoItemsRelations = relations(pedidoItems, ({ one }) => ({
  pedido: one(pedidos, { fields: [pedidoItems.pedidoId], references: [pedidos.id] }),
  producto: one(productos, { fields: [pedidoItems.productoId], references: [productos.id] }),
  variante: one(variantesProducto, {
    fields: [pedidoItems.varianteId],
    references: [variantesProducto.id],
  }),
}));

export const cuponesRelations = relations(cupones, ({ many }) => ({
  usos: many(cuponUsos),
  pedidos: many(pedidos),
}));

export const cuponUsosRelations = relations(cuponUsos, ({ one }) => ({
  cupon: one(cupones, { fields: [cuponUsos.cuponId], references: [cupones.id] }),
  usuario: one(usuarios, { fields: [cuponUsos.usuarioId], references: [usuarios.id] }),
  pedido: one(pedidos, { fields: [cuponUsos.pedidoId], references: [pedidos.id] }),
}));

export const resenasRelations = relations(resenas, ({ one }) => ({
  producto: one(productos, { fields: [resenas.productoId], references: [productos.id] }),
  usuario: one(usuarios, { fields: [resenas.usuarioId], references: [usuarios.id] }),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  usuario: one(usuarios, { fields: [wishlist.usuarioId], references: [usuarios.id] }),
  producto: one(productos, { fields: [wishlist.productoId], references: [productos.id] }),
}));

export const comprasRelations = relations(compras, ({ many }) => ({
  items: many(compraItems),
}));

export const compraItemsRelations = relations(compraItems, ({ one }) => ({
  compra: one(compras, { fields: [compraItems.compraId], references: [compras.id] }),
  producto: one(productos, { fields: [compraItems.productoId], references: [productos.id] }),
}));
