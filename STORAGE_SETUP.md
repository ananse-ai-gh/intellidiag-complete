# Supabase Storage Setup Guide

## Quick Setup (Recommended)

Run the automated setup script:

```bash
node scripts/create-storage-bucket.js
```

## Manual Setup

If the automated script doesn't work, follow these steps:

### 1. Create the Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **New bucket**
4. Name: `analysis-outputs`
5. Public: ✅ **Yes** (checked)
6. File size limit: `10 MB`
7. Allowed MIME types: `image/png,image/jpeg,image/jpg`
8. Click **Create bucket**

### 2. Set Up Row Level Security (RLS)

Go to **Storage** → **Policies** and create these policies for the `analysis-outputs` bucket:

#### Policy 1: Allow authenticated users to upload

- **Policy name**: `Allow authenticated users to upload analysis outputs`
- **Operation**: `INSERT`
- **Policy definition**:

```sql
auth.role() = 'authenticated'
```

#### Policy 2: Allow authenticated users to view

- **Policy name**: `Allow authenticated users to view analysis outputs`
- **Operation**: `SELECT`
- **Policy definition**:

```sql
auth.role() = 'authenticated'
```

#### Policy 3: Allow users to update own files

- **Policy name**: `Allow users to update own analysis outputs`
- **Operation**: `UPDATE`
- **Policy definition**:

```sql
auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 4: Allow users to delete own files

- **Policy name**: `Allow users to delete own analysis outputs`
- **Operation**: `DELETE`
- **Policy definition**:

```sql
auth.uid()::text = (storage.foldername(name))[1]
```

### 3. File Structure

The system will organize files as:

```
analysis-outputs/
├── {userId}/
│   ├── {analysisType}/
│   │   ├── {scanId}/
│   │   │   ├── {imageIndex}/
│   │   │   │   ├── combined_image.png
│   │   │   │   ├── ct_to_mri.png
│   │   │   │   ├── mri_to_ct.png
│   │   │   │   └── converted_image.png
```

### 4. Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Verification

After setup, test by running an analysis. Check the Supabase Storage bucket to see if images are being uploaded correctly.

## Troubleshooting

### Bucket not found error

- Ensure the bucket name is exactly `analysis-outputs`
- Check that the bucket is public
- Verify RLS policies are set correctly

### Permission denied errors

- Check that RLS policies allow the current user
- Verify the user is authenticated
- Ensure the file path structure matches the policy expectations

### Upload failures

- Check file size limits (max 10MB)
- Verify MIME type restrictions
- Ensure the service role key has proper permissions
