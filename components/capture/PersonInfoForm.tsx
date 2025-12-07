/**
 * PERSON INFO FORM COMPONENT
 * 
 * Input form for basic person information (name, company, role, location).
 * Displayed at the top of the capture section.
 * 
 * USED BY:
 * - app/page.tsx (left side of split view)
 * 
 * DEPENDENCIES:
 * - components/ui/button (shadcn Button component)
 * - lucide-react (icons)
 * - lib/types (PersonFormData type)
 * 
 * PROPS:
 * - personName, personCompany, personRole, personLocation: Form values
 * - onFieldChange: Callback when any field changes
 * - onClear: Callback to clear all fields
 * 
 * FEATURES:
 * - Clean, minimalist design
 * - Clear button to reset form
 * - File upload button (placeholder for future image feature)
 * - Auto-populated when loading person from library
 * 
 * FORM FIELDS:
 * - Name: Full name of person
 * - Company: Where they work
 * - Role/Title: Job position
 * - Location: City, state, country
 * 
 * EXTRACTED FROM:
 * - app/page.tsx (lines 969-1099)
 */

import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PersonFormData } from "@/lib/types";

interface PersonInfoFormProps {
  personForm: PersonFormData;
  onFieldChange: (field: keyof PersonFormData, value: string) => void;
  onClear: () => void;
}

export function PersonInfoForm({ 
  personForm, 
  onFieldChange, 
  onClear 
}: PersonInfoFormProps) {
  return (
    <div className="mb-4 pb-4 border-b border-gray-200">
      <div className="bg-white p-4 rounded border border-gray-200 space-y-2 relative">
        {/* Action Buttons (top right) */}
        <div className="absolute top-4 right-4 flex gap-2">
          {/* Clear Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
            title="Clear all fields"
          >
            Clear
          </Button>

          {/* File Upload Button (placeholder for future feature) */}
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
            title="Upload profile image (coming soon)"
          >
            <ImageIcon className="mr-2 h-3 w-3" />
            Choose File
          </Button>
        </div>

        {/* Name Input */}
        <input
          type="text"
          placeholder="Name"
          value={personForm.personName}
          onChange={(e) => onFieldChange('personName', e.target.value)}
          className="w-full font-bold text-xl text-gray-800 border-0 p-0 pr-32 focus:outline-none focus:ring-0 placeholder:text-gray-400"
        />

        {/* Company Input */}
        <input
          type="text"
          placeholder="Company"
          value={personForm.personCompany}
          onChange={(e) => onFieldChange('personCompany', e.target.value)}
          className="w-full text-base text-gray-700 border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
        />

        {/* Role Input */}
        <input
          type="text"
          placeholder="Role / Title"
          value={personForm.personRole}
          onChange={(e) => onFieldChange('personRole', e.target.value)}
          className="w-full text-base text-gray-700 border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
        />

        {/* Location Input */}
        <input
          type="text"
          placeholder="Location (City, State, Country)"
          value={personForm.personLocation}
          onChange={(e) => onFieldChange('personLocation', e.target.value)}
          className="w-full text-base text-gray-700 border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}
