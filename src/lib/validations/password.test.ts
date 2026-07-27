import { describe, expect, it } from "vitest";
import { passwordValida } from "./password";

describe("passwordValida", () => {
  it("rechaza contraseñas que no cumplen todos los requisitos", () => {
    expect(passwordValida("corta1!")).toBe(false); // menos de 8
    expect(passwordValida("sinmayuscula1!")).toBe(false);
    expect(passwordValida("SINMINUSCULA1!")).toBe(false);
    expect(passwordValida("SinNumero!")).toBe(false);
    expect(passwordValida("SinSimbolo1")).toBe(false);
  });

  it("acepta una contraseña que cumple los 5 requisitos", () => {
    expect(passwordValida("Correcta1!")).toBe(true);
  });
});
