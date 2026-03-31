import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import BruteButton from './BruteButton';
import { useAuth } from '../context/AuthContext';

interface ProfileCompletionModalProps {
  open: boolean;
  allowClose?: boolean;
  title?: string;
  description?: string;
  onClose?: () => void;
  onCompleted?: () => void;
}

const phoneRegex = /^[0-9]{7,15}$/;

export default function ProfileCompletionModal({
  open,
  allowClose = true,
  title = 'Complete Your Profile',
  description = 'Name, phone number, and gender are required before you can continue.',
  onClose,
  onCompleted,
}: ProfileCompletionModalProps) {
  const { user, profile, saveProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      gender: profile?.gender || '',
    });
    setError(null);
  }, [open, profile]);

  if (!open || !user) {
    return null;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!phoneRegex.test(formData.phone.trim())) {
      setError('Enter a valid phone number using 7 to 15 digits.');
      return;
    }

    if (!formData.gender.trim()) {
      setError('Gender is required.');
      return;
    }

    try {
      setSaving(true);
      await saveProfile({
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
      });
      onCompleted?.();
      onClose?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-surface border-4 border-primary max-w-xl w-full p-8 text-black shadow-[8px_8px_0px_0px_rgba(206,18,52,1)] relative">
        {allowClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
            aria-label="Close profile modal"
          >
            <X size={18} />
          </button>
        )}

        <h2 className="text-3xl font-black uppercase mb-2">{title}</h2>
        <p className="text-sm font-bold uppercase tracking-widest text-black/50 mb-8">
          {description}
        </p>

        {error && (
          <div className="mb-6 p-4 border-2 border-red-500 bg-red-100 text-red-700 font-bold text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              value={profile?.email || user.email || ''}
              disabled
              className="w-full border-2 border-black bg-black/5 p-3 font-bold text-black/60 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={saving}
              className="w-full border-2 border-black bg-white p-3 font-bold"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={saving}
              className="w-full border-2 border-black bg-white p-3 font-bold"
              placeholder="Digits only"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={saving}
              className="w-full border-2 border-black bg-white p-3 font-bold"
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            {allowClose && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 font-black uppercase tracking-widest border-2 border-black hover:bg-black hover:text-white transition-colors text-sm"
                disabled={saving}
              >
                Close
              </button>
            )}
            <BruteButton type="submit" variant="primary" className="py-3 px-8 text-sm" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </BruteButton>
          </div>
        </form>
      </div>
    </div>
  );
}
