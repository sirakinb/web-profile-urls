import { supabase } from '@/utils/supabaseClient';
import React from 'react';
import ContactActions from './ContactActions';
import ProfileImageUpload from './ProfileImageUpload';

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

async function getUserPrimaryCard(userId: string) {
  try {
    const { data, error } = await supabase
      .from('public_business_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single();
    return { data, error };
  } catch (error) {
    console.error('Error in getUserPrimaryCard:', error);
    return { data: null, error: error as Error };
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data: card, error } = await getUserPrimaryCard(id);

    if (error || !card) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Profile Not Found</h1>
            <p className="text-gray-300">We couldn&apos;t find a user with that profile.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/10">
            {/* Profile Header */}
            <div className="text-center mb-8">
              <ProfileImageUpload
                avatarUrl={card.avatar_url}
                userName={card.name || card.email}
              />
              <h1 className="text-3xl font-bold text-white mb-2">{card.name || 'No Name'}</h1>
              {card.title && (
                <p className="text-purple-200 font-medium text-lg mb-1">{card.title}</p>
              )}
              {card.company && (
                <p className="text-gray-400 text-sm">{card.company}</p>
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
              
              {card.email && (
                <div className="flex items-center bg-white/10 rounded-2xl p-5 border border-white/20">
                  <span className="text-white font-medium flex-1">{card.email}</span>
                </div>
              )}

              {card.phone && (
                <div className="flex items-center bg-white/10 rounded-2xl p-5 border border-white/20">
                  <span className="text-white font-medium flex-1">{card.phone}</span>
                </div>
              )}

              {card.website && (
                <div className="flex items-center bg-white/10 rounded-2xl p-5 border border-white/20">
                  <a href={card.website.startsWith('http') ? card.website : `https://${card.website}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 font-medium flex-1">
                    {card.website}
                  </a>
                </div>
              )}

              {card.linkedin && (
                <div className="flex items-center bg-white/10 rounded-2xl p-5 border border-white/20">
                  <a href={card.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 font-medium flex-1">
                    LinkedIn Profile
                  </a>
                </div>
              )}

              {card.twitter && (
                <div className="flex items-center bg-white/10 rounded-2xl p-5 border border-white/20">
                  <a href={card.twitter.startsWith('http') ? card.twitter : `https://twitter.com/${card.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 font-medium flex-1">
                    Twitter Profile
                  </a>
                </div>
              )}

              {card.instagram && (
                <div className="flex items-center bg-white/10 rounded-2xl p-5 border border-white/20">
                  <a href={card.instagram} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 font-medium flex-1">
                    Instagram Profile
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <ContactActions card={card as BusinessCardForActions} />
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">Drop Card</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in ProfilePage:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Something Went Wrong</h1>
          <p className="text-gray-300">We encountered an error loading this profile.</p>
        </div>
      </div>
    );
  }
} 