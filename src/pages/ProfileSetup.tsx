import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BruteButton from '../components/BruteButton';
import { isProfileComplete } from '../utils/profile';

function ProfileSetup() {
  const { user, profile, saveProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: ''
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (profile) {
        setFormData(prev => ({
          ...prev,
          name: profile.name || prev.name,
          phone: profile.phone || prev.phone,
          gender: profile.gender || prev.gender
        }));

        if (isProfileComplete(profile)) {
          navigate('/');
        }
      }
    }
  }, [user, profile, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await saveProfile(formData);
      navigate('/');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-primary font-black text-2xl animate-pulse uppercase tracking-widest">
          Authenticating...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-24 min-h-[70vh] relative z-10">
      <div className="brute-card bg-surface p-10 text-black border-b-8 border-black">
        <h1 className="text-4xl font-black font-headline uppercase mb-4 text-center">Complete Your Profile</h1>
        <p className="text-black/60 font-bold mb-8 text-center italic uppercase tracking-widest text-sm">
          Email comes from Google and cannot be edited here
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-black uppercase mb-2 tracking-widest text-black/70">Email</label>
            <input
              type="email"
              value={profile?.email || user?.email || ''}
              disabled
              className="w-full bg-black/5 border-2 border-black p-3 font-bold text-black/60 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-2 tracking-widest text-black/70">Full Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full bg-white border-2 border-black p-3 font-bold text-black focus:outline-none focus:border-primary"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-2 tracking-widest text-black/70">Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full bg-white border-2 border-black p-3 font-bold text-black focus:outline-none focus:border-primary"
              placeholder="10 digit mobile number"
            />
          </div>

          <div>
            <label className="block text-sm font-black uppercase mb-2 tracking-widest text-black/70">Gender</label>
            <select 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full bg-white border-2 border-black p-3 font-bold text-black focus:outline-none focus:border-primary"
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="pt-6 flex gap-4">
            <BruteButton 
              variant="primary" 
              className="flex-1 text-xl py-4"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </BruteButton>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetup;
