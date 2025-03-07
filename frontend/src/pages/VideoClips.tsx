import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "app";
import brain from "brain";
import { GeneratedScript, VoiceOver } from "types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AudioWaveform } from "components/AudioWaveform";
import { ArrowLeft, ArrowRight, Film, Loader2, Play, Plus, Search, Upload, Video, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface VideoClip {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  tags: string[];
  source: string;
  url: string;
}

interface ScriptSegment {
  id: string;
  section_type: string;
  content: string;
  start_time: number;
  end_time: number;
  selected_clip?: VideoClip;
}

const VideoClips: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const searchParams = new URLSearchParams(location.search);
  const storyId = searchParams.get("id");
  const scriptId = searchParams.get("script_id");
  const voiceOverId = searchParams.get("voice_over_id");

  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [voiceOver, setVoiceOver] = useState<VoiceOver | null>(null);
  const [scriptSegments, setScriptSegments] = useState<ScriptSegment[]>([]);
  const [availableClips, setAvailableClips] = useState<VideoClip[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  
  // Loading states
  const [loadingScript, setLoadingScript] = useState(true);
  const [loadingVoiceOver, setLoadingVoiceOver] = useState(true);
  const [loadingClips, setLoadingClips] = useState(true);
  const [searchingClips, setSearchingClips] = useState(false);

  // Fetch script data
  useEffect(() => {
    if (!storyId || !scriptId || !user) return;

    const fetchScript = async () => {
      try {
        setLoadingScript(true);
        const response = await brain.get_script({
          user_id: user.uid,
          storyId,
          scriptId,
        });
        const scriptData = await response.json();
        setScript(scriptData);
        
        // Initialize script segments from script sections
        if (scriptData.sections) {
          const segments = scriptData.sections.map((section, index) => ({
            id: `segment-${index}`,
            section_type: section.type,
            content: section.content,
            start_time: 0, // Will be calculated after voice-over is loaded
            end_time: 0,   // Will be calculated after voice-over is loaded
            selected_clip: undefined
          }));
          setScriptSegments(segments);
        }
      } catch (error) {
        console.error("Error fetching script:", error);
        toast.error("Failed to load script data");
      } finally {
        setLoadingScript(false);
      }
    };

    fetchScript();
  }, [storyId, scriptId, user]);

  // Fetch voice-over data
  useEffect(() => {
    if (!voiceOverId || !user) return;

    const fetchVoiceOver = async () => {
      try {
        setLoadingVoiceOver(true);
        const response = await brain.get_voice_over_metadata({
          voiceOverId: voiceOverId,
        });
        const voiceOverData = await response.json();
        setVoiceOver(voiceOverData);
        
        // Once we have the voice-over, we can calculate segment timings
        // This would typically come from the API, but we're simulating it here
        if (scriptSegments.length > 0) {
          // Simulate timing data based on content length
          // In a real app, this would come from the backend
          const totalDuration = voiceOverData.duration || 120; // fallback to 2 minutes
          let currentTime = 0;
          
          const updatedSegments = scriptSegments.map(segment => {
            // Estimate duration based on content length (very rough approximation)
            const contentLength = segment.content.length;
            const segmentDuration = (contentLength / 500) * 30; // ~30 seconds per 500 chars
            const scaledDuration = (segmentDuration / scriptSegments.reduce((sum, seg) => sum + seg.content.length, 0)) * totalDuration;
            
            const start = currentTime;
            currentTime += scaledDuration;
            
            return {
              ...segment,
              start_time: start,
              end_time: currentTime
            };
          });
          
          setScriptSegments(updatedSegments);
        }
      } catch (error) {
        console.error("Error fetching voice-over:", error);
        toast.error("Failed to load voice-over data");
      } finally {
        setLoadingVoiceOver(false);
      }
    };

    fetchVoiceOver();
  }, [voiceOverId, user, scriptSegments.length]);

  // Fetch available video clips
  useEffect(() => {
    const fetchAvailableClips = async () => {
      try {
        setLoadingClips(true);
        
        // This would be an API call in a real application
        // For now, we'll use mock data
        const mockClips: VideoClip[] = [
          {
            id: "clip1",
            title: "Business Meeting",
            thumbnail_url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            duration: 15,
            tags: ["business", "meeting", "office", "professional"],
            source: "stock",
            url: "https://example.com/videos/business-meeting.mp4"
          },
          {
            id: "clip2",
            title: "Technology Interface",
            thumbnail_url: "https://images.unsplash.com/photo-1581090700227-8e3b68af7d70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            duration: 12,
            tags: ["technology", "interface", "digital", "futuristic"],
            source: "stock",
            url: "https://example.com/videos/tech-interface.mp4"
          },
          {
            id: "clip3",
            title: "Medical Research",
            thumbnail_url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            duration: 18,
            tags: ["medical", "research", "science", "laboratory"],
            source: "stock",
            url: "https://example.com/videos/medical-research.mp4"
          },
          {
            id: "clip4",
            title: "Nature Landscape",
            thumbnail_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            duration: 20,
            tags: ["nature", "landscape", "outdoors", "scenic"],
            source: "stock",
            url: "https://example.com/videos/nature-landscape.mp4"
          },
          {
            id: "clip5",
            title: "Urban City",
            thumbnail_url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            duration: 15,
            tags: ["urban", "city", "buildings", "architecture"],
            source: "stock",
            url: "https://example.com/videos/urban-city.mp4"
          },
          {
            id: "clip6",
            title: "Digital Marketing",
            thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
            duration: 14,
            tags: ["marketing", "digital", "business", "analytics"],
            source: "stock",
            url: "https://example.com/videos/digital-marketing.mp4"
          }
        ];
        
        setAvailableClips(mockClips);
      } catch (error) {
        console.error("Error fetching available clips:", error);
        toast.error("Failed to load video clips");
      } finally {
        setLoadingClips(false);
      }
    };

    fetchAvailableClips();
  }, []);

  const handleSearchClips = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearchingClips(true);
      
      // In a real app, this would be an API call with the search query
      // For now, we'll filter the mock data
      const filteredClips = availableClips.filter(clip => 
        clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clip.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAvailableClips(filteredClips);
      
      if (filteredClips.length === 0) {
        toast.info("No clips found matching your search");
      }
    } catch (error) {
      console.error("Error searching clips:", error);
      toast.error("Failed to search for clips");
    } finally {
      setSearchingClips(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchQuery("");
    
    // Reset to all available clips
    try {
      setSearchingClips(true);
      
      // In a real app, this would be an API call to get all clips
      // For now, we'll use the mock data again
      const mockClips: VideoClip[] = [
        {
          id: "clip1",
          title: "Business Meeting",
          thumbnail_url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
          duration: 15,
          tags: ["business", "meeting", "office", "professional"],
          source: "stock",
          url: "https://example.com/videos/business-meeting.mp4"
        },
        {
          id: "clip2",
          title: "Technology Interface",
          thumbnail_url: "https://images.unsplash.com/photo-1581090700227-8e3b68af7d70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
          duration: 12,
          tags: ["technology", "interface", "digital", "futuristic"],
          source: "stock",
          url: "https://example.com/videos/tech-interface.mp4"
        },
        {
          id: "clip3",
          title: "Medical Research",
          thumbnail_url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
          duration: 18,
          tags: ["medical", "research", "science", "laboratory"],
          source: "stock",
          url: "https://example.com/videos/medical-research.mp4"
        },
        {
          id: "clip4",
          title: "Nature Landscape",
          thumbnail_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
          duration: 20,
          tags: ["nature", "landscape", "outdoors", "scenic"],
          source: "stock",
          url: "https://example.com/videos/nature-landscape.mp4"
        },
        {
          id: "clip5",
          title: "Urban City",
          thumbnail_url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
          duration: 15,
          tags: ["urban", "city", "buildings", "architecture"],
          source: "stock",
          url: "https://example.com/videos/urban-city.mp4"
        },
        {
          id: "clip6",
          title: "Digital Marketing",
          thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
          duration: 14,
          tags: ["marketing", "digital", "business", "analytics"],
          source: "stock",
          url: "https://example.com/videos/digital-marketing.mp4"
        }
      ];
      
      setAvailableClips(mockClips);
    } catch (error) {
      console.error("Error resetting clips:", error);
    } finally {
      setSearchingClips(false);
    }
  };

  const handleSelectSegment = (segmentId: string) => {
    setSelectedSegmentId(segmentId);
  };

  const handleSelectClip = (clip: VideoClip) => {
    if (!selectedSegmentId) return;
    
    setScriptSegments(prev => 
      prev.map(segment => 
        segment.id === selectedSegmentId 
          ? { ...segment, selected_clip: clip } 
          : segment
      )
    );
    
    toast.success(`Clip "${clip.title}" assigned to segment`);
  };

  const handleRemoveClip = (segmentId: string) => {
    setScriptSegments(prev => 
      prev.map(segment => 
        segment.id === segmentId 
          ? { ...segment, selected_clip: undefined } 
          : segment
      )
    );
  };

  const handleGenerateVideo = async () => {
    // Check if all segments have clips assigned
    const unassignedSegments = scriptSegments.filter(segment => !segment.selected_clip);
    
    if (unassignedSegments.length > 0) {
      toast.error(`Please assign clips to all ${unassignedSegments.length} remaining segments`);
      return;
    }
    
    try {
      setIsGeneratingVideo(true);
      toast.info("Generating your video. This may take a few minutes...");
      
      // In a real app, this would be an API call to generate the video
      // For now, we'll simulate it with a timeout
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Simulate a successful video generation
      setFinalVideoUrl("https://example.com/generated-videos/your-video.mp4");
      
      toast.success("Video generated successfully!");
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to generate video");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleBackToVoiceOver = () => {
    navigate(`/voice-over?id=${storyId}&script_id=${scriptId}`);
  };

  const handleContinueToFinalVideo = () => {
    if (!finalVideoUrl) {
      toast.error("Please generate the video first");
      return;
    }
    
    navigate(`/final-video?id=${storyId}&script_id=${scriptId}&voice_over_id=${voiceOverId}`);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loadingScript || loadingVoiceOver) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
          <h2 className="text-2xl font-semibold">Loading data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Video Clips Selection</h1>
            <p className="text-gray-400 mt-2">Choose video clips to match your script and voice-over</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBackToVoiceOver}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Voice-over
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column - Script segments and voice-over */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Voice-over Timeline</CardTitle>
                <CardDescription>Assign video clips to each segment of your script</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {voiceOver && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Full Voice-over</h3>
                    <AudioWaveform 
                      audioUrl={`/api/voice-over/audio/${voiceOver.id}`}
                      height={60}
                      waveColor="#6b21a8"
                      progressColor="#a855f7"
                    />
                  </div>
                )}
                
                <Separator className="my-6 bg-gray-800" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Script Segments</h3>
                  <p className="text-sm text-gray-400">
                    Click on a segment to assign a video clip to it
                  </p>
                  
                  {scriptSegments.map((segment, index) => (
                    <div 
                      key={segment.id}
                      onClick={() => handleSelectSegment(segment.id)}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        selectedSegmentId === segment.id 
                          ? 'bg-indigo-900/30 border-indigo-500' 
                          : segment.selected_clip 
                            ? 'bg-green-900/20 border-green-700' 
                            : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">
                            {index + 1}. {segment.section_type.replace('_', ' ').toUpperCase()}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {formatTime(segment.start_time)} - {formatTime(segment.end_time)} 
                            ({Math.round(segment.end_time - segment.start_time)}s)
                          </p>
                        </div>
                        {segment.selected_clip && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveClip(segment.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                        {segment.content.substring(0, 100)}...
                      </p>
                      
                      {segment.selected_clip ? (
                        <div className="flex items-center gap-2 bg-gray-800 rounded p-2">
                          <img 
                            src={segment.selected_clip.thumbnail_url} 
                            alt={segment.selected_clip.title}
                            className="h-10 w-16 object-cover rounded"
                          />
                          <div>
                            <p className="text-sm font-medium">{segment.selected_clip.title}</p>
                            <p className="text-xs text-gray-400">{segment.selected_clip.duration}s</p>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-dashed border-gray-600 text-gray-400"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Assign Video Clip
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-800 pt-6">
                <Button 
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo || scriptSegments.some(segment => !segment.selected_clip)}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Film className="mr-2 h-4 w-4" />
                      Generate Final Video
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right column - Video clips library */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Video Clips Library</CardTitle>
                <CardDescription>
                  {selectedSegmentId 
                    ? `Select a clip for ${scriptSegments.find(s => s.id === selectedSegmentId)?.section_type.replace('_', ' ').toUpperCase()}`
                    : "Click on a script segment first, then select a clip for it"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Search for clips..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                    />
                    {searchQuery && (
                      <button
                        className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        onClick={handleClearSearch}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Button 
                    onClick={handleSearchClips}
                    disabled={searchingClips || !searchQuery.trim()}
                  >
                    {searchingClips ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                
                {loadingClips ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  </div>
                ) : availableClips.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Video className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                    <p className="text-lg font-medium mb-2">No clips found</p>
                    <p>Try a different search term or upload your own clips</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {availableClips.map((clip) => (
                      <div 
                        key={clip.id}
                        onClick={() => selectedSegmentId && handleSelectClip(clip)}
                        className={`rounded-lg overflow-hidden border border-gray-800 transition-all ${
                          selectedSegmentId 
                            ? 'cursor-pointer hover:border-indigo-500 hover:scale-105 transform transition-transform' 
                            : 'opacity-70 cursor-not-allowed'
                        }`}
                      >
                        <div className="aspect-video relative">
                          <img 
                            src={clip.thumbnail_url} 
                            alt={clip.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {clip.duration}s
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                            <Play className="h-10 w-10 text-white" />
                          </div>
                        </div>
                        <div className="p-2">
                          <h3 className="font-medium text-sm">{clip.title}</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {clip.tags.slice(0, 2).map((tag, i) => (
                              <span 
                                key={i} 
                                className="text-xs bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {clip.tags.length > 2 && (
                              <span className="text-xs text-gray-400">+{clip.tags.length - 2}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Video preview */}
            {finalVideoUrl && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Video Preview</CardTitle>
                  <CardDescription>Preview your generated video</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                    <video 
                      controls
                      className="w-full h-full"
                      poster="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                    >
                      <source src={finalVideoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-gray-800 pt-6 flex justify-end">
                  <Button 
                    onClick={handleContinueToFinalVideo}
                    className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                  >
                    Continue to Final Video
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoClips;
