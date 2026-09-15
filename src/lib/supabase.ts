import { createClient } from '@supabase/supabase-js';
import { AppointmentBooking, SupabaseAppointmentRecord } from '../types';

export const SUPABASE_PROJECT_ID = 'jytkxbgxshkmsbrbmmje';
export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EotJAp2m3fimM2l7gz6gig_1zkB1TiQ';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// SQL Schema for Supabase SQL Editor
export const APPOINTMENTS_TABLE_SQL = `-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  service_type TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Allow public (anon + auth) visitors to submit appointment bookings
CREATE POLICY "Allow public insert on appointments" 
ON public.appointments FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow reading appointments
CREATE POLICY "Allow public read on appointments" 
ON public.appointments FOR SELECT 
TO public 
USING (true);

-- Optional: Allow updates (e.g. status changes)
CREATE POLICY "Allow public update on appointments" 
ON public.appointments FOR UPDATE 
TO public 
USING (true);
`;

const LOCAL_STORAGE_KEY = 'emailverifier_appointments_v1';

export function getLocalAppointments(): AppointmentBooking[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse local appointments:', err);
    return [];
  }
}

export function saveLocalAppointment(appointment: AppointmentBooking): void {
  try {
    const existing = getLocalAppointments();
    const updated = [appointment, ...existing.filter(a => a.id !== appointment.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to persist appointment locally:', err);
  }
}

/**
 * Checks connectivity to the user's Supabase project and determines if the appointments table exists.
 */
export async function testSupabaseConnection(tableName = 'appointments'): Promise<{
  connected: boolean;
  tableExists: boolean;
  message: string;
  error?: string;
}> {
  try {
    // Probe table
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return {
          connected: true,
          tableExists: false,
          message: `Connected to Supabase project (${SUPABASE_PROJECT_ID}), but table '${tableName}' has not been created yet in the SQL Editor.`,
          error: error.message
        };
      }
      return {
        connected: false,
        tableExists: false,
        message: `Supabase error (${error.code || 'UNKNOWN'}): ${error.message}`,
        error: error.message
      };
    }

    return {
      connected: true,
      tableExists: true,
      message: `Successfully connected to Supabase table '${tableName}'! Rows are queryable.`
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      message: err?.message || 'Network error connecting to Supabase',
      error: String(err)
    };
  }
}

/**
 * Saves an appointment booking directly into the Supabase backend table.
 */
export async function saveAppointmentToSupabase(
  booking: AppointmentBooking,
  tableName = 'appointments'
): Promise<{
  success: boolean;
  source: 'supabase' | 'local_fallback';
  data?: any;
  error?: string;
  requiresTableCreation?: boolean;
}> {
  const generatedId = booking.id || crypto.randomUUID();
  const timestamp = booking.createdAt || new Date().toISOString();

  // Save to local cache first so customer data is guaranteed safe
  const localBooking: AppointmentBooking = {
    ...booking,
    id: generatedId,
    createdAt: timestamp,
    status: booking.status || 'pending'
  };
  saveLocalAppointment(localBooking);

  // Prepare database record for Supabase
  const record: SupabaseAppointmentRecord = {
    full_name: booking.fullName,
    email: booking.email,
    phone: booking.phone || '',
    company: booking.company || '',
    service_type: booking.serviceType,
    appointment_date: booking.appointmentDate,
    appointment_time: booking.appointmentTime,
    notes: booking.notes || '',
    status: booking.status || 'pending',
    created_at: timestamp
  };

  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert([record])
      .select();

    if (error) {
      console.warn('Supabase insertion warning:', error);
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        return {
          success: true, // Still marked success for user because local backup captured it
          source: 'local_fallback',
          requiresTableCreation: true,
          error: `Table '${tableName}' does not exist in Supabase yet. Booking is securely queued locally.`
        };
      }

      // Check if user table has camelCase columns instead of snake_case
      if (error.message?.includes('column') || error.code === '42703') {
        const camelCaseRecord = {
          fullName: booking.fullName,
          email: booking.email,
          phone: booking.phone || '',
          company: booking.company || '',
          serviceType: booking.serviceType,
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
          notes: booking.notes || '',
          status: booking.status || 'pending',
          createdAt: timestamp
        };

        const retry = await supabase.from(tableName).insert([camelCaseRecord]).select();
        if (!retry.error) {
          return {
            success: true,
            source: 'supabase',
            data: retry.data
          };
        }
      }

      return {
        success: false,
        source: 'local_fallback',
        error: error.message || 'Error inserting into Supabase'
      };
    }

    return {
      success: true,
      source: 'supabase',
      data: data
    };
  } catch (err: any) {
    console.error('Supabase request failed:', err);
    return {
      success: false,
      source: 'local_fallback',
      error: err?.message || 'Unexpected failure connecting to Supabase backend'
    };
  }
}

/**
 * Fetch all appointments from Supabase backend (or fallback to local if table not ready)
 */
export async function fetchAppointments(tableName = 'appointments'): Promise<{
  appointments: AppointmentBooking[];
  source: 'supabase' | 'local';
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return {
        appointments: getLocalAppointments(),
        source: 'local',
        error: error.message
      };
    }

    // Map snake_case or camelCase to AppointmentBooking
    const mapped: AppointmentBooking[] = (data || []).map((row: any) => ({
      id: row.id,
      fullName: row.full_name || row.fullName || row.name || 'Anonymous',
      email: row.email,
      phone: row.phone || row.phoneNumber || '',
      company: row.company || row.organization || '',
      serviceType: row.service_type || row.serviceType || 'General Consultation',
      appointmentDate: row.appointment_date || row.appointmentDate || '',
      appointmentTime: row.appointment_time || row.appointmentTime || '',
      notes: row.notes || row.message || '',
      status: row.status || 'pending',
      createdAt: row.created_at || row.createdAt || new Date().toISOString()
    }));

    return {
      appointments: mapped,
      source: 'supabase'
    };
  } catch (err: any) {
    return {
      appointments: getLocalAppointments(),
      source: 'local',
      error: err?.message || 'Failed to fetch from Supabase'
    };
  }
}
