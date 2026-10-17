/**
 * Avatar Helper
 * Provides high-resolution 3D stylized cartoon character avatars.
 * Eliminates real human photos in favor of professional 3D animated character renders.
 */

export function getUserAvatar(user?: {
  avatar?: string;
  gender?: "male" | "female" | "other" | string;
  name?: string;
}): string {
  // If user uploaded a custom cropped avatar (e.g. on Cloudinary) and not the old Unsplash stock photos
  if (
    user?.avatar &&
    user.avatar.trim() !== "" &&
    !user.avatar.includes("images.unsplash.com")
  ) {
    return user.avatar;
  }

  const name = user?.name?.toLowerCase() || "";

  if (
    user?.gender === "female" ||
    name.includes("sarah") ||
    name.includes("emily")
  ) {
    // High-resolution 3D Stylized Female Executive Character
    return `/avatars/avatar-female-3d.jpg`;
  }

  if (
    user?.gender === "male" ||
    name.includes("david") ||
    name.includes("alex") ||
    name.includes("marcus") ||
    name.includes("admin") ||
    name.includes("manager")
  ) {
    // High-resolution 3D Stylized Male Executive Character
    return `/avatars/avatar-male-3d.jpg`;
  }

  // Fallback to 3D male avatar
  return `/avatars/avatar-male-3d.jpg`;
}

export default getUserAvatar;
