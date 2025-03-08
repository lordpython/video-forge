import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "app";
import brain from "brain";
import { GeneratedScript, VoiceOver } from "types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AudioWaveform } from "components/AudioWaveform";
import { ArrowLeft, ArrowRight, Film, Loader2, Play, Plus, Search, Upload, Video, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { VideoClipSelector } from "@/components/VideoClipSelector";

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
      
      // Create the segment clips data structure for the API
      const segmentClips = scriptSegments.map(segment => ({
        segment_id: segment.id,
        clip_id: segment.selected_clip?.id || "",
        start_time: segment.start_time,
        end_time: segment.end_time
      }));
      
      // Call the API to generate the video
      const response = await brain.generate_video({
        user_id: user?.uid || ""
      }, {
        script_id: scriptId || "",
        voice_over_id: voiceOverId || "",
        segment_clips: segmentClips
      });
      
      const data = await response.json();
      
      // Check if we need to poll for completion or if it's instantly available
      if (data.status === "processing") {
        toast.success("Video generation started. You'll be notified when it's ready.");
        // You could set up polling here to check the status periodically
      } else if (data.status === "completed") {
        setFinalVideoUrl(data.url);
        toast.success("Video generated successfully!");
      } else {
        toast.error(`Video generation status: ${data.status}`);
      }
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

          {/* Right column - Video clips library and selected segment */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>
                  {selectedSegmentId ? (
                    <span className="flex items-center gap-2">
                      <span>Segment: {scriptSegments.find(s => s.id === selectedSegmentId)?.section_type.replace('_', ' ').toUpperCase()}</span>
                      <Badge variant="outline" className="ml-2 bg-indigo-900/30 text-indigo-300 border-indigo-500">
                        Selected
                      </Badge>
                    </span>
                  ) : "Select a Script Segment"}
                </CardTitle>
                <CardDescription>
                  {selectedSegmentId 
                    ? `Choose a video clip for this segment or search for specific content`
                    : "Click on a script segment on the left to start assigning video clips"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSegmentId ? (
                  // Use our new VideoClipSelector component when a segment is selected
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-1">Segment Content:</h3>
                      <div className="bg-gray-800/70 rounded p-3 text-sm text-gray-300">
                        {scriptSegments.find(s => s.id === selectedSegmentId)?.content}
                      </div>
                    </div>

                    <VideoClipSelector
                      selectedClip={scriptSegments.find(s => s.id === selectedSegmentId)?.selected_clip}
                      segmentContent={scriptSegments.find(s => s.id === selectedSegmentId)?.content || ""}
                      onSelectClip={(clip) => handleSelectClip(clip)}
                      onRemoveClip={() => selectedSegmentId && handleRemoveClip(selectedSegmentId)}
                    />
                  </motion.div>
                ) : (
                  // Display instruction when no segment is selected
                  <div className="text-center py-16 px-4">
                    <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-6 max-w-md mx-auto">
                      <ArrowLeft className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">Select a Script Segment</h3>
                      <p className="text-gray-400 mb-4">
                        Choose a segment from the left panel to assign a video clip to it
                      </p>
                      <div className="text-sm text-gray-500">
                        <p>Tip: You need to assign a video clip to each segment before generating your final video</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Video generation and preview */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Video Generation</CardTitle>
                <CardDescription>
                  {scriptSegments.every(segment => segment.selected_clip) 
                    ? "All segments have clips assigned. Ready to generate your video!"
                    : `Assign clips to ${scriptSegments.filter(segment => !segment.selected_clip).length} more segments to generate your video`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {finalVideoUrl ? (
                  // Show video player when video is generated
                  <div>
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
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={handleContinueToFinalVideo}
                        className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                      >
                        Continue to Final Video
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Show generation progress or segment status
                  <div className="py-6">
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Segments with clips assigned</span>
                        <span className="text-sm font-medium">
                          {scriptSegments.filter(segment => segment.selected_clip).length}/{scriptSegments.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2.5">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${(scriptSegments.filter(segment => segment.selected_clip).length / scriptSegments.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {isGeneratingVideo ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-10 w-10 animate-spin text-purple-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Generating Your Video</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                          We're combining your script, voice-over, and selected clips to create your video. This may take a few minutes.
                        </p>
                      </div>
                    ) : (
                      <Button 
                        onClick={handleGenerateVideo}
                        disabled={scriptSegments.some(segment => !segment.selected_clip)}
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all"
                      >
                        <Film className="mr-2 h-5 w-5" />
                        Generate Final Video
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoClips;
