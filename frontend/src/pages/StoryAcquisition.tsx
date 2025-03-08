import React, { useState, useEffect, useTransition } from "react";
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
  researchKeywords: string;
  targetVideoLength: string;
  videoStyle: string;
  storyType: string;
}

interface ContentTypeConfig {
  examples: string[];
  styleSuggestions: string[];
  lengthRecommendation: string;
}

const CONTENT_TYPE_CONFIG: Record<string, ContentTypeConfig> = {
  short_form: {
    examples: [
      "Top 10 productivity tools for remote work",
      "5-minute healthy breakfast ideas for busy professionals",
      "Essential tech tips to improve your workflow"
    ],
    styleSuggestions: ["Fast-paced", "Eye-catching", "Trendy music"],
    lengthRecommendation: "1-3 minutes"
  },
  entertainment: {
    examples: [
      "Behind the scenes: How movies are made",
      "Top 5 upcoming video games of the year",
      "Amazing talent show performances compilation"
    ],
    styleSuggestions: ["Dramatic", "Humorous", "Suspenseful"],
    lengthRecommendation: "8-15 minutes"
  },
  personal_use: {
    examples: [
      "My journey through the national parks",
      "How I renovated my home office on a budget",
      "A day in the life of a software developer"
    ],
    styleSuggestions: ["Personal", "Heartfelt", "Uplifting"],
    lengthRecommendation: "5-10 minutes"
  },
  news_information: {
    examples: [
      "Latest advancements in renewable energy",
      "How AI is transforming healthcare",
      "Economic trends shaping the future of work"
    ],
    styleSuggestions: ["Informative", "Objective", "Engaging"],
    lengthRecommendation: "5-15 minutes"
  },
  educational: {
    examples: [
      "Mastering data visualization in 20 minutes",
      "Understanding blockchain technology: A beginner's guide",
      "The science behind effective learning techniques"
    ],
    styleSuggestions: ["Clear", "Concise", "Engaging"],
    lengthRecommendation: "10-30 minutes"
  },
};

const initialFormData: StoryFormData = {
  topic: "",
  genre: "short_form",
  targetAudience: "content_creators",
  additionalDetails: "",
  tone: "energetic",
  researchKeywords: "",
  targetVideoLength: "",
  videoStyle: "",
  storyType: ""
};

// Add real story type options
const storyTypes = [
  { id: "true_crime", name: "True Crime" },
  { id: "success_story", name: "Success Story" },
  { id: "biography", name: "Biography" },
  { id: "historical", name: "Historical Event" },
  { id: "investigation", name: "Investigation" },
  { id: "scandal", name: "Scandal/Controversy" }
];

const genres = [
  { id: "short_form", name: "Short Form Content" },
  { id: "entertainment", name: "Entertainment & Engagement" },
  { id: "personal_use", name: "Personal Use" },
  { id: "news_information", name: "News & Information" },
  { id: "educational", name: "Educational Content" },
];

const audiences = [
  { id: "content_creators", name: "Content Creators" },
  { id: "social_media_managers", name: "Social Media Managers" },
  { id: "influencers", name: "Influencers" },
  { id: "brands", name: "Brands" },
  { id: "individuals", name: "Individuals & Families" },
  { id: "educators", name: "Educators & Students" },
];

const tones = [
  { id: "energetic", name: "Energetic" },
  { id: "casual", name: "Casual" },
  { id: "serious", name: "Serious" },
  { id: "professional", name: "Professional" },
  { id: "friendly", name: "Friendly" },
  { id: "informative", name: "Informative" },
];

