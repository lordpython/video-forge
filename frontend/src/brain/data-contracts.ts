/** GeneratedScript */
export interface GeneratedScript {
  /**
   * Id
   * Unique identifier for the generated script
   */
  id: string;
  /**
   * Story Id
   * ID of the original story
   */
  story_id: string;
  /**
   * Title
   * Title of the script
   */
  title: string;
  /**
   * Sections
   * Sections of the script
   */
  sections: ScriptSection[];
  /**
   * Metadata
   * Additional metadata about the generated script
   */
  metadata?: object;
  /**
   * Created At
   * Timestamp when the script was generated
   */
  created_at: string;
  /**
   * Modified At
   * Timestamp when the script was last modified
   */
  modified_at?: string | null;
  /**
   * Approved
   * Whether the script has been approved by the user
   * @default false
   */
  approved?: boolean;
}

/** GeneratedScriptListResponse */
export interface GeneratedScriptListResponse {
  /**
   * Scripts
   * List of generated scripts
   */
  scripts: GeneratedScript[];
}

/** GeneratedStory */
export interface GeneratedStory {
  /**
   * Id
   * Unique identifier for the generated story
   */
  id: string;
  /**
   * Story Id
   * ID of the original story request
   */
  story_id: string;
  /**
   * Content
   * The generated story content
   */
  content: string;
  /**
   * Metadata
   * Additional metadata about the generated story
   */
  metadata?: object;
  /**
   * Created At
   * Timestamp when the story was generated
   */
  created_at: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** ScriptGenerationResponse */
export interface ScriptGenerationResponse {
  /**
   * Id
   * Unique identifier for the generation job
   */
  id: string;
  /**
   * Story Id
   * ID of the story being processed
   */
  story_id: string;
  /**
   * Status
   * Current status of the generation process
   */
  status: string;
  /**
   * Message
   * Additional message about the generation process
   */
  message?: string | null;
  /**
   * Created At
   * Timestamp when the generation was started
   */
  created_at: string;
  /**
   * Completed At
   * Timestamp when the generation was completed
   */
  completed_at?: string | null;
}

/** ScriptGenerationsListResponse */
export interface ScriptGenerationsListResponse {
  /**
   * Generations
   * List of script generation jobs
   */
  generations: ScriptGenerationResponse[];
}

/** ScriptRequest */
export interface ScriptRequest {
  /**
   * Story Id
   * ID of the story to generate a script for
   */
  story_id: string;
  /**
   * Content Override
   * Override the story content for script generation
   */
  content_override?: string | null;
  /**
   * Script Style
   * Style of the script (professional, conversational, dramatic)
   * @default "professional"
   */
  script_style?: string | null;
  /**
   * Include B Roll
   * Whether to include B-roll suggestions
   * @default true
   */
  include_b_roll?: boolean;
  /**
   * Max Duration Minutes
   * Target maximum duration in minutes
   * @default 5
   */
  max_duration_minutes?: number | null;
}

/** ScriptSection */
export interface ScriptSection {
  /**
   * Type
   * Section type (hook, main_content, outro, etc.)
   */
  type: string;
  /**
   * Content
   * Content for this section
   */
  content: string;
  /**
   * Estimated Duration
   * Estimated duration for this section
   */
  estimated_duration?: string | null;
  /**
   * B Roll Suggestions
   * Suggestions for B-roll footage
   */
  b_roll_suggestions?: string[] | null;
}

/** ScriptUpdateRequest */
export interface ScriptUpdateRequest {
  /**
   * Title
   * Updated title of the script
   */
  title?: string | null;
  /**
   * Sections
   * Updated sections of the script
   */
  sections?: ScriptSection[] | null;
  /**
   * Approved
   * Whether the script has been approved by the user
   */
  approved?: boolean | null;
}

/** StoriesListResponse */
export interface StoriesListResponse {
  /**
   * Stories
   * List of stories
   */
  stories: StoryResponse[];
}

/** StoryGenerationResponse */
export interface StoryGenerationResponse {
  /**
   * Id
   * Unique identifier for the generation job
   */
  id: string;
  /**
   * Story Id
   * ID of the story being processed
   */
  story_id: string;
  /**
   * Status
   * Current status of the generation process
   */
  status: string;
  /**
   * Message
   * Additional message about the generation process
   */
  message?: string | null;
  /**
   * Created At
   * Timestamp when the generation was started
   */
  created_at: string;
  /**
   * Completed At
   * Timestamp when the generation was completed
   */
  completed_at?: string | null;
}

/** StoryGenerationsListResponse */
export interface StoryGenerationsListResponse {
  /**
   * Generations
   * List of generation jobs
   */
  generations: StoryGenerationResponse[];
}

/** StoryRequest */
export interface StoryRequest {
  /**
   * Topic
   * The main topic or idea for the video
   */
  topic: string;
  /**
   * Genre
   * The genre of the video
   */
  genre: string;
  /**
   * Target Audience
   * The target audience for the video
   */
  target_audience: string;
  /**
   * Tone
   * The tone of the video
   */
  tone: string;
  /**
   * Additional Details
   * Additional details or requirements
   */
  additional_details?: string | null;
}

/** StoryResponse */
export interface StoryResponse {
  /**
   * Id
   * Unique identifier for the story
   */
  id: string;
  /**
   * Topic
   * The main topic or idea for the video
   */
  topic: string;
  /**
   * Genre
   * The genre of the video
   */
  genre: string;
  /**
   * Target Audience
   * The target audience for the video
   */
  target_audience: string;
  /**
   * Tone
   * The tone of the video
   */
  tone: string;
  /**
   * Additional Details
   * Additional details or requirements
   */
  additional_details?: string | null;
  /**
   * Created At
   * Timestamp when the story was created
   */
  created_at: string;
  /**
   * Status
   * Current status of the story generation process
   */
  status: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** VoiceListResponse */
export interface VoiceListResponse {
  /**
   * Voices
   * List of available voices
   */
  voices: VoiceModel[];
}

/** VoiceModel */
export interface VoiceModel {
  /**
   * Voice Id
   * Unique identifier for the voice
   */
  voice_id: string;
  /**
   * Name
   * Name of the voice
   */
  name: string;
  /**
   * Category
   * Category of the voice (e.g., professional, conversational)
   */
  category?: string | null;
  /**
   * Description
   * Description of the voice characteristics
   */
  description?: string | null;
  /**
   * Labels
   * Additional labels/metadata for the voice
   */
  labels?: object | null;
  /**
   * Samples
   * Sample audio clips of the voice
   */
  samples?: object[] | null;
  /** Voice settings */
  settings?: VoiceSettingsModel | null;
}

/** VoiceOverPreviewRequest */
export interface VoiceOverPreviewRequest {
  /**
   * Text
   * Text to generate voice-over preview for
   */
  text: string;
  /**
   * Voice Id
   * ID of the voice to use
   */
  voice_id: string;
  /** Voice settings to override defaults */
  settings?: VoiceSettingsModel | null;
  /**
   * Speed
   * Speed multiplier for the voice-over
   * @min 0.5
   * @max 2
   * @default 1
   */
  speed?: number;
}

/** VoiceOverPreviewResponse */
export interface VoiceOverPreviewResponse {
  /**
   * Audio Data
   * Base64 encoded audio data
   */
  audio_data: string;
}

/** VoiceOverRequest */
export interface VoiceOverRequest {
  /**
   * Script Id
   * ID of the script to generate voice-over for
   */
  script_id: string;
  /**
   * Voice Id
   * ID of the voice to use
   */
  voice_id: string;
  /** Voice settings to override defaults */
  settings?: VoiceSettingsModel | null;
  /**
   * Speed
   * Speed multiplier for the voice-over
   * @min 0.5
   * @max 2
   * @default 1
   */
  speed?: number;
}

/** VoiceOverResponse */
export interface VoiceOverResponse {
  /**
   * Id
   * Unique identifier for the voice-over
   */
  id: string;
  /**
   * Script Id
   * ID of the script used
   */
  script_id: string;
  /**
   * Story Id
   * ID of the original story
   */
  story_id: string;
  /**
   * Voice Id
   * ID of the voice used
   */
  voice_id: string;
  /** Voice settings used */
  settings?: VoiceSettingsModel | null;
  /**
   * Speed
   * Speed used for the voice-over
   */
  speed: number;
  /**
   * Status
   * Current status of the voice-over generation
   */
  status: string;
  /**
   * Audio Url
   * URL to the generated audio file
   */
  audio_url?: string | null;
  /**
   * Created At
   * Timestamp when the voice-over was created
   */
  created_at: string;
  /**
   * Completed At
   * Timestamp when the voice-over was completed
   */
  completed_at?: string | null;
}

/** VoiceSettingsModel */
export interface VoiceSettingsModel {
  /**
   * Stability
   * How stable/consistent the voice is
   * @min 0
   * @max 1
   * @default 0.5
   */
  stability?: number;
  /**
   * Similarity Boost
   * How much to prioritize sounding like the original voice
   * @min 0
   * @max 1
   * @default 0.75
   */
  similarity_boost?: number;
  /**
   * Style
   * Speaking style adjustment
   * @min 0
   * @max 1
   * @default 0
   */
  style?: number;
  /**
   * Use Speaker Boost
   * Boost the speaker clarity and target speaker voice
   * @default true
   */
  use_speaker_boost?: boolean;
}

export type CheckHealthData = HealthResponse;

export type ListVoicesData = VoiceListResponse;

export type CreateVoiceOverPreviewData = VoiceOverPreviewResponse;

export type CreateVoiceOverPreviewError = HTTPValidationError;

export type GenerateVoiceOverData = VoiceOverResponse;

export type GenerateVoiceOverError = HTTPValidationError;

export interface ListVoiceOversParams {
  /** Script Id */
  scriptId: string;
}

/** Response List Voice Overs */
export type ListVoiceOversData = VoiceOverResponse[];

export type ListVoiceOversError = HTTPValidationError;

export interface GetVoiceOverMetadataParams {
  /** Voice Over Id */
  voiceOverId: string;
}

export type GetVoiceOverMetadataData = VoiceOverResponse;

export type GetVoiceOverMetadataError = HTTPValidationError;

export interface GetVoiceOverAudioDataParams {
  /** Voice Over Id */
  voiceOverId: string;
}

export type GetVoiceOverAudioDataData = any;

export type GetVoiceOverAudioDataError = HTTPValidationError;

export interface VideoClip {
  /**
   * Id
   * Unique identifier for the video clip
   */
  id: string;
  /**
   * Title
   * Title of the video clip
   */
  title: string;
  /**
   * Thumbnail Url
   * URL to the thumbnail image for the clip
   */
  thumbnail_url: string;
  /**
   * Duration
   * Duration of the clip in seconds
   */
  duration: number;
  /**
   * Tags
   * List of tags associated with the clip
   */
  tags: string[];
  /**
   * Source
   * Source of the video clip (e.g., stock, user-uploaded)
   */
  source: string;
  /**
   * Url
   * URL to the video clip
   */
  url: string;
}

export interface VideoClipListResponse {
  /**
   * Clips
   * List of video clips
   */
  clips: VideoClip[];
}

export interface VideoGenerationResponse {
  /**
   * Id
   * Unique identifier for the video generation job
   */
  id: string;
  /**
   * Script Id
   * ID of the script used for the video
   */
  script_id: string;
  /**
   * Voice Over Id
   * ID of the voice-over used for the video
   */
  voice_over_id: string;
  /**
   * Status
   * Status of the video generation job
   */
  status: string;
  /**
   * Message
   * Status message for the video generation job
   */
  message?: string;
  /**
   * Created At
   * Timestamp when the video generation job was created
   */
  created_at: string;
  /**
   * Completed At
   * Timestamp when the video generation job was completed
   */
  completed_at?: string;
  /**
   * Url
   * URL to the generated video
   */
  url?: string;
  /**
   * Thumbnail Url
   * URL to the thumbnail image for the video
   */
  thumbnail_url?: string;
}

export interface FinalVideo {
  /**
   * Id
   * Unique identifier for the final video
   */
  id: string;
  /**
   * Title
   * Title of the video
   */
  title: string;
  /**
   * Description
   * Description of the video
   */
  description: string;
  /**
   * Duration
   * Duration of the video in seconds
   */
  duration: number;
  /**
   * Url
   * URL to the video file
   */
  url: string;
  /**
   * Thumbnail Url
   * URL to the thumbnail image for the video
   */
  thumbnail_url: string;
  /**
   * Created At
   * Timestamp when the video was created
   */
  created_at: string;
  /**
   * Story Id
   * ID of the original story
   */
  story_id: string;
  /**
   * Script Id
   * ID of the script used for the video
   */
  script_id: string;
  /**
   * Voice Over Id
   * ID of the voice-over used for the video
   */
  voice_over_id: string;
  /**
   * Status
   * Status of the video
   */
  status: string;
  /**
   * Resolution
   * Resolution of the video
   */
  resolution: string;
  /**
   * File Size
   * Size of the video file in bytes
   */
  file_size: number;
}

export type ListVideoClipsData = VideoClipListResponse;
export type ListVideoClipsError = HTTPValidationError;

export type GenerateVideoData = VideoGenerationResponse;
export type GenerateVideoError = HTTPValidationError;

export type GetFinalVideoData = FinalVideo;
export type GetFinalVideoError = HTTPValidationError;

export type UpdateFinalVideoData = FinalVideo;
export type UpdateFinalVideoError = HTTPValidationError;

export type ListFinalVideosData = FinalVideo[];
export type ListFinalVideosError = HTTPValidationError;

export interface GenerateScriptParams {
  /** User Id */
  user_id: string;
}

export type GenerateScriptData = ScriptGenerationResponse;

export type GenerateScriptError = HTTPValidationError;

export interface ListScriptGenerationsParams {
  /** User Id */
  user_id: string;
  /** Story Id */
  storyId: string;
}

export type ListScriptGenerationsData = ScriptGenerationsListResponse;

export type ListScriptGenerationsError = HTTPValidationError;

export interface ListGeneratedScriptsParams {
  /** User Id */
  user_id: string;
  /** Story Id */
  storyId: string;
}

export type ListGeneratedScriptsData = GeneratedScriptListResponse;

export type ListGeneratedScriptsError = HTTPValidationError;

export interface GetScriptParams {
  /** User Id */
  user_id: string;
  /** Story Id */
  storyId: string;
  /** Script Id */
  scriptId: string;
}

export type GetScriptData = GeneratedScript;

export type GetScriptError = HTTPValidationError;

export interface UpdateScriptParams {
  /** User Id */
  user_id: string;
  /** Story Id */
  storyId: string;
  /** Script Id */
  scriptId: string;
}

export type UpdateScriptData = GeneratedScript;

export type UpdateScriptError = HTTPValidationError;

export interface StartStoryGenerationParams {
  /** User Id */
  user_id: string;
  /** Story Id */
  storyId: string;
}

export type StartStoryGenerationData = StoryGenerationResponse;

export type StartStoryGenerationError = HTTPValidationError;

export interface ListStoryGenerationsParams {
  /** User Id */
  user_id: string;
  /** Story Id */
  storyId: string;
}

export type ListStoryGenerationsData = StoryGenerationsListResponse;

export type ListStoryGenerationsError = HTTPValidationError;

export interface ListGeneratedStoriesParams {
  /** User Id */
  user_id: string;
  /** Story Id */
  storyId: string;
}

/** Response List Generated Stories */
export type ListGeneratedStoriesData = GeneratedStory[];

export type ListGeneratedStoriesError = HTTPValidationError;

export interface CreateStoryParams {
  /** User Id */
  user_id: string;
}

export type CreateStoryData = StoryResponse;

export type CreateStoryError = HTTPValidationError;

export interface ListStoriesParams {
  /** User Id */
  user_id: string;
}

export type ListStoriesData = StoriesListResponse;

export type ListStoriesError = HTTPValidationError;

export interface GetStoryParams {
  /** User Id */
  user_id: string;
  /** Story Id */
  storyId: string;
}

export type GetStoryData = StoryResponse;

export type GetStoryError = HTTPValidationError;
