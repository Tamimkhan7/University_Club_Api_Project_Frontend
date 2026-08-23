import api from "./axios";
import { unwrap } from "./apiUtils";

const API_BASE_URL = "http://localhost:5000/api";
const ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const MessageMediaType = {
  Text: 0,
  Voice: 1,
};

export const resolveMediaUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
};

const buildVoiceFormData = (audioBlob, durationSeconds, fileName) => {
  const formData = new FormData();
  formData.append("Audio", audioBlob, fileName);
  formData.append("DurationSeconds", String(Math.min(600, Math.max(1, Math.round(durationSeconds || 1)))));
  return formData;
};

export const voiceMessageApi = {
  sendDirect: async (receiverId, audioBlob, durationSeconds, fileName = "voice-message.webm") => {
    const formData = buildVoiceFormData(audioBlob, durationSeconds, fileName);
    const res = await api.post(`/voice-messages/direct/${receiverId}`, formData);
    return unwrap(res, "Failed to send voice message.");
  },

  sendGroup: async (groupId, audioBlob, durationSeconds, fileName = "voice-message.webm") => {
    const formData = buildVoiceFormData(audioBlob, durationSeconds, fileName);
    const res = await api.post(`/voice-messages/group/${groupId}`, formData);
    return unwrap(res, "Failed to send voice message.");
  },

  deleteDirect: async (messageId) => {
    const res = await api.delete(`/voice-messages/direct/${messageId}`);
    return unwrap(res, "Failed to delete voice message.");
  },

  deleteGroup: async (messageId) => {
    const res = await api.delete(`/voice-messages/group/${messageId}`);
    return unwrap(res, "Failed to delete voice message.");
  },
};

export default voiceMessageApi;