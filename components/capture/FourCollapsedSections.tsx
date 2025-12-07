/**
 * FOUR COLLAPSED SECTIONS COMPONENT
 * 
 * The main collapsible sections for organizing person data:
 * 1. LinkedIn - Followers, About, Experience, Education, Keywords, Companies, Industries, Skills, Technologies, Interests
 * 2. Conversations - Add notes with dates
 * 3. Follow-ups - Add action items
 * 4. Memories - Add memories with dates
 * 
 * EXTRACTED FROM: app/page.tsx lines 1474-1924
 * ALL STATE remains in page.tsx - this is ONLY the visual component
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FourCollapsedSectionsProps {
  editedPreview: any;
  setEditedPreview: (preview: any) => void;
  personName: string;
  personCompany: string;
  personRole: string;
  personLocation: string;
  showLinkedInData: boolean;
  setShowLinkedInData: (show: boolean) => void;
  showConversations: boolean;
  setShowConversations: (show: boolean) => void;
  showFollowUps: boolean;
  setShowFollowUps: (show: boolean) => void;
  showMemories: boolean;
  setShowMemories: (show: boolean) => void;
  isProcessing: boolean;
  handleSavePreviewEdits: () => void;
  handleApproveAndSave: (data: any) => void;
  setAiPreview: (preview: any) => void;
  setIsEditingPreview: (editing: boolean) => void;
  setShowRawNotes: (show: boolean) => void;
}

export function FourCollapsedSections({
  editedPreview,
  setEditedPreview,
  personName,
  personCompany,
  personRole,
  personLocation,
  showLinkedInData,
  setShowLinkedInData,
  showConversations,
  setShowConversations,
  showFollowUps,
  setShowFollowUps,
  showMemories,
  setShowMemories,
  isProcessing,
  handleSavePreviewEdits,
  handleApproveAndSave,
  setAiPreview,
  setIsEditingPreview,
  setShowRawNotes,
}: FourCollapsedSectionsProps) {
  // Local state for showing/hiding input fields
  const [showKeywordsInput, setShowKeywordsInput] = useState(false);
  const [showCompaniesInput, setShowCompaniesInput] = useState(false);
  const [showIndustriesInput, setShowIndustriesInput] = useState(false);
  const [showSkillsInput, setShowSkillsInput] = useState(false);
  const [showTechnologiesInput, setShowTechnologiesInput] = useState(false);
  const [showInterestsInput, setShowInterestsInput] = useState(false);

  return (
    <div className="mb-6 space-y-2">
      <Card className="bg-white border-gray-200 p-4 space-y-2">
        {/* LinkedIn (Collapsible) - Profile header + sections */}
        <div className="pb-4 border-b border-gray-200">
          <button
            onClick={() => setShowLinkedInData(!showLinkedInData)}
            className="w-full flex items-center justify-between font-semibold text-gray-700 mb-2 hover:text-gray-900"
          >
            <span>LinkedIn</span>
            <span>{showLinkedInData ? '▼' : '▶'}</span>
          </button>
          {showLinkedInData && (
            <div className="space-y-4">
              {/* Profile Header - Name, Role, Company, Location, Followers */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{personName || 'Name not set'}</h3>
                </div>
                <div>
                  <p className="text-sm text-gray-700">{personRole || 'Role not set'} at {personCompany || 'Company not set'}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{personLocation || 'Location not set'}</span>
                  {editedPreview?.people?.[0]?.follower_count && (
                    <span>• {editedPreview.people[0].follower_count.toLocaleString()} followers</span>
                  )}
                </div>
                {!editedPreview?.people?.[0]?.follower_count && (
                  <div className="mt-2">
                    <input
                      type="number"
                      placeholder="Add follower count"
                      value=""
                      onChange={(e) => {
                        const person = editedPreview?.people?.[0] || {};
                        const updatedPerson = {...person, follower_count: e.target.value ? parseInt(e.target.value) : null};
                        const updatedPeople = [...(editedPreview?.people || [])];
                        updatedPeople[0] = updatedPerson;
                        setEditedPreview(editedPreview ? {...editedPreview, people: updatedPeople} : {people: updatedPeople});
                      }}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs"
                    />
                  </div>
                )}
              </div>

              {/* About Section */}
              {editedPreview?.people?.[0]?.about && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">About</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {editedPreview.people[0].about}
                  </p>
                </div>
              )}

              {/* Experience Section */}
              {editedPreview?.people?.[0]?.experience && editedPreview.people[0].experience.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Experience</h4>
                  <ul className="space-y-3 list-none">
                    {editedPreview.people[0].experience.map((exp: any, idx: number) => (
                      <li key={idx} className="text-sm">
                        <div className="font-medium text-gray-900">
                          {exp.role} at {exp.company} {exp.dates && `(${exp.dates})`}
                        </div>
                        {exp.description && (
                          <div className="text-gray-600 mt-1">{exp.description}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Education Section */}
              {editedPreview?.people?.[0]?.education && editedPreview.people[0].education.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Education</h4>
                  <ul className="space-y-2 list-none">
                    {editedPreview.people[0].education.map((edu: any, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700">
                        {edu.school}{edu.degree && ` - ${edu.degree}`}{edu.dates && ` (${edu.dates})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Keywords */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-700">Keywords</h4>
                  {!showKeywordsInput && (
                    <button
                      onClick={() => setShowKeywordsInput(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      +
                    </button>
                  )}
                </div>
                {showKeywordsInput && (
                  <input
                    type="text"
                    placeholder="Add keywords (comma-separated, press Enter)"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const items = e.currentTarget.value.split(',').map(item => item.trim()).filter(item => item);
                        const newKeywords = [...(editedPreview?.keywords || []), ...items];
                        setEditedPreview(editedPreview ? {...editedPreview, keywords: newKeywords} : {keywords: newKeywords});
                        e.currentTarget.value = '';
                        setShowKeywordsInput(false);
                      } else if (e.key === 'Escape') {
                        setShowKeywordsInput(false);
                      }
                    }}
                    onBlur={() => setShowKeywordsInput(false)}
                  />
                )}
                {(editedPreview?.keywords && editedPreview.keywords.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {(editedPreview?.keywords || []).map((keyword: string, idx: number) => (
                      <Badge 
                        key={idx} 
                        className="bg-blue-100 text-blue-700 text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
                        onClick={() => {
                          const newKeywords = (editedPreview?.keywords || []).filter((_: any, i: number) => i !== idx);
                          setEditedPreview(editedPreview ? {...editedPreview, keywords: newKeywords} : {keywords: newKeywords});
                        }}
                      >
                        {keyword} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Companies */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-700">Companies</h4>
                  {!showCompaniesInput && (
                    <button
                      onClick={() => setShowCompaniesInput(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      +
                    </button>
                  )}
                </div>
                {showCompaniesInput && (
                  <input
                    type="text"
                    placeholder="Add companies (comma-separated, press Enter)"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const items = e.currentTarget.value.split(',').map(item => item.trim()).filter(item => item);
                        const newCompanies = [...(editedPreview?.companies || []), ...items];
                        setEditedPreview(editedPreview ? {...editedPreview, companies: newCompanies} : {companies: newCompanies});
                        e.currentTarget.value = '';
                        setShowCompaniesInput(false);
                      } else if (e.key === 'Escape') {
                        setShowCompaniesInput(false);
                      }
                    }}
                    onBlur={() => setShowCompaniesInput(false)}
                  />
                )}
                {(editedPreview?.companies && editedPreview.companies.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {(editedPreview?.companies || []).map((company: string, idx: number) => (
                      <Badge 
                        key={idx} 
                        className="bg-purple-100 text-purple-700 text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
                        onClick={() => {
                          const newCompanies = (editedPreview?.companies || []).filter((_: any, i: number) => i !== idx);
                          setEditedPreview(editedPreview ? {...editedPreview, companies: newCompanies} : {companies: newCompanies});
                        }}
                      >
                        {company} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Industries */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-700">Industries</h4>
                  {!showIndustriesInput && (
                    <button
                      onClick={() => setShowIndustriesInput(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      +
                    </button>
                  )}
                </div>
                {showIndustriesInput && (
                  <input
                    type="text"
                    placeholder="Add industries (comma-separated, press Enter)"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const items = e.currentTarget.value.split(',').map(item => item.trim()).filter(item => item);
                        const newIndustries = [...(editedPreview?.industries || []), ...items];
                        setEditedPreview(editedPreview ? {...editedPreview, industries: newIndustries} : {industries: newIndustries});
                        e.currentTarget.value = '';
                        setShowIndustriesInput(false);
                      } else if (e.key === 'Escape') {
                        setShowIndustriesInput(false);
                      }
                    }}
                    onBlur={() => setShowIndustriesInput(false)}
                  />
                )}
                {(editedPreview?.industries && editedPreview.industries.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {(editedPreview?.industries || []).map((industry: string, idx: number) => (
                      <Badge 
                        key={idx} 
                        className="bg-green-100 text-green-700 text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
                        onClick={() => {
                          const newIndustries = (editedPreview?.industries || []).filter((_: any, i: number) => i !== idx);
                          setEditedPreview(editedPreview ? {...editedPreview, industries: newIndustries} : {industries: newIndustries});
                        }}
                      >
                        {industry} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-700">Skills</h4>
                  {!showSkillsInput && (
                    <button
                      onClick={() => setShowSkillsInput(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      +
                    </button>
                  )}
                </div>
                {showSkillsInput && (
                  <input
                    type="text"
                    placeholder="Add skills (comma-separated, press Enter)"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const items = e.currentTarget.value.split(',').map(item => item.trim()).filter(item => item);
                        const person = editedPreview.people?.[0];
                        if (person) {
                          const newSkills = [...(person.skills || []), ...items];
                          const updatedPerson = {...person, skills: newSkills};
                          const updatedPeople = [...(editedPreview.people || [])];
                          updatedPeople[0] = updatedPerson;
                          setEditedPreview({...editedPreview, people: updatedPeople});
                        }
                        e.currentTarget.value = '';
                        setShowSkillsInput(false);
                      } else if (e.key === 'Escape') {
                        setShowSkillsInput(false);
                      }
                    }}
                    onBlur={() => setShowSkillsInput(false)}
                  />
                )}
                {(editedPreview?.people?.[0]?.skills && editedPreview.people[0].skills.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {(editedPreview?.people?.[0]?.skills || []).map((skill: string, idx: number) => (
                      <Badge 
                        key={idx} 
                        className="bg-amber-100 text-amber-700 text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
                        onClick={() => {
                          const person = editedPreview?.people?.[0];
                          if (person) {
                            const newSkills = (person.skills || []).filter((_: any, i: number) => i !== idx);
                            const updatedPerson = {...person, skills: newSkills};
                            const updatedPeople = [...(editedPreview?.people || [])];
                            updatedPeople[0] = updatedPerson;
                            setEditedPreview(editedPreview ? {...editedPreview, people: updatedPeople} : {people: updatedPeople});
                          }
                        }}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Technologies */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-700">Technologies</h4>
                  {!showTechnologiesInput && (
                    <button
                      onClick={() => setShowTechnologiesInput(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      +
                    </button>
                  )}
                </div>
                {showTechnologiesInput && (
                  <input
                    type="text"
                    placeholder="Add technologies (comma-separated, press Enter)"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const items = e.currentTarget.value.split(',').map(item => item.trim()).filter(item => item);
                        const person = editedPreview.people?.[0];
                        if (person) {
                          const newTechnologies = [...(person.technologies || []), ...items];
                          const updatedPerson = {...person, technologies: newTechnologies};
                          const updatedPeople = [...(editedPreview.people || [])];
                          updatedPeople[0] = updatedPerson;
                          setEditedPreview({...editedPreview, people: updatedPeople});
                        }
                        e.currentTarget.value = '';
                        setShowTechnologiesInput(false);
                      } else if (e.key === 'Escape') {
                        setShowTechnologiesInput(false);
                      }
                    }}
                    onBlur={() => setShowTechnologiesInput(false)}
                  />
                )}
                {(editedPreview?.people?.[0]?.technologies && editedPreview.people[0].technologies.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {(editedPreview?.people?.[0]?.technologies || []).map((tech: string, idx: number) => (
                      <Badge 
                        key={idx} 
                        className="bg-cyan-100 text-cyan-700 text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
                        onClick={() => {
                          const person = editedPreview?.people?.[0];
                          if (person) {
                            const newTechnologies = (person.technologies || []).filter((_: any, i: number) => i !== idx);
                            const updatedPerson = {...person, technologies: newTechnologies};
                            const updatedPeople = [...(editedPreview?.people || [])];
                            updatedPeople[0] = updatedPerson;
                            setEditedPreview(editedPreview ? {...editedPreview, people: updatedPeople} : {people: updatedPeople});
                          }
                        }}
                      >
                        {tech} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Interests */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-700">Interests</h4>
                  {!showInterestsInput && (
                    <button
                      onClick={() => setShowInterestsInput(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      +
                    </button>
                  )}
                </div>
                {showInterestsInput && (
                  <input
                    type="text"
                    placeholder="Add interests (comma-separated, press Enter)"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const items = e.currentTarget.value.split(',').map(item => item.trim()).filter(item => item);
                        const person = editedPreview.people?.[0];
                        if (person) {
                          const newInterests = [...(person.interests || []), ...items];
                          const updatedPerson = {...person, interests: newInterests};
                          const updatedPeople = [...(editedPreview.people || [])];
                          updatedPeople[0] = updatedPerson;
                          setEditedPreview({...editedPreview, people: updatedPeople});
                        }
                        e.currentTarget.value = '';
                        setShowInterestsInput(false);
                      } else if (e.key === 'Escape') {
                        setShowInterestsInput(false);
                      }
                    }}
                    onBlur={() => setShowInterestsInput(false)}
                  />
                )}
                {(editedPreview?.people?.[0]?.interests && editedPreview.people[0].interests.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {(editedPreview?.people?.[0]?.interests || []).map((interest: string, idx: number) => (
                      <Badge 
                        key={idx} 
                        className="bg-pink-100 text-pink-700 text-xs cursor-pointer hover:bg-red-100 hover:text-red-700"
                        onClick={() => {
                          const person = editedPreview?.people?.[0];
                          if (person) {
                            const newInterests = (person.interests || []).filter((_: any, i: number) => i !== idx);
                            const updatedPerson = {...person, interests: newInterests};
                            const updatedPeople = [...(editedPreview?.people || [])];
                            updatedPeople[0] = updatedPerson;
                            setEditedPreview(editedPreview ? {...editedPreview, people: updatedPeople} : {people: updatedPeople});
                          }
                        }}
                      >
                        {interest} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Conversations */}
        <div className="pb-4 border-b border-gray-200">
          <button
            onClick={() => setShowConversations(!showConversations)}
            className="w-full flex items-center justify-between font-semibold text-gray-700 mb-2 hover:text-gray-900"
          >
            <span>Conversations</span>
            <span>{showConversations ? '▼' : '▶'}</span>
          </button>
          {showConversations && (
            <>
              <textarea
                placeholder="Add note (Enter to save, Shift+Enter for new line)"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2 resize-none overflow-hidden"
                rows={1}
                onInput={(e) => {
                  e.currentTarget.style.height = 'auto';
                  e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    const notes = editedPreview?.additional_notes || [];
                    const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
                    const newNote = {
                      date: today,
                      text: e.currentTarget.value.trim()
                    };
                    const newNotes = [newNote, ...notes];
                    setEditedPreview(editedPreview ? {...editedPreview, additional_notes: newNotes} : {additional_notes: newNotes});
                    e.currentTarget.value = '';
                    e.currentTarget.style.height = 'auto';
                  }
                }}
              />
              {editedPreview?.additional_notes && editedPreview.additional_notes.length > 0 ? (
                <div className="space-y-2">
                  {editedPreview.additional_notes.map((note: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                      <span className="text-sm text-gray-600 flex-shrink-0">
                        {note.date || new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                      </span>
                      <span className="text-sm text-gray-700 flex-1">{typeof note === 'string' ? note : (note.text || '')}</span>
                      <button
                        onClick={async () => {
                          // If this conversation exists in DB (has an id), delete it
                          if (note.id && note.isExisting) {
                            if (!confirm('Delete this conversation from the database?')) return;
                            
                            try {
                              const { data: { session } } = await supabase.auth.getSession();
                              const response = await fetch(`/api/delete-conversation/${note.id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${session?.access_token}`
                                }
                              });
                              
                              if (!response.ok) {
                                throw new Error('Failed to delete conversation');
                              }
                              console.log('✅ Conversation deleted from DB');
                            } catch (error) {
                              console.error('Error deleting conversation:', error);
                              alert('Failed to delete conversation');
                              return;
                            }
                          }
                          
                          // Remove from UI
                          const newNotes = (editedPreview?.additional_notes || []).filter((_: any, i: number) => i !== idx);
                          setEditedPreview(editedPreview ? {...editedPreview, additional_notes: newNotes} : {additional_notes: newNotes});
                        }}
                        className="text-red-600 hover:text-red-700 text-xs font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No notes yet</p>
              )}
            </>
          )}
        </div>

        {/* Follow-ups */}
        <div className="pb-4 border-b border-gray-200">
          <button
            onClick={() => setShowFollowUps(!showFollowUps)}
            className="w-full flex items-center justify-between font-semibold text-gray-700 mb-2 hover:text-gray-900"
          >
            <span>Follow-ups</span>
            <span>{showFollowUps ? '▼' : '▶'}</span>
          </button>
          {showFollowUps && (
            <>
              <textarea
                placeholder="Add follow-up action (Enter to save, Shift+Enter for new line)"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2 resize-none overflow-hidden"
                rows={1}
                onInput={(e) => {
                  e.currentTarget.style.height = 'auto';
                  e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    const followUps = editedPreview?.follow_ups || editedPreview?.followUps || [];
                    const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
                    const newFollowUp = {
                      description: e.currentTarget.value.trim(),
                      priority: 'medium',
                      urgency: 'not-urgent-not-important',
                      status: 'not-started',
                      date: today,
                      due_date: ''
                    };
                    const newFollowUps = [newFollowUp, ...followUps];
                    setEditedPreview(editedPreview ? {...editedPreview, follow_ups: newFollowUps, followUps: undefined} : {follow_ups: newFollowUps});
                    e.currentTarget.value = '';
                    e.currentTarget.style.height = 'auto';
                  }
                }}
              />
              {((editedPreview?.follow_ups || editedPreview?.followUps)?.length > 0) ? (
                <div className="space-y-2">
                  {(editedPreview?.follow_ups || editedPreview?.followUps || []).map((followUp: any, idx: number) => {
                    const updateFollowUp = async (field: 'status' | 'priority' | 'urgency' | 'due_date', value: string) => {
                      console.log(`🔄 Updating follow-up field: ${field} to value:`, value);
                      console.log('📋 Current follow-up:', followUp);
                      
                      // Update in UI first (always)
                      const followUps = editedPreview?.follow_ups || editedPreview?.followUps || [];
                      console.log('📚 Current follow-ups count:', followUps.length);
                      
                      const newFollowUps = followUps.map((fu: any, i: number) => 
                        i === idx ? { ...fu, [field]: value } : fu
                      );
                      console.log('📚 New follow-ups count:', newFollowUps.length);
                      
                      setEditedPreview(editedPreview ? {...editedPreview, follow_ups: newFollowUps, followUps: undefined} : {follow_ups: newFollowUps});
                      
                      // If this is an existing follow-up (already in DB), update it there too
                      if (followUp.id && followUp.isExisting) {
                        console.log(`💾 Updating existing follow-up in DB: ${followUp.id}`);
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          const response = await fetch(`/api/update-followup/${followUp.id}`, {
                            method: 'PATCH',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${session?.access_token}`
                            },
                            body: JSON.stringify({ [field]: value })
                          });
                          
                          if (!response.ok) {
                            const errorData = await response.json();
                            console.error(`❌ API error updating follow-up ${field}:`, errorData);
                            throw new Error(errorData.error || `Failed to update follow-up ${field}`);
                          }
                          console.log(`✅ Follow-up ${field} updated in DB to:`, value);
                        } catch (error: any) {
                          console.error(`❌ Error updating follow-up ${field}:`, error);
                          // Show a more user-friendly message without blocking the UI
                          console.warn(`⚠️ Change to ${field} saved locally. Will sync when you save to Rolodex.`);
                        }
                      } else {
                        console.log(`📝 Follow-up ${field} updated locally to ${value} (will save to DB when you click Save)`);
                      }
                    };

                    return (
                      <div key={idx} className="flex flex-col gap-2 p-3 bg-white rounded border border-gray-200">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600 flex-shrink-0">
                            {followUp.date || new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                          </span>
                          <span className="text-sm text-gray-700 flex-1">{followUp.description}</span>
                          <button
                            onClick={async () => {
                              // If this follow-up exists in DB (has an id), delete it
                              if (followUp.id && followUp.isExisting) {
                                if (!confirm(`⚠️ PERMANENTLY DELETE this follow-up?\n\n"${followUp.description}"\n\nThis cannot be undone!`)) return;
                                
                                try {
                                  const { data: { session } } = await supabase.auth.getSession();
                                  const response = await fetch(`/api/delete-followup/${followUp.id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${session?.access_token}`
                                    }
                                  });
                                  
                                  if (!response.ok) {
                                    throw new Error('Failed to delete follow-up');
                                  }
                                  console.log('✅ Follow-up deleted from DB');
                                } catch (error) {
                                  console.error('Error deleting follow-up:', error);
                                  alert('Failed to delete follow-up');
                                  return;
                                }
                              }
                              
                              // Remove from UI
                              const followUps = editedPreview?.follow_ups || editedPreview?.followUps || [];
                              const newFollowUps = followUps.filter((_: any, i: number) => i !== idx);
                              setEditedPreview(editedPreview ? {...editedPreview, follow_ups: newFollowUps, followUps: undefined} : {follow_ups: newFollowUps});
                            }}
                            className="text-red-600 hover:text-red-700 text-xs font-bold"
                          >
                            ×
                          </button>
                        </div>
                        
                        {/* Status - Visual Progress Stepper */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16">Status:</span>
                          <div className="flex items-center gap-2">
                            {/* Step 1: Not Started */}
                            <button
                              onClick={() => updateFollowUp('status', 'not-started')}
                              className={`px-2 py-0.5 text-xs rounded transition-all ${
                                followUp.status === 'not-started' || followUp.status === 'pending' || !followUp.status
                                  ? 'bg-red-600 text-white' 
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              Not Started
                            </button>
                            
                            {/* Arrow/Connector */}
                            <div className="text-gray-400 text-xs">→</div>
                            
                            {/* Step 2: Started */}
                            <button
                              onClick={() => updateFollowUp('status', 'started')}
                              className={`px-2 py-0.5 text-xs rounded transition-all ${
                                followUp.status === 'started' 
                                  ? 'bg-yellow-400 text-gray-900' 
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              In Progress
                            </button>
                            
                            {/* Arrow/Connector */}
                            <div className="text-gray-400 text-xs">→</div>
                            
                            {/* Step 3: Complete */}
                            <button
                              onClick={() => updateFollowUp('status', 'complete')}
                              className={`px-2 py-0.5 text-xs rounded transition-all ${
                                followUp.status === 'complete' 
                                  ? 'bg-green-600 text-white' 
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              Complete
                            </button>
                          </div>
                        </div>
                        
                        {/* Priority - Simple Low/Medium/High */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16">Priority:</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateFollowUp('priority', 'low')}
                              className={`px-2 py-0.5 text-xs rounded transition-all ${
                                followUp.priority === 'low' 
                                  ? 'bg-gray-400 text-white' 
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              Low
                            </button>
                            <button
                              onClick={() => updateFollowUp('priority', 'medium')}
                              className={`px-2 py-0.5 text-xs rounded transition-all ${
                                followUp.priority === 'medium' 
                                  ? 'bg-gray-400 text-white' 
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              Medium
                            </button>
                            <button
                              onClick={() => updateFollowUp('priority', 'high')}
                              className={`px-2 py-0.5 text-xs rounded transition-all ${
                                followUp.priority === 'high' 
                                  ? 'bg-gray-400 text-white' 
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              High
                            </button>
                          </div>
                        </div>
                        
                        {/* Urgency - Eisenhower Matrix */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16">Urgency:</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateFollowUp('urgency', 'urgent-important')}
                              className={`px-2 py-0.5 text-xs rounded transition-all ${
                                followUp.urgency === 'urgent-important' 
                                  ? 'bg-gray-400 text-white' 
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              Urgent: Important
                            </button>
                            <button
                              onClick={() => updateFollowUp('urgency', 'urgent-not-important')}
                              className={`px-2 py-0.5 text-xs rounded transition-all ${
                                followUp.urgency === 'urgent-not-important' 
                                  ? 'bg-gray-400 text-white' 
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              Urgent: Not Important
                            </button>
                            <button
                              onClick={() => updateFollowUp('urgency', 'not-urgent-important')}
                              className={`px-2 py-0.5 text-xs rounded transition-all ${
                                followUp.urgency === 'not-urgent-important' 
                                  ? 'bg-gray-400 text-white' 
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              Not Urgent: Important
                            </button>
                            <button
                              onClick={() => updateFollowUp('urgency', 'not-urgent-not-important')}
                              className={`px-2 py-0.5 text-xs rounded transition-all ${
                                followUp.urgency === 'not-urgent-not-important' 
                                  ? 'bg-gray-400 text-white' 
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              Not Urgent: Not Important
                            </button>
                          </div>
                        </div>
                        
                        {/* Due Date */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-16">Due Date:</span>
                          <input
                            type="date"
                            value={followUp.due_date || ''}
                            onChange={(e) => {
                              const newDueDate = e.target.value;
                              console.log('📅 Due date changed to:', newDueDate);
                              updateFollowUp('due_date', newDueDate);
                            }}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No follow-ups yet</p>
              )}
            </>
          )}
        </div>

        {/* Memories */}
        <div className="pb-4">
          <button
            onClick={() => setShowMemories(!showMemories)}
            className="w-full flex items-center justify-between font-semibold text-gray-700 mb-2 hover:text-gray-900"
          >
            <span>Memories</span>
            <span>{showMemories ? '▼' : '▶'}</span>
          </button>
          {showMemories && (
            <>
              <textarea
                placeholder="Add a memory or something to remember"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2 resize-none overflow-hidden"
                rows={1}
                onInput={(e) => {
                  e.currentTarget.style.height = 'auto';
                  e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    const memories = editedPreview?.memories || [];
                    const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
                    const newMemory = {
                      date: today,
                      text: e.currentTarget.value.trim()
                    };
                    const newMemories = [newMemory, ...memories];
                    setEditedPreview(editedPreview ? {...editedPreview, memories: newMemories} : {memories: newMemories});
                    e.currentTarget.value = '';
                    e.currentTarget.style.height = 'auto';
                  }
                }}
              />
              {editedPreview?.memories && editedPreview.memories.length > 0 ? (
                <div className="space-y-2">
                  {(editedPreview?.memories || []).map((memory: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                      <span className="text-sm text-gray-600 flex-shrink-0">
                        {memory.date || new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                      </span>
                      <span className="text-sm text-gray-700 flex-1">{typeof memory === 'string' ? memory : (memory.text || '')}</span>
                      <button
                        onClick={async () => {
                          // If this memory exists in DB (has an id), delete it
                          if (memory.id && memory.isExisting) {
                            if (!confirm('Delete this memory from the database?')) return;
                            
                            try {
                              const { data: { session } } = await supabase.auth.getSession();
                              const response = await fetch(`/api/delete-memory/${memory.id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${session?.access_token}`
                                }
                              });
                              
                              if (!response.ok) {
                                throw new Error('Failed to delete memory');
                              }
                              console.log('✅ Memory deleted from DB');
                            } catch (error) {
                              console.error('Error deleting memory:', error);
                              alert('Failed to delete memory');
                              return;
                            }
                          }
                          
                          // Remove from UI
                          const newMemories = (editedPreview?.memories || []).filter((_: any, i: number) => i !== idx);
                          setEditedPreview(editedPreview ? {...editedPreview, memories: newMemories} : {memories: newMemories});
                        }}
                        className="text-red-600 hover:text-red-700 text-xs font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No memories yet</p>
              )}
            </>
          )}
        </div>

        {/* Show save button if there's a person name or any data */}
        {(personName?.trim() || (editedPreview && (editedPreview.people?.length > 0 || editedPreview.conversations?.length > 0 || editedPreview.follow_ups?.length > 0 || editedPreview.memories?.length > 0))) && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => {
                // Ensure we have the latest data including manual edits
                const dataToSave = editedPreview || {
                  people: [{
                    name: personName,
                    company: personCompany,
                    role: personRole,
                    location: personLocation,
                  }],
                  conversations: [],
                  follow_ups: [],
                  memories: []
                };
                handleSavePreviewEdits();
                handleApproveAndSave(dataToSave);
              }}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? "Saving..." : "Save to Rolodex"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAiPreview(null);
                setIsEditingPreview(false);
                setShowRawNotes(true);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
