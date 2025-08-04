'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface ProfileImageUploadProps {
  avatarUrl: string | null;
  userName: string;
  userId?: string;
  profileId?: string;
  isOwner?: boolean;
  onImageUpdate?: (newAvatarUrl: string) => void;
}

export default function ProfileImageUpload({ 
  avatarUrl, 
  userName,
  userId,
  profileId,
  isOwner = false,
  onImageUpdate
}: ProfileImageUploadProps) {
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleImageClick = () => {
    if (!user) {
      alert('Please log in to update your profile picture');
      return;
    }

    if (!isOwner) {
      alert('You can only update your own profile picture');
      return;
    }

    // Trigger file input
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !userId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('profileId', profileId || '');

      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image');
      }

      // Update the avatar URL in the parent component
      if (onImageUpdate && result.avatar_url) {
        onImageUpdate(result.avatar_url);
      }

      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const hasValidAvatar = avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('https')) && !imageError;

  return (
    <div className="relative flex flex-col items-center justify-center mb-6 w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Profile Image */}
      <div 
        className={`relative group flex justify-center ${
          isOwner && user ? 'cursor-pointer' : 'cursor-default'
        }`}
        onClick={handleImageClick}
      >
        {hasValidAvatar ? (
          <img
            src={avatarUrl}
            alt={userName}
            width={112}
            height={112}
            className="w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-xl"
            onError={handleImageError}
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border-4 border-white/20 shadow-xl flex items-center justify-center">
            <span className="material-icons text-white text-4xl">person</span>
          </div>
        )}

        {/* Upload overlay - shows when user can edit */}
        {isOwner && user && (
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-center">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                  <p className="text-white text-xs font-medium">Uploading...</p>
                </>
              ) : (
                <>
                  <span className="material-icons text-white text-2xl mb-1">camera_alt</span>
                  <p className="text-white text-xs font-medium">Update Photo</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Non-owner hint overlay */}
        {(!isOwner || !user) && (
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-center">
              <span className="material-icons text-white text-2xl mb-1">
                {!user ? 'login' : 'lock'}
              </span>
              <p className="text-white text-xs font-medium">
                {!user ? 'Login to Edit' : 'Owner Only'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status text */}
      <p className="text-center text-gray-400 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
        {isOwner && user 
          ? 'Click to update your profile picture' 
          : !user 
            ? 'Login to update profile pictures'
            : 'Only the profile owner can update pictures'
        }
      </p>
    </div>
  );
} 