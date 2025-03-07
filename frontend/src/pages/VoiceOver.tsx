import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "app";
import brain from "brain";
import { GeneratedScript } from "types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioWaveform } from "components/AudioWaveform";
import { VoiceSelector } from "components/VoiceSelector";
import { VoiceSettings } from "components/VoiceSettings";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, ArrowRight, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  settings?: VoiceSettings;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface VoiceOver {
  id: string;
  script_id: string;
  story_id: string;
  voice_id: string;
  settings?: VoiceSettings;
  speed: number;
  status: string;
  audio_url?: string;
  created_at: string;
  completed_at?: string;
}

const VoiceOver: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const searchParams = new URLSearchParams(location.search);
  const storyId = searchParams.get("id");
  const scriptId = searchParams.get("script_id");

  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [previewText, setPreviewText] = useState("");
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [generatedVoiceOvers, setGeneratedVoiceOvers] = useState<VoiceOver[]>([]);
  const [activeVoiceOver, setActiveVoiceOver] = useState<VoiceOver | null>(null);
  
  // Voice settings
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [style, setStyle] = useState(0.0);
  const [useSpeakerBoost, setUseSpeakerBoost] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  
  // Loading states
  const [loadingScript, setLoadingScript] = useState(true);
  const [loadingVoiceOvers, setLoadingVoiceOvers] = useState(true);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [generatingVoiceOver, setGeneratingVoiceOver] = useState(false);

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
        
        // Set initial preview text from first section if available
        if (scriptData.sections && scriptData.sections.length > 0) {
          // Use the first 150 characters of first section content for preview
          const firstSection = scriptData.sections[0].content;
          setPreviewText(firstSection.slice(0, 150) + (firstSection.length > 150 ? '...' : ''));
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

  // Fetch existing voice overs
  useEffect(() => {
    if (!scriptId || !user) return;

    const fetchVoiceOvers = async () => {
      try {
        setLoadingVoiceOvers(true);
        const response = await brain.list_voice_overs({
          script_id: scriptId,
        });
        const voiceOvers = await response.json();
        setGeneratedVoiceOvers(voiceOvers);
        
        // Set active voice over if available
        if (voiceOvers.length > 0) {
          setActiveVoiceOver(voiceOvers[0]);
        }
      } catch (error) {
        console.error("Error fetching voice overs:", error);
      } finally {
        setLoadingVoiceOvers(false);
      }
    };

    fetchVoiceOvers();
  }, [scriptId, user]);

  // Apply voice settings from selected voice
  useEffect(() => {
    if (selectedVoice?.settings) {
      setStability(selectedVoice.settings.stability);
      setSimilarityBoost(selectedVoice.settings.similarity_boost);
      setStyle(selectedVoice.settings.style);
      setUseSpeakerBoost(selectedVoice.settings.use_speaker_boost);
    }
  }, [selectedVoice]);

  const handleVoiceSelect = (voice: Voice) => {
    setSelectedVoice(voice);
    setPreviewAudio(null); // Clear preview when voice changes
  };

  const handleGeneratePreview = async () => {
    if (!selectedVoice || !previewText) {
      toast.error("Please select a voice and enter text to preview");
      return;
    }

    try {
      setGeneratingPreview(true);
      const response = await brain.create_voice_over_preview({
        text: previewText,
        voice_id: selectedVoice.voice_id,
        settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: useSpeakerBoost
        },
        speed
      });
      const data = await response.json();
      setPreviewAudio(data.audio_data);
      toast.success("Preview generated successfully");
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("Failed to generate preview");
    } finally {
      setGeneratingPreview(false);
    }
  };

  const handleGenerateVoiceOver = async () => {
    if (!selectedVoice || !scriptId) {
      toast.error("Please select a voice first");
      return;
    }

    try {
      setGeneratingVoiceOver(true);
      toast.info("Generating voice-over. This may take a minute...");
      
      const response = await brain.generate_voice_over({
        script_id: scriptId,
        voice_id: selectedVoice.voice_id,
        settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: useSpeakerBoost
        },
        speed
      });
      
      const voiceOver = await response.json();
      setGeneratedVoiceOvers(prev => [voiceOver, ...prev]);
      setActiveVoiceOver(voiceOver);
      toast.success("Voice-over generated successfully");
    } catch (error) {
      console.error("Error generating voice-over:", error);
      toast.error("Failed to generate voice-over");
    } finally {
      setGeneratingVoiceOver(false);
    }
  };

  const handleDownloadVoiceOver = async () => {
    if (!activeVoiceOver) return;

    try {
      // Fetch the audio data
      const response = await fetch(`/api/voice-over/audio/${activeVoiceOver.id}`);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-over-${activeVoiceOver.id.slice(0, 8)}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading voice-over:", error);
      toast.error("Failed to download voice-over");
    }
  };

  const handleContinueToNextStage = () => {
    if (!storyId || !scriptId || !activeVoiceOver) {
      toast.error("Please generate a voice-over first");
      return;
    }

    // Navigate to the next page with the story, script, and voice-over IDs
    navigate(`/video-clips?id=${storyId}&script_id=${scriptId}&voice_over_id=${activeVoiceOver.id}`);
  };

  // Format script content for display
  const getScriptContent = () => {
    if (!script) return "";
    
    return script.sections
      .map(section => section.content)
      .join("\n\n");
  };

  if (loadingScript) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
          <h2 className="text-2xl font-semibold">Loading script data...</h2>
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-2 text-red-500 mb-4">
            <AlertCircle className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Script Not Found</h2>
          </div>
          <p className="mb-6">The script you're looking for couldn't be found or loaded.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
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
            <h1 className="text-3xl font-bold tracking-tight">{script.title}</h1>
            <p className="text-gray-400 mt-2">Create a professional voice-over for your video</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back to Script
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column - Voice selector and settings */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Voice Selection</CardTitle>
                <CardDescription>Choose a voice that matches your video style</CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceSelector 
                  onSelect={handleVoiceSelect} 
                  selectedVoiceId={selectedVoice?.voice_id} 
                  className="mb-6"
                />

                {selectedVoice && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Voice Preview</h3>
                      <div className="flex gap-4 mb-4">
                        <Textarea 
                          value={previewText}
                          onChange={(e) => setPreviewText(e.target.value)}
                          placeholder="Enter text to preview the voice..."
                          className="h-24 bg-gray-800 border-gray-700 text-gray-200"
                        />
                      </div>
                      <Button 
                        onClick={handleGeneratePreview}
                        disabled={!previewText || generatingPreview}
                        className="w-full"
                      >
                        {generatingPreview ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Preview...
                          </>
                        ) : (
                          "Generate Preview"
                        )}
                      </Button>
                    </div>

                    {previewAudio && (
                      <div className="mt-4">
                        <AudioWaveform 
                          audioData={previewAudio} 
                          height={80}
                          waveColor="#6b21a8"
                          progressColor="#a855f7"
                        />
                      </div>
                    )}
                    
                    <Separator className="my-6 bg-gray-800" />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Voice Settings</h3>
                      <VoiceSettings 
                        stability={stability}
                        similarityBoost={similarityBoost}
                        style={style}
                        useSpeakerBoost={useSpeakerBoost}
                        speed={speed}
                        onStabilityChange={setStability}
                        onSimilarityBoostChange={setSimilarityBoost}
                        onStyleChange={setStyle}
                        onSpeakerBoostChange={setUseSpeakerBoost}
                        onSpeedChange={setSpeed}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end border-t border-gray-800 pt-6">
                <Button 
                  onClick={handleGenerateVoiceOver} 
                  disabled={!selectedVoice || generatingVoiceOver}
                  size="lg"
                >
                  {generatingVoiceOver ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Voice-over...
                    </>
                  ) : (
                    "Generate Full Voice-over"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right column - Script and generated voice-overs */}
          <div className="lg:col-span-7 space-y-6">
            <Tabs defaultValue="script" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-900 text-gray-400">
                <TabsTrigger value="script">Script</TabsTrigger>
                <TabsTrigger value="voice-overs">
                  Voice-overs {generatedVoiceOvers.length > 0 && `(${generatedVoiceOvers.length})`}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="script" className="mt-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Script Content</CardTitle>
                    <CardDescription>This script will be used for the voice-over</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-800 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm text-gray-300 max-h-[600px] overflow-y-auto">
                      {getScriptContent()}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="voice-overs" className="mt-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Generated Voice-overs</CardTitle>
                    <CardDescription>
                      {loadingVoiceOvers ? "Loading..." : 
                       generatedVoiceOvers.length > 0 ? "Select a voice-over to preview" : 
                       "No voice-overs generated yet"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadingVoiceOvers ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                      </div>
                    ) : generatedVoiceOvers.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <p>Generate your first voice-over to see it here</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Active voice-over preview */}
                        {activeVoiceOver && (
                          <div className="bg-gray-800 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <h3 className="text-lg font-semibold flex items-center">
                                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                                  Voice-over #{activeVoiceOver.id.slice(0, 8)}
                                </h3>
                                <p className="text-sm text-gray-400">
                                  Created {new Date(activeVoiceOver.created_at).toLocaleString()}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadVoiceOver}
                                className="flex items-center"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                            
                            {/* Audio waveform */}
                            <AudioWaveform 
                              audioUrl={`/api/voice-over/audio/${activeVoiceOver.id}`}
                              height={80}
                              waveColor="#6b21a8"
                              progressColor="#a855f7"
                            />
                          </div>
                        )}
                        
                        {/* List of other voice-overs */}
                        {generatedVoiceOvers.length > 1 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Other voice-overs</h4>
                            <div className="space-y-2">
                              {generatedVoiceOvers
                                .filter(vo => vo.id !== activeVoiceOver?.id)
                                .map(voiceOver => (
                                  <div 
                                    key={voiceOver.id}
                                    onClick={() => setActiveVoiceOver(voiceOver)}
                                    className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                                  >
                                    <div>
                                      <p className="font-medium">Voice-over #{voiceOver.id.slice(0, 8)}</p>
                                      <p className="text-xs text-gray-400">
                                        Created {new Date(voiceOver.created_at).toLocaleString()}
                                      </p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <ArrowRight className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  {activeVoiceOver && (
                    <CardFooter className="flex justify-end border-t border-gray-800 pt-6">
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                        onClick={handleContinueToNextStage}
                      >
                        Continue to Video Clips
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceOver;
