import {
  CheckHealthData,
  CreateStoryData,
  CreateVoiceOverPreviewData,
  GenerateScriptData,
  GenerateVoiceOverData,
  GetScriptData,
  GetStoryData,
  GetVoiceOverAudioDataData,
  GetVoiceOverMetadataData,
  ListGeneratedScriptsData,
  ListGeneratedStoriesData,
  ListScriptGenerationsData,
  ListStoriesData,
  ListStoryGenerationsData,
  ListVoiceOversData,
  ListVoicesData,
  ScriptRequest,
  ScriptUpdateRequest,
  StartStoryGenerationData,
  StoryRequest,
  UpdateScriptData,
  VoiceOverPreviewRequest,
  VoiceOverRequest,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description List all available voices from ElevenLabs.
   * @tags dbtn/module:voice_over, dbtn/hasAuth
   * @name list_voices
   * @summary List Voices
   * @request GET:/routes/voices
   */
  export namespace list_voices {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListVoicesData;
  }

  /**
   * @description Generate a voice-over preview for a small amount of text.
   * @tags dbtn/module:voice_over, dbtn/hasAuth
   * @name create_voice_over_preview
   * @summary Create Voice Over Preview
   * @request POST:/routes/preview
   */
  export namespace create_voice_over_preview {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = VoiceOverPreviewRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateVoiceOverPreviewData;
  }

  /**
   * @description Generate a voice-over for a script.
   * @tags dbtn/module:voice_over, dbtn/hasAuth
   * @name generate_voice_over
   * @summary Generate Voice Over
   * @request POST:/routes/generate
   */
  export namespace generate_voice_over {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = VoiceOverRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateVoiceOverData;
  }

  /**
   * @description List all voice-overs for a script.
   * @tags dbtn/module:voice_over, dbtn/hasAuth
   * @name list_voice_overs
   * @summary List Voice Overs
   * @request GET:/routes/list/{script_id}
   */
  export namespace list_voice_overs {
    export type RequestParams = {
      /** Script Id */
      scriptId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListVoiceOversData;
  }

  /**
   * @description Get metadata for a voice-over.
   * @tags dbtn/module:voice_over, dbtn/hasAuth
   * @name get_voice_over_metadata
   * @summary Get Voice Over Metadata
   * @request GET:/routes/{voice_over_id}
   */
  export namespace get_voice_over_metadata {
    export type RequestParams = {
      /** Voice Over Id */
      voiceOverId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetVoiceOverMetadataData;
  }

  /**
   * @description Get the audio data for a voice-over.
   * @tags dbtn/module:voice_over, dbtn/hasAuth
   * @name get_voice_over_audio_data
   * @summary Get Voice Over Audio Data
   * @request GET:/routes/audio/{voice_over_id}
   */
  export namespace get_voice_over_audio_data {
    export type RequestParams = {
      /** Voice Over Id */
      voiceOverId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetVoiceOverAudioDataData;
  }

  /**
   * @description Start the script generation process for a specific story
   * @tags dbtn/module:script_generator, dbtn/hasAuth
   * @name generate_script
   * @summary Generate Script
   * @request POST:/routes/scripts/generate
   */
  export namespace generate_script {
    export type RequestParams = {};
    export type RequestQuery = {
      /** User Id */
      user_id: string;
    };
    export type RequestBody = ScriptRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateScriptData;
  }

  /**
   * @description List all script generation jobs for a specific story
   * @tags dbtn/module:script_generator, dbtn/hasAuth
   * @name list_script_generations
   * @summary List Script Generations
   * @request GET:/routes/scripts/generations/{story_id}
   */
  export namespace list_script_generations {
    export type RequestParams = {
      /** Story Id */
      storyId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListScriptGenerationsData;
  }

  /**
   * @description List all generated scripts for a specific story
   * @tags dbtn/module:script_generator, dbtn/hasAuth
   * @name list_generated_scripts
   * @summary List Generated Scripts
   * @request GET:/routes/scripts/{story_id}
   */
  export namespace list_generated_scripts {
    export type RequestParams = {
      /** Story Id */
      storyId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListGeneratedScriptsData;
  }

  /**
   * @description Get a specific generated script by ID
   * @tags dbtn/module:script_generator, dbtn/hasAuth
   * @name get_script
   * @summary Get Script
   * @request GET:/routes/scripts/{story_id}/{script_id}
   */
  export namespace get_script {
    export type RequestParams = {
      /** Story Id */
      storyId: string;
      /** Script Id */
      scriptId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetScriptData;
  }

  /**
   * @description Update a specific generated script
   * @tags dbtn/module:script_generator, dbtn/hasAuth
   * @name update_script
   * @summary Update Script
   * @request PATCH:/routes/scripts/{story_id}/{script_id}
   */
  export namespace update_script {
    export type RequestParams = {
      /** Story Id */
      storyId: string;
      /** Script Id */
      scriptId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id: string;
    };
    export type RequestBody = ScriptUpdateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateScriptData;
  }

  /**
   * @description Start the story generation process for a specific story
   * @tags dbtn/module:story_generator, dbtn/hasAuth
   * @name start_story_generation
   * @summary Start Story Generation
   * @request POST:/routes/stories/{story_id}/generate
   */
  export namespace start_story_generation {
    export type RequestParams = {
      /** Story Id */
      storyId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = StartStoryGenerationData;
  }

  /**
   * @description List all generation jobs for a specific story
   * @tags dbtn/module:story_generator, dbtn/hasAuth
   * @name list_story_generations
   * @summary List Story Generations
   * @request GET:/routes/stories/{story_id}/generations
   */
  export namespace list_story_generations {
    export type RequestParams = {
      /** Story Id */
      storyId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListStoryGenerationsData;
  }

  /**
   * @description List all generated stories for a specific story request
   * @tags dbtn/module:story_generator, dbtn/hasAuth
   * @name list_generated_stories
   * @summary List Generated Stories
   * @request GET:/routes/stories/{story_id}/generated
   */
  export namespace list_generated_stories {
    export type RequestParams = {
      /** Story Id */
      storyId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListGeneratedStoriesData;
  }

  /**
   * @description Create a new story based on user input
   * @tags dbtn/module:story_acquisition, dbtn/hasAuth
   * @name create_story
   * @summary Create Story
   * @request POST:/routes/stories
   */
  export namespace create_story {
    export type RequestParams = {};
    export type RequestQuery = {
      /** User Id */
      user_id: string;
    };
    export type RequestBody = StoryRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateStoryData;
  }

  /**
   * @description List all stories for the authenticated user
   * @tags dbtn/module:story_acquisition, dbtn/hasAuth
   * @name list_stories
   * @summary List Stories
   * @request GET:/routes/stories
   */
  export namespace list_stories {
    export type RequestParams = {};
    export type RequestQuery = {
      /** User Id */
      user_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListStoriesData;
  }

  /**
   * @description Get a specific story by ID
   * @tags dbtn/module:story_acquisition, dbtn/hasAuth
   * @name get_story
   * @summary Get Story
   * @request GET:/routes/stories/{story_id}
   */
  export namespace get_story {
    export type RequestParams = {
      /** Story Id */
      storyId: string;
    };
    export type RequestQuery = {
      /** User Id */
      user_id: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetStoryData;
  }
}
