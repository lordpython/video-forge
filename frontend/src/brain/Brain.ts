import {
  CheckHealthData,
  CreateStoryData,
  CreateStoryError,
  CreateStoryParams,
  CreateVoiceOverPreviewData,
  CreateVoiceOverPreviewError,
  GenerateScriptData,
  GenerateScriptError,
  GenerateScriptParams,
  GenerateVoiceOverData,
  GenerateVoiceOverError,
  GetScriptData,
  GetScriptError,
  GetScriptParams,
  GetStoryData,
  GetStoryError,
  GetStoryParams,
  GetVoiceOverAudioDataData,
  GetVoiceOverAudioDataError,
  GetVoiceOverAudioDataParams,
  GetVoiceOverMetadataData,
  GetVoiceOverMetadataError,
  GetVoiceOverMetadataParams,
  ListGeneratedScriptsData,
  ListGeneratedScriptsError,
  ListGeneratedScriptsParams,
  ListGeneratedStoriesData,
  ListGeneratedStoriesError,
  ListGeneratedStoriesParams,
  ListScriptGenerationsData,
  ListScriptGenerationsError,
  ListScriptGenerationsParams,
  ListStoriesData,
  ListStoriesError,
  ListStoriesParams,
  ListStoryGenerationsData,
  ListStoryGenerationsError,
  ListStoryGenerationsParams,
  ListVoiceOversData,
  ListVoiceOversError,
  ListVoiceOversParams,
  ListVoicesData,
  ScriptRequest,
  ScriptUpdateRequest,
  StartStoryGenerationData,
  StartStoryGenerationError,
  StartStoryGenerationParams,
  StoryRequest,
  UpdateScriptData,
  UpdateScriptError,
  UpdateScriptParams,
  VoiceOverPreviewRequest,
  VoiceOverRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description List all available voices from ElevenLabs.
   *
   * @tags dbtn/module:voice_over, dbtn/hasAuth
   * @name list_voices
   * @summary List Voices
   * @request GET:/routes/voices
   */
  list_voices = (params: RequestParams = {}) =>
    this.request<ListVoicesData, any>({
      path: `/routes/voices`,
      method: "GET",
      ...params,
    });

  /**
   * @description Generate a voice-over preview for a small amount of text.
   *
   * @tags dbtn/module:voice_over, dbtn/hasAuth
   * @name create_voice_over_preview
   * @summary Create Voice Over Preview
   * @request POST:/routes/preview
   */
  create_voice_over_preview = (data: VoiceOverPreviewRequest, params: RequestParams = {}) =>
    this.request<CreateVoiceOverPreviewData, CreateVoiceOverPreviewError>({
      path: `/routes/preview`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate a voice-over for a script.
   *
   * @tags dbtn/module:voice_over, dbtn/hasAuth
   * @name generate_voice_over
   * @summary Generate Voice Over
   * @request POST:/routes/generate
   */
  generate_voice_over = (data: VoiceOverRequest, params: RequestParams = {}) =>
    this.request<GenerateVoiceOverData, GenerateVoiceOverError>({
      path: `/routes/generate`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all voice-overs for a script.
   *
   * @tags dbtn/module:voice_over, dbtn/hasAuth
   * @name list_voice_overs
   * @summary List Voice Overs
   * @request GET:/routes/list/{script_id}
   */
  list_voice_overs = ({ scriptId, ...query }: ListVoiceOversParams, params: RequestParams = {}) =>
    this.request<ListVoiceOversData, ListVoiceOversError>({
      path: `/routes/list/${scriptId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get metadata for a voice-over.
   *
   * @tags dbtn/module:voice_over, dbtn/hasAuth
   * @name get_voice_over_metadata
   * @summary Get Voice Over Metadata
   * @request GET:/routes/{voice_over_id}
   */
  get_voice_over_metadata = ({ voiceOverId, ...query }: GetVoiceOverMetadataParams, params: RequestParams = {}) =>
    this.request<GetVoiceOverMetadataData, GetVoiceOverMetadataError>({
      path: `/routes/${voiceOverId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get the audio data for a voice-over.
   *
   * @tags dbtn/module:voice_over, dbtn/hasAuth
   * @name get_voice_over_audio_data
   * @summary Get Voice Over Audio Data
   * @request GET:/routes/audio/{voice_over_id}
   */
  get_voice_over_audio_data = ({ voiceOverId, ...query }: GetVoiceOverAudioDataParams, params: RequestParams = {}) =>
    this.request<GetVoiceOverAudioDataData, GetVoiceOverAudioDataError>({
      path: `/routes/audio/${voiceOverId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Start the script generation process for a specific story
   *
   * @tags dbtn/module:script_generator, dbtn/hasAuth
   * @name generate_script
   * @summary Generate Script
   * @request POST:/routes/scripts/generate
   */
  generate_script = (query: GenerateScriptParams, data: ScriptRequest, params: RequestParams = {}) =>
    this.request<GenerateScriptData, GenerateScriptError>({
      path: `/routes/scripts/generate`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all script generation jobs for a specific story
   *
   * @tags dbtn/module:script_generator, dbtn/hasAuth
   * @name list_script_generations
   * @summary List Script Generations
   * @request GET:/routes/scripts/generations/{story_id}
   */
  list_script_generations = ({ storyId, ...query }: ListScriptGenerationsParams, params: RequestParams = {}) =>
    this.request<ListScriptGenerationsData, ListScriptGenerationsError>({
      path: `/routes/scripts/generations/${storyId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description List all generated scripts for a specific story
   *
   * @tags dbtn/module:script_generator, dbtn/hasAuth
   * @name list_generated_scripts
   * @summary List Generated Scripts
   * @request GET:/routes/scripts/{story_id}
   */
  list_generated_scripts = ({ storyId, ...query }: ListGeneratedScriptsParams, params: RequestParams = {}) =>
    this.request<ListGeneratedScriptsData, ListGeneratedScriptsError>({
      path: `/routes/scripts/${storyId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific generated script by ID
   *
   * @tags dbtn/module:script_generator, dbtn/hasAuth
   * @name get_script
   * @summary Get Script
   * @request GET:/routes/scripts/{story_id}/{script_id}
   */
  get_script = ({ storyId, scriptId, ...query }: GetScriptParams, params: RequestParams = {}) =>
    this.request<GetScriptData, GetScriptError>({
      path: `/routes/scripts/${storyId}/${scriptId}`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Update a specific generated script
   *
   * @tags dbtn/module:script_generator, dbtn/hasAuth
   * @name update_script
   * @summary Update Script
   * @request PATCH:/routes/scripts/{story_id}/{script_id}
   */
  update_script = (
    { storyId, scriptId, ...query }: UpdateScriptParams,
    data: ScriptUpdateRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateScriptData, UpdateScriptError>({
      path: `/routes/scripts/${storyId}/${scriptId}`,
      method: "PATCH",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Start the story generation process for a specific story
   *
   * @tags dbtn/module:story_generator, dbtn/hasAuth
   * @name start_story_generation
   * @summary Start Story Generation
   * @request POST:/routes/stories/{story_id}/generate
   */
  start_story_generation = ({ storyId, ...query }: StartStoryGenerationParams, params: RequestParams = {}) =>
    this.request<StartStoryGenerationData, StartStoryGenerationError>({
      path: `/routes/stories/${storyId}/generate`,
      method: "POST",
      query: query,
      ...params,
    });

  /**
   * @description List all generation jobs for a specific story
   *
   * @tags dbtn/module:story_generator, dbtn/hasAuth
   * @name list_story_generations
   * @summary List Story Generations
   * @request GET:/routes/stories/{story_id}/generations
   */
  list_story_generations = ({ storyId, ...query }: ListStoryGenerationsParams, params: RequestParams = {}) =>
    this.request<ListStoryGenerationsData, ListStoryGenerationsError>({
      path: `/routes/stories/${storyId}/generations`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description List all generated stories for a specific story request
   *
   * @tags dbtn/module:story_generator, dbtn/hasAuth
   * @name list_generated_stories
   * @summary List Generated Stories
   * @request GET:/routes/stories/{story_id}/generated
   */
  list_generated_stories = ({ storyId, ...query }: ListGeneratedStoriesParams, params: RequestParams = {}) =>
    this.request<ListGeneratedStoriesData, ListGeneratedStoriesError>({
      path: `/routes/stories/${storyId}/generated`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a new story based on user input
   *
   * @tags dbtn/module:story_acquisition, dbtn/hasAuth
   * @name create_story
   * @summary Create Story
   * @request POST:/routes/stories
   */
  create_story = (query: CreateStoryParams, data: StoryRequest, params: RequestParams = {}) =>
    this.request<CreateStoryData, CreateStoryError>({
      path: `/routes/stories`,
      method: "POST",
      query: query,
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all stories for the authenticated user
   *
   * @tags dbtn/module:story_acquisition, dbtn/hasAuth
   * @name list_stories
   * @summary List Stories
   * @request GET:/routes/stories
   */
  list_stories = (query: ListStoriesParams, params: RequestParams = {}) =>
    this.request<ListStoriesData, ListStoriesError>({
      path: `/routes/stories`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific story by ID
   *
   * @tags dbtn/module:story_acquisition, dbtn/hasAuth
   * @name get_story
   * @summary Get Story
   * @request GET:/routes/stories/{story_id}
   */
  get_story = ({ storyId, ...query }: GetStoryParams, params: RequestParams = {}) =>
    this.request<GetStoryData, GetStoryError>({
      path: `/routes/stories/${storyId}`,
      method: "GET",
      query: query,
      ...params,
    });
}
