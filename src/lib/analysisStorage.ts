import { createServerSupabaseClient } from './supabase';

export interface AnalysisImageStorage {
    uploadOutputImage(
        userId: string,
        scanId: string,
        analysisType: string,
        imageIndex: number,
        imageData: string, // base64 string
        imageType: 'combined_image' | 'ct_to_mri' | 'mri_to_ct' | 'converted_image'
    ): Promise<string | null>;

    getOutputImageUrl(
        userId: string,
        scanId: string,
        analysisType: string,
        imageIndex: number,
        imageType: 'combined_image' | 'ct_to_mri' | 'mri_to_ct' | 'converted_image'
    ): Promise<string | null>;

    deleteOutputImages(
        userId: string,
        scanId: string,
        analysisType: string,
        imageIndex: number
    ): Promise<void>;
}

class SupabaseAnalysisStorage implements AnalysisImageStorage {
    private supabase = createServerSupabaseClient();
    private bucketName = 'analysis-outputs';

    /**
     * Generate a structured file path for analysis output images
     * Structure: analysis-outputs/{userId}/{analysisType}/{scanId}/{imageIndex}/{imageType}.png
     */
    private generateFilePath(
        userId: string,
        scanId: string,
        analysisType: string,
        imageIndex: number,
        imageType: string
    ): string {
        // Sanitize inputs to ensure valid file paths
        const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-]/g, '');
        const sanitizedScanId = scanId.replace(/[^a-zA-Z0-9-]/g, '');
        const sanitizedAnalysisType = analysisType.replace(/[^a-zA-Z0-9_]/g, '');
        const sanitizedImageType = imageType.replace(/[^a-zA-Z0-9_]/g, '');

        return `${sanitizedUserId}/${sanitizedAnalysisType}/${sanitizedScanId}/${imageIndex}/${sanitizedImageType}.png`;
    }

    async uploadOutputImage(
        userId: string,
        scanId: string,
        analysisType: string,
        imageIndex: number,
        imageData: string,
        imageType: 'combined_image' | 'ct_to_mri' | 'mri_to_ct' | 'converted_image'
    ): Promise<string | null> {
        try {
            // Convert base64 to buffer
            const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            // Generate file path
            const filePath = this.generateFilePath(userId, scanId, analysisType, imageIndex, imageType);

            console.log(`📤 Uploading analysis output image to: ${filePath}`);

            // Upload to Supabase Storage
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(filePath, buffer, {
                    contentType: 'image/png',
                    upsert: true, // Overwrite if exists
                    cacheControl: '3600' // Cache for 1 hour
                });

            if (error) {
                console.error('❌ Error uploading analysis output image:', error);
                return null;
            }

            console.log(`✅ Analysis output image uploaded successfully: ${data.path}`);

            // Generate public URL
            const { data: urlData } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);

            return urlData.publicUrl;

        } catch (error) {
            console.error('❌ Error in uploadOutputImage:', error);
            return null;
        }
    }

    async getOutputImageUrl(
        userId: string,
        scanId: string,
        analysisType: string,
        imageIndex: number,
        imageType: 'combined_image' | 'ct_to_mri' | 'mri_to_ct' | 'converted_image'
    ): Promise<string | null> {
        try {
            const filePath = this.generateFilePath(userId, scanId, analysisType, imageIndex, imageType);
            console.log(`🔍 Getting URL for file: ${filePath}`);

            // Generate public URL directly (since bucket is public)
            const { data: urlData } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);

            if (!urlData?.publicUrl) {
                console.log(`⚠️ No public URL generated for ${filePath}`);
                return null;
            }

            console.log(`✅ Generated public URL: ${urlData.publicUrl}`);
            return urlData.publicUrl;

        } catch (error) {
            console.error('❌ Error in getOutputImageUrl:', error);
            return null;
        }
    }

    async deleteOutputImages(
        userId: string,
        scanId: string,
        analysisType: string,
        imageIndex: number
    ): Promise<void> {
        try {
            const basePath = `${userId.replace(/[^a-zA-Z0-9-]/g, '')}/${analysisType.replace(/[^a-zA-Z0-9_]/g, '')}/${scanId.replace(/[^a-zA-Z0-9-]/g, '')}/${imageIndex}`;

            // List all files in the directory
            const { data: files, error: listError } = await this.supabase.storage
                .from(this.bucketName)
                .list(basePath);

            if (listError || !files) {
                console.warn('⚠️ Could not list files for deletion:', listError);
                return;
            }

            // Delete all files in the directory
            const filePaths = files.map((file: { name: string }) => `${basePath}/${file.name}`);

            if (filePaths.length > 0) {
                const { error: deleteError } = await this.supabase.storage
                    .from(this.bucketName)
                    .remove(filePaths);

                if (deleteError) {
                    console.error('❌ Error deleting analysis output images:', deleteError);
                } else {
                    console.log(`✅ Deleted ${filePaths.length} analysis output images`);
                }
            }

        } catch (error) {
            console.error('❌ Error in deleteOutputImages:', error);
        }
    }
}

// Export singleton instance
export const analysisStorage = new SupabaseAnalysisStorage();
