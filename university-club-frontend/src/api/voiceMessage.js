import api from "./axios";


const API_BASE_URL = "http://localhost:5000/api";
const ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

// Mirrors UniversityClubAPI.Enums.MessageMediaType
export const MessageMediaType = {
  Text: 0,
  Voice: 1,
};

// Resolves a possibly-relative MediaUrl coming back from the API into an
// absolute, playable URL. Already-absolute URLs are returned unchanged.
export const resolveMediaUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
};

const unwrap = (res, fallback) => {
  const body = res.data;
  if (body && typeof body === "object" && !Array.isArray(body) && body.success === false) {
    throw new Error(body.message || fallback);
  }
  return body;
};

const buildVoiceFormData = (audioBlob, durationSeconds, fileName) => {
  const formData = new FormData();
  formData.append("Audio", audioBlob, fileName);
  // Backend range-validates 1-600 seconds (SendVoiceMessageDto.DurationSeconds).
  formData.append("DurationSeconds", String(Math.min(600, Math.max(1, Math.round(durationSeconds || 1)))));
  return formData;
};

export const voiceMessageApi = {
  // POST /api/voice-messages/direct/{receiverId} (multipart/form-data: Audio, DurationSeconds)
  sendDirect: async (receiverId, audioBlob, durationSeconds, fileName = "voice-message.webm") => {
    const formData = buildVoiceFormData(audioBlob, durationSeconds, fileName);
    const res = await api.post(`/voice-messages/direct/${receiverId}`, formData);
    return unwrap(res, "Failed to send voice message.");
  },

  // POST /api/voice-messages/group/{groupId} (multipart/form-data: Audio, DurationSeconds)
  sendGroup: async (groupId, audioBlob, durationSeconds, fileName = "voice-message.webm") => {
    const formData = buildVoiceFormData(audioBlob, durationSeconds, fileName);
    const res = await api.post(`/voice-messages/group/${groupId}`, formData);
    return unwrap(res, "Failed to send voice message.");
  },

  // DELETE /api/voice-messages/direct/{messageId}
  deleteDirect: async (messageId) => {
    const res = await api.delete(`/voice-messages/direct/${messageId}`);
    return unwrap(res, "Failed to delete voice message.");
  },

  // DELETE /api/voice-messages/group/{messageId}
  deleteGroup: async (messageId) => {
    const res = await api.delete(`/voice-messages/group/${messageId}`);
    return unwrap(res, "Failed to delete voice message.");
  },
};

export default voiceMessageApi;