import { describe, expect, it } from "vitest";
import { validarCupon } from "./validar";
import type { CuponAlmacenado } from "./store";

function cupon(overrides: Partial<CuponAlmacenado> = {}): CuponAlmacenado {
  return {
    id: "1",
    codigo: "DESCUENTO10",
    tipo: "porcentaje",
    valor: 10,
    montoMinimoCompra: 0,
    fechaInicio: "2020-01-01T00:00:00.000Z",
    fechaFin: "2999-01-01T00:00:00.000Z",
    usosMaximos: null,
    usosActuales: 0,
    activo: true,
    ...overrides,
  };
}

describe("validarCupon", () => {
  it("rechaza si el cupón no existe", () => {
    const resultado = validarCupon(undefined, { subtotal: 100 });
    expect(resultado.ok).toBe(false);
  });

  it("rechaza un cupón fuera de su rango de fechas", () => {
    const vencido = cupon({ fechaFin: "2020-06-01T00:00:00.000Z" });
    const resultado = validarCupon(vencido, { subtotal: 100 });
    expect(resultado).toEqual({ ok: false, motivo: "Este cupón no está vigente." });
  });

  it("rechaza un cupón que ya alcanzó su límite de usos", () => {
    const agotado = cupon({ usosMaximos: 5, usosActuales: 5 });
    const resultado = validarCupon(agotado, { subtotal: 100 });
    expect(resultado.ok).toBe(false);
  });

  it("rechaza si el subtotal no alcanza el mínimo de compra", () => {
    const conMinimo = cupon({ montoMinimoCompra: 200 });
    const resultado = validarCupon(conMinimo, { subtotal: 100 });
    expect(resultado.ok).toBe(false);
  });

  it("calcula el descuento porcentual sobre el subtotal", () => {
    const resultado = validarCupon(cupon({ tipo: "porcentaje", valor: 10 }), { subtotal: 200 });
    expect(resultado).toMatchObject({ ok: true, descuento: 20, envioGratis: false });
  });

  it("el descuento nunca supera el subtotal (monto fijo mayor al subtotal)", () => {
    const resultado = validarCupon(cupon({ tipo: "monto_fijo", valor: 500 }), { subtotal: 100 });
    expect(resultado).toMatchObject({ ok: true, descuento: 100 });
  });

  it("un cupón de envío gratis no descuenta del subtotal, solo marca envioGratis", () => {
    const resultado = validarCupon(cupon({ tipo: "envio_gratis", valor: 0 }), { subtotal: 300 });
    expect(resultado).toMatchObject({ ok: true, descuento: 0, envioGratis: true });
  });
});
