import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import BruteButton from '../../components/BruteButton';
import { Edit2, Trash2, Plus, Star, X } from 'lucide-react';
import type { Course, BundleItem } from '../../types/app';

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Course>>({
    id: '', 
    name: '', 
    subtitle: '', 
    price: 0, 
    discountPrice: null, 
    category: '', 
    startDate: '', 
    endDate: '', 
    isBundle: false, 
    bundleItems: [{ courseId: '', courseName: '', price: 0 }]
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
      setFormData({
        ...course,
        bundleItems: course.bundleItems?.length ? course.bundleItems : [{ courseId: course.lms_id || '', courseName: '', price: 0 }],
        startDate: course.startDate ? new Date(course.startDate).toISOString().slice(0, 16) : '',
        endDate: course.endDate ? new Date(course.endDate).toISOString().slice(0, 16) : '',
      });
    } else {
      setEditingCourse(null);
      setFormData({ 
        id: '', name: '', subtitle: '', price: 0, discountPrice: null, category: '', startDate: '', endDate: '', isBundle: false, bundleItems: [{ courseId: '', courseName: '', price: 0 }] 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.subtitle || formData.price === undefined || !formData.category) {
      alert("Missing required fields (name, subtitle, price, category)");
      return;
    }
    if (formData.isBundle) {
      if (!formData.bundleItems || formData.bundleItems.length < 1 || formData.bundleItems.length > 6) {
        alert("Bundles must have between 1 and 6 courses.");
        return;
      }
      for (const item of formData.bundleItems) {
        if (!item.courseId || !item.courseName) {
          alert("All bundle items must have a courseId and courseName.");
          return;
        }
      }
    } else {
      if (!formData.bundleItems?.[0]?.courseId || !formData.bundleItems?.[0]?.courseName) {
        alert("Single course must have a courseId and courseName specified.");
        return;
      }
      // Trim bundle to just the first item
      formData.bundleItems = [formData.bundleItems[0]];
    }

    setLoading(true);
    try {
      const payload: any = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      if (!formData.isBundle && formData.bundleItems?.[0]) {
        payload.lms_id = formData.bundleItems[0].courseId;
      }

      if (editingCourse) {
        const { error } = await supabase.from('courses').update(payload).eq('id', editingCourse.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('courses').insert([payload]);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black uppercase text-white mb-2">Subject <span className="text-primary italic">Registry</span></h2>
          <p className="text-white/60 font-bold">Manage platform course offerings and bundles.</p>
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
            <div key={course.id} className="bg-surface border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6 relative group text-black flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-black bg-black text-white px-2 py-1 uppercase tracking-widest">{course.id}</span>
                {course.isBundle && (
                  <span className="text-[10px] font-black bg-primary text-white px-2 py-1 uppercase tracking-widest">BUNDLE</span>
                )}
              </div>
              <h3 className="text-xl font-black uppercase leading-tight mb-2" title={course.name}>{course.name}</h3>
              <p className="text-black/60 font-bold line-clamp-2 text-sm mb-2">{course.subtitle}</p>
              <div className="text-[10px] uppercase font-black tracking-widest text-black/40 mb-4">{course.category}</div>
              
              <div className="flex items-end gap-2 mb-6 mt-auto">
                <div className="text-primary font-black text-2xl italic">₹{course.price}</div>
                {course.discountPrice && (
                  <div className="text-black/40 font-bold text-sm line-through mb-1">₹{course.discountPrice}</div>
                )}
              </div>
              
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
            
            <form onSubmit={handleSave} className="space-y-6">
              
              <div className="space-y-4">
                <h4 className="font-black uppercase tracking-widest border-b-2 border-black/10 pb-2">Main Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-1">Listing ID (slug)</label>
                    <input required placeholder="e.g. data-science-1" className="w-full border-2 border-black bg-white p-3 font-mono text-sm uppercase" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} disabled={!!editingCourse} />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-1">Category</label>
                    <input required placeholder="e.g. Technology" className="w-full border-2 border-black bg-white p-3 font-bold text-sm" value={formData.category || ''} onChange={(e) => setFormData({...formData, category: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-1">Listing Name (courseName)</label>
                  <input required className="w-full border-2 border-black bg-white p-3 font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-1">Subtitle (Short Description)</label>
                  <input required className="w-full border-2 border-black bg-white p-3 font-bold text-sm" value={formData.subtitle || ''} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-1">Base Price (₹)</label>
                    <input required type="number" min="0" className="w-full border-2 border-black bg-white p-3 font-black text-xl" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-1">Discount Price (₹) (Optional)</label>
                    <input type="number" min="0" className="w-full border-2 border-black bg-white p-3 font-black text-xl text-primary" value={formData.discountPrice || ''} onChange={(e) => setFormData({...formData, discountPrice: e.target.value ? Number(e.target.value) : null})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-1">Start Date (Optional)</label>
                    <input type="datetime-local" className="w-full border-2 border-black bg-white p-3 font-mono text-sm" value={formData.startDate || ''} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-1">End Date (Optional)</label>
                    <input type="datetime-local" className="w-full border-2 border-black bg-white p-3 font-mono text-sm" value={formData.endDate || ''} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
                  <h4 className="font-black uppercase tracking-widest flex items-center gap-2">
                    LMS Configuration
                    {formData.isBundle && <span className="bg-primary text-white text-[10px] px-2 py-1">BUNDLE MODE</span>}
                  </h4>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-black uppercase tracking-widest cursor-pointer">Enable Bundle</label>
                    <input type="checkbox" checked={formData.isBundle} onChange={(e) => {
                      const isBundle = e.target.checked;
                      setFormData({...formData, isBundle, bundleItems: isBundle ? formData.bundleItems : [formData.bundleItems?.[0] || { courseId: '', courseName: '', price: 0 }]});
                    }} className="w-5 h-5 accent-primary border-2 border-black cursor-pointer" />
                  </div>
                </div>

                <div className="space-y-3">
                  {(formData.bundleItems || []).map((item, index) => (
                    <div key={index} className="flex gap-2 items-start bg-black/5 p-3 border-2 border-black/10">
                      <div className="flex-1 space-y-2">
                        <input required placeholder="LMS Internal Course ID" className="w-full border-2 border-black bg-white p-2 font-mono text-xs placeholder:text-black/30" value={item.courseId} onChange={(e) => {
                          const newItems = [...(formData.bundleItems || [])];
                          newItems[index].courseId = e.target.value;
                          setFormData({...formData, bundleItems: newItems});
                        }} />
                        <div className="flex gap-2">
                          <input required placeholder="Internal Course Name" className="flex-1 border-2 border-black bg-white p-2 font-bold text-xs placeholder:text-black/30" value={item.courseName} onChange={(e) => {
                            const newItems = [...(formData.bundleItems || [])];
                            newItems[index].courseName = e.target.value;
                            setFormData({...formData, bundleItems: newItems});
                          }} />
                          {formData.isBundle && (
                            <input required type="number" min="0" placeholder="Price (₹)" className="w-24 border-2 border-black bg-white p-2 font-bold text-xs" value={item.price || ''} onChange={(e) => {
                              const newItems = [...(formData.bundleItems || [])];
                              newItems[index].price = Number(e.target.value);
                              setFormData({...formData, bundleItems: newItems});
                            }} />
                          )}
                        </div>
                      </div>
                      {formData.isBundle && (formData.bundleItems || []).length > 1 && (
                        <button type="button" onClick={() => {
                          const newItems = formData.bundleItems?.filter((_, i) => i !== index);
                          setFormData({...formData, bundleItems: newItems});
                        }} className="p-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors bg-white">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {formData.isBundle && (formData.bundleItems || []).length < 6 && (
                  <BruteButton type="button" variant="outline" onClick={() => {
                    setFormData({...formData, bundleItems: [...(formData.bundleItems || []), { courseId: '', courseName: '', price: 0 }]});
                  }} className="w-full py-2 text-xs border-dashed">
                    <Plus size={14} className="inline mr-1" /> Add Course to Bundle
                  </BruteButton>
                )}
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
