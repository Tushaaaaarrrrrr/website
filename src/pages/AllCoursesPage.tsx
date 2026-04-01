import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database, Layers, Shield, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BruteButton from '../components/BruteButton';

export default function AllCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchCourses() {
      const { data } = await supabase.from('courses').select('*').order('createdAt', { ascending: false });
      if (data) setCourses(data);
      setLoading(false);
    }
    fetchCourses();
  }, []);



  return (
    <div className="min-h-screen bg-surface pt-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black font-headline uppercase leading-none mb-4 text-black text-center">
          Global <span className="text-primary italic">Registry</span>
        </h1>
        <div className="w-24 h-4 bg-primary mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black mb-16"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
             <div className="col-span-full py-12 text-center text-primary font-black uppercase tracking-widest animate-pulse">
                Fetching Global Registry...
             </div>
          ) : courses.length === 0 ? (
             <div className="col-span-full py-12 text-center text-black/40 font-black uppercase tracking-widest">
                Registry Offline
             </div>
          ) : courses.map((course, i) => (
             <div key={course.id} className="brute-card flex flex-col group hover:-translate-y-2 transition-transform text-black">
                <div className="p-8 border-b-4 border-black bg-white/5 group-hover:bg-primary/5 transition-colors">
                  <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {i % 3 === 0 ? <Database /> : i % 3 === 1 ? <Layers /> : <Shield />}
                  </div>
                  <h3 className="text-3xl font-black uppercase leading-tight mb-2 truncate" title={course.name}>{course.name}</h3>
                  {course.isBundle && (
                    <div className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">Bundle Starting from</div>
                  )}
                  <div className="flex items-baseline gap-2 group-hover:scale-105 transition-transform origin-left">
                    <span className="text-primary font-black text-4xl italic">₹{course.discountPrice || course.price}</span>
                    {course.discountPrice && (
                      <span className="text-black/30 font-bold text-lg line-through">₹{course.price}</span>
                    )}
                  </div>
                </div>
                <div className="p-8 bg-surface">
                  <ul className="space-y-3 mb-8">
                    {["Recorded Lectures", "Live Doubt Sessions", "Real Projects"].map((feat, j) => (
                      <li key={j} className="flex items-center gap-2 font-bold uppercase text-xs">
                        <ArrowRight size={14} className="text-primary" /> {feat}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-3">
                    <Link to={`/course/${course.id}`} className="flex-1">
                      <BruteButton variant="outline" className="w-full">View Details</BruteButton>
                    </Link>
                    <Link to={`/buy/${course.id}`} className="flex-1">
                      <BruteButton variant="primary" className="w-full">
                        Buy Now
                      </BruteButton>
                    </Link>
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}
