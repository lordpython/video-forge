import React, { useState, useEffect } from "react";
import { Play, Check, SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import brain from "brain";

interface VideoClip {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  tags: string[];
  source: string;
  url: string;
}

interface VideoClipSelectorProps {
  selectedClip?: VideoClip;
  segmentContent: string;
  onSelectClip: (clip: VideoClip) => void;
  onRemoveClip: () => void;
}

export const VideoClipSelector: React.FC<VideoClipSelectorProps> = ({
  selectedClip,
  segmentContent,
  onSelectClip,
  onRemoveClip,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [availableClips, setAvailableClips] = useState<VideoClip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewClip, setPreviewClip] = useState<VideoClip | null>(null);

  // Generate suggested tags based on segment content
  useEffect(() => {
    if (segmentContent) {
      // Extract potential keywords from the content
      // This is a simple implementation - in a real application, you might use NLP
      const content = segmentContent.toLowerCase();
      const potentialTags = [
        "business", "technology", "medical", "nature", "urban", "digital",
        "meeting", "science", "landscape", "city", "marketing", "professional",
        "interface", "research", "outdoors", "buildings", "analytics", "office",
        "digital", "laboratory", "scenic", "architecture"
      ];
      
      const extractedTags = potentialTags.filter(tag => content.includes(tag));
      setSuggestedTags(extractedTags.slice(0, 5)); // Limit to 5 tags
    }
  }, [segmentContent]);

  // Initial load of clips
  useEffect(() => {
    fetchClips();
  }, []);

  const fetchClips = async (query: string = "", tags: string[] = []) => {
    setIsLoading(true);
    
    try {
      // Create queryParams
      const queryParams = new URLSearchParams();
      if (query) {
        queryParams.append("query", query);
      }
      
      tags.forEach(tag => {
        queryParams.append("tags", tag);
      });
      
      const response = await brain.list_video_clips({
        query,
        tags
      });
      
      const data = await response.json();
      setAvailableClips(data.clips);
      
      if (data.clips.length === 0) {
        toast.info("No clips found matching your criteria");
      }
    } catch (error) {
      console.error("Error fetching clips:", error);
      toast.error("Failed to load video clips");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchClips(searchQuery, selectedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedTags([]);
    fetchClips();
  };

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handlePlayPreview = (clip: VideoClip) => {
    setPreviewClip(clip);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewClip(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-lg border border-gray-800">
      {selectedClip ? (
        <div className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Selected Clip</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRemoveClip}
                className="h-8 px-2 text-red-500 hover:text-red-400"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
            
            <div className="relative rounded-md overflow-hidden group">
              <img 
                src={selectedClip.thumbnail_url} 
                alt={selectedClip.title}
                className="w-full h-32 object-cover" 
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="sm" 
                  onClick={() => handlePlayPreview(selectedClip)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {formatDuration(selectedClip.duration)}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm">{selectedClip.title}</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedClip.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {selectedClip.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedClip.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Search for video clips"
                className="bg-gray-900/50"
              />
              <Button 
                onClick={handleSearch} 
                size="icon" 
                className="h-10 w-10"
              >
                <SearchIcon className="h-4 w-4" />
              </Button>
              {(searchQuery || selectedTags.length > 0) && (
                <Button 
                  onClick={handleClearSearch} 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {suggestedTags.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Suggested tags:</p>
                <div className="flex flex-wrap gap-1">
                  {suggestedTags.map(tag => (
                    <Badge 
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagSelect(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-800 pt-4">
              <h3 className="font-medium mb-3">Available clips</h3>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-24 h-16 rounded-md" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : availableClips.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>No video clips found</p>
                  <p className="text-sm mt-1">Try a different search or tag</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {availableClips.map(clip => (
                    <div 
                      key={clip.id}
                      className="flex gap-3 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => onSelectClip(clip)}
                    >
                      <div className="relative w-24 h-16 flex-shrink-0">
                        <img 
                          src={clip.thumbnail_url} 
                          alt={clip.title}
                          className="w-full h-full object-cover rounded-md" 
                        />
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                          {formatDuration(clip.duration)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">{clip.title}</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {clip.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {clip.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{clip.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="self-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(clip);
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Video Preview Dialog */}
      {showPreview && previewClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-900 p-4 rounded-lg w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{previewClip.title}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClosePreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              {/* In a real app, you would embed the video player here */}
              <div className="text-center">
                <p className="text-gray-400 mb-2">Video Preview</p>
                <p className="text-sm text-gray-500">
                  (In a real implementation, the video would play here)
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button 
                variant="ghost" 
                onClick={handleClosePreview}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  onSelectClip(previewClip);
                  handleClosePreview();
                }}
              >
                <Check className="h-4 w-4 mr-1" />
                Select This Clip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
