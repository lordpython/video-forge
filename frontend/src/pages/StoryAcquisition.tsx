import { useState, useEffect } from "react";
import { useUserGuardContext } from "app";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Lightbulb, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import brain from "brain";
import { StoryRequest } from "types";

interface StoryFormData {
  topic: string;
  genre: string;
  targetAudience: string;
  additionalDetails: string;
  tone: string;
}

const initialFormData: StoryFormData = {
  topic: "",
  genre: "technology",
  targetAudience: "general",
  additionalDetails: "",
  tone: "professional",
};

const genres = [
  { id: "technology", name: "Technology" },
  { id: "business", name: "Business" },
  { id: "education", name: "Education" },
  { id: "entertainment", name: "Entertainment" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "science", name: "Science" },
  { id: "health", name: "Health" },
];

const audiences = [
  { id: "general", name: "General Audience" },
  { id: "professionals", name: "Professionals" },
  { id: "students", name: "Students" },
  { id: "enthusiasts", name: "Enthusiasts" },
  { id: "executives", name: "Executives" },
];

const tones = [
  { id: "professional", name: "Professional" },
  { id: "conversational", name: "Conversational" },
  { id: "inspirational", name: "Inspirational" },
  { id: "humorous", name: "Humorous" },
  { id: "serious", name: "Serious" },
];

