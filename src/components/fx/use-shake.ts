import { useAnimationControls } from "framer-motion";

/** Sacude un elemento en X — feedback de error en forms (login/registro).
 * `controls` se conecta a un `motion.div` vía `animate={controls}`. */
export function useShake() {
  const controls = useAnimationControls();
  function shake() {
    controls.start({
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      transition: { duration: 0.45, ease: "easeInOut" },
    });
  }
  return { controls, shake };
}
