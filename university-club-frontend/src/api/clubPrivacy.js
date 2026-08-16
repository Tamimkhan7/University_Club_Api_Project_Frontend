import api from "./axios";

const unwrap = (res, fallback) => {
  const body = res.data;
  if (body && typeof body === "object" && !Array.isArray(body) && body.success === false) {
    throw new Error(body.message || fallback);
  }
  return body;
};


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
  updateVisibility: async (clubId, visibility) => {
    const res = await api.put(`/club-privacy/clubs/${clubId}/visibility`, { visibility });
    return unwrap(res, "Failed to update club visibility.");
  },

  createInvite: async (clubId, invitedUserId) => {
    const res = await api.post(`/club-privacy/clubs/${clubId}/invites`, { invitedUserId });
    return unwrap(res, "Failed to send invite.");
  },

  revokeInvite: async (inviteId) => {
    const res = await api.delete(`/club-privacy/invites/${inviteId}`);
    return unwrap(res, "Failed to revoke invite.");
  },

  getClubInvites: async (clubId, { status, page = 1, pageSize = 10 } = {}) => {
    const params = { page, pageSize };
    if (status !== undefined && status !== null && status !== "") {
      params.status = status;
    }
    const res = await api.get(`/club-privacy/clubs/${clubId}/invites`, { params });
    return unwrap(res, "Failed to load invites.");
  },

  getInviteById: async (inviteId) => {
    const res = await api.get(`/club-privacy/invites/${inviteId}`);
    return unwrap(res, "Failed to load invite.");
  },

  getMyInvites: async () => {
    const res = await api.get(`/club-privacy/invites/my`);
    return unwrap(res, "Failed to load your invites.");
  },

  acceptInvite: async (inviteId) => {
    const res = await api.post(`/club-privacy/invites/${inviteId}/accept`);
    return unwrap(res, "Failed to accept invite.");
  },

  declineInvite: async (inviteId) => {
    const res = await api.post(`/club-privacy/invites/${inviteId}/decline`);
    return unwrap(res, "Failed to decline invite.");
  },
};

export default clubPrivacyApi;
