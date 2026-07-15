/** Constantes de motion compartidas — dirección "High-End Cyberpunk
 * Minimalist" (ver docs/brief-diseno-stitch.md). Evita repetir strings
 * mágicos de easing/stagger en cada componente. */

/** Para transiciones CSS puras (hover, `transition-*` de Tailwind). */
export const SPRING_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

/** Para animaciones GSAP dirigidas por JS (más "rebote" que SPRING_EASE). */
export const ELASTIC_EASE = "elastic.out(1.2, 0.4)";

/** Rango recomendado de stagger para grillas/listas — nunca aparecen de golpe. */
export const STAGGER_MIN = 0.03;
export const STAGGER_MAX = 0.05;

/** Card translúcida sobre el fondo cinemático (login/registro/cuenta) —
 * antes repetida a mano en cada archivo, cualquier ajuste al estilo
 * "vidrio" requería tocar 5+ lugares. */
export const GLASS_CARD = "border-border bg-card/80 backdrop-blur-lg";
