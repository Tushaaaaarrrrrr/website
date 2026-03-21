import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BruteButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'outline' | 'black' | 'red';
  isTyping?: boolean;
  children?: React.ReactNode;
}

const BruteButton = React.forwardRef<HTMLButtonElement, BruteButtonProps>(
  ({ className, variant = 'primary', isTyping = false, children, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-surface border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
      outline: "bg-surface text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
      black: "bg-black text-surface border-2 border-primary shadow-[4px_4px_0px_0px_rgba(206,18,52,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
      red: "bg-primary text-surface border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "px-8 py-3 font-headline font-bold text-lg uppercase tracking-wider transition-all duration-100",
          variants[variant],
          className
        )}
        {...props}
      >
        <span className={cn(isTyping && "cursor-blink")}>
          {children}
        </span>
      </motion.button>
    );
  }
);

BruteButton.displayName = "BruteButton";

export default BruteButton;
