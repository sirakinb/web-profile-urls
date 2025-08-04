import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, userId, updates } = body;

    // Validate required fields
    if (!profileId || !userId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields: profileId, userId, or updates' },
        { status: 400 }
      );
    }

    // First, verify that the user owns this profile
    const { data: profile, error: fetchError } = await supabase
      .from('business_cards')
      .select('user_id')
      .eq('id', profileId)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (profile.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only update your own profile' },
        { status: 403 }
      );
    }

    // Update the profile
    const { data, error: updateError } = await supabase
      .from('business_cards')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}