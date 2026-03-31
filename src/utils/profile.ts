import type { User } from '@supabase/supabase-js';
import type { Profile, WebsiteRole } from '../types/app';

type ProfileFields = Pick<Profile, 'name' | 'phone' | 'gender'> | null | undefined;

export function normalizeWebsiteRole(role?: string | null): WebsiteRole {
  return role === 'MANAGER' ? 'MANAGER' : 'STUDENT';
}

export function isProfileComplete(profile: ProfileFields): boolean {
  return Boolean(profile?.name?.trim() && profile?.phone?.trim() && profile?.gender?.trim());
}

export function getGoogleDisplayName(user: User | null): string | null {
  if (!user) return null;

  const metadataName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === 'string'
        ? user.user_metadata.name
        : null;

  return metadataName?.trim() || null;
}
