import { describe, expect, it } from "vitest";
import { calcularCostoPonderado } from "./costeo";

describe("calcularCostoPonderado", () => {
  it("promedia el costo previo con el de la nueva entrada, ponderado por cantidad", () => {
    // 10 unidades a 100 + 10 unidades a 200 → promedio 150
    expect(calcularCostoPonderado(10, 100, 10, 200)).toBe(150);
  });

  it("pondera más el lado con más unidades", () => {
    // 90 unidades a 100 + 10 unidades a 200 → 9000+2000=11000 / 100 = 110
    expect(calcularCostoPonderado(90, 100, 10, 200)).toBe(110);
  });

  it("si no había stock previo, el costo nuevo es el costo unitario de la compra", () => {
    expect(calcularCostoPonderado(0, 0, 5, 80)).toBe(80);
  });

  it("no divide por cero cuando tanto el stock previo como la cantidad nueva son 0", () => {
    expect(calcularCostoPonderado(0, 0, 0, 50)).toBe(50);
  });

  it("redondea a 2 decimales", () => {
    // 3 unidades a 10 + 3 unidades a 11 → promedio 10.5 exacto, probamos un caso con cola larga
    expect(calcularCostoPonderado(1, 10, 2, 11)).toBeCloseTo(10.67, 2);
  });
});
