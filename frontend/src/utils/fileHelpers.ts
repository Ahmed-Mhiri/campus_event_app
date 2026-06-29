// src/utils/fileHelpers.ts
export const getAvatarUrl = (userId: string): string => {
  // This will be served from the backend static files
  return `/uploads/avatars/avatar_${userId}.png`;
};

export const getEventThumbnailUrl = (eventId: string, mediaId: string): string => {
  return `/uploads/events/${eventId}/images/${mediaId}_thumb.jpg`;
};

export const getEventMediumUrl = (eventId: string, mediaId: string): string => {
  return `/uploads/events/${eventId}/images/${mediaId}_medium.jpg`;
};

export const getEventVideoUrl = (eventId: string, mediaId: string): string => {
  return `/uploads/events/${eventId}/videos/${mediaId}.mp4`;
};

// Helper to get file extension from filename
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop() || '';
};

// Validate file type for images
export const isValidImageType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
};

// Validate file type for videos
export const isValidVideoType = (file: File): boolean => {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  return validTypes.includes(file.type);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};