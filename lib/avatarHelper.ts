/**
 * Avatar Helper
 * Provides crisp, professional vector avatars.
 * Uses clean SVG avatars (/avatars/man-1.svg, /avatars/woman-1.svg, etc.)
 */

export function getUserAvatar(user?: {
  avatar?: string;
  gender?: "male" | "female" | "other" | string;
  name?: string;
}): string {
  // If user uploaded a custom cropped avatar (e.g. on Cloudinary) and not old stock or AI images
  if (
    user?.avatar &&
    user.avatar.trim() !== "" &&
    !user.avatar.includes("images.unsplash.com") &&
    !user.avatar.includes("avatar-male-3d.jpg") &&
    !user.avatar.includes("avatar-female-3d.jpg")
  ) {
    return user.avatar;
  }

  const name = user?.name?.toLowerCase() || "";

  if (
    user?.gender === "female" ||
    name.includes("sarah") ||
    name.includes("emily")
  ) {
    return `/avatars/woman-1.svg`;
  }

  if (
    user?.gender === "male" ||
    name.includes("david") ||
    name.includes("alex") ||
    name.includes("marcus") ||
    name.includes("admin") ||
    name.includes("manager") ||
    name.includes("aftab")
  ) {
    return `/avatars/man-1.svg`;
  }

  // Fallback to clean professional avatar
  return `/avatars/man-1.svg`;
}

export default getUserAvatar;
