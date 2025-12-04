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
                      <span className="text-sm text-gray-700 flex-1">{note.text || note}</span>
                      <button
                        onClick={() => {
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
                    const newFollowUps = [...followUps, { description: e.currentTarget.value.trim(), priority: 'medium' }];
                    setEditedPreview(editedPreview ? {...editedPreview, follow_ups: newFollowUps, followUps: undefined} : {follow_ups: newFollowUps});
                    e.currentTarget.value = '';
                    e.currentTarget.style.height = 'auto';
                  }
                }}
              />
              {((editedPreview?.follow_ups || editedPreview?.followUps)?.length > 0) ? (
                <div className="space-y-2">
                  {(editedPreview?.follow_ups || editedPreview?.followUps || []).map((followUp: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                      <span className="text-sm text-gray-700 flex-1">{followUp.description}</span>
                      <button
                        onClick={() => {
                          const followUps = editedPreview?.follow_ups || editedPreview?.followUps || [];
                          const newFollowUps = followUps.filter((_: any, i: number) => i !== idx);
                          setEditedPreview(editedPreview ? {...editedPreview, follow_ups: newFollowUps, followUps: undefined} : {follow_ups: newFollowUps});
                        }}
                        className="text-red-600 hover:text-red-700 text-xs font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
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
                      <span className="text-sm text-gray-700 flex-1">{memory.text || memory}</span>
                      <button
                        onClick={() => {
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

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => {
              handleSavePreviewEdits();
              handleApproveAndSave(editedPreview);
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
      </Card>
    </div>
  );
}
