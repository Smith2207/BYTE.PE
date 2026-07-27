/**
 * Política de contraseña, centralizada para reutilizarla igual en
 * registro y en restablecer/cambiar contraseña — y para mostrarla como
 * checklist en vivo en el formulario (ver ChecklistPassword). Mismo
 * criterio ya aplicado en el otro proyecto (PAWPATROLL).
 */

export type ReglaPassword = {
  id: string;
  label: string;
  cumple: (password: string) => boolean;
};

export const REGLAS_PASSWORD: ReglaPassword[] = [
  { id: "longitud", label: "Al menos 8 caracteres", cumple: (p) => p.length >= 8 },
  { id: "mayuscula", label: "Una letra mayúscula (A-Z)", cumple: (p) => /[A-Z]/.test(p) },
  { id: "minuscula", label: "Una letra minúscula (a-z)", cumple: (p) => /[a-z]/.test(p) },
  { id: "numero", label: "Un número (0-9)", cumple: (p) => /[0-9]/.test(p) },
  {
    id: "simbolo",
    label: "Un símbolo o signo de puntuación (!@#$%...)",
    cumple: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

export const MENSAJE_PASSWORD_INVALIDA =
  "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.";

export function passwordValida(password: string): boolean {
  return REGLAS_PASSWORD.every((r) => r.cumple(password));
}