export default function StoryAcquisition() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StoryFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [exampleVisible, setExampleVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<StoryFormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Clear submit error when changing steps
  useEffect(() => {
    setSubmitError(null);
  }, [currentStep]);

  const totalSteps = 3;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (errors[name as keyof StoryFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<StoryFormData> = {};
    
    if (step === 1) {
      if (!formData.topic.trim()) {
        newErrors.topic = "Please provide a topic for your video";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Format data for API (camelCase to snake_case)
      const storyRequest: StoryRequest = {
        topic: formData.topic,
        genre: formData.genre,
        target_audience: formData.targetAudience,
        tone: formData.tone,
        additional_details: formData.additionalDetails || null
      };
      
      // Get user ID from the authenticated user
      const userId = user?.uid;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      console.log("Submitting story data:", storyRequest);
      
      // Call the API to create a new story
      const response = await brain.create_story({ user_id: userId }, storyRequest);
      const data = await response.json();
      
      console.log("Story submitted successfully:", data);
      
      // Navigate to script generation page with the story ID
      navigate(`/script-generation?id=${data.id}`, { 
        state: { success: true, message: "Story created successfully! Now let's generate a script." } 
      });
    } catch (error) {
      console.error("Error submitting story:", error);
      setSubmitError("Failed to create story. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExample = () => {
    setExampleVisible(!exampleVisible);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618609255910-1950ba7de780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3000&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-6 px-4 md:px-6 lg:px-8 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center pb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 w-6 rounded-full ${i + 1 <= currentStep ? 'bg-indigo-500' : 'bg-gray-700'}`}
                ></div>
              ))}
            </div>
            <span className="text-sm text-gray-400">Step {currentStep}/{totalSteps}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-300 to-purple-400">
              Tell Us Your Story
            </h1>
            <p className="text-gray-300 mb-8">
              Share your idea and we'll transform it into a compelling narrative for your video.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="topic" className="block text-lg font-medium">
                        What's your video about?
                      </label>
                      <button 
                        type="button" 
                        onClick={toggleExample}
                        className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
                      >
                        <HelpCircle className="h-4 w-4" />
                        See Examples
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        id="topic"
                        name="topic"
                        value={formData.topic}
                        onChange={handleInputChange}
                        placeholder="e.g., The future of AI in healthcare"
                        className={`w-full px-4 py-3 bg-gray-900/60 border ${errors.topic ? 'border-red-500' : 'border-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Sparkles className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    {errors.topic && (
                      <p className="mt-2 text-sm text-red-500">{errors.topic}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-400">
                      This will be the core subject of your video. Be specific for best results.
                    </p>
                  </div>

                  <AnimatePresence>
                    {exampleVisible && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                          <div className="flex items-start gap-2 mb-2">
                            <Lightbulb className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-1" />
                            <div>
                              <p className="font-medium">Example Topics:</p>
                              <ul className="mt-2 space-y-2 text-sm text-gray-300">
                                <li>
                                  <span className="font-medium text-indigo-400">"How AI is Revolutionizing Customer Service"</span>
                                  <p className="text-gray-400 mt-1">A business-focused video explaining AI applications in customer support.</p>
                                </li>
                                <li>
                                  <span className="font-medium text-indigo-400">"The Science Behind CRISPR Gene Editing"</span>
                                  <p className="text-gray-400 mt-1">An educational video explaining complex scientific concepts.</p>
                                </li>
                                <li>
                                  <span className="font-medium text-indigo-400">"5 Ways Renewable Energy is Changing the World"</span>
                                  <p className="text-gray-400 mt-1">An informative video with statistics and case studies.</p>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label htmlFor="genre" className="block text-lg font-medium mb-2">
                      Select a Genre
                    </label>
                    <select
                      id="genre"
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      {genres.map(genre => (
                        <option key={genre.id} value={genre.id}>{genre.name}</option>
                      ))}
                    </select>
                    <p className="mt-2 text-sm text-gray-400">
                      The genre helps determine the style and approach of your video.
                    </p>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <label htmlFor="targetAudience" className="block text-lg font-medium mb-2">
                      Who is your target audience?
                    </label>
                    <select
                      id="targetAudience"
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      {audiences.map(audience => (
                        <option key={audience.id} value={audience.id}>{audience.name}</option>
                      ))}
                    </select>
                    <p className="mt-2 text-sm text-gray-400">
                      This helps us tailor the language and examples to resonate with your viewers.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="tone" className="block text-lg font-medium mb-2">
                      What tone should your video have?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {tones.map(tone => (
                        <div key={tone.id}>
                          <input 
                            type="radio" 
                            id={`tone-${tone.id}`} 
                            name="tone" 
                            value={tone.id}
                            checked={formData.tone === tone.id}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <label 
                            htmlFor={`tone-${tone.id}`}
                            className={`block w-full py-3 px-4 text-center rounded-lg border transition-colors cursor-pointer ${formData.tone === tone.id 
                              ? 'bg-indigo-500/20 border-indigo-500 text-white' 
                              : 'bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-800/60'}`}
                          >
                            {tone.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                      The tone sets the overall feeling and voice of your video.
                    </p>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {submitError && (
                    <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                        <span>{submitError}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label htmlFor="additionalDetails" className="block text-lg font-medium mb-2">
                      Any additional details or requirements? (Optional)
                    </label>
                    <textarea
                      id="additionalDetails"
                      name="additionalDetails"
                      value={formData.additionalDetails}
                      onChange={handleInputChange}
                      placeholder="e.g., Include statistics from the latest research, focus on practical applications, avoid technical jargon..."
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                    <p className="mt-2 text-sm text-gray-400">
                      Any specific points you want to include or things to avoid in your video.
                    </p>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-indigo-400" />
                      Story Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">Topic:</span> {formData.topic}</p>
                      <p><span className="text-gray-400">Genre:</span> {genres.find(g => g.id === formData.genre)?.name}</p>
                      <p><span className="text-gray-400">Target Audience:</span> {audiences.find(a => a.id === formData.targetAudience)?.name}</p>
                      <p><span className="text-gray-400">Tone:</span> {tones.find(t => t.id === formData.tone)?.name}</p>
                      {formData.additionalDetails && (
                        <div>
                          <p className="text-gray-400">Additional Details:</p>
                          <p className="mt-1">{formData.additionalDetails}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between pt-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 flex items-center gap-2 text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transition-all duration-300 flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-indigo-500/30'}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing
                    </>
                  ) : (
                    <>
                      Generate Story
                      <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
