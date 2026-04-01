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

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "lms_id" TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "googleGroupEmail" TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "subtitle" TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "discountPrice" NUMERIC;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "isBundle" BOOLEAN DEFAULT false;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS "bundleItems" JSONB DEFAULT '[]'::jsonb;

-- 2. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    "userName" TEXT,
    "email" TEXT,
    "action" TEXT NOT NULL,
    "courseId" TEXT,
    "courseName" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Website Orders Table
CREATE TABLE IF NOT EXISTS public.website_orders (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "orderId" TEXT UNIQUE NOT NULL,
    "userId" UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    "userName" TEXT,
    "userEmail" TEXT NOT NULL,
    "courseIds" TEXT[] DEFAULT '{}',
    "courseNames" TEXT[] DEFAULT '{}',
    "courseCount" INTEGER DEFAULT 0,
    "courseId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "amount" NUMERIC NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'CREATED' CHECK ("paymentStatus" IN ('CREATED', 'FAILED', 'PAID')),
    "enrollmentStatus" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("enrollmentStatus" IN ('PENDING', 'FAILED', 'ENROLLED')),
    "paymentId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'WEBSITE' CHECK ("source" = 'WEBSITE'),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "paidAt" TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.website_orders ADD COLUMN IF NOT EXISTS "courseIds" TEXT[] DEFAULT '{}';
ALTER TABLE public.website_orders ADD COLUMN IF NOT EXISTS "courseNames" TEXT[] DEFAULT '{}';
ALTER TABLE public.website_orders ADD COLUMN IF NOT EXISTS "courseCount" INTEGER DEFAULT 0;

-- 4. Support Tickets Table
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
ALTER TABLE public.website_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Courses Policies
CREATE POLICY "Enable read access for all users" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Managers can manage courses" ON public.courses FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'MANAGER'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'MANAGER')); 

-- Activity Logs Policies
CREATE POLICY "Users can insert activity logs" ON public.activity_logs FOR INSERT
WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Managers can read activity logs" ON public.activity_logs FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'MANAGER'));

-- Website Orders Policies
CREATE POLICY "Users can read own website orders" ON public.website_orders FOR SELECT
USING (auth.uid() = "userId" OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'MANAGER'));
CREATE POLICY "Users can update own website orders" ON public.website_orders FOR UPDATE
USING (auth.uid() = "userId" OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'MANAGER'));

-- Support Tickets Policies
CREATE POLICY "Users can insert their own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "Users can read their own tickets" ON public.support_tickets FOR SELECT
USING (auth.uid() = "userId" OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'MANAGER'));
CREATE POLICY "Users can update their own tickets" ON public.support_tickets FOR UPDATE
USING (auth.uid() = "userId" OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'MANAGER'));
