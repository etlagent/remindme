-- Enable RLS on all tables if not already enabled
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own memories" ON memories;
DROP POLICY IF EXISTS "Users can view their own memories" ON memories;
DROP POLICY IF EXISTS "Users can update their own memories" ON memories;
DROP POLICY IF EXISTS "Users can delete their own memories" ON memories;

DROP POLICY IF EXISTS "Users can insert their own people" ON people;
DROP POLICY IF EXISTS "Users can view their own people" ON people;
DROP POLICY IF EXISTS "Users can update their own people" ON people;
DROP POLICY IF EXISTS "Users can delete their own people" ON people;

DROP POLICY IF EXISTS "Users can insert their own business profiles" ON people_business_profiles;
DROP POLICY IF EXISTS "Users can view their own business profiles" ON people_business_profiles;
DROP POLICY IF EXISTS "Users can update their own business profiles" ON people_business_profiles;
DROP POLICY IF EXISTS "Users can delete their own business profiles" ON people_business_profiles;

DROP POLICY IF EXISTS "Users can insert their own memory-people links" ON memory_people;
DROP POLICY IF EXISTS "Users can view their own memory-people links" ON memory_people;
DROP POLICY IF EXISTS "Users can delete their own memory-people links" ON memory_people;

DROP POLICY IF EXISTS "Users can insert their own follow-ups" ON follow_ups;
DROP POLICY IF EXISTS "Users can view their own follow-ups" ON follow_ups;
DROP POLICY IF EXISTS "Users can update their own follow-ups" ON follow_ups;
DROP POLICY IF EXISTS "Users can delete their own follow-ups" ON follow_ups;

DROP POLICY IF EXISTS "Users can insert their own events" ON events;
DROP POLICY IF EXISTS "Users can view their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

-- Create policies for memories table
CREATE POLICY "Users can insert their own memories"
ON memories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own memories"
ON memories FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
ON memories FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
ON memories FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for people table
CREATE POLICY "Users can insert their own people"
ON people FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own people"
ON people FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own people"
ON people FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own people"
ON people FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for people_business_profiles table
CREATE POLICY "Users can insert their own business profiles"
ON people_business_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own business profiles"
ON people_business_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profiles"
ON people_business_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business profiles"
ON people_business_profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for memory_people table (junction table)
CREATE POLICY "Users can insert their own memory-people links"
ON memory_people FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memories 
    WHERE memories.id = memory_people.memory_id 
    AND memories.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own memory-people links"
ON memory_people FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memories 
    WHERE memories.id = memory_people.memory_id 
    AND memories.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own memory-people links"
ON memory_people FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM memories 
    WHERE memories.id = memory_people.memory_id 
    AND memories.user_id = auth.uid()
  )
);

-- Create policies for follow_ups table
CREATE POLICY "Users can insert their own follow-ups"
ON follow_ups FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own follow-ups"
ON follow_ups FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own follow-ups"
ON follow_ups FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follow-ups"
ON follow_ups FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for events table
CREATE POLICY "Users can insert their own events"
ON events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own events"
ON events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
ON events FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
ON events FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
