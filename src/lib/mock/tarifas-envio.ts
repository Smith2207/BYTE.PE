import { tarifasEnvioSeed } from "@/data/catalogo-seed";

/**
 * Sin dependencias de Node (fs/path): a diferencia del resto de repo.ts,
 * esto se usa también desde componentes cliente (ej. checkout-wizard.tsx)
 * para mostrar el costo de envío en vivo mientras el usuario elige el
 * departamento, sin ida y vuelta al servidor.
 */
export function getTarifasEnvio() {
  return tarifasEnvioSeed;
}

export function getTarifaEnvioPorDepartamento(departamento: string) {
  return (
    tarifasEnvioSeed.find((t) => t.departamento === departamento) ??
    tarifasEnvioSeed.find((t) => t.departamento === "Otros")!
  );
}
