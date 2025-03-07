import { useUserGuardContext } from "app";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Loader2, Play, Check, FileText, AlertCircle, RefreshCw, CheckCircle2, MoveRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useTransition } from "react";
import brain from "brain";
import { StoryResponse, GeneratedScript, ScriptSection as ScriptSectionType, ScriptRequest, ScriptGenerationResponse } from "types";
import { Button } from "@/components/ui/button";
import { ScriptSection } from "components/ScriptSection";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export default function ScriptGeneration() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const storyId = searchParams.get('id');
  const [story, setStory] = useState<StoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatedScripts, setGeneratedScripts] = useState<GeneratedScript[]>([]);
  const [scriptGenerations, setScriptGenerations] = useState<ScriptGenerationResponse[]>([]);
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [scriptStyle, setScriptStyle] = useState<string>("professional");
  const [includeBRoll, setIncludeBRoll] = useState<boolean>(true);
  const [maxDuration, setMaxDuration] = useState<number>(5);

  const fetchStory = useCallback(async () => {
    if (!storyId || !user) return;
    
    try {
      const response = await brain.get_story(
        { storyId: storyId, user_id: user.uid }
      );
      const data = await response.json();
      setStory(data);
    } catch (error) {
      console.error("Error fetching story:", error);
      toast.error("Failed to load story details");
    }
  }, [storyId, user]);

  const fetchScriptGenerations = useCallback(async () => {
    if (!storyId || !user) return;
    
    try {
      const response = await brain.list_script_generations(
        { storyId: storyId, user_id: user.uid }
      );
      const data = await response.json();
      setScriptGenerations(data.generations);
      
      // Check if there's an active generation
      const pendingGeneration = data.generations.find(g => g.status === "pending" || g.status === "in-progress");
      if (pendingGeneration) {
        setGeneratingScript(true);
      } else {
        setGeneratingScript(false);
      }
    } catch (error) {
      console.error("Error fetching script generations:", error);
    }
  }, [storyId, user]);

  const fetchGeneratedScripts = useCallback(async () => {
    if (!storyId || !user) return;
    
    try {
      const response = await brain.list_generated_scripts(
        { storyId: storyId, user_id: user.uid }
      );
      const data = await response.json();
      setGeneratedScripts(data.scripts);
      
      // Set active script to the most recent one if there's no active script yet
      if (data.scripts.length > 0 && !activeScriptId) {
        // Sort by most recent first
        const sortedScripts = [...data.scripts].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setActiveScriptId(sortedScripts[0].id);
      }
    } catch (error) {
      console.error("Error fetching generated scripts:", error);
    }
  }, [storyId, user, activeScriptId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStory(), fetchScriptGenerations(), fetchGeneratedScripts()]);
      setLoading(false);
    };
    
    loadData();
    
    // Set up polling for active generations
    const intervalId = setInterval(() => {
      const hasActiveGeneration = scriptGenerations.some(g => 
        g.status === "pending" || g.status === "in-progress"
      );
      
      if (hasActiveGeneration) {
        fetchScriptGenerations();
        fetchGeneratedScripts();
      }
    }, 5000); // Poll every 5 seconds if there's an active generation
    
    return () => clearInterval(intervalId);
  }, [fetchStory, fetchScriptGenerations, fetchGeneratedScripts, scriptGenerations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 opacity-80"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618609255910-1950ba7de780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-4" />
          <p className="text-xl">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 opacity-80"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618609255910-1950ba7de780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">Story Not Found</h1>
          <p className="text-gray-400 mb-8">The story you're looking for doesn't exist or you don't have permission to view it.</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const generateNewScript = async () => {
    if (!storyId || !user) return;
    
    try {
      setGeneratingScript(true);
      
      const request: ScriptRequest = {
        story_id: storyId,
        script_style: scriptStyle,
        include_b_roll: includeBRoll,
        max_duration_minutes: maxDuration
      };
      
      const response = await brain.generate_script({ user_id: user.uid }, request);
      const data = await response.json();
      
      toast.success("Script generation started");
      
      // Refresh generations list
      fetchScriptGenerations();
    } catch (error) {
      console.error("Error generating script:", error);
      toast.error("Failed to start script generation");
      setGeneratingScript(false);
    }
  };

  const handleEditSection = (index: number) => {
    setEditingSectionIndex(index);
  };

  const handleSaveSection = async (index: number, updatedSection: ScriptSectionType) => {
    if (!activeScriptId || !storyId || !user) return;
    
    const activeScript = generatedScripts.find(script => script.id === activeScriptId);
    if (!activeScript) return;
    
    // Update the section
    const updatedSections = [...activeScript.sections];
    updatedSections[index] = updatedSection;
    
    try {
      const response = await brain.update_script(
        { 
          storyId: storyId,
          scriptId: activeScriptId,
          user_id: user.uid
        },
        { 
          sections: updatedSections 
        }
      );
      
      const updatedScript = await response.json();
      
      // Update the local state
      setGeneratedScripts(prev => 
        prev.map(script => 
          script.id === activeScriptId ? updatedScript : script
        )
      );
      
      setEditingSectionIndex(null);
      toast.success("Script section updated");
    } catch (error) {
      console.error("Error updating script section:", error);
      toast.error("Failed to update script section");
    }
  };

  const handleCancelEditSection = () => {
    setEditingSectionIndex(null);
  };

  const handleApproveScript = async () => {
    if (!activeScriptId || !storyId || !user) return;
    
    try {
      const response = await brain.update_script(
        { 
          storyId: storyId,
          scriptId: activeScriptId,
          user_id: user.uid
        },
        { 
          approved: true 
        }
      );
      
      const updatedScript = await response.json();
      
      // Update the local state
      setGeneratedScripts(prev => 
        prev.map(script => 
          script.id === activeScriptId ? updatedScript : script
        )
      );
      
      toast.success("Script approved! Ready for the next stage.");
    } catch (error) {
      console.error("Error approving script:", error);
      toast.error("Failed to approve script");
    }
  };

  // Add useTransition hook for handling suspense during navigation
  const [isPending, startTransition] = useTransition();
  
  const handleProceedToNextStage = () => {
    // Navigate to the next stage in the workflow with the approved script
    if (activeScriptId) {
      // Wrap navigation in startTransition to avoid suspension errors
      startTransition(() => {
        navigate(`/voice-over?id=${storyId}&script_id=${activeScriptId}`);
      });
    }
  };

  const getActiveScript = () => {
    if (!activeScriptId) return null;
    return generatedScripts.find(script => script.id === activeScriptId) || null;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618609255910-1950ba7de780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="mb-8 flex items-center justify-between">
          <button 
            onClick={() => navigate(`/story-details?id=${storyId}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Story Details
          </button>
          
          {/* Only show next stage button if we have an approved script */}
          {getActiveScript()?.approved && (
              <Button 
                onClick={handleProceedToNextStage}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Navigating...
                  </>
                ) : (
                  <>
                    Proceed to Voice-over
                    <MoveRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
          )}
        </nav>

        {/* Page content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Script Generation</h1>
          <p className="text-gray-400 mb-6">Turn your story into a professional video script with AI</p>
          
          {/* Story Summary Card */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">{story.topic}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/60 text-indigo-200">
                    {story.genre}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/60 text-purple-200">
                    {story.tone}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/60 text-blue-200">
                    {story.target_audience}
                  </span>
                </div>
              </div>

              {generatedScripts.length === 0 && !generatingScript && (
                <div className="flex-shrink-0">
                  <Button 
                    onClick={() => generateNewScript()}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={generatingScript}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Generate Script
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Script Generation Options */}
          {generatedScripts.length === 0 && !generatingScript && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium mb-4">Script Generation Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Script Style</label>
                  <Select 
                    value={scriptStyle} 
                    onValueChange={setScriptStyle}
                  >
                    <SelectTrigger className="bg-gray-950/50 border-gray-700">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="dramatic">Dramatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Target Duration</label>
                  <Select 
                    value={maxDuration.toString()} 
                    onValueChange={(value) => setMaxDuration(parseInt(value))}
                  >
                    <SelectTrigger className="bg-gray-950/50 border-gray-700">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="3">3 minutes</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-400">Include B-Roll Suggestions</label>
                  <div className="flex-1"></div>
                  <button 
                    className={`w-10 h-6 rounded-full transition-colors ${includeBRoll ? 'bg-indigo-600' : 'bg-gray-700'}`}
                    onClick={() => setIncludeBRoll(!includeBRoll)}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${includeBRoll ? 'translate-x-5' : 'translate-x-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Generation in Progress */}
          {generatingScript && scriptGenerations.some(g => g.status === "pending" || g.status === "in-progress") && (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden p-8 mb-8">
              <div className="max-w-3xl mx-auto text-center">
                <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-indigo-900/30 flex items-center justify-center">
                  <RefreshCw className="h-10 w-10 text-indigo-400 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Generating Your Script</h2>
                <p className="text-gray-300 mb-6">
                  Our AI is crafting a professional script for your video. This may take a minute or two. Please wait...
                </p>
                <div className="w-full max-w-md mx-auto mb-6">
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      animate={{ width: ["0%", "100%"] }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear"
                      }}
                    />
                  </div>
                </div>
                
                {scriptGenerations.length > 0 && (
                  <div className="text-gray-400 text-sm italic">
                    {scriptGenerations[0].message || "Processing your story into a compelling script..."}  
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Script Generation Failed */}
          {scriptGenerations.some(g => g.status === "failed") && generatedScripts.length === 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-red-900/50 overflow-hidden p-8 mb-8">
              <div className="max-w-3xl mx-auto text-center">
                <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Script Generation Failed</h2>
                <p className="text-gray-300 mb-6">
                  We encountered an error while generating your script. Please try again.
                </p>
                <div className="mb-6">
                  {scriptGenerations.find(g => g.status === "failed")?.message && (
                    <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/50 p-4 rounded-md inline-block max-w-md">
                      {scriptGenerations.find(g => g.status === "failed")?.message}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={() => generateNewScript()}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {/* Generated Scripts */}
          {generatedScripts.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Generated Script</h3>
                  
                  <div className="flex items-center space-x-4">
                    {!getActiveScript()?.approved && (
                      <Button 
                        onClick={handleApproveScript}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!activeScriptId}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve Script
                      </Button>
                    )}
                    
                    {generatedScripts.length > 0 && !generatingScript && (
                      <Button 
                        onClick={() => generateNewScript()}
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    )}
                  </div>
                </div>
                
                {generatedScripts.length > 1 && (
                  <div className="mb-6">
                    <Tabs 
                      defaultValue={activeScriptId || generatedScripts[0].id}
                      onValueChange={setActiveScriptId}
                    >
                      <TabsList className="bg-gray-800">
                        {generatedScripts.map((script, index) => (
                          <TabsTrigger 
                            key={script.id} 
                            value={script.id}
                            className="data-[state=active]:bg-indigo-600"
                          >
                            {script.approved && (
                              <CheckCircle2 className="mr-1 h-3 w-3 text-green-400" />
                            )}
                            Version {index + 1}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                )}
                
                {activeScriptId && getActiveScript() && (
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-semibold text-2xl mb-1">{getActiveScript()?.title}</h3>
                        <div className="text-gray-400 text-sm">
                          <span>Generated {format(new Date(getActiveScript()?.created_at || ''), 'MMM d, yyyy')}</span>
                          {getActiveScript()?.metadata?.word_count && (
                            <span> • {getActiveScript()?.metadata?.word_count} words</span>
                          )}
                          {getActiveScript()?.approved && (
                            <span className="text-green-400 ml-2 flex items-center">
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="mb-6 bg-gray-800" />
                    
                    {/* Script sections */}
                    {getActiveScript()?.sections.map((section, index) => (
                      <ScriptSection 
                        key={`${section.type}-${index}`}
                        section={section}
                        index={index}
                        isEditing={editingSectionIndex === index}
                        onEdit={handleEditSection}
                        onSave={handleSaveSection}
                        onCancel={handleCancelEditSection}
                      />
                    ))}
                    
                    {getActiveScript()?.approved ? (
                      <div className="mt-8 p-4 bg-gray-800/50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
                          <span>This script has been approved and is ready for the next stage</span>
                        </div>
                        <Button 
                          onClick={handleProceedToNextStage}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                          disabled={isPending}
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Navigating...
                            </>
                          ) : (
                            <>
                              Proceed to Voice-over
                              <MoveRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-8 text-center">
                        <p className="text-gray-400 mb-4">Once you're satisfied with the script, approve it to proceed to the next stage</p>
                        <Button 
                          onClick={handleApproveScript}
                          className="bg-green-600 hover:bg-green-700"
                          size="lg"
                        >
                          <Check className="mr-2 h-5 w-5" />
                          Approve Script
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
