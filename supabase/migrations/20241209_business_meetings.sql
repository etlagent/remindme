-- Business Management Schema
-- Tables for managing businesses, meetings, notes, and related data

-- ============================================================================
-- BUSINESSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  stage TEXT, -- 'discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
  deal_value NUMERIC,
  website TEXT,
  linkedin_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_stage ON businesses(stage);

-- RLS Policies for businesses
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own businesses"
  ON businesses FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own businesses"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own businesses"
  ON businesses FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own businesses"
  ON businesses FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- BUSINESS_PEOPLE TABLE (Link people to businesses)
-- ============================================================================
CREATE TABLE IF NOT EXISTS business_people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  role TEXT, -- 'champion', 'decision_maker', 'influencer', 'blocker', 'end_user', 'coach'
  influence_level TEXT, -- 'high', 'medium', 'low'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, person_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_people_business_id ON business_people(business_id);
CREATE INDEX IF NOT EXISTS idx_business_people_person_id ON business_people(person_id);

-- RLS Policies for business_people
ALTER TABLE business_people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business people"
  ON business_people FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_people.business_id
      AND businesses.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their business people"
  ON business_people FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_people.business_id
      AND businesses.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their business people"
  ON business_people FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_people.business_id
      AND businesses.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their business people"
  ON business_people FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_people.business_id
      AND businesses.user_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- BUSINESS_NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS business_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  source TEXT, -- 'manual', 'slack', 'zoom', 'email', 'linkedin', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_business_notes_business_id ON business_notes(business_id);

-- RLS Policies
ALTER TABLE business_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business notes"
  ON business_notes FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their business notes"
  ON business_notes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their business notes"
  ON business_notes FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their business notes"
  ON business_notes FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- MEETINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  meeting_date TIMESTAMPTZ,
  location TEXT, -- 'zoom', 'office', 'phone', 'google_meet', etc.
  goal TEXT,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meetings_business_id ON meetings(business_id);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);

-- RLS Policies
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meetings"
  ON meetings FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their meetings"
  ON meetings FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their meetings"
  ON meetings FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their meetings"
  ON meetings FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- MEETING_ATTENDEES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS meeting_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, person_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_id ON meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_person_id ON meeting_attendees(person_id);

-- RLS Policies
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meeting attendees"
  ON meeting_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_attendees.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their meeting attendees"
  ON meeting_attendees FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_attendees.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their meeting attendees"
  ON meeting_attendees FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_attendees.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- MEETING_AGENDA TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS meeting_agenda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  item_order INTEGER NOT NULL,
  duration_minutes INTEGER,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_meeting_agenda_meeting_id ON meeting_agenda(meeting_id);

-- RLS Policies
ALTER TABLE meeting_agenda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meeting agenda"
  ON meeting_agenda FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_agenda.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their meeting agenda"
  ON meeting_agenda FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_agenda.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their meeting agenda"
  ON meeting_agenda FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_agenda.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their meeting agenda"
  ON meeting_agenda FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_agenda.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- MEETING_QUESTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS meeting_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  context TEXT, -- Why this question is important
  status TEXT DEFAULT 'to_ask', -- 'to_ask', 'asked', 'answered'
  answer TEXT,
  asked_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_meeting_questions_meeting_id ON meeting_questions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_questions_status ON meeting_questions(status);

-- RLS Policies
ALTER TABLE meeting_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meeting questions"
  ON meeting_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_questions.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert their meeting questions"
  ON meeting_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_questions.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can update their meeting questions"
  ON meeting_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_questions.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete their meeting questions"
  ON meeting_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_questions.meeting_id
      AND meetings.user_id::text = auth.uid()::text
    )
  );

-- ============================================================================
-- MEETING_NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS meeting_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'during', -- 'pre', 'during', 'post'
  source TEXT, -- 'manual', 'zoom_transcript', 'slack', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_meeting_notes_meeting_id ON meeting_notes(meeting_id);

-- RLS Policies
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meeting notes"
  ON meeting_notes FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their meeting notes"
  ON meeting_notes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their meeting notes"
  ON meeting_notes FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their meeting notes"
  ON meeting_notes FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- MEETING_FOLLOWUPS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS meeting_followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  due_date DATE,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meeting_followups_meeting_id ON meeting_followups(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_followups_status ON meeting_followups(status);
CREATE INDEX IF NOT EXISTS idx_meeting_followups_due_date ON meeting_followups(due_date);

-- RLS Policies
ALTER TABLE meeting_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meeting followups"
  ON meeting_followups FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their meeting followups"
  ON meeting_followups FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their meeting followups"
  ON meeting_followups FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their meeting followups"
  ON meeting_followups FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- PERSON_BUSINESS_NOTES TABLE (Notes about a person in context of a business)
-- ============================================================================
CREATE TABLE IF NOT EXISTS person_business_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_person_business_notes_person_id ON person_business_notes(person_id);
CREATE INDEX IF NOT EXISTS idx_person_business_notes_business_id ON person_business_notes(business_id);

-- RLS Policies
ALTER TABLE person_business_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their person business notes"
  ON person_business_notes FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their person business notes"
  ON person_business_notes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their person business notes"
  ON person_business_notes FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their person business notes"
  ON person_business_notes FOR DELETE
  USING (auth.uid()::text = user_id::text);
