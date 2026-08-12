import api from "./axios";

const unwrap = (res, fallback) => {
  const body = res.data;
  if (body && typeof body === "object" && !Array.isArray(body) && body.success === false) {
    throw new Error(body.message || fallback);
  }
  return body;
};

// Mirrors UniversityClubAPI.Enums.ClubVisibility. The backend has no
// [JsonConverter(typeof(JsonStringEnumConverter))] registered (see
// Program.cs -> AddJsonOptions), so enums travel over JSON request BODIES
// as their underlying int, exactly like ClubApplication.Status /
// LiveEvent.Status elsewhere in this app.
export const ClubVisibility = {
  Public: 0,
  Private: 1,
  InviteOnly: 2,
};

export const ClubVisibilityLabels = {
  [ClubVisibility.Public]: "Public",
  [ClubVisibility.Private]: "Private",
  [ClubVisibility.InviteOnly]: "Invite Only",
};

// Mirrors UniversityClubAPI.Enums.InviteStatus
export const InviteStatus = {
  Pending: 0,
  Accepted: 1,
  Declined: 2,
  Revoked: 3,
};

export const InviteStatusLabels = {
  [InviteStatus.Pending]: "Pending",
  [InviteStatus.Accepted]: "Accepted",
  [InviteStatus.Declined]: "Declined",
  [InviteStatus.Revoked]: "Revoked",
};

export const clubPrivacyApi = {
  // PUT /api/club-privacy/clubs/{clubId}/visibility  (Admin only)
  updateVisibility: async (clubId, visibility) => {
    const res = await api.put(`/club-privacy/clubs/${clubId}/visibility`, { visibility });
    return unwrap(res, "Failed to update club visibility.");
  },

  // POST /api/club-privacy/clubs/{clubId}/invites  (Admin/Mod only)
  createInvite: async (clubId, invitedUserId) => {
    const res = await api.post(`/club-privacy/clubs/${clubId}/invites`, { invitedUserId });
    return unwrap(res, "Failed to send invite.");
  },

  // DELETE /api/club-privacy/invites/{inviteId}  (Admin/Mod only - revoke)
  revokeInvite: async (inviteId) => {
    const res = await api.delete(`/club-privacy/invites/${inviteId}`);
    return unwrap(res, "Failed to revoke invite.");
  },

  // GET /api/club-privacy/clubs/{clubId}/invites?page=&pageSize=&status=  (Admin/Mod only)
  getClubInvites: async (clubId, { status, page = 1, pageSize = 10 } = {}) => {
    const params = { page, pageSize };
    if (status !== undefined && status !== null && status !== "") {
      params.status = status;
    }
    const res = await api.get(`/club-privacy/clubs/${clubId}/invites`, { params });
    return unwrap(res, "Failed to load invites.");
  },

  // GET /api/club-privacy/invites/{inviteId}  (the invited user, or an Admin/Mod of that club)
  getInviteById: async (inviteId) => {
    const res = await api.get(`/club-privacy/invites/${inviteId}`);
    return unwrap(res, "Failed to load invite.");
  },

  // GET /api/club-privacy/invites/my
  getMyInvites: async () => {
    const res = await api.get(`/club-privacy/invites/my`);
    return unwrap(res, "Failed to load your invites.");
  },

  // POST /api/club-privacy/invites/{inviteId}/accept
  acceptInvite: async (inviteId) => {
    const res = await api.post(`/club-privacy/invites/${inviteId}/accept`);
    return unwrap(res, "Failed to accept invite.");
  },

  // POST /api/club-privacy/invites/{inviteId}/decline
  declineInvite: async (inviteId) => {
    const res = await api.post(`/club-privacy/invites/${inviteId}/decline`);
    return unwrap(res, "Failed to decline invite.");
  },
};

export default clubPrivacyApi;
