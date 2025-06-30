import { supabase } from '@/utils/supabaseClient';
import React from 'react';
import ContactActions from './ContactActions';

async function getUserPrimaryCard(userId: string) {
  // Query Supabase for the user's primary business card
  const { data, error } = await supabase
    .from('business_cards')
    .select('*')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .single();
  return { data, error };
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: card, error } = await getUserPrimaryCard(id);

  // Debug output
  console.log('ProfilePage debug:', { id, card, error });

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 font-sans">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
            <span className="material-icons text-white text-4xl">person_off</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Profile Not Found</h1>
          <p className="text-gray-300 font-light">We couldn&apos;t find a user with that profile.</p>
        </div>
      </div>
    );
  }

  // Get field visibility settings
  const fieldVisibility = card.field_visibility || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-md">
        {/* Main Profile Card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-indigo-600/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-slate-400/10 to-purple-600/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          {/* Profile Header */}
          <div className="relative z-10 text-center mb-8">
            <div className="relative inline-block mb-6">
              {card.avatar_url ? (
                <img
                  src={card.avatar_url}
                  alt={card.name || card.email}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white/20 shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border-4 border-white/20 shadow-xl flex items-center justify-center">
                  <span className="material-icons text-white text-4xl">person</span>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight leading-tight">{card.name || 'No Name'}</h1>
            {fieldVisibility.title && card.title && (
              <p className="text-purple-200 font-medium text-lg mb-1">{card.title}</p>
            )}
            {fieldVisibility.company && card.company && (
              <p className="text-gray-400 text-sm font-light tracking-wide">{card.company}</p>
            )}
          </div>

          {/* Bio Section */}
          {fieldVisibility.bio && card.bio && (
            <div className="mb-8 relative z-10">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <p className="text-gray-300 text-center italic leading-relaxed font-light text-base">{card.bio}</p>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-3 mb-8 relative z-10">
            <h2 className="text-xl font-semibold text-white mb-5 flex items-center tracking-tight">
              <span className="material-icons mr-3 text-purple-300">contact_mail</span>
              Contact Information
            </h2>
            
            <div className="space-y-3">
              {fieldVisibility.email && card.email && (
                <div className="flex items-center bg-black/20 md:bg-white/10 backdrop-blur-md md:backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/20 md:border-white/20 hover:bg-black/30 md:hover:bg-white/15 transition-all duration-300 md:duration-500 group">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-purple-500/25">
                    <span className="material-icons text-white text-lg md:text-xl">email</span>
                  </div>
                  <div className="flex-1 md:block hidden">
                    <span className="text-white/90 text-sm font-medium block mb-1">Email</span>
                    <span className="text-white font-semibold text-base tracking-wide">{card.email}</span>
                  </div>
                  <span className="text-white font-medium tracking-wide md:hidden">{card.email}</span>
                </div>
              )}

              {fieldVisibility.phone && card.phone && (
                <div className="flex items-center bg-black/20 md:bg-white/10 backdrop-blur-md md:backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/20 md:border-white/20 hover:bg-black/30 md:hover:bg-white/15 transition-all duration-300 md:duration-500 group">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 rounded-xl md:rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-emerald-500/25">
                    <span className="material-icons text-white text-lg md:text-xl">phone</span>
                  </div>
                  <div className="flex-1 md:block hidden">
                    <span className="text-white/90 text-sm font-medium block mb-1">Phone</span>
                    <span className="text-white font-semibold text-base tracking-wide">{card.phone}</span>
                  </div>
                  <span className="text-white font-medium tracking-wide md:hidden">{card.phone}</span>
                </div>
              )}

              {fieldVisibility.website && card.website && (
                <div className="flex items-center bg-black/20 md:bg-white/10 backdrop-blur-md md:backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/20 md:border-white/20 hover:bg-black/30 md:hover:bg-white/15 transition-all duration-300 md:duration-500 group">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-slate-500 via-slate-600 to-gray-600 rounded-xl md:rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-slate-500/25">
                    <span className="material-icons text-white text-lg md:text-xl">language</span>
                  </div>
                  <div className="flex-1 md:block hidden">
                    <span className="text-white/90 text-sm font-medium block mb-1">Website</span>
                    <span className="text-white font-semibold text-base tracking-wide">{card.website}</span>
                  </div>
                  <span className="text-white font-medium tracking-wide md:hidden">{card.website}</span>
                </div>
              )}

              {fieldVisibility.linkedin && card.linkedin && (
                <div className="flex items-center bg-black/20 md:bg-white/10 backdrop-blur-md md:backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/20 md:border-white/20 hover:bg-black/30 md:hover:bg-white/15 transition-all duration-300 md:duration-500 group">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl md:rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-500/25">
                    <span className="material-icons text-white text-lg md:text-xl">work</span>
                  </div>
                  <div className="flex-1 md:block hidden">
                    <span className="text-white/90 text-sm font-medium block mb-1">LinkedIn</span>
                    <a href={card.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 font-semibold text-base tracking-wide transition-colors">
                      LinkedIn Profile
                    </a>
                  </div>
                  <a href={card.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 font-medium tracking-wide transition-colors md:text-blue-300 md:hover:text-blue-200">
                    LinkedIn Profile
                  </a>
                </div>
              )}

              {fieldVisibility.twitter && card.twitter && (
                <div className="flex items-center bg-black/20 md:bg-white/10 backdrop-blur-md md:backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/20 md:border-white/20 hover:bg-black/30 md:hover:bg-white/15 transition-all duration-300 md:duration-500 group">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-slate-400 via-slate-500 to-gray-500 rounded-xl md:rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-slate-500/25">
                    <span className="material-icons text-white text-lg md:text-xl">alternate_email</span>
                  </div>
                  <div className="flex-1 md:block hidden">
                    <span className="text-white/90 text-sm font-medium block mb-1">Twitter</span>
                    <a href={card.twitter.startsWith('http') ? card.twitter : `https://twitter.com/${card.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 font-semibold text-base tracking-wide transition-colors">
                      Twitter Profile
                    </a>
                  </div>
                  <a href={card.twitter.startsWith('http') ? card.twitter : `https://twitter.com/${card.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 font-medium tracking-wide transition-colors md:hover:text-gray-200">
                    Twitter Profile
                  </a>
                </div>
              )}

              {fieldVisibility.tiktok && card.tiktok && (
                <div className="flex items-center bg-black/20 md:bg-white/10 backdrop-blur-md md:backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/20 md:border-white/20 hover:bg-black/30 md:hover:bg-white/15 transition-all duration-300 md:duration-500 group">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 rounded-xl md:rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-pink-500/25">
                    <span className="material-icons text-white text-lg md:text-xl">music_note</span>
                  </div>
                  <div className="flex-1 md:block hidden">
                    <span className="text-white/90 text-sm font-medium block mb-1">TikTok</span>
                    <a href={card.tiktok.startsWith('http') ? card.tiktok : `https://tiktok.com/@${card.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-pink-300 hover:text-pink-200 font-semibold text-base tracking-wide transition-colors">
                      TikTok Profile
                    </a>
                  </div>
                  <a href={card.tiktok.startsWith('http') ? card.tiktok : `https://tiktok.com/@${card.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 font-medium tracking-wide transition-colors md:text-pink-300 md:hover:text-pink-200">
                    TikTok Profile
                  </a>
                </div>
              )}

              {fieldVisibility.youtube && card.youtube && (
                <div className="flex items-center bg-black/20 md:bg-white/10 backdrop-blur-md md:backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/20 md:border-white/20 hover:bg-black/30 md:hover:bg-white/15 transition-all duration-300 md:duration-500 group">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-red-500 via-red-600 to-red-600 rounded-xl md:rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-red-500/25">
                    <span className="material-icons text-white text-lg md:text-xl">play_circle</span>
                  </div>
                  <div className="flex-1 md:block hidden">
                    <span className="text-white/90 text-sm font-medium block mb-1">YouTube</span>
                    <a href={card.youtube.startsWith('http') ? card.youtube : `https://youtube.com/@${card.youtube}`} target="_blank" rel="noopener noreferrer" className="text-red-300 hover:text-red-200 font-semibold text-base tracking-wide transition-colors">
                      YouTube Channel
                    </a>
                  </div>
                  <a href={card.youtube.startsWith('http') ? card.youtube : `https://youtube.com/@${card.youtube}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 font-medium tracking-wide transition-colors md:text-red-300 md:hover:text-red-200">
                    YouTube Channel
                  </a>
                </div>
              )}

              {fieldVisibility.instagram && card.instagram && (
                <div className="flex items-center bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-black/30 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <span className="material-icons text-white text-lg">camera_alt</span>
                  </div>
                  <a href={card.instagram} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 flex-1 transition-colors font-medium tracking-wide">
                    Instagram Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <ContactActions card={card} />
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm font-light tracking-widest uppercase">Drop Card</p>
        </div>
      </div>
    </div>
  );
} 