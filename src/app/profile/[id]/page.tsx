'use client';

import { supabase } from '@/utils/supabaseClient';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import ContactActions from './ContactActions';
import ProfileImageUpload from './ProfileImageUpload';
import LoginModal from '@/components/LoginModal';

interface BusinessCard {
  id: string;
  user_id: string;
  is_primary: boolean;
  name: string;
  avatar_url: string | null;
  theme_color: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  tiktok: string;
  youtube: string;
  bio?: string;
}

type BusinessCardForActions = Pick<BusinessCard, 'name' | 'title' | 'company' | 'email' | 'phone' | 'website' | 'linkedin' | 'twitter' | 'instagram' | 'tiktok' | 'youtube'>;

async function getProfileById(profileId: string) {
  try {
    // First try to get from public_business_cards view (for display)
    const { data, error } = await supabase
      .from('public_business_cards')
      .select('*')
      .eq('id', profileId)
      .single();
    return { data, error };
  } catch (error) {
    console.error('Error in getProfileById:', error);
    return { data: null, error: error as Error };
  }
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [card, setCard] = useState<BusinessCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<BusinessCard | null>(null);
  const [saving, setSaving] = useState(false);
  const { user, signOut } = useAuth();

  // Check if current user owns this profile
  const isOwner = Boolean(user && card && user.id === card.user_id);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const resolvedParams = await params;
        const { data, error } = await getProfileById(resolvedParams.id);
        if (error) {
          setError(error);
        } else {
          setCard(data);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [params]);

  // Auto-enable editing when user logs in and owns the profile
  useEffect(() => {
    if (user && card && user.id === card.user_id && showLoginModal === false) {
      setIsEditing(true);
      setEditForm(card); // Initialize the edit form with current card data
    }
  }, [user, card, showLoginModal]);

  const handleEditClick = () => {
    if (user) {
      // User is logged in, check if they own this profile
      if (user.id === card?.user_id) {
        if (isEditing) {
          // Cancel editing
          setIsEditing(false);
          setEditForm(null);
        } else {
          // Start editing
          setIsEditing(true);
          setEditForm(card);
        }
      } else {
        alert("You can only edit your own profile.");
      }
    } else {
      // User not logged in, show login modal
      setShowLoginModal(true);
    }
  };

  const handleSave = async () => {
    if (!editForm || !card || !user) return;
    
    setSaving(true);
    try {
      // Create an API request to our custom endpoint with authentication
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: card.id,
          userId: user.id,
          updates: {
            name: editForm.name,
            title: editForm.title,
            company: editForm.company,
            email: editForm.email,
            phone: editForm.phone,
            website: editForm.website,
            twitter: editForm.twitter,
            instagram: editForm.instagram,
            linkedin: editForm.linkedin,
            tiktok: editForm.tiktok,
            youtube: editForm.youtube,
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error updating profile:', result);
        alert(`Failed to save changes: ${result.error || 'Unknown error'}`);
      } else {
        console.log('Profile saved successfully, exiting edit mode...');
        // Update local state
        setCard(editForm);
        setIsEditing(false);
        setEditForm(null);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const handleLoginSuccess = () => {
    // After login, check if the logged-in user owns this profile
    // This will be handled by the useEffect that watches for user changes
    setShowLoginModal(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Reset all editing states when logging out
      setIsEditing(false);
      setEditForm(null);
      alert('Logged out successfully!');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

    if (error || !card) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 font-sans">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Profile Not Found</h1>
            <p className="text-gray-300">We couldn&apos;t find a user with that profile.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center font-sans">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/10">
            {/* User Actions: Logout and Edit/Save/Cancel Buttons */}
            <div className="flex justify-between items-center mb-4">
              {/* Logout Button - Show when user is logged in */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 hover:text-red-200 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              )}

              {/* Edit/Save/Cancel Buttons */}
              <div className="flex gap-2">
                {isOwner && isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-600/50 hover:bg-gray-600/70 text-white rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600/80 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Profile Header */}
            <div className="relative z-10 flex flex-col items-center mb-8">
              <ProfileImageUpload
                avatarUrl={card.avatar_url}
                userName={card.name || card.email}
                userId={card.user_id}
                isOwner={isOwner}
                onImageUpdate={(newAvatarUrl) => {
                  setCard(prev => prev ? { ...prev, avatar_url: newAvatarUrl } : prev);
                }}
              />
              
              {/* Name Field */}
              {isOwner && isEditing ? (
                <input
                  type="text"
                  value={editForm?.name || card.name || ''}
                  onChange={(e) => setEditForm(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="text-3xl font-bold text-white mb-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your Name"
                />
              ) : (
                <h1 className="text-3xl font-bold text-white mb-2">{card.name || 'No Name'}</h1>
              )}

              {/* Title Field */}
              {isOwner && isEditing ? (
                <input
                  type="text"
                  value={editForm?.title || card.title || ''}
                  onChange={(e) => setEditForm(prev => prev ? {...prev, title: e.target.value} : null)}
                  className="text-purple-200 font-medium text-lg mb-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your Title"
                />
              ) : (
                card.title && (
                  <p className="text-purple-200 font-medium text-lg mb-1">{card.title}</p>
                )
              )}

              {/* Company Field */}
              {isOwner && isEditing ? (
                <input
                  type="text"
                  value={editForm?.company || card.company || ''}
                  onChange={(e) => setEditForm(prev => prev ? {...prev, company: e.target.value} : null)}
                  className="text-gray-400 text-sm bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your Company"
                />
              ) : (
                card.company && (
                  <p className="text-gray-400 text-sm">{card.company}</p>
                )
              )}
            </div>

            {/* Bio Section */}
            {card.bio && (
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                  <p className="text-gray-300 text-center">{card.bio}</p>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-3 mb-8">
              <h2 className="text-xl font-semibold text-white mb-5">Contact Information</h2>
              
              {/* Email Field */}
              <div className="flex items-center bg-white/10 rounded-2xl p-5 border border-white/20">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {isOwner && isEditing ? (
                  <input
                    type="email"
                    value={editForm?.email || card.email || ''}
                    onChange={(e) => setEditForm(prev => prev ? {...prev, email: e.target.value} : null)}
                    className="text-white font-medium flex-1 bg-transparent border-none focus:outline-none"
                    placeholder="your@email.com"
                  />
                ) : (
                  <span className="text-white font-medium flex-1">{card.email || 'No email provided'}</span>
                )}
              </div>

              {/* Phone Field */}
              <div className="flex items-center bg-white/10 rounded-2xl p-5 border border-white/20">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {isOwner && isEditing ? (
                  <input
                    type="tel"
                    value={editForm?.phone || card.phone || ''}
                    onChange={(e) => setEditForm(prev => prev ? {...prev, phone: e.target.value} : null)}
                    className="text-white font-medium flex-1 bg-transparent border-none focus:outline-none"
                    placeholder="Your phone number"
                  />
                ) : (
                  <span className="text-white font-medium flex-1">{card.phone || 'No phone provided'}</span>
                )}
              </div>

              {/* Website Field */}
              <div className="flex items-center bg-white/10 rounded-2xl p-5 border border-white/20">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                </svg>
                {isOwner && isEditing ? (
                  <input
                    type="url"
                    value={editForm?.website || card.website || ''}
                    onChange={(e) => setEditForm(prev => prev ? {...prev, website: e.target.value} : null)}
                    className="text-white font-medium flex-1 bg-transparent border-none focus:outline-none"
                    placeholder="www.yourwebsite.com"
                  />
                ) : (
                  card.website ? (
                    <a href={card.website.startsWith('http') ? card.website : `https://${card.website}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 font-medium flex-1">
                      {card.website}
                    </a>
                  ) : (
                    <span className="text-gray-400 font-medium flex-1">No website provided</span>
                  )
                )}
              </div>

              {/* LinkedIn Field */}
              <div className="flex items-center bg-white/10 rounded-2xl p-5 border border-white/20">
                <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                {isOwner && isEditing ? (
                  <input
                    type="url"
                    value={editForm?.linkedin || card.linkedin || ''}
                    onChange={(e) => setEditForm(prev => prev ? {...prev, linkedin: e.target.value} : null)}
                    className="text-blue-300 font-medium flex-1 bg-transparent border-none focus:outline-none"
                    placeholder="LinkedIn profile URL"
                  />
                ) : (
                  card.linkedin ? (
                    <a href={card.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 font-medium flex-1">
                      LinkedIn Profile
                    </a>
                  ) : (
                    <span className="text-gray-400 font-medium flex-1">No LinkedIn provided</span>
                  )
                )}
              </div>

              {/* Twitter Field */}
              <div className="flex items-center bg-white/10 rounded-2xl p-5 border border-white/20">
                <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                {isOwner && isEditing ? (
                  <input
                    type="text"
                    value={editForm?.twitter || card.twitter || ''}
                    onChange={(e) => setEditForm(prev => prev ? {...prev, twitter: e.target.value} : null)}
                    className="text-white font-medium flex-1 bg-transparent border-none focus:outline-none"
                    placeholder="@username or full URL"
                  />
                ) : (
                  card.twitter ? (
                    <a href={card.twitter.startsWith('http') ? card.twitter : `https://twitter.com/${card.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 font-medium flex-1">
                      Twitter Profile
                    </a>
                  ) : (
                    <span className="text-gray-400 font-medium flex-1">No Twitter provided</span>
                  )
                )}
              </div>

              {/* Instagram Field */}
              <div className="flex items-center bg-white/10 rounded-2xl p-5 border border-white/20">
                <svg className="w-5 h-5 text-purple-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.928-.796-1.418-1.947-1.418-3.244s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244z"/>
                </svg>
                {isOwner && isEditing ? (
                  <input
                    type="url"
                    value={editForm?.instagram || card.instagram || ''}
                    onChange={(e) => setEditForm(prev => prev ? {...prev, instagram: e.target.value} : null)}
                    className="text-purple-300 font-medium flex-1 bg-transparent border-none focus:outline-none"
                    placeholder="Instagram profile URL"
                  />
                ) : (
                  card.instagram ? (
                    <a href={card.instagram} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 font-medium flex-1">
                      Instagram Profile
                    </a>
                  ) : (
                    <span className="text-gray-400 font-medium flex-1">No Instagram provided</span>
                  )
                )}
              </div>

              {/* TikTok Field */}
              <div className="flex items-center bg-white/10 rounded-2xl p-5 border border-white/20">
                <svg className="w-5 h-5 text-pink-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
                {isOwner && isEditing ? (
                  <input
                    type="text"
                    value={editForm?.tiktok || card.tiktok || ''}
                    onChange={(e) => setEditForm(prev => prev ? {...prev, tiktok: e.target.value} : null)}
                    className="text-pink-300 font-medium flex-1 bg-transparent border-none focus:outline-none"
                    placeholder="@username or full URL"
                  />
                ) : (
                  card.tiktok ? (
                    <a href={card.tiktok.startsWith('http') ? card.tiktok : `https://tiktok.com/@${card.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-pink-300 hover:text-pink-200 font-medium flex-1">
                      TikTok Profile
                    </a>
                  ) : (
                    <span className="text-gray-400 font-medium flex-1">No TikTok provided</span>
                  )
                )}
              </div>

              {/* YouTube Field */}
              <div className="flex items-center bg-white/10 rounded-2xl p-5 border border-white/20">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                {isOwner && isEditing ? (
                  <input
                    type="url"
                    value={editForm?.youtube || card.youtube || ''}
                    onChange={(e) => setEditForm(prev => prev ? {...prev, youtube: e.target.value} : null)}
                    className="text-red-300 font-medium flex-1 bg-transparent border-none focus:outline-none"
                    placeholder="YouTube channel URL"
                  />
                ) : (
                  card.youtube ? (
                    <a href={card.youtube} target="_blank" rel="noopener noreferrer" className="text-red-300 hover:text-red-200 font-medium flex-1">
                      YouTube Channel
                    </a>
                  ) : (
                    <span className="text-gray-400 font-medium flex-1">No YouTube provided</span>
                  )
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <ContactActions card={card as BusinessCardForActions} />
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm font-light tracking-widest uppercase">Drop Card</p>
          </div>
        </div>

        {/* Login Modal */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
} 