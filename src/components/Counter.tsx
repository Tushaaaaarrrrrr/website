import React from 'react';
import { motion, useInView, animate } from 'framer-motion';

interface CounterProps {
  value: number;
  label: string;
  suffix?: string;
}

const Counter: React.FC<CounterProps> = ({ value, label, suffix = '' }) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration: 2,
        onUpdate: (latest) => setCount(latest),
      });
      return () => controls.stop();
    }
  }, [isInView, value]);

  const rounded = Math.floor(count).toLocaleString();

  return (
    <div className="text-center p-8 brute-card bg-surface">
      <motion.span 
        ref={ref} 
        className="text-6xl font-headline font-black text-primary block mb-2"
      >
        {rounded}{suffix}
      </motion.span>
      <span className="text-sm uppercase tracking-widest font-black text-black/60">
        {label}
      </span>
    </div>
  );
};

export default Counter;
