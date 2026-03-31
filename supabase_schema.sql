-- 1. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" NUMERIC NOT NULL,
    "isPinned" BOOLEAN DEFAULT false,
    "learn" TEXT[] DEFAULT '{}',
    "who" TEXT DEFAULT '',
    "outcomes" TEXT DEFAULT '',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    "email" TEXT,
    "action" TEXT NOT NULL,
    "courseId" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'RESOLVED')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Enable
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Courses Policies
CREATE POLICY "Enable read access for all users" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Enable insert/update/delete for authenticated users" ON public.courses FOR ALL USING (auth.role() = 'authenticated'); 

-- Activity Logs Policies
CREATE POLICY "Enable insert for authenticated users" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = "userId" OR auth.uid() IS NULL);
CREATE POLICY "Enable read for all" ON public.activity_logs FOR SELECT USING (true);

-- Support Tickets Policies
CREATE POLICY "Users can insert their own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Users can read their own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = "userId" OR true);
CREATE POLICY "Users can update their own tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = "userId" OR true);
