/**
 * Avatar Helper
 * Provides high-resolution avatars according to user preference and gender.
 * Defaults to distinct professional avatars for male vs female when no custom image is uploaded.
 */

export function getUserAvatar(user?: {
  avatar?: string;
  gender?: "male" | "female" | "other" | string;
  name?: string;
}): string {
  if (user?.avatar && user.avatar.trim() !== "") {
    return user.avatar;
  }

  const name = user?.name || "NextOne Team";

  if (user?.gender === "female") {
    // Professional Female Enterprise Avatar
    return `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80`;
  }

  if (user?.gender === "male") {
    // Professional Male Enterprise Avatar
    return `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80`;
  }

  // Neutral or other: High contrast corporate avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=4f46e5&color=ffffff&bold=true&size=256`;
}

export default getUserAvatar;
