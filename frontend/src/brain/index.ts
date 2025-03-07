import { auth } from "app/auth";
import { API_PATH } from "../constants";
import { Brain } from "./Brain";
import type { RequestParams } from "./http-client";

const isLocalhost = /localhost:\d{4}/i.test(window.location.origin);

const constructBaseUrl = (): string => {
  if (isLocalhost) {
    return `${window.location.origin}${API_PATH}`;
  }

  return `https://api.databutton.com${API_PATH}`;
};

type BaseApiParams = Omit<RequestParams, "signal" | "baseUrl" | "cancelToken">;

const constructBaseApiParams = (): BaseApiParams => {
  return {
    credentials: "include",
    secure: true,
  };
};

const constructClient = () => {
  const baseUrl = constructBaseUrl();
  const baseApiParams = constructBaseApiParams();

  const client = new Brain({
    baseUrl,
    baseApiParams,
    securityWorker: async () => {
      return {
        headers: {
          Authorization: await auth.getAuthHeaderValue(),
        },
      };
    },
  });

  // Add video clips endpoints
  client.list_video_clips = async (params = {}) => {
    return client.request({
      url: `/video-clips/clips`,
      method: "GET",
      params,
    });
  };

  client.generate_video = async ({ user_id, ...body }) => {
    return client.request({
      url: `/video-clips/generate`,
      method: "POST",
      params: { user_id },
      body,
    });
  };

  client.get_final_video = async ({ user_id, video_id }) => {
    return client.request({
      url: `/video-clips/videos/${video_id}`,
      method: "GET",
      params: { user_id },
    });
  };

  client.update_final_video = async ({ user_id, video_id, ...body }) => {
    return client.request({
      url: `/video-clips/videos/${video_id}`,
      method: "PATCH",
      params: { user_id },
      body,
    });
  };

  client.list_final_videos = async ({ user_id }) => {
    return client.request({
      url: `/video-clips/videos`,
      method: "GET",
      params: { user_id },
    });
  };

  return client;
};

const brain = constructClient();

export default brain;
