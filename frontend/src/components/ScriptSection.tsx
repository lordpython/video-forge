import React, { useState } from "react";
import { ScriptSection as ScriptSectionType } from "types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  section: ScriptSectionType;
  index: number;
  isEditing: boolean;
  onEdit: (index: number) => void;
  onSave: (index: number, updatedSection: ScriptSectionType) => void;
  onCancel: (index: number) => void;
}

const getSectionTitle = (type: string): string => {
  const typeMap: Record<string, string> = {
    "hook": "HOOK",
    "intro": "INTRODUCTION",
    "main_content": "MAIN CONTENT",
    "main_content_1": "MAIN CONTENT (Part 1)",
    "main_content_2": "MAIN CONTENT (Part 2)",
    "main_content_3": "MAIN CONTENT (Part 3)",
    "main_content_4": "MAIN CONTENT (Part 4)",
    "main_content_5": "MAIN CONTENT (Part 5)",
    "outro": "OUTRO",
    "call_to_action": "CALL TO ACTION",
    "full_script": "FULL SCRIPT"
  };
  
  return typeMap[type] || type.toUpperCase().replace("_", " ");
};

const getEstimatedDurationText = (duration: string | null | undefined): string => {
  if (!duration) return "";
  
  // Extract numbers from the duration string (e.g., "30 seconds" -> "30")
  const match = duration.match(/\d+/);
  if (!match) return duration;
  
  const number = match[0];
  if (duration.toLowerCase().includes("second")) {
    return `${number}s`;
  } else if (duration.toLowerCase().includes("minute")) {
    return `${number}m`;
  }
  
  return duration;
};

export const ScriptSection: React.FC<Props> = ({
  section,
  index,
  isEditing,
  onEdit,
  onSave,
  onCancel
}) => {
  const [editedContent, setEditedContent] = useState(section.content);
  const [showBRoll, setShowBRoll] = useState(false);
  
  const handleSave = () => {
    const updatedSection = {
      ...section,
      content: editedContent
    };
    onSave(index, updatedSection);
  };
  
  const handleCancel = () => {
    setEditedContent(section.content);
    onCancel(index);
  };
  
  const sectionTitle = getSectionTitle(section.type);
  const durationText = getEstimatedDurationText(section.estimated_duration);
  const hasBRoll = section.b_roll_suggestions && section.b_roll_suggestions.length > 0;
  
  return (
    <div className="mb-6 bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-800/70 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="font-bold text-gray-200">{sectionTitle}</h3>
          {durationText && (
            <Badge variant="outline" className="ml-2 text-xs text-gray-300 border-gray-700">
              {durationText}
            </Badge>
          )}
        </div>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={() => onEdit(index)} className="text-gray-400 hover:text-white">
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[150px] bg-gray-950/50 border-gray-700 text-gray-200"
            placeholder={`Enter ${sectionTitle.toLowerCase()} content here...`}
          />
        ) : (
          <div className="prose prose-sm prose-invert max-w-none">
            {section.content.split("\n").map((paragraph, i) => (
              paragraph.trim() ? (
                <p key={i} className="text-gray-300 mb-2">{paragraph}</p>
              ) : <br key={i} />
            ))}
          </div>
        )}
        
        {hasBRoll && (
          <div className="mt-4">
            <button
              onClick={() => setShowBRoll(!showBRoll)}
              className="flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {showBRoll ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide B-Roll Suggestions
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show B-Roll Suggestions
                </>
              )}
            </button>
            
            {showBRoll && (
              <div className="mt-2 bg-gray-950/50 border border-gray-800 rounded-md p-3">
                <h4 className="text-xs uppercase text-gray-500 font-semibold mb-2">B-Roll Suggestions</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {section.b_roll_suggestions?.map((suggestion, i) => (
                    <li key={i} className="text-sm text-gray-400">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
