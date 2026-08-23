import toast from "react-hot-toast";

export async function copyToClipboard(text, opts = {}) {
  const { successMessage = "Link copied!", errorMessage = "Failed to copy" } = opts;
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    toast.error(errorMessage);
    return false;
  }
}

export function copyPostLink(postId) {
  return copyToClipboard(`${window.location.origin}/post/${postId}`, {
    successMessage: " Post link copied!",
    errorMessage: "Failed to copy link",
  });
}
