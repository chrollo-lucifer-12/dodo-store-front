"use client";
import { ReactNode } from "react";

import { motion } from "framer-motion";
interface ProductHoverCardProps {
  children: ReactNode;
  className?: string;
}

const ProductHoverCard = ({ children, className }: ProductHoverCardProps) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        boxShadow: "0px 20px 40px rgba(0,0,0,0.15)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ProductHoverCard;
