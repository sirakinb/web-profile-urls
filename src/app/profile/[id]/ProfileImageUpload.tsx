'use client';

import React, { useState } from 'react';

interface ProfileImageUploadProps {
  avatarUrl: string | null;
  userName: string;
}

export default function ProfileImageUpload({ 
  avatarUrl, 
  userName
}: ProfileImageUploadProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageClick = () => {
    // Web profiles are read-only - only the mobile app can update profile pictures
    alert('Profile pictures can only be updated through the mobile app');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const hasValidAvatar = avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('https')) && !imageError;

  return (
    <div className="relative flex flex-col items-center justify-center mb-6 w-full">
      {/* Profile Image */}
      <div 
        className="relative group cursor-not-allowed flex justify-center"
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

        {/* Mobile app hint overlay */}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-center">
            <span className="material-icons text-white text-2xl mb-1">smartphone</span>
            <p className="text-white text-xs font-medium">Update via Mobile App</p>
          </div>
        </div>
      </div>

      {/* Mobile app hint */}
      <p className="text-center text-gray-400 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
        Use the mobile app to update your profile picture
      </p>
    </div>
  );
} 