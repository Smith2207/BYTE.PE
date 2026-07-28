import { describe, expect, it } from "vitest";
import * as OTPAuth from "otpauth";
import { generarSecretoTotp, verificarCodigoTotp } from "./totp";

describe("totp", () => {
  it("genera un secreto y una URL otpauth válidos", () => {
    const { secret, url } = generarSecretoTotp("admin@byte.pe");
    expect(secret.length).toBeGreaterThan(0);
    expect(url).toMatch(/^otpauth:\/\/totp\//);
  });

  it("acepta el código correcto del momento actual", () => {
    const { secret } = generarSecretoTotp("admin@byte.pe");
    const totp = new OTPAuth.TOTP({
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });
    const codigoValido = totp.generate();
    expect(verificarCodigoTotp(secret, codigoValido)).toBe(true);
  });

  it("rechaza un código incorrecto", () => {
    const { secret } = generarSecretoTotp("admin@byte.pe");
    expect(verificarCodigoTotp(secret, "000000")).toBe(false);
  });
});
