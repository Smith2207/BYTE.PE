import { describe, expect, it } from "vitest";
import { desglosarIGV } from "./format";

describe("desglosarIGV", () => {
  it("la base imponible más el IGV siempre reconstruye el precio original", () => {
    for (const precio of [10, 99.9, 118, 250.5, 1999.99]) {
      const { baseImponible, igv } = desglosarIGV(precio);
      expect(Math.round((baseImponible + igv) * 100) / 100).toBe(precio);
    }
  });

  it("nunca agrega un 18% extra — el IGV siempre es una porción del precio ya cobrado", () => {
    const precio = 118;
    const { baseImponible, igv } = desglosarIGV(precio);
    // 118 con IGV incluido → base 100, IGV 18 (no 118 + 18% = 139.24)
    expect(baseImponible).toBeCloseTo(100, 2);
    expect(igv).toBeCloseTo(18, 2);
  });

  it("redondea ambos valores a 2 decimales", () => {
    const { baseImponible, igv } = desglosarIGV(99.9);
    expect(Number(baseImponible.toFixed(2))).toBe(baseImponible);
    expect(Number(igv.toFixed(2))).toBe(igv);
  });
});
