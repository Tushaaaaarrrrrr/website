import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, Video, Users, FileText, Code2, Award } from 'lucide-react';
import BruteButton from '../components/BruteButton';

import { supabase } from '../lib/supabase';
const features = [
  { icon: <Video className="text-primary" />, text: "Recorded Lectures" },
  { icon: <Users className="text-primary" />, text: "Live Doubt Sessions" },
  { icon: <FileText className="text-primary" />, text: "Assignments" },
  { icon: <Code2 className="text-primary" />, text: "Real Projects" },
  { icon: <Award className="text-primary" />, text: "Certification" }
];

function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchCourse() {
      if (!id) return;
      setLoading(true);
      const { data } = await supabase.from('courses').select('*').eq('id', id).single();
      if (data) setCourse(data);
      setLoading(false);
    }
    fetchCourse();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-black uppercase text-2xl animate-pulse">Initializing Interface...</div>;

  if (!course) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center p-6">
      <h1 className="text-6xl font-black text-red-500 uppercase mb-4">404</h1>
      <p className="text-xl font-bold font-mono text-white/50 mb-8 mt-2 uppercase">Course not found in registry.</p>
      <Link to="/#courses"><BruteButton variant="outline">Return to Database</BruteButton></Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
      <Link to="/#courses" className="inline-flex items-center gap-2 text-surface/60 font-bold uppercase tracking-widest text-sm hover:text-primary mb-12 transition-colors">
        <ArrowLeft size={16} /> Back to Registry
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-black font-headline uppercase leading-tight mb-6">{course.name}</h1>
            <p className="text-xl text-surface/80 font-bold leading-relaxed border-l-4 border-primary pl-6">
              {course.description}
            </p>
          </motion.div>

          {/* What You Will Learn */}
          {(course.learn && course.learn.length > 0) && (
            <div className="brute-card bg-surface p-8 text-black">
              <h3 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary text-white flex items-center justify-center">01</span>
                What You Will Learn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {course.learn.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 font-bold border-2 border-black/10 p-4">
                    <Check className="text-primary shrink-0" />
                    <span className="leading-tight">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Who This Is For & Outcomes */}
          {(course.who || course.outcomes) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {course.who && (
                <div>
                  <h4 className="text-2xl font-black uppercase mb-4 text-surface border-b-2 border-primary inline-block pb-1">Target Audience</h4>
                  <p className="text-surface/70 font-bold">{course.who}</p>
                </div>
              )}
              {course.outcomes && (
                <div>
                  <h4 className="text-2xl font-black uppercase mb-4 text-surface border-b-2 border-primary inline-block pb-1">Outcomes</h4>
                  <p className="text-surface/70 font-bold">{course.outcomes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar / Checkout */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 brute-card flex flex-col">
            <div className="p-8 border-b-4 border-black bg-white/5">
              <div className="text-sm font-black uppercase text-surface/50 tracking-widest mb-2">Enrollment Cost</div>
              <div className="text-primary font-black text-6xl italic leading-none mb-6">₹{course.price}</div>
              <Link to={`/buy?course=${id}`} className="w-full block">
                <BruteButton variant="primary" className="w-full text-xl py-4">Buy Now</BruteButton>
              </Link>
            </div>
            
            <div className="p-8 bg-surface text-black space-y-6">
              <h4 className="font-black uppercase tracking-widest border-b-2 border-black pb-2">Features Included</h4>
              <ul className="space-y-4">
                {features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold uppercase text-sm">
                    <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center shrink-0">
                      {feat.icon}
                    </div>
                    {feat.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursePage;
