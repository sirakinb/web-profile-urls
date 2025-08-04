import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Upload profile image to Supabase Storage
const uploadProfileImage = async (file: File, userId: string): Promise<string | null> => {
  try {
    if (!supabaseServiceKey) {
      console.error('Service role key not configured');
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('profile-avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const formData = await request.formData();
  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;

  console.log('Upload avatar request:', { userId, fileName: file?.name });

  if (!file || !userId) {
    return NextResponse.json(
      { error: 'File and userId are required' },
      { status: 400 }
    );
  }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Verify the user has a primary profile in our database
    console.log('Looking for primary profile with user_id:', userId);
    
    const { data: profile, error: profileError } = await supabase
      .from('business_cards')
      .select('id, user_id, is_primary')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single();

    console.log('Primary profile query result:', { profile, profileError });

    if (profileError || !profile) {
      console.error('Primary profile not found for user_id:', userId, 'Error:', profileError);
      return NextResponse.json(
        { error: 'Primary profile not found' },
        { status: 404 }
      );
    }

    // Upload image to Supabase Storage
    const publicUrl = await uploadProfileImage(file, userId);

    if (!publicUrl) {
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Update the user's profile in the database
    const { error: updateError } = await supabase
      .from('business_cards')
      .update({ avatar_url: publicUrl })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatar_url: publicUrl
    });

  } catch (error) {
    console.error('Error in upload-avatar route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 