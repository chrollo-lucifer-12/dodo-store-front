"use client";

import { useReducedMotion } from "framer-motion";
import { PropsWithChildren } from "react";
import { motion } from "framer-motion";

const MotionFadeIn = ({ children }: PropsWithChildren) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default MotionFadeIn;
