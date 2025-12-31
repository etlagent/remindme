/**
 * INTERACTION DETAILS LOG COMPONENT
 * 
 * Free-form log for capturing any details about a person:
 * - Physical descriptions (clothes, accent, facial features)
 * - Where you met, conversation topics
 * - Vibe, impressions, social handles
 * - Anything you want to remember for next time
 */

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X, MapPin, Calendar } from "lucide-react";
import { InteractionDetail } from "@/lib/types";

interface InteractionDetailsLogProps {
  details: InteractionDetail[];
  onChange: (details: InteractionDetail[]) => void;
}

export function InteractionDetailsLog({ details, onChange }: InteractionDetailsLogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newDetails, setNewDetails] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const handleAddDetail = () => {
    if (!newDetails.trim()) return;

    const newDetail: InteractionDetail = {
      date: new Date().toISOString(),
      details: newDetails.trim(),
      location: newLocation.trim() || undefined
    };

    onChange([...details, newDetail]);
    setNewDetails("");
    setNewLocation("");
    setIsAdding(false);
  };

  const handleRemoveDetail = (index: number) => {
    const updated = details.filter((_, i) => i !== index);
    onChange(updated);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Interaction Details & Notes
        </label>
        {!isAdding && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Detail
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Log anything you want to remember: physical features, conversation topics, where you met, vibe, etc.
      </p>

      {/* Existing details */}
      {details.length > 0 && (
        <div className="space-y-2">
          {details.map((detail, index) => (
            <Card key={index} className="p-3 bg-gray-50 border-gray-200">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(detail.date)}</span>
                    {detail.location && (
                      <>
                        <span className="text-gray-400">•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{detail.location}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {detail.details}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDetail(index)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add new detail form */}
      {isAdding && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Location (e.g., The Dive Bar on Main St)"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Textarea
              placeholder="Write any details you want to remember...&#10;&#10;Examples:&#10;- Bartender named Mike, plays in band 'Velvet Noise', has Irish accent&#10;- Wearing glasses, blue jacket, friendly smile&#10;- Working on AI startup, raising seed round&#10;- Followed on Instagram @username"
              value={newDetails}
              onChange={(e) => setNewDetails(e.target.value)}
              className="min-h-[120px] text-sm resize-y"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAddDetail}
                disabled={!newDetails.trim()}
              >
                Add
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewDetails("");
                  setNewLocation("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {details.length === 0 && !isAdding && (
        <p className="text-sm text-gray-400 italic py-4 text-center border-2 border-dashed border-gray-200 rounded">
          No interaction details yet. Click "Add Detail" to log your first interaction.
        </p>
      )}
    </div>
  );
}
