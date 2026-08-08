"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function ensureGsapPlugins() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Falso en touch/stylus sin mouse real — evita registrar listeners de
 * "mousemove" para efectos parallax que en pantallas táctiles nunca se
 * disparan y solo queman batería/CPU sin ningún beneficio visual. */
export function hasFinePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
}

export { gsap, ScrollTrigger };
