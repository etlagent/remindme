/**
 * PERSON INFO CARD COMPONENT
 * 
 * Input fields for basic person information.
 * Displays at the top of the capture section.
 * 
 * EXTRACTED FROM: app/page.tsx lines 969-1045
 * ALL STATE remains in page.tsx - this is ONLY the visual component
 */

import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PersonInfoCardProps {
  personName: string;
  personCompany: string;
  personRole: string;
  personLocation: string;
  personInterests: string;
  onPersonNameChange: (value: string) => void;
  onPersonCompanyChange: (value: string) => void;
  onPersonRoleChange: (value: string) => void;
  onPersonLocationChange: (value: string) => void;
  onPersonInterestsChange: (value: string) => void;
  onClear: () => void;
}

export function PersonInfoCard({
  personName,
  personCompany,
  personRole,
  personLocation,
  personInterests,
  onPersonNameChange,
  onPersonCompanyChange,
  onPersonRoleChange,
  onPersonLocationChange,
  onPersonInterestsChange,
  onClear,
}: PersonInfoCardProps) {
  return (
    <div className="mb-3 pb-3 border-b border-gray-200">
      <div className="bg-white p-4 rounded border border-gray-200 space-y-2 relative">
        {/* Buttons in top right */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
          >
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
          >
            <ImageIcon className="mr-2 h-3 w-3" />
            Choose File
          </Button>
        </div>
        
        {/* Name */}
        <input
          type="text"
          placeholder="Name"
          value={personName}
          onChange={(e) => onPersonNameChange(e.target.value)}
          className="w-full font-bold text-xl text-gray-800 border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
        />
        
        {/* Company */}
        <input
          type="text"
          placeholder="Company"
          value={personCompany}
          onChange={(e) => onPersonCompanyChange(e.target.value)}
          className="w-full text-base text-gray-700 border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
        />
        
        {/* Role */}
        <input
          type="text"
          placeholder="Role / Title"
          value={personRole}
          onChange={(e) => onPersonRoleChange(e.target.value)}
          className="w-full text-base text-gray-700 border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
        />
        
        {/* Location */}
        <input
          type="text"
          placeholder="Location"
          value={personLocation}
          onChange={(e) => onPersonLocationChange(e.target.value)}
          className="w-full text-base text-gray-700 border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
        />
        
        {/* Interests / What they do */}
        <input
          type="text"
          placeholder="Interests / What they do (e.g., Painter, Musician, Rock climber)"
          value={personInterests}
          onChange={(e) => onPersonInterestsChange(e.target.value)}
          className="w-full text-base text-gray-600 border-0 p-0 focus:outline-none focus:ring-0 placeholder:text-gray-400 italic"
        />
      </div>
    </div>
  );
}
