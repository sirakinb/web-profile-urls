'use client';

import React from 'react';

interface BusinessCard {
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
}

interface ContactActionsProps {
  card: BusinessCard;
}

export default function ContactActions({ card }: ContactActionsProps) {
  const handleSaveContact = (card: BusinessCard) => {
    // Check if device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && 'share' in navigator) {
      // Try to use native contact app on mobile
      const contactData = generateVCard(card);
      const blob = new Blob([contactData], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link to download the vCard
      const link = document.createElement('a');
      link.href = url;
      link.download = `${card.name || 'contact'}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Desktop fallback - download vCard file
      const contactData = generateVCard(card);
      const blob = new Blob([contactData], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${card.name || 'contact'}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleShare = async (card: BusinessCard) => {
    const shareData = {
      title: `${card.name}'s Contact`,
      text: `Check out ${card.name}'s profile`,
      url: window.location.href,
    };

    if (navigator.share) {
      // Use native sharing on mobile
      try {
        await navigator.share(shareData);
      } catch {
        console.log('Share cancelled or failed');
      }
    } else {
      // Desktop fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Profile link copied to clipboard!');
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Profile link copied to clipboard!');
      }
    }
  };

  const generateVCard = (card: BusinessCard): string => {
    let vcard = 'BEGIN:VCARD\n';
    vcard += 'VERSION:3.0\n';
    
    // Add structured name (N) and formatted name (FN)
    const fullName = card.name || '';
    const nameParts = fullName.split(' ');
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : fullName;
    
    vcard += `N:${lastName};${firstName};;;\n`;
    vcard += `FN:${fullName}\n`;
    
    if (card.title && card.company) {
      vcard += `ORG:${card.company}\n`;
      vcard += `TITLE:${card.title}\n`;
    } else if (card.company) {
      vcard += `ORG:${card.company}\n`;
    } else if (card.title) {
      vcard += `TITLE:${card.title}\n`;
    }
    
    if (card.email) {
      vcard += `EMAIL:${card.email}\n`;
    }
    
    if (card.phone) {
      vcard += `TEL:${card.phone}\n`;
    }
    
    if (card.website) {
      vcard += `URL:${card.website}\n`;
    }
    
    // Add social media as notes or URLs
    const socialLinks = [];
    if (card.linkedin) {
      const linkedinUrl = card.linkedin.startsWith('http') ? card.linkedin : `https://linkedin.com/in/${card.linkedin}`;
      socialLinks.push(`LinkedIn: ${linkedinUrl}`);
    }
    if (card.twitter) {
      const twitterUrl = card.twitter.startsWith('http') ? card.twitter : `https://twitter.com/${card.twitter.replace('@', '')}`;
      socialLinks.push(`Twitter: ${twitterUrl}`);
    }
    if (card.instagram) {
      socialLinks.push(`Instagram: ${card.instagram}`);
    }
    if (card.tiktok) {
      const tiktokUrl = card.tiktok.startsWith('http') ? card.tiktok : `https://tiktok.com/@${card.tiktok.replace('@', '')}`;
      socialLinks.push(`TikTok: ${tiktokUrl}`);
    }
    if (card.youtube) {
      const youtubeUrl = card.youtube.startsWith('http') ? card.youtube : `https://youtube.com/@${card.youtube}`;
      socialLinks.push(`YouTube: ${youtubeUrl}`);
    }
    
    if (socialLinks.length > 0) {
      vcard += `NOTE:${socialLinks.join('\\n')}\n`;
    }
    
    vcard += 'END:VCARD\n';
    return vcard;
  };

  return (
    <div className="flex gap-4 relative z-10">
      <button 
        onClick={() => handleSaveContact(card)}
        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-semibold flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 tracking-wide"
      >
        <span className="material-icons mr-2">download</span> 
        Save Contact
      </button>
      <button 
        onClick={() => handleShare(card)}
        className="flex-1 bg-black/20 md:bg-white/10 hover:bg-black/30 md:hover:bg-white/15 backdrop-blur-md md:backdrop-blur-sm text-white py-4 rounded-xl md:rounded-2xl font-semibold flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-white/30 tracking-wide"
      >
        <span className="material-icons mr-2">share</span> 
        Share
      </button>
    </div>
  );
} 