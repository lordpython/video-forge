import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, RefreshCw, ZapIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import brain from "brain";
import { StoryResponse } from "types";

export interface Props {
  userId: string;
  onNotification: (message: string, type: 'success' | 'error') => void;
}

export function StoriesSection({ userId, onNotification }: Props) {
  const navigate = useNavigate();
  const [stories, setStories] = useState<StoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingStoryId, setGeneratingStoryId] = useState<string | null>(null);

  // Define fetchStories first because other functions depend on it
  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await brain.list_stories({
        user_id: userId
      });
      const data = await response.json();
      setStories(data.stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      onNotification("Failed to load your stories", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, onNotification]);

  // Define pollGenerationStatus before handleGenerateStory since handleGenerateStory depends on it
  const pollGenerationStatus = useCallback(async (storyId: string) => {
    // Set up polling interval to check generation status
    const interval = setInterval(async () => {
      try {
        const response = await brain.list_story_generations({
          storyId, 
          user_id: userId
        });
        const data = await response.json();
        
        if (data.generations.length > 0) {
          const latestGeneration = data.generations[data.generations.length - 1];
          
          if (latestGeneration.status === "completed") {
            clearInterval(interval);
            fetchStories(); // Refresh stories to get updated status
            onNotification("Story generation completed", "success");
          } else if (latestGeneration.status === "failed") {
            clearInterval(interval);
            fetchStories(); // Refresh stories to get updated status
            onNotification(`Story generation failed: ${latestGeneration.message}`, "error");
          }
        }
      } catch (error) {
        console.error("Error polling generation status:", error);
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds

    // Clean up interval after 5 minutes (maximum polling time)
    setTimeout(() => {
      clearInterval(interval);
    }, 5 * 60 * 1000);
  }, [userId, fetchStories, onNotification]);

  // Now define handleGenerateStory which depends on pollGenerationStatus
  const handleGenerateStory = useCallback(async (storyId: string) => {
    setGeneratingStoryId(storyId);
    try {
      const response = await brain.start_story_generation({
        storyId, 
        user_id: userId
      });
      const data = await response.json();
      
      // Update the story status in the local state
      setStories(stories.map(story => 
        story.id === storyId ? { ...story, status: "processing" } : story
      ));
      
      onNotification("Story generation started", "success");
      
      // Poll for generation status
      pollGenerationStatus(storyId);
    } catch (error) {
      console.error("Error generating story:", error);
      onNotification("Failed to start story generation", "error");
    } finally {
      setGeneratingStoryId(null);
    }
  }, [userId, stories, onNotification, pollGenerationStatus]);

  useEffect(() => {
    fetchStories();
  }, [userId]);

  // Helper function for rendering the appropriate action button based on story status
  const getStoryAction = useCallback((story: StoryResponse) => {
    if (story.status === "story_generated") {
      return (
        <button
          onClick={() => navigate(`/story-details?id=${story.id}`)}
          className="flex items-center gap-1 text-sm px-3 py-1.5 bg-indigo-600/30 text-indigo-200 rounded-lg hover:bg-indigo-600/50 transition-colors"
        >
          <ZapIcon className="h-3.5 w-3.5" />
          View Story
        </button>
      );
    }
    
    if (story.status === "pending") {
      return (
        <button
          onClick={() => handleGenerateStory(story.id)}
          disabled={generatingStoryId !== null}
          className={`flex items-center gap-1 text-sm px-3 py-1.5 ${generatingStoryId === story.id ? "bg-purple-600/30 text-purple-200" : "bg-indigo-600/30 text-indigo-200 hover:bg-indigo-600/50"} rounded-lg transition-colors`}
        >
          {generatingStoryId === story.id ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <ZapIcon className="h-3.5 w-3.5" />
              Generate Story
            </>
          )}
        </button>
      );
    }
    
    if (story.status === "processing") {
      return (
        <button
          disabled
          className="flex items-center gap-1 text-sm px-3 py-1.5 bg-purple-600/30 text-purple-200 rounded-lg"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Processing...
        </button>
      );
    }
    
    return null;
  }, [navigate, handleGenerateStory, generatingStoryId]);

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold pb-2 border-b border-gray-800">Your Stories</h2>
        <button
          onClick={fetchStories}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-all"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-indigo-900/30 flex items-center justify-center">
              <PlusCircle className="h-7 w-7 text-indigo-400" />
            </div>
          </div>
          <h3 className="font-medium mb-2">No stories yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">Create your first story to begin the video creation process</p>
          <button
            onClick={() => navigate("/StoryAcquisition")}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <PlusCircle className="h-5 w-5" />
            Create Your First Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300"
            >
              <div className="aspect-video p-6 relative bg-gradient-to-br from-gray-900 via-indigo-950/30 to-purple-950/40">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10 h-full flex flex-col">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{story.topic}</h3>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/60 text-indigo-200">
                      {story.genre}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/60 text-purple-200">
                      {story.tone}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-3 flex-grow">
                    {story.additional_details || `A ${story.tone.toLowerCase()} video targeted at ${story.target_audience.toLowerCase()} audience.`}
                  </p>
                  <div className="mt-auto">
                    <div className="text-xs text-gray-400 flex justify-between items-center mt-2">
                      <span>
                        Created: {new Date(story.created_at).toLocaleDateString()}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyles(story.status)}`}>
                        {getStatusLabel(story.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <button
                  onClick={() => navigate(`/story-details?id=${story.id}`)}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  View Details
                </button>
                {getStoryAction(story)}
              </div>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300 flex items-center justify-center aspect-[4/3]"
          >
            <button
              onClick={() => navigate("/StoryAcquisition")}
              className="p-8 flex flex-col items-center text-center"
            >
              <div className="h-14 w-14 rounded-full bg-indigo-900/30 flex items-center justify-center mb-4">
                <PlusCircle className="h-7 w-7 text-indigo-400" />
              </div>
              <span className="font-medium">New Story</span>
              <span className="text-sm text-gray-400 mt-1">Create from scratch</span>
            </button>
          </motion.div>
        </div>
      )}
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

