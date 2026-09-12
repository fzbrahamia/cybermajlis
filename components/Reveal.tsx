"use client";

/* A motion.div that reveals itself the way useReveal defines it: shown at once
 * if it is at or above the fold, otherwise on scroll, and never left invisible.
 *
 * It exists because a hook cannot be called inside a .map callback, and most
 * of the places that need this are exactly that — a row of cards built from an
 * array. Wrapping the item in a component is the only way each one gets its
 * own ref.
 */

import { motion, useReducedMotion, type Transition, type TargetAndTransition } from "framer-motion";
import { useReveal } from "@/hooks/useReveal";

export default function Reveal({
  from = { opacity: 0, y: 16 },
  to = { opacity: 1, y: 0 },
  transition,
  children,
  ...rest
}: {
  from?: TargetAndTransition;
  to?: TargetAndTransition;
  transition?: Transition;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof motion.div>, "initial" | "animate" | "transition" | "children">) {
  const reduce = useReducedMotion();
  const [ref, shown] = useReveal<HTMLDivElement>();
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : from}
      animate={shown || reduce ? to : from}
      transition={transition}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
