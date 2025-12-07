-- ============================================
-- DEBUG QUERIES FOR LINKEDIN DATA
-- Run these in Supabase SQL Editor
-- ============================================

-- 1. Check the person record "New Person"
SELECT 
  id,
  name,
  company,
  role,
  location,
  linkedin_url,
  company_linkedin_url,
  skills,
  technologies,
  interests,
  inspiration_level,
  created_at
FROM people 
WHERE name = 'New Person'
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check all memories associated with "New Person"
SELECT 
  m.id,
  m.created_at,
  m.raw_text,
  m.keywords,
  m.companies,
  m.industries,
  m.who,
  m.what,
  p.name as person_name
FROM memories m
JOIN memory_people mp ON m.id = mp.memory_id
JOIN people p ON mp.person_id = p.id
WHERE p.name = 'New Person'
ORDER BY m.created_at DESC;

-- 3. Check if keywords, companies, industries columns exist in memories table
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'memories' 
  AND column_name IN ('keywords', 'companies', 'industries');

-- 4. Check if skills, technologies, interests columns exist in people table
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'people' 
  AND column_name IN ('skills', 'technologies', 'interests');

-- 5. Count total people and memories
SELECT 
  (SELECT COUNT(*) FROM people) as total_people,
  (SELECT COUNT(*) FROM memories) as total_memories,
  (SELECT COUNT(*) FROM memory_people) as total_links;

-- 6. Show all people with their memory counts
SELECT 
  p.id,
  p.name,
  p.company,
  p.role,
  COUNT(DISTINCT mp.memory_id) as memory_count,
  p.created_at
FROM people p
LEFT JOIN memory_people mp ON p.id = mp.person_id
GROUP BY p.id, p.name, p.company, p.role, p.created_at
ORDER BY p.created_at DESC;

-- 7. Check business profiles (if any)
SELECT 
  pp.person_id,
  p.name,
  pp.follower_count,
  pp.about,
  pp.experience,
  pp.education
FROM people_business_profiles pp
JOIN people p ON pp.person_id = p.id
WHERE p.name = 'New Person';

-- 8. Check follow-ups for "New Person"
SELECT 
  f.id,
  f.description,
  f.priority,
  f.status,
  f.created_at,
  p.name as person_name
FROM follow_ups f
LEFT JOIN people p ON f.person_id = p.id
WHERE p.name = 'New Person'
ORDER BY f.created_at DESC;
