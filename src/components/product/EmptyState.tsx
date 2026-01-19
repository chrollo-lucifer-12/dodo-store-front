"use client";

import { LucideIcon } from "lucide-react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

const iconVariants: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 18 },
  },
};

const EmptyState = ({ description, icon: Icon, title }: EmptyStateProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <Empty className="w-full">
      <motion.div
        variants={reduceMotion ? undefined : containerVariants}
        initial="hidden"
        animate="visible"
      >
        <EmptyHeader>
          <motion.div variants={reduceMotion ? undefined : iconVariants}>
            <EmptyMedia variant="icon">
              <Icon className="h-6 w-6 text-muted-foreground" />
            </EmptyMedia>
          </motion.div>

          <motion.div variants={reduceMotion ? undefined : itemVariants}>
            <EmptyTitle>{title}</EmptyTitle>
          </motion.div>

          <motion.div variants={reduceMotion ? undefined : itemVariants}>
            <EmptyDescription>{description}</EmptyDescription>
          </motion.div>
        </EmptyHeader>
      </motion.div>
    </Empty>
  );
};

export default EmptyState;
