import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "app";
import brain from "brain";
import { GeneratedScript, VoiceOver } from "types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Share2, Loader2, CheckCircle2, Copy, Twitter, Facebook, Linkedin, Mail } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FinalVideo {
  id: string;
  title: string;
  description: string;
  duration: number;
  url: string;
  thumbnail_url: string;
  created_at: string;
  story_id: string;
  script_id: string;
  voice_over_id: string;
  status: string;
  resolution: string;
  file_size: number;
}

const FinalVideo: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const searchParams = new URLSearchParams(location.search);
  const storyId = searchParams.get("id");
  const scriptId = searchParams.get("script_id");
  const voiceOverId = searchParams.get("voice_over_id");

  const [finalVideo, setFinalVideo] = useState<FinalVideo | null>(null);
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [voiceOver, setVoiceOver] = useState<VoiceOver | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);

  // Fetch final video data
  useEffect(() => {
    if (!storyId || !scriptId || !voiceOverId || !user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call to get the final video
        // For now, we'll simulate it with mock data
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockFinalVideo: FinalVideo = {
          id: "video-" + Math.random().toString(36).substring(2, 10),
          title: "How AI is Revolutionizing Content Creation",
          description: "An in-depth look at how artificial intelligence is transforming the way we create and consume content in the digital age.",
          duration: 180, // 3 minutes
          url: "https://example.com/videos/final-video.mp4",
          thumbnail_url: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
          created_at: new Date().toISOString(),
          story_id: storyId,
          script_id: scriptId,
          voice_over_id: voiceOverId,
          status: "completed",
          resolution: "1080p",
          file_size: 45600000, // ~45.6 MB
        };
        
        setFinalVideo(mockFinalVideo);
        setVideoTitle(mockFinalVideo.title);
        setVideoDescription(mockFinalVideo.description);
        
        // Also fetch the script and voice-over for reference
        const scriptResponse = await brain.get_script({
          user_id: user.uid,
          storyId,
          scriptId,
        });
        const scriptData = await scriptResponse.json();
        setScript(scriptData);
        
        const voiceOverResponse = await brain.get_voice_over_metadata({
          voiceOverId: voiceOverId,
        });
        const voiceOverData = await voiceOverResponse.json();
        setVoiceOver(voiceOverData);
      } catch (error) {
        console.error("Error fetching final video ", error);
        toast.error("Failed to load video data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storyId, scriptId, voiceOverId, user]);

  const handleDownload = async () => {
    if (!finalVideo) return;
    
    try {
      setIsDownloading(true);
      toast.info("Preparing download...");
      
      // Simulate download preparation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would be an API call to get the download URL
      // For now, we'll simulate it
      const downloadUrl = finalVideo.url;
      
      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${finalVideo.title.replace(/\s+/g, '-').toLowerCase()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("Download started");
    } catch (error) {
      console.error("Error downloading video:", error);
      toast.error("Failed to download video");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = (platform: string) => {
    if (!finalVideo) return;
    
    // In a real app, this would generate sharing links for different platforms
    // For now, we'll just show a toast
    toast.success(`Shared to ${platform}`);
    setIsSharing(false);
  };

  const handleCopyLink = () => {
    if (!finalVideo) return;
    
    // In a real app, this would copy a shareable link to the clipboard
    navigator.clipboard.writeText(`https://yourdomain.com/shared-videos/${finalVideo.id}`)
      .then(() => {
        toast.success("Link copied to clipboard");
      })
      .catch((error) => {
        console.error("Error copying link:", error);
        toast.error("Failed to copy link");
      });
  };

  const handleSaveMetadata = async () => {
    if (!finalVideo) return;
    
    try {
      setIsSaving(true);
      
      // In a real app, this would be an API call to update the video metadata
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFinalVideo(prev => {
        if (!prev) return null;
        return {
          ...prev,
          title: videoTitle,
          description: videoDescription
        };
      });
      
      toast.success("Video details updated");
    } catch (error) {
      console.error("Error updating video meta", error);
      toast.error("Failed to update video details");
    } finally {
      setIsSaving(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(1) + " GB";
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleBackToVideoClips = () => {
    navigate(`/video-clips?id=${storyId}&script_id=${scriptId}&voice_over_id=${voiceOverId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
          <h2 className="text-2xl font-semibold">Loading your video...</h2>
        </div>
      </div>
    );
  }

  if (!finalVideo) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-2 text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <h2 className="text-xl font-semibold">Video Not Found</h2>
          </div>
          <p className="mb-6">The video you're looking for couldn't be found or hasn't been generated yet.</p>
          <Button onClick={handleBackToVideoClips}>Go Back to Video Clips</Button>
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
            <h1 className="text-3xl font-bold tracking-tight">Final Video</h1>
            <p className="text-gray-400 mt-2">Review, download, and share your completed video</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBackToVideoClips}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Video Clips
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column - Video player and details */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-800 rounded-t-lg overflow-hidden">
                  <video 
                    controls
                    className="w-full h-full"
                    poster={finalVideo.thumbnail_url}
                  >
                    <source src={finalVideo.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center py-4 px-6">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{formatDuration(finalVideo.duration)}</span>
                  <span>•</span>
                  <span>{finalVideo.resolution}</span>
                  <span>•</span>
                  <span>{formatFileSize(finalVideo.file_size)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Popover open={isSharing} onOpenChange={setIsSharing}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-gray-900 border-gray-800">
                      <div className="space-y-4">
                        <h4 className="font-medium">Share your video</h4>
                        <div className="flex justify-between">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-9 w-9 rounded-full"
                            onClick={() => handleShare('Twitter')}
                          >
                            <Twitter className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-9 w-9 rounded-full"
                            onClick={() => handleShare('Facebook')}
                          >
                            <Facebook className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-9 w-9 rounded-full"
                            onClick={() => handleShare('LinkedIn')}
                          >
                            <Linkedin className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-9 w-9 rounded-full"
                            onClick={() => handleShare('Email')}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input 
                            value="https://yourdomain.com/shared-videos/abc123" 
                            readOnly 
                            className="h-9 bg-gray-800 border-gray-700"
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-9 w-9"
                            onClick={handleCopyLink}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download Video
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Video Details</CardTitle>
                <CardDescription>Edit your video title and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={videoTitle} 
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea 
                    id="description" 
                    value={videoDescription} 
                    onChange={(e) => setVideoDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={handleSaveMetadata}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Details"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right column - Video info and related content */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Video Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-900/20 border border-green-900/30 rounded-lg flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <p className="text-sm text-green-300">Your video has been successfully generated and is ready to download or share.</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Created</h4>
                    <p>{new Date(finalVideo.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Duration</h4>
                    <p>{formatDuration(finalVideo.duration)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Resolution</h4>
                    <p>{finalVideo.resolution}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">File Size</h4>
                    <p>{formatFileSize(finalVideo.file_size)}</p>
                  </div>
                </div>
                
                <Separator className="my-4 bg-gray-800" />
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">What's Next?</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Download className="h-4 w-4 text-purple-400 mr-2 mt-0.5" />
                      <span>Download your video to your device</span>
                    </li>
                    <li className="flex items-start">
                      <Share2 className="h-4 w-4 text-purple-400 mr-2 mt-0.5" />
                      <span>Share your video on social media</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 mr-2 mt-0.5"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
                      <span>Create a new video from scratch</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Project Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Original Story</h4>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm line-clamp-2">{script?.title || "Story title"}</p>
                    <p className="text-xs text-gray-400 mt-1">ID: {storyId?.substring(0, 8)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Script</h4>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm line-clamp-2">{script?.title || "Script title"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {script?.sections?.length || 0} sections • 
                      ID: {scriptId?.substring(0, 8)}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">Voice-over</h4>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm">
                      {voiceOver?.voice_id ? `Voice: ${voiceOver.voice_id}` : "Voice-over"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {voiceOverId?.substring(0, 8)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalVideo;
