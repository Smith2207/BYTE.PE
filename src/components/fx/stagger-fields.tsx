"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/** Cascada de entrada para campos de formulario/listas cortas — cada hijo
 * directo (`StaggerField`) aparece con un pequeño delay respecto al
 * anterior. Complementa a RevealOnScroll (GSAP, para bloques que entran al
 * hacer scroll): esto es para contenido que ya está en pantalla al montar
 * (forms de login/registro, menú móvil), donde ScrollTrigger no aplica. */

const contenedor: Variants = {
  oculto: {},
  // delayChildren espera a que termine la entrada del contenedor que lo
  // envuelve (ej. la tarjeta del modal, ~0.35s) antes de arrancar la
  // cascada — si arrancan juntos, se pisan y no se lee como dos pasos.
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
};

const campo: Variants = {
  oculto: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export function StaggerFields({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reducida = useReducedMotion();
  if (reducida) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial="oculto"
      animate="visible"
      variants={contenedor}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerField({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={campo} className={className}>
      {children}
    </motion.div>
  );
}
