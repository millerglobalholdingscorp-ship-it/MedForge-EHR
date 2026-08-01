import type { Facility } from '../types/facility';
export const FACILITY_KEY = 'medforge-facility-slug';
export function getFacilitySlug(): string { return localStorage.getItem(FACILITY_KEY) || 'default'; }
export function facilityHeaders(): Record<string, string> { return { 'x-facility-slug': getFacilitySlug() }; }
export async function fetchFacilities(token: string | null): Promise<Facility[]> { const r = await fetch('/api/facilities', { headers: { Authorization: `Bearer ${token}` } }); if (!r.ok) throw new Error('Failed to load facilities'); const d = await r.json(); return d.facilities || []; }
