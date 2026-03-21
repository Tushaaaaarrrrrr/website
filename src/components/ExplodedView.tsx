import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const ExplodedView = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // phase 1: 0 -> 0.5 (explode)
  // phase 2: 0.5 -> 1.0 (reassemble)
  
  const explodeX = useTransform(smoothProgress, [0, 0.4, 0.6, 1], [0, 200, 200, 0]);
  const explodeY = useTransform(smoothProgress, [0, 0.4, 0.6, 1], [0, -150, -150, 0]);
  const rotateS = useTransform(smoothProgress, [0, 0.4, 0.6, 1], [0, 45, 45, 0]);
  const scaleS = useTransform(smoothProgress, [0, 0.4, 0.6, 1], [1, 0.8, 0.8, 1]);

  return (
    <div ref={containerRef} className="h-[300vh] relative bg-black">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(206,18,52,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(206,18,52,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

        <div className="relative w-full max-w-4xl px-4">
          <div className="text-center mb-16">
            <motion.h2 
              style={{ opacity: useTransform(smoothProgress, [0, 0.2, 0.8, 1], [1, 0, 0, 1]) }}
              className="text-6xl md:text-8xl font-black font-headline uppercase text-white mb-4"
            >
              The Assembly <br/> <span className="text-primary italic">Of Skill</span>
            </motion.h2>
          </div>

          <div className="relative aspect-video flex items-center justify-center">
            {/* Main Mockup - The Mechanical Depth Center */}
            <motion.div 
              style={{ scale: scaleS, rotateX: rotateS }}
              className="relative z-10 w-full h-full brute-card overflow-hidden"
            >
              <img 
                src="/Users/laxmikant/.gemini/antigravity/brain/2f4bb589-2343-4915-894e-cd262e0d6c5f/mechanical_depth_texture_1774079887387.png" 
                alt="Mechanical Depth"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-4xl font-black text-black bg-white px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  CORE-01
                </h3>
              </div>
            </motion.div>

            {/* Satellite Components (Exploding Bits) */}
            <motion.div 
              style={{ x: explodeX, y: explodeY, rotate: rotateS }}
              className="absolute -top-10 -right-10 w-48 h-48 brute-card-red flex items-center justify-center z-20"
            >
              <div className="text-center">
                <div className="text-2xl font-black">CURRICULUM</div>
                <div className="text-xs font-mono opacity-80">v2.4.0-STABLE</div>
              </div>
            </motion.div>

            <motion.div 
              style={{ x: useTransform(smoothProgress, [0, 0.4, 0.6, 1], [0, -250, -250, 0]), y: useTransform(smoothProgress, [0, 0.4, 0.6, 1], [0, 100, 100, 0]) }}
              className="absolute -bottom-10 -left-10 w-64 h-32 brute-card p-4 z-20"
            >
              <div className="h-full border-l-4 border-primary pl-4">
                <div className="text-lg font-black uppercase">Data Engine</div>
                <div className="w-full bg-black/10 h-2 mt-2">
                  <motion.div 
                    style={{ width: useTransform(smoothProgress, [0, 1], ["0%", "100%"]) }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </motion.div>

            {/* Connecting Lines (Conceptual) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
               <motion.path
                 d="M 100 100 L 400 300"
                 stroke="#CE1234"
                 strokeWidth="2"
                 fill="none"
                 style={{ pathLength: smoothProgress }}
               />
            </svg>
          </div>

          <div className="mt-16 text-center">
            <motion.h2 
              style={{ opacity: useTransform(smoothProgress, [0, 0.8, 1], [0, 0, 1]) }}
              className="text-6xl md:text-8xl font-black font-headline uppercase text-white"
            >
              Precision <br/> <span className="text-primary italic">Reassembled</span>
            </motion.h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplodedView;
