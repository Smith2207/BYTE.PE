import { CarritoContenido } from "./carrito-contenido";

export const metadata = { title: "Carrito de compras" };

export default function CarritoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display mb-8 text-2xl font-bold sm:text-3xl">Tu carrito</h1>
      <CarritoContenido />
    </div>
  );
}
