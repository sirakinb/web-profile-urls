# Profile Image Setup with Supabase Storage

This guide explains how to set up profile image uploads that work across both mobile app and web.

## 1. Supabase Storage Setup

### Create Storage Bucket
1. Go to your Supabase dashboard
2. Navigate to Storage
3. Create a new bucket called `profile-avatars`
4. Set it to public (if you want images to be publicly accessible)

### Storage Policies
Add these RLS policies to your `profile-avatars` bucket:

```sql
-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to profile images
CREATE POLICY "Public read access to profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-avatars');

-- Allow users to update their own images
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 2. Mobile App Integration

### Option A: Use the API Endpoint
Your mobile app can upload images using the API endpoint:

```javascript
// Example mobile app code (React Native)
const uploadProfileImage = async (imageUri, userId) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'profile.jpg'
  });
  formData.append('userId', userId);

  try {
    const response = await fetch('https://your-domain.com/api/profile/upload-avatar', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    if (result.success) {
      console.log('Image uploaded:', result.avatar_url);
      // Update local state with new avatar URL
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Option B: Direct Supabase Integration
Alternatively, upload directly from mobile app:

```javascript
// Direct Supabase upload from mobile app
import { supabase } from '@supabase/supabase-js';

const uploadProfileImage = async (imageUri, userId) => {
  try {
    // Convert image to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Create filename
    const fileName = `${userId}-${Date.now()}.jpg`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-avatars')
      .upload(fileName, blob);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-avatars')
      .getPublicUrl(fileName);

    // Update database
    const { error: updateError } = await supabase
      .from('public_business_cards')
      .update({ avatar_url: publicUrl })
      .eq('user_id', userId)
      .eq('is_primary', true);

    if (updateError) throw updateError;

    return publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
};
```

## 3. Web App

The web app is already configured to handle HTTP/HTTPS URLs. No changes needed!

## 4. Environment Variables

Make sure you have these environment variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 5. Testing

1. Upload an image from your mobile app
2. Check that the `avatar_url` in the database is now a public HTTPS URL
3. Visit the profile page - the image should now display!

## Benefits of This Approach

✅ **Cross-platform compatibility** - Works on web and mobile  
✅ **Scalable** - Supabase handles storage and CDN  
✅ **Secure** - Proper RLS policies  
✅ **Fast** - Images served from CDN  
✅ **Cost-effective** - Supabase storage is affordable  

## Troubleshooting

- **Images not showing**: Check that the bucket is public or RLS policies allow read access
- **Upload fails**: Verify your Supabase credentials and storage permissions
- **CORS issues**: Make sure your Supabase project allows requests from your domains 