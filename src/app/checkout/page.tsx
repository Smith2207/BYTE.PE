import { CheckoutWizard } from "./checkout-wizard";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display mb-8 text-2xl font-bold sm:text-3xl">Finalizar compra</h1>
      <CheckoutWizard />
    </div>
  );
}
