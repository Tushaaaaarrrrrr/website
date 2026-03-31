import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import BruteButton from '../../components/BruteButton';
import { Edit2, Trash2, Plus, Star } from 'lucide-react';

export interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  isPinned: boolean;
  learn: string[];
  who: string;
  outcomes: string;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Course>>({
    id: '', name: '', description: '', price: 0, isPinned: false, learn: [], who: '', outcomes: ''
  });

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('courses').select('*').order('createdAt', { ascending: false });
    if (!error && data) setCourses(data as Course[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData(course);
    } else {
      setEditingCourse(null);
      setFormData({ id: '', name: '', description: '', price: 0, isPinned: false, learn: [], who: '', outcomes: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCourse) {
        // Update
        const { error } = await supabase.from('courses').update(formData).eq('id', editingCourse.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from('courses').insert([formData]);
        if (error) throw error;
      }
      handleCloseModal();
      await fetchCourses();
    } catch (err) {
      console.error(err);
      alert('Error saving course. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    setLoading(true);
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (!error) await fetchCourses();
    setLoading(false);
  };

  const togglePin = async (course: Course) => {
    setLoading(true);
    const { error } = await supabase.from('courses').update({ isPinned: !course.isPinned }).eq('id', course.id);
    if (!error) await fetchCourses();
    setLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black uppercase text-white mb-2">Subject <span className="text-primary italic">Registry</span></h2>
          <p className="text-white/60 font-bold">Manage platform course offerings.</p>
        </div>
        <BruteButton variant="primary" onClick={() => handleOpenModal()} className="flex items-center gap-2 py-2">
          <Plus size={16} /> New Course
        </BruteButton>
      </div>

      {loading && !isModalOpen ? (
        <div className="animate-pulse text-white/50 uppercase font-black text-sm">Synchronizing...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-surface border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6 relative group text-black">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-black bg-black text-white px-2 py-1 uppercase tracking-widest">{course.id}</span>
                <button 
                  onClick={() => togglePin(course)}
                  className={`p-1 border-2 transition-colors ${course.isPinned ? 'border-primary text-primary bg-primary/10' : 'border-black/20 text-black/40 hover:border-black'}`}
                  title={course.isPinned ? "Unpin Course" : "Pin to Homepage"}
                >
                  <Star size={16} fill={course.isPinned ? "currentColor" : "none"} />
                </button>
              </div>
              <h3 className="text-xl font-black uppercase leading-tight mb-2 truncate" title={course.name}>{course.name}</h3>
              <p className="text-black/60 font-bold line-clamp-2 text-sm mb-4">{course.description}</p>
              <div className="text-primary font-black text-2xl italic mb-6">₹{course.price}</div>
              
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(course)} className="flex-1 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors py-2 flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(course.id)} className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors px-4 py-2 flex items-center justify-center">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-white/20 p-12 text-center text-white/50 font-black uppercase tracking-widest">
              No Courses Configured
            </div>
          )}
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 overflow-y-auto">
          <div className="bg-surface border-4 border-primary p-8 max-w-2xl w-full text-black shadow-[8px_8px_0px_0px_rgba(206,18,52,1)] my-8 relative">
            <h3 className="text-3xl font-black uppercase mb-6">{editingCourse ? 'Edit' : 'Create'} <span className="text-primary italic">Course</span></h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-1">Course ID (slug)</label>
                  <input required placeholder="e.g. python-basics" className="w-full border-2 border-black bg-white p-3 font-mono text-sm uppercase" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} disabled={!!editingCourse} />
                  {!!editingCourse && <p className="text-[10px] text-primary mt-1 font-bold uppercase">ID cannot be changed</p>}
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-1">Price (₹)</label>
                  <input required type="number" min="0" className="w-full border-2 border-black bg-white p-3 font-black text-primary text-xl" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-1">Display Name</label>
                <input required className="w-full border-2 border-black bg-white p-3 font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-1">Short Description</label>
                <textarea required rows={3} className="w-full border-2 border-black bg-white p-3 font-bold text-sm" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>

               <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-1">Target Audience (Who)</label>
                <input className="w-full border-2 border-black bg-white p-3 font-bold text-sm" value={formData.who} onChange={(e) => setFormData({...formData, who: e.target.value})} placeholder="e.g. Beginners in Data Science" />
              </div>

               <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-1">Expected Outcomes</label>
                <input className="w-full border-2 border-black bg-white p-3 font-bold text-sm" value={formData.outcomes} onChange={(e) => setFormData({...formData, outcomes: e.target.value})} placeholder="e.g. Build industrial ML pipelines" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-1">What You Will Learn (Comma separated)</label>
                <textarea rows={3} className="w-full border-2 border-black bg-white p-3 font-bold text-sm" placeholder="Pandas Basics, Numpy, Scikit-Learn" value={formData.learn?.join(', ')} onChange={(e) => setFormData({...formData, learn: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="isPinned" checked={formData.isPinned} onChange={(e) => setFormData({...formData, isPinned: e.target.checked})} className="w-5 h-5 accent-primary border-2 border-black" />
                <label htmlFor="isPinned" className="font-black uppercase tracking-widest text-sm flex items-center gap-2 cursor-pointer">
                  <Star size={16} fill={formData.isPinned ? "currentColor" : "none"} className={formData.isPinned ? "text-primary" : "text-black/40"} />
                  Pin to Homepage
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-6 mt-6 border-t-2 border-black/10">
                <button type="button" onClick={handleCloseModal} className="px-6 py-3 font-black uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-colors text-sm">
                  Cancel
                </button>
                <BruteButton type="submit" variant="primary" className="py-3 px-8 text-sm" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Config'}
                </BruteButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
