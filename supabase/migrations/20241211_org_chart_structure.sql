-- ============================================================================
-- ORG CHART STRUCTURE TABLES
-- Created: 2024-12-11
-- Purpose: Store organizational hierarchy, teams, and business-specific person data
-- ============================================================================

-- ============================================================================
-- ORG CHART PEOPLE
-- People positioned in the org chart for a specific business
-- Can be linked to actual people table OR be placeholders
-- ============================================================================
CREATE TABLE org_chart_people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL, -- NULL for placeholder people
  
  -- Person details (stored here for flexibility and placeholders)
  name TEXT NOT NULL,
  title TEXT,
  
  -- Org chart position
  level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 5), 
    -- 0=Executive, 1=VP, 2=Director, 3=Manager, 4=Analyst, 5=Technical
  parent_id UUID REFERENCES org_chart_people(id) ON DELETE SET NULL, -- Reports to
  position_order INTEGER DEFAULT 0, -- Order within level
  
  -- Call preparation notes
  responsibilities TEXT, -- What they're responsible for / their goals
  challenges TEXT, -- Problems they're facing
  needs TEXT, -- What they need from you
  notes TEXT, -- Additional notes
  
  -- Metadata
  is_placeholder BOOLEAN DEFAULT FALSE, -- True if not yet contacted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for performance
CREATE INDEX idx_org_chart_people_business ON org_chart_people(business_id);
CREATE INDEX idx_org_chart_people_person ON org_chart_people(person_id);
CREATE INDEX idx_org_chart_people_parent ON org_chart_people(parent_id);
CREATE INDEX idx_org_chart_people_level ON org_chart_people(business_id, level);

-- Updated at trigger
CREATE TRIGGER update_org_chart_people_updated_at 
  BEFORE UPDATE ON org_chart_people 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE org_chart_people IS 'People positioned in org charts for businesses, includes placeholders';
COMMENT ON COLUMN org_chart_people.person_id IS 'Links to people table, NULL for placeholders not yet in rolodex';
COMMENT ON COLUMN org_chart_people.level IS '0=Executive, 1=VP, 2=Director, 3=Manager, 4=Analyst, 5=Technical';
COMMENT ON COLUMN org_chart_people.parent_id IS 'Who this person reports to in the org chart';
COMMENT ON COLUMN org_chart_people.responsibilities IS 'Their goals, responsibilities, what they want to accomplish';
COMMENT ON COLUMN org_chart_people.needs IS 'What they need from you or your company';


-- ============================================================================
-- ORG CHART TEAMS
-- Teams within the organizational structure
-- ============================================================================
CREATE TABLE org_chart_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Team details
  name TEXT NOT NULL,
  description TEXT,
  
  -- Position in org chart
  level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0 AND level <= 5),
  position_order INTEGER DEFAULT 0, -- Order within level
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_org_chart_teams_business ON org_chart_teams(business_id);
CREATE INDEX idx_org_chart_teams_level ON org_chart_teams(business_id, level);

-- Updated at trigger
CREATE TRIGGER update_org_chart_teams_updated_at 
  BEFORE UPDATE ON org_chart_teams 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE org_chart_teams IS 'Teams within organizational hierarchies';
COMMENT ON COLUMN org_chart_teams.level IS 'Which level in the org chart this team appears at';


-- ============================================================================
-- ORG CHART TEAM MEMBERS
-- Junction table linking people to teams
-- ============================================================================
CREATE TABLE org_chart_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES org_chart_teams(id) ON DELETE CASCADE,
  org_chart_person_id UUID NOT NULL REFERENCES org_chart_people(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Prevent duplicate team memberships
  UNIQUE(team_id, org_chart_person_id)
);

-- Indexes
CREATE INDEX idx_team_members_team ON org_chart_team_members(team_id);
CREATE INDEX idx_team_members_person ON org_chart_team_members(org_chart_person_id);

COMMENT ON TABLE org_chart_team_members IS 'Links people to teams in org charts';


-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE org_chart_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_chart_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_chart_team_members ENABLE ROW LEVEL SECURITY;

-- Org Chart People Policies
CREATE POLICY "Users can view org chart people for their businesses"
  ON org_chart_people FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert org chart people for their businesses"
  ON org_chart_people FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update org chart people for their businesses"
  ON org_chart_people FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete org chart people for their businesses"
  ON org_chart_people FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Org Chart Teams Policies
CREATE POLICY "Users can view teams for their businesses"
  ON org_chart_teams FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert teams for their businesses"
  ON org_chart_teams FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update teams for their businesses"
  ON org_chart_teams FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete teams for their businesses"
  ON org_chart_teams FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

-- Team Members Policies
CREATE POLICY "Users can view team members for their businesses"
  ON org_chart_team_members FOR SELECT
  USING (
    team_id IN (
      SELECT id FROM org_chart_teams WHERE business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert team members for their businesses"
  ON org_chart_team_members FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT id FROM org_chart_teams WHERE business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete team members for their businesses"
  ON org_chart_team_members FOR DELETE
  USING (
    team_id IN (
      SELECT id FROM org_chart_teams WHERE business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
      )
    )
  );
