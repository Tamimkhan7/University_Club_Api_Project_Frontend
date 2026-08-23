export const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : "U");

export const isClubManager = (membership) =>
  membership?.role === "Admin" || membership?.role === "Moderator";


export const isClubAdmin = (membership) => membership?.role === "Admin";
