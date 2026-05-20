-- ==========================================
-- Team Task Manager Supabase Schema
-- Copy and paste this into the Supabase SQL Editor
-- ==========================================

-- 1. Create Users Table
-- This extends the built-in auth.users table in Supabase
CREATE TABLE public.users (
  id UUID PRIMARY KEY, -- Removed constraint temporarily
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'Member' CHECK (role IN ('Main Admin', 'Co-Admin', 'Member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Projects Table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Tasks Table
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  checklist JSONB DEFAULT '[]'::jsonb, -- Array of objects: { id: string, text: string, completed: boolean }
  status TEXT DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Done')),
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Notifications Table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Optional: Enable Row Level Security (RLS)
-- Currently, our backend handles auth via Node.js REST API
-- If you want the frontend to query directly, you can enable these policies:
-- ==========================================

-- Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read/write if you want your backend/anon key to have full access 
-- (For development purposes only, restrict these in production!)
CREATE POLICY "Allow full access to users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow full access to projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Allow full access to tasks" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Allow full access to notifications" ON public.notifications FOR ALL USING (true);
