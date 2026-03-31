import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NeonGlowButtonProps {
  label: string;
  hoverText: string;
  className?: string;
}

const NeonGlowButton: React.FC<NeonGlowButtonProps> = ({ 
  label, 
  hoverText, 
  className = "" 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isHovered) {
      let currentText = "";
      let index = 0;
      const type = () => {
        if (index < hoverText.length) {
          currentText += hoverText[index];
          setDisplayText(currentText);
          index++;
          timeoutId = setTimeout(type, 50);
        }
      };
      type();
    } else {
      setDisplayText("");
    }
    return () => clearTimeout(timeoutId);
  }, [isHovered, hoverText]);

  return (
    <motion.button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden px-6 py-4 
        bg-black border-2 border-primary/30
        text-white font-mono text-sm uppercase tracking-tighter
        transition-all duration-300 group
        ${isHovered ? 'border-secondary shadow-[0_0_20px_rgba(168,85,247,0.4)]' : ''}
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 
        bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.15)_0%,_transparent_70%)]" 
      />
      
      <div className="relative z-10 flex items-center justify-between gap-4">
        <span className={`transition-all duration-300 ${isHovered ? 'text-secondary font-black' : 'text-gray-400'}`}>
          {isHovered ? "> " : ""}{label}
        </span>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-secondary font-black flex items-center"
            >
              <span>{displayText}</span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                className="ml-1 w-2 h-4 bg-secondary inline-block align-middle"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Futuristic corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary/20 group-hover:border-secondary transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary/20 group-hover:border-secondary transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary/20 group-hover:border-secondary transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary/20 group-hover:border-secondary transition-colors" />
    </motion.button>
  );
};

export default NeonGlowButton;
