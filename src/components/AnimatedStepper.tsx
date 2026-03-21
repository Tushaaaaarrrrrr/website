import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import BruteButton from './BruteButton';

interface Step {
  title: string;
  description: string;
  content: React.ReactNode;
}

const steps: Step[] = [
  {
    title: "Choose Your Path",
    description: "Select the course that best fits your current skill level and career goals.",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="brute-card p-6 border-l-8 border-l-primary">
          <h4 className="text-xl font-black mb-2">Foundation</h4>
          <p className="text-sm opacity-70">Data Science Essentials for beginners.</p>
        </div>
        <div className="brute-card p-6 border-l-8 border-l-black">
          <h4 className="text-xl font-black mb-2">Advanced</h4>
          <p className="text-sm opacity-70">ML & AI for experienced developers.</p>
        </div>
      </div>
    )
  },
  {
    title: "Master the Skills",
    description: "Dive deep into industry-expert led curriculum with hands-on projects.",
    content: (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-2 border-black bg-white/5">
            <div className="w-10 h-10 bg-primary text-white flex items-center justify-center font-black">0{i}</div>
            <div className="font-bold uppercase tracking-tight">Industrial Module {i}</div>
          </div>
        ))}
      </div>
    )
  },
  {
    title: "Gain Certification",
    description: "Complete your capstone and join the elite Alpha IITIAN collective.",
    content: (
      <div className="text-center py-8 brute-card-red">
        <div className="w-20 h-20 bg-white text-primary rounded-full mx-auto flex items-center justify-center mb-4 border-4 border-black">
          <Check size={40} strokeWidth={4} />
        </div>
        <h4 className="text-2xl font-black uppercase">Certification Ready</h4>
      </div>
    )
  }
];

export function AnimatedStepper() {
  const [currentStep, setCurrentStep] = React.useState(0);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="max-w-4xl mx-auto w-full brute-card p-8 bg-surface text-black">
      <div className="flex justify-between items-center mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-black/10 -translate-y-1/2 z-0" />
        <motion.div 
          initial={false}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
        />
        
        {steps.map((_, index) => (
          <div key={index} className="relative z-10 flex flex-col items-center">
            <motion.div
              animate={{
                backgroundColor: index <= currentStep ? "#CE1234" : "#F3F0E0",
                borderColor: index <= currentStep ? "#000000" : "rgba(0,0,0,0.1)",
                scale: index === currentStep ? 1.2 : 1,
              }}
              className="w-12 h-12 border-4 flex items-center justify-center font-black transition-colors"
            >
              {index < currentStep ? <Check size={20} color="white" strokeWidth={4} /> : <span className={index === currentStep ? "text-white" : "text-black/30"}>{index + 1}</span>}
            </motion.div>
          </div>
        ))}
      </div>

      <div className="min-h-[300px] mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-4xl font-black uppercase mb-2 italic">{steps[currentStep].title}</h3>
              <p className="text-black/60 font-bold">{steps[currentStep].description}</p>
            </div>
            <div className="p-6 bg-black/5 border-2 border-black/10">
              {steps[currentStep].content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between gap-4">
        <BruteButton 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 0}
          className={currentStep === 0 ? "opacity-30 cursor-not-allowed" : ""}
        >
          <div className="flex items-center gap-2">
            <ChevronLeft size={20} strokeWidth={3} /> BACK
          </div>
        </BruteButton>
        <BruteButton 
          variant={currentStep === steps.length - 1 ? "black" : "primary"}
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
        >
          <div className="flex items-center gap-2">
            {currentStep === steps.length - 1 ? "FINISH" : "CONTINUE"} <ChevronRight size={20} strokeWidth={3} />
          </div>
        </BruteButton>
      </div>
    </div>
  );
}

export default AnimatedStepper;
