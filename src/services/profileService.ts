import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/app';
import { getGoogleDisplayName, normalizeWebsiteRole } from '../utils/profile';

interface ProfileRow {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  gender: string | null;
  role: string | null;
}

interface SaveProfileInput {
  user: User;
  existingProfile?: Profile | null;
  name: string;
  phone: string;
  gender: string;
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    gender: row.gender,
    role: normalizeWebsiteRole(row.role),
    rawRole: row.role,
  };
}

async function fetchProfileRow(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, phone, gender, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ProfileRow | null) ?? null;
}

export async function syncProfileFromAuth(user: User): Promise<Profile> {
  const existingProfile = await fetchProfileRow(user.id);
  const email = (user.email || '').trim().toLowerCase();
  const googleName = getGoogleDisplayName(user);

  if (existingProfile) {
    const updates: Partial<ProfileRow> = {};

    if (email && existingProfile.email !== email) {
      updates.email = email;
    }

    if (!existingProfile.name && googleName) {
      updates.name = googleName;
    }

    if (Object.keys(updates).length > 0) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select('id, email, name, phone, gender, role')
        .single();

      if (error) {
        throw error;
      }

      return mapProfile(data as ProfileRow);
    }

    return mapProfile(existingProfile);
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email,
      name: googleName,
      phone: null,
      gender: null,
      role: 'STUDENT',
      updated_at: new Date().toISOString(),
    })
    .select('id, email, name, phone, gender, role')
    .single();

  if (error) {
    const fallbackProfile = await fetchProfileRow(user.id);

    if (fallbackProfile) {
      return mapProfile(fallbackProfile);
    }

    throw error;
  }

  return mapProfile(data as ProfileRow);
}

export async function saveProfileDetails(input: SaveProfileInput): Promise<Profile> {
  const email = (input.user.email || '').trim().toLowerCase();
  const payload = {
    email,
    name: input.name.trim(),
    phone: input.phone.trim(),
    gender: input.gender.trim().toUpperCase(),
    updated_at: new Date().toISOString(),
  };

  if (input.existingProfile) {
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', input.user.id)
      .select('id, email, name, phone, gender, role')
      .single();

    if (error) {
      throw error;
    }

    return mapProfile(data as ProfileRow);
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: input.user.id,
      ...payload,
      role: 'STUDENT',
    })
    .select('id, email, name, phone, gender, role')
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data as ProfileRow);
}
