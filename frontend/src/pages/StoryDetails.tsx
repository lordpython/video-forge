import { useUserGuardContext } from "app";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, RefreshCw, Loader2, ZapIcon, Copy, CheckIcon, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import brain from "brain";
import { StoryResponse, GeneratedStory } from "types";

export default function StoryDetails() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const storyId = searchParams.get('id');
  const [story, setStory] = useState<StoryResponse | null>(null);
  const [generatedStories, setGeneratedStories] = useState<GeneratedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchStoryDetails = async () => {
    if (!storyId || !user) return;

    setLoading(true);
    try {
      // Fetch the original story
      const storyResponse = await brain.get_story({
        storyId, 
        user_id: user.uid
      });
      const storyData = await storyResponse.json();
      setStory(storyData);

      // Fetch generated stories (if any)
      if (storyData.status === "story_generated") {
        const generatedResponse = await brain.list_generated_stories({
          storyId, 
          user_id: user.uid
        });
        const generatedData = await generatedResponse.json();
        setGeneratedStories(generatedData);
      }
    } catch (error) {
      console.error("Error fetching story details:", error);
      setNotification({ message: "Failed to load story details", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStory = async () => {
    if (!storyId || !user || !story) return;

    try {
      setNotification({ message: "Starting story generation...", type: "success" });
      const response = await brain.start_story_generation({
        storyId, 
        user_id: user.uid
      });
      await response.json();
      
      // Update the local story status
      setStory({ ...story, status: "processing" });
      
      // Start polling for updates
      pollGenerationStatus();
    } catch (error) {
      console.error("Error generating story:", error);
      setNotification({ message: "Failed to start story generation", type: "error" });
    }
  };

  const pollGenerationStatus = async () => {
    if (!storyId || !user) return;
    
    // Set up polling interval
    const interval = setInterval(async () => {
      try {
        const response = await brain.list_story_generations({
          storyId, 
          user_id: user.uid
        });
        const data = await response.json();
        
        if (data.generations.length > 0) {
          const latestGeneration = data.generations[data.generations.length - 1];
          
          if (latestGeneration.status === "completed") {
            clearInterval(interval);
            fetchStoryDetails(); // Refresh the entire page data
            setNotification({ message: "Story generation completed", type: "success" });
          } else if (latestGeneration.status === "failed") {
            clearInterval(interval);
            fetchStoryDetails(); // Refresh the entire page data
            setNotification({ 
              message: `Story generation failed: ${latestGeneration.message}`, 
              type: "error" 
            });
          }
        }
      } catch (error) {
        console.error("Error polling generation status:", error);
        clearInterval(interval);
      }
    }, 3000); // Poll every 3 seconds

    // Clean up interval after 5 minutes (maximum polling time)
    setTimeout(() => {
      clearInterval(interval);
    }, 5 * 60 * 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
        setNotification({ message: "Failed to copy text", type: "error" });
      }
    );
  };

  useEffect(() => {
    if (user) {
      fetchStoryDetails();
    }
  }, [storyId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 opacity-80"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618609255910-1950ba7de780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-4" />
          <p className="text-xl">Loading story details...</p>
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
            onClick={() => navigate('/Dashboard')} 
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618609255910-1950ba7de780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
      </div>

      {/* Notification */}
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg flex items-center justify-between max-w-md ${notification.type === 'success' ? 'bg-green-900/70 text-green-200 border border-green-700' : 'bg-red-900/70 text-red-200 border border-red-700'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-green-800' : 'bg-red-800'}`}>
              {notification.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>
              )}
            </div>
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-gray-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>
          </button>
        </motion.div>
      )}

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/Dashboard')} 
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              Back to Dashboard
            </button>
          </div>
          <button
            onClick={fetchStoryDetails}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </nav>

        {/* Story Header */}
        <div className="mb-8 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 relative bg-gradient-to-br from-gray-900 via-indigo-950/20 to-purple-950/30">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-3xl font-bold">{story.topic}</h1>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-900/60 text-indigo-200">
                    {story.genre}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-900/60 text-purple-200">
                    {story.tone}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/60 text-blue-200">
                    {story.target_audience}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Details</h3>
                  <p className="text-gray-300 mb-4">
                    {story.additional_details || "No additional details provided."}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Created: {new Date(story.created_at).toLocaleString()}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyles(story.status)}`}>
                      {getStatusLabel(story.status)}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-medium mb-3">Actions</h3>
                  
                  {story.status === "pending" && (
                    <div className="space-y-4">
                      <p className="text-gray-300 text-sm">
                        This story is ready to be generated. Click the button below to start the AI-powered story generation process.
                      </p>
                      <button
                        onClick={handleGenerateStory}
                        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ZapIcon className="h-5 w-5" />
                        Generate Story with AI
                      </button>
                    </div>
                  )}
                  
                  {story.status === "processing" && (
                    <div className="space-y-4">
                      <p className="text-gray-300 text-sm">
                        We're currently generating your story with our AI agents. This process can take a few moments.
                      </p>
                      <div className="w-full px-4 py-3 bg-gray-800 rounded-lg flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                        <span>Processing story...</span>
                      </div>
                    </div>
                  )}
                  
                  {story.status === "story_generated" && (
                    <div className="space-y-4">
                      <p className="text-gray-300 text-sm">
                        Your story has been generated successfully! You can now proceed to the next steps in the video creation process.
                      </p>
                      <button
                        onClick={() => navigate(`/script-generation?id=${storyId}`)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ZapIcon className="h-5 w-5" />
                        Continue to Script Generation
                      </button>
                    </div>
                  )}
                  
                  {story.status === "failed" && (
                    <div className="space-y-4">
                      <p className="text-gray-300 text-sm">
                        There was an issue generating your story. You can try again by clicking the button below.
                      </p>
                      <button
                        onClick={handleGenerateStory}
                        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="h-5 w-5" />
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Story Section */}
        {story.status === "story_generated" && generatedStories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Generated Story</h2>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-900/50 flex items-center justify-center">
                      <ZapIcon className="h-4 w-4 text-indigo-400" />
                    </div>
                    <span className="font-medium">Generated on {new Date(generatedStories[0].created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => copyToClipboard(generatedStories[0].content)}
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1"
                    >
                      {copied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-700 prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-300">
                    {generatedStories[0].content}
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-400 flex justify-between">
                  <span>Word count: {generatedStories[0].content.split(/\s+/).length}</span>
                  <span>Generated with: {generatedStories[0].metadata.generated_with || "CrewAI"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getStatusBadgeStyles(status: string): string {
  switch (status) {
    case "story_generated":
      return "bg-green-900/70 text-green-200";
    case "processing":
    case "pending":
      return "bg-yellow-900/70 text-yellow-200";
    case "failed":
      return "bg-red-900/70 text-red-200";
    default:
      return "bg-blue-900/70 text-blue-200";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "story_generated":
      return "Story Generated";
    case "processing":
      return "Processing";
    case "pending":
      return "Pending";
    case "failed":
      return "Failed";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  }
}