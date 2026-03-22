/**
 * InteractiveFolder Component
 * A premium, interactive folder UI element adapted for the Alpha IITIAN design system.
 * Features a playful opening animation and "drifting" paper elements.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FolderProps {
  /** Main color of the folder flap (alphaiitian intense red) */
  color?: string;
  /** Scale factor for the folder */
  size?: number;
  /** Array of React elements to display as "papers" inside the folder */
  items?: React.ReactNode[];
  /** Optional CSS class for the wrapper */
  className?: string;
  /** Title or label to display on the folder */
  label?: string;
}

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

export function InteractiveFolder({ 
  color = '#CE1234', 
  size = 1, 
  items = [], 
  className = '',
  label
}: FolderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const maxVisibleItems = 3;
  const displayItems = items.slice(0, maxVisibleItems);
  while (displayItems.length < maxVisibleItems) {
    displayItems.push(null);
  }

  const folderBackColor = darkenColor(color, 0.12);
  const paperColors = [
    '#ffffff',
    '#F3F0E0',
    '#ffffff'
  ];

  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    if (!isOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.2;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.2;
    setMousePos({ x, y });
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setHoveredIndex(null);
  };

  const getPaperTransform = (index: number) => {
    if (!isOpen) return { x: '-50%', y: '10%', rotate: 0 };
    
    const baseTransforms = [
      { x: '-110%', y: '-65%', rotate: -12 },
      { x: '10%', y: '-65%', rotate: 12 },
      { x: '-50%', y: '-95%', rotate: 0 }
    ];

    const base = baseTransforms[index] || { x: '-50%', y: '-50%', rotate: 0 };
    
    if (hoveredIndex === index) {
      return {
        x: `calc(${base.x} + ${mousePos.x}px)`,
        y: `calc(${base.y} + ${mousePos.y}px)`,
        rotate: base.rotate,
        scale: 1.1,
      };
    }
    
    return base;
  };

  return (
    <div 
      className={cn("relative flex items-center justify-center pointer-events-auto", className)}
      style={{ transform: `scale(${size})`, width: 120, height: 100 }}
    >
      <div
        className="relative cursor-pointer group select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Folder Back */}
        <div
          className="relative w-[110px] h-[85px] transition-all duration-500 rounded-tr-[4px] rounded-br-[4px] rounded-bl-[4px] border-b-4 border-r-4 border-black"
          style={{ 
            backgroundColor: folderBackColor,
            zIndex: 10
          }}
        >
          {/* Tab */}
          <div
            className="absolute bottom-full left-0 w-[40px] h-[15px] rounded-t-[4px] border-t-2 border-x-2 border-black"
            style={{ backgroundColor: folderBackColor }}
          />

          {/* Papers */}
          {displayItems.map((item, i) => (
            <motion.div
              key={i}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={handleMouseLeave}
              animate={getPaperTransform(i)}
              transition={{ 
                type: 'spring', 
                stiffness: 260, 
                damping: 20,
                mass: 1 
              }}
              className="absolute left-1/2 flex items-center justify-center overflow-hidden border-2 border-black p-2"
              style={{
                zIndex: 20,
                backgroundColor: paperColors[i],
                width: i === 0 ? '75px' : i === 1 ? '85px' : '90px',
                height: i === 0 ? '95px' : i === 1 ? '100px' : '110px',
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
              }}
            >
              {item || (
                <div className="w-full h-full flex flex-col gap-1.5 opacity-20 text-black">
                  <div className="w-full h-1 bg-current rounded-full" />
                  <div className="w-3/4 h-1 bg-current rounded-full" />
                  <div className="w-1/2 h-1 bg-current rounded-full" />
                  <div className="w-full h-2 bg-primary/20 mt-2" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Folder Front Flap - Left Side */}
          <motion.div
            animate={{
              skewX: isOpen ? 15 : 0,
              scaleY: isOpen ? 0.3 : 1,
              translateY: isOpen ? 10 : 0
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute inset-0 z-30 origin-bottom border-l-2 border-black"
            style={{
              backgroundColor: color,
              clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
            }}
          />

          {/* Folder Front Flap - Right Side */}
          <motion.div
            animate={{
              skewX: isOpen ? -15 : 0,
              scaleY: isOpen ? 0.3 : 1,
              translateY: isOpen ? 10 : 0
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute inset-0 z-30 origin-bottom border-r-4 border-b-4 border-black"
            style={{
              backgroundColor: color,
              clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'
            }}
          >
             {label && !isOpen && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-black uppercase text-[10px] tracking-widest whitespace-nowrap bg-black/20 px-1 py-0.5 font-headline">
                {label}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveFolder;