export default function StoryAcquisition() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StoryFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [exampleVisible, setExampleVisible] = useState(false);
  const [keywordsExampleVisible, setKeywordsExampleVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<StoryFormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Clear submit error when changing steps
  useEffect(() => {
    setSubmitError(null);
  }, [currentStep]);

  useEffect(() => {
    if (formData.genre && CONTENT_TYPE_CONFIG[formData.genre]) {
      const config = CONTENT_TYPE_CONFIG[formData.genre];
      setFormData(prev => ({
        ...prev,
        targetVideoLength: config.lengthRecommendation.split('-')[0].trim(),
        videoStyle: config.styleSuggestions[0] || ''
      }));
    }
  }, [formData.genre]);

  const totalSteps = 4;

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
      
      if (formData.genre === 'short_form' && !formData.targetVideoLength) {
        newErrors.targetVideoLength = "Duration is required for short-form content";
      }
      
      const [min, max] = (CONTENT_TYPE_CONFIG[formData.genre]?.lengthRecommendation || '-').split('-').map(Number);
      const inputLength = parseInt(formData.targetVideoLength);
      if (!isNaN(inputLength) && (inputLength < min || inputLength > max)) {
        newErrors.targetVideoLength = `Duration must be between ${min} and ${max} minutes`;
      }

      if (!formData.storyType && formData.genre !== 'short_form') {
        newErrors.storyType = "Please select a story type";
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

  // Add useTransition hook for handling suspense
  const [isPending, startTransition] = useTransition();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Format data for API (camelCase to snake_case)
      const storyRequest = ({
        topic: formData.topic,
        genre: formData.genre,
        target_audience: formData.targetAudience,
        tone: formData.tone,
        additional_details: formData.additionalDetails || null,
        research_keywords: formData.researchKeywords ? formData.researchKeywords.split(',').map(kw => kw.trim()).filter(kw => kw !== '') : null,
        target_video_length: formData.targetVideoLength ? formData.targetVideoLength : null,
        video_style: formData.videoStyle ? formData.videoStyle : null,
        story_type: formData.storyType || null
      } as unknown) as StoryRequest & { 
        target_video_length?: string | null; 
        video_style?: string | null;
        story_type?: string | null;
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
      
      // Use startTransition to wrap the navigation which might cause suspense
      startTransition(() => {
        // Navigate to script generation page with the story ID
        navigate(`/script-generation?id=${data.id}`, { 
          state: { success: true, message: "Story created successfully! Now let's generate a script." } 
        });
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

  const toggleKeywordsExample = () => {
    setKeywordsExampleVisible(!keywordsExampleVisible);
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
                        placeholder="e.g., 5 amazing gadgets under $50 that will change your life"
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
                      Provide a detailed description of your video concept. The more specific details you include about your topic, angle, and key points, the better our AI can create a script that matches your vision.
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
                                {CONTENT_TYPE_CONFIG[formData.genre]?.examples.map(example => (
                                  <li key={example}>
                                    <span className="font-medium text-indigo-400">{example}</span>
                                    <p className="text-gray-400 mt-1">A {formData.genre} video perfect for {formData.targetAudience}.</p>
                                  </li>
                                ))}
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

                  <div className="mb-4">
                    <label className="block text-sm font-medium">Target Video Length (minutes)</label>
                    <input
                      type="number"
                      name="targetVideoLength"
                      value={formData.targetVideoLength}
                      onChange={handleInputChange}
                      min={CONTENT_TYPE_CONFIG[formData.genre]?.lengthRecommendation.split('-')[0]}
                      max={CONTENT_TYPE_CONFIG[formData.genre]?.lengthRecommendation.split('-')[1]}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      aria-label="Target video length in minutes"
                      placeholder="Enter length in minutes"
                    />
                    {errors.targetVideoLength && (
                      <p className="text-red-500 text-sm mt-1">{errors.targetVideoLength}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-2">
                      Recommended: {CONTENT_TYPE_CONFIG[formData.genre]?.lengthRecommendation} minutes
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium">Video Style</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {CONTENT_TYPE_CONFIG[formData.genre]?.styleSuggestions.map((style) => (
                        <button
                          type="button"
                          key={style}
                          onClick={() => setFormData({...formData, videoStyle: style})}
                          className={`px-3 py-1 rounded-full text-sm ${
                            formData.videoStyle === style
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                      <input
                        type="text"
                        name="videoStyle"
                        value={formData.videoStyle}
                        onChange={handleInputChange}
                        placeholder="Custom style..."
                        className="flex-1 min-w-[200px] bg-gray-800 rounded-lg px-3 py-1 text-sm"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                      Recommended length: {CONTENT_TYPE_CONFIG[formData.genre]?.lengthRecommendation}
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Real Story Type
                    </label>
                    <select
                      name="storyType"
                      value={formData.storyType}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-4 py-3 bg-gray-900/60 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      aria-label="Select a real story type"
                    >
                      <option value="">Select a story type...</option>
                      {storyTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {errors.storyType && (
                      <p className="text-red-500 text-sm mt-1">{errors.storyType}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-2">
                      Select a real story category to help our AI generate relevant content
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
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="researchKeywords" className="block text-lg font-medium">
                        Research Keywords (optional)
                      </label>
                      <button 
                        type="button" 
                        onClick={toggleKeywordsExample}
                        className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
                      >
                        <HelpCircle className="h-4 w-4" />
                        See Examples
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        id="researchKeywords"
                        name="researchKeywords"
                        value={formData.researchKeywords}
                        onChange={handleInputChange}
                        placeholder="e.g., latest advancements, statistics, future predictions"
                        className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-400">
                      Comma-separated keywords to guide research for your video content. These help our AI find relevant information.
                    </p>
                  </div>

                  <AnimatePresence>
                    {keywordsExampleVisible && (
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
                              <p className="font-medium">Example Keywords:</p>
                              <ul className="mt-2 space-y-2 text-sm text-gray-300">
                                <li>
                                  <span className="font-medium text-indigo-400">For AI topic:</span>
                                  <p className="text-gray-400 mt-1">"machine learning breakthroughs, ethical concerns, AI applications, industry adoption"</p>
                                </li>
                                <li>
                                  <span className="font-medium text-indigo-400">For Climate Change:</span>
                                  <p className="text-gray-400 mt-1">"recent studies, mitigation strategies, global impact, renewable solutions"</p>
                                </li>
                                <li>
                                  <span className="font-medium text-indigo-400">For Business Strategy:</span>
                                  <p className="text-gray-400 mt-1">"market trends, case studies, industry benchmarks, competitive analysis"</p>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {currentStep === 4 && (
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
                      {formData.storyType && (
                        <p><span className="text-gray-400">Story Type:</span> {storyTypes.find(s => s.id === formData.storyType)?.name}</p>
                      )}
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
                  className={`px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transition-all duration-300 flex items-center gap-2 ${isSubmitting || isPending ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-indigo-500/30'}`}
                >
                  {isSubmitting || isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isSubmitting ? "Processing" : "Navigating..."}
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
