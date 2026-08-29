import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../utils/cn";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  key?: string | number;
}

export default function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      className={cn("", className)}
    >
      {children}
    </motion.div>
  );
}
