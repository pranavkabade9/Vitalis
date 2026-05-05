/// <reference types="vite/client" />
/**
 * Supabase Schema SQL
 * Run this in your Supabase SQL Editor
 * 
 
 -- Create Tables
 CREATE TABLE users (
   id UUID PRIMARY KEY DEFAULT auth.uid(),
   email TEXT UNIQUE,
   full_name TEXT,
   blood_group TEXT,
   allergies TEXT,
   emergency_contact_json JSONB,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 );

 CREATE TABLE health_rules (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   parameter TEXT NOT NULL, -- e.g., 'heart_rate', 'sleep_hours', 'water_intake_ml'
   min_value NUMERIC,
   max_value NUMERIC,
   message TEXT NOT NULL,
   severity TEXT CHECK (severity IN ('warning', 'critical')),
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 );

 CREATE TABLE vitals (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID REFERENCES auth.users(id),
   heart_rate INTEGER,
   systolic_bp INTEGER,
   diastolic_bp INTEGER,
   weight_kg NUMERIC,
   logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 );

 CREATE TABLE lifestyle_logs (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID REFERENCES auth.users(id),
   sleep_hours NUMERIC,
   water_intake_ml INTEGER,
   steps INTEGER,
   exercise_done BOOLEAN DEFAULT FALSE,
   logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 );

 CREATE TABLE medications (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID REFERENCES auth.users(id),
   name TEXT NOT NULL,
   dosage TEXT NOT NULL,
   time TIME NOT NULL,
   frequency TEXT, -- e.g., 'daily', 'weekly'
   active BOOLEAN DEFAULT TRUE,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 );

 CREATE TABLE medication_logs (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   medication_id UUID REFERENCES medications(id),
   user_id UUID REFERENCES auth.users(id),
   taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
   status TEXT CHECK (status IN ('taken', 'missed'))
 );

 CREATE TABLE alerts (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID REFERENCES auth.users(id),
   title TEXT NOT NULL,
   message TEXT NOT NULL,
   severity TEXT CHECK (severity IN ('warning', 'critical')),
   is_read BOOLEAN DEFAULT FALSE,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 );

 -- Insert Initial Rules
 INSERT INTO health_rules (parameter, min_value, max_value, message, severity) VALUES
 ('heart_rate', 60, 100, 'Heart rate is outside normal resting range (60-100 bpm).', 'warning'),
 ('heart_rate', 40, 120, 'Critical heart rate anomaly detected!', 'critical'),
 ('sleep_hours', 6, 9, 'Looks like you didn''t get enough sleep today.', 'warning'),
 ('water_intake_ml', 2000, null, 'Remember to stay hydrated! Goal is 2000ml.', 'warning');

 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials missing. App will only function in guest mode using local storage.');
}

export interface HealthRule {
  id: string;
  parameter: string;
  min_value?: number;
  max_value?: number;
  message: string;
  severity: 'warning' | 'critical';
}

export interface VitalLog {
  id: string;
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  weight_kg: number;
  logged_at: string;
}

export interface LifestyleLog {
  id: string;
  sleep_hours: number;
  water_intake_ml: number;
  steps: number;
  exercise_done: boolean;
  logged_at: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  active: boolean;
}

export interface MedicationLog {
  id: string;
  medication_id: string;
  status: 'taken' | 'missed';
  taken_at: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'warning' | 'critical';
  created_at: string;
  is_read: boolean;
}
