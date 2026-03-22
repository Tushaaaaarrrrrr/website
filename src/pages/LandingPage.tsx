import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Code2,
  Database,
  Shield,
  Layers,
  ArrowRight,
  Search,
  FileJson,
  Table2,
  Activity,
  Cpu
} from 'lucide-react';
import BruteButton from '../components/BruteButton';
import Counter from '../components/Counter';
import ExplodedView from '../components/ExplodedView';
import AnimatedStepper from '../components/AnimatedStepper';
import TiltCard from '../components/TiltCard';
import NeonGlowButton from '../components/NeonGlowButton';
import InteractiveFolder from '../components/InteractiveFolder';

function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-6 overflow-hidden min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block bg-primary text-white font-black px-4 py-1 uppercase tracking-[0.3em] text-xs mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Established 2024 // GEN-01
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <h1 className="text-7xl md:text-9xl font-black font-headline leading-[0.85] uppercase mb-4 hover:text-primary transition-colors duration-500 cursor-default">
                MASTER <br />
                <span className="text-primary italic">DATA</span> <br />
                SCIENCE.
              </h1>
            </motion.div>
            <p className="text-xl text-surface max-w-lg mb-6 font-bold leading-relaxed border-l-4 border-primary pl-6">
              Build real-world ML systems. We forge industry-ready data scientists through rigorous curriculum, hands-on analytics, and career-focused learning.
            </p>
            <div className="flex flex-wrap gap-6">
              <a href="#courses">
                <BruteButton variant="primary" isTyping>Explore Courses</BruteButton>
              </a>
              <a href="#about">
                <BruteButton variant="outline">Learn More</BruteButton>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block perspective-1000"
          >
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full"></div>
            
            <TiltCard>
              <div className="brute-card bg-surface p-2 p-8 relative shadow-2xl">
                  <motion.div 
                    className="text-9xl font-black text-black/5 absolute -top-10 -right-10 pointer-events-none"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  >
                    01
                  </motion.div>
                   <div className="space-y-4 relative z-10" style={{ transform: "translateZ(30px)" }}>
                      <div className="flex items-center justify-between border-b-2 border-black/10 pb-4">
                          <div className="flex items-center gap-4">
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              <Code2 className="text-primary" size={32} />
                            </motion.div>
                            <span className="font-black uppercase text-xl">Industrial Analytics</span>
                          </div>
                      </div>

                      <motion.div 
                        initial="hidden"
                        animate="show"
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.15,
                              delayChildren: 0.3
                            }
                          }
                        }}
                        className="grid grid-cols-2 gap-4"
                      >
                        {/* Box 1: Terminal Snippet with Typing Effect */}
                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 }
                          }}
                          className="bg-black text-[10px] text-white p-3 font-mono border-l-4 border-primary brute-card shadow-sm h-32 flex flex-col justify-center"
                        >
                          <div className="text-primary opacity-50 mb-1">ST-01 // READY</div>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatDelay: 3 }}
                            className="overflow-hidden whitespace-nowrap"
                          >
                            {"> INCOMING DATA..."}
                          </motion.div>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, delay: 0.5, ease: "linear", repeat: Infinity, repeatDelay: 3 }}
                            className="overflow-hidden whitespace-nowrap"
                          >
                            {"> MODEL LOADED"}
                          </motion.div>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, delay: 1, ease: "linear", repeat: Infinity, repeatDelay: 4 }}
                            className="overflow-hidden whitespace-nowrap font-black text-primary"
                          >
                            {"> OPTIMIZING..."}
                          </motion.div>
                        </motion.div>

                        {/* Box 2: System Stats with Counter */}
                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 }
                          }}
                          className="brute-card bg-surface p-3 h-32 flex flex-col justify-center items-center text-center"
                        >
                          <Activity size={20} className="text-primary mb-2 animate-pulse" />
                          <div className="text-[10px] font-black uppercase text-black/40">Accuracy</div>
                          <div className="text-2xl font-black text-black tabular-nums">
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                               98.4%
                            </motion.span>
                          </div>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "80%" }}
                            transition={{ duration: 1.5, delay: 1 }}
                            className="h-1 bg-primary/20 mt-2 w-full max-w-[40px] overflow-hidden"
                          >
                            <motion.div 
                              animate={{ x: ["-100%", "100%"] }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="h-full w-full bg-primary"
                            />
                          </motion.div>
                        </motion.div>

                        {/* Box 3: Repositories */}
                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 }
                          }}
                          className="brute-card bg-surface/50 p-3 h-32 flex items-center justify-center overflow-visible"
                        >
                          <InteractiveFolder 
                            label="REPOS"
                            color="#CE1234"
                            size={0.7}
                            items={[
                              <Database key="1" className="w-5 h-5 text-primary" />,
                              <Cpu key="2" className="w-5 h-5 text-primary" />,
                              <Table2 key="3" className="w-5 h-5 text-primary" />
                            ]}
                          />
                        </motion.div>

                        {/* Box 4: Controls */}
                        <motion.div 
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 }
                          }}
                          className="grid grid-rows-2 gap-2 h-32"
                        >
                          <NeonGlowButton 
                            label="DEPLOY" 
                            hoverText="OK" 
                            className="h-full py-0 text-[10px] border-1"
                          />
                          <NeonGlowButton 
                            label="RUN" 
                            hoverText="...PRC" 
                            className="h-full py-0 text-[10px] border-1"
                          />
                        </motion.div>
                      </motion.div>
                  </div>
              </div>
            </TiltCard>
          </motion.div>
        </div>

        {/* Ticker Tape */}
        <div className="absolute bottom-0 w-full bg-primary py-3 overflow-hidden border-y-4 border-black rotate-1 scale-110">
          <div className="flex whitespace-nowrap animate-marquee w-max font-black text-surface uppercase tracking-widest text-sm">
            {Array(20).fill(" // MACHINE LEARNING // AI ANALYTICS // DATA SCIENCE PIPELINES ").map((t, i) => (
              <span key={i} className="px-2">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* About / Manifesto */}
      <section id="about" className="py-24 px-6 bg-surface text-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-1/3">
              <h2 className="text-5xl font-black font-headline uppercase leading-tight">
                Why <span className="text-primary italic">Alpha?</span>
              </h2>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 border-l-4 border-black pl-6">
                <h4 className="text-2xl font-black uppercase">Industrial Data Science</h4>
                <p className="font-bold text-black/60">Our curriculum isn't academic; it's industrial. Learn Python, Machine Learning, and AI hands-on.</p>
              </div>
              <div className="space-y-4 border-l-4 border-black pl-6">
                <h4 className="text-2xl font-black uppercase">Career-Focused Projects</h4>
                <p className="font-bold text-black/60">Build portfolios with real-world datasets. No filler, just industry-grade analytics and ML deployment.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements / Statistics */}
      <section id="results" className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <Counter value={3345} suffix="+" label="Students Enrolled" />
          <Counter value={92} suffix="%" label="Success Rate" />
          <Counter value={150} suffix="+" label="Projects Completed" />
        </div>
      </section>

      {/* Exploded View - The Assembly */}
      <section className="py-0">
        <ExplodedView />
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-32 px-6 bg-surface text-black border-y-8 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-7xl font-black font-headline uppercase mb-4">The Registry.</h2>
            <div className="w-24 h-4 bg-primary mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: "python-data-science", title: "Python for Data Science", price: "₹299", icon: <Database /> },
              { id: "deep-learning", title: "Deep Learning Mastery", price: "₹399", icon: <Layers /> },
              { id: "advanced-ai", title: "Advanced AI & ML", price: "₹499", icon: <Shield /> }
            ].map((course, i) => (
              <div key={i} className="brute-card flex flex-col group hover:-translate-y-2 transition-transform">
                <div className="p-8 border-b-4 border-black bg-white/5 group-hover:bg-primary/5 transition-colors">
                  <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {course.icon}
                  </div>
                  <h3 className="text-3xl font-black uppercase leading-tight mb-2">{course.title}</h3>
                  <div className="text-primary font-black text-4xl italic group-hover:scale-105 transition-transform origin-left">{course.price}</div>
                </div>
                <div className="p-8 bg-surface">
                  <ul className="space-y-3 mb-8">
                    {["Recorded Lectures", "Live Doubt Sessions", "Real Projects"].map((feat, j) => (
                      <li key={j} className="flex items-center gap-2 font-bold uppercase text-xs">
                        <ArrowRight size={14} className="text-primary" /> {feat}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/course/${course.id}`} className="w-full">
                    <BruteButton variant="primary" className="w-full">Initialize Access</BruteButton>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enrollment Stepper */}
      <section className="py-32 px-6 bg-black relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-black font-headline uppercase text-white mb-4">Join the <span className="text-primary italic">Underground.</span></h2>
            <p className="text-surface/80 font-bold uppercase tracking-widest text-sm">Automated Enrollment Pipeline Status: Online</p>
          </div>
          <AnimatedStepper />
        </div>
      </section>
    </>
  );
}

export default LandingPage;
