#!/bin/bash

# Setup Supabase Storage bucket for analysis output images
# Run this script to create the analysis-outputs bucket with proper policies

echo "🚀 Setting up Supabase Storage for analysis output images..."

# Create the analysis-outputs bucket
echo "📦 Creating analysis-outputs bucket..."
supabase storage create-bucket analysis-outputs --public

# Set bucket policies
echo "🔒 Setting up bucket policies..."

# Allow authenticated users to upload analysis output images
supabase storage policy create "Allow authenticated users to upload analysis outputs" \
  --bucket analysis-outputs \
  --operation insert \
  --policy "auth.role() = 'authenticated'"

# Allow authenticated users to view analysis output images
supabase storage policy create "Allow authenticated users to view analysis outputs" \
  --bucket analysis-outputs \
  --operation select \
  --policy "auth.role() = 'authenticated'"

# Allow users to update their own analysis output images
supabase storage policy create "Allow users to update own analysis outputs" \
  --bucket analysis-outputs \
  --operation update \
  --policy "auth.uid()::text = (storage.foldername(name))[1]"

# Allow users to delete their own analysis output images
supabase storage policy create "Allow users to delete own analysis outputs" \
  --bucket analysis-outputs \
  --operation delete \
  --policy "auth.uid()::text = (storage.foldername(name))[1]"

echo "✅ Supabase Storage setup complete!"
echo ""
echo "📁 File structure will be:"
echo "   analysis-outputs/{userId}/{analysisType}/{scanId}/{imageIndex}/{imageType}.png"
echo ""
echo "🔐 Security:"
echo "   - Only authenticated users can upload/view images"
echo "   - Users can only modify their own analysis outputs"
echo "   - Images are organized by user ID for proper access control"
