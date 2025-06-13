/**
 * Cloudflare R2 Service
 * 
 * This service handles file uploads and deletions using Cloudflare R2 storage.
 * R2 is S3-compatible, so we use the AWS SDK for S3.
 * 
 * @author Auto-generated
 * @date 2025-06-10
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import config from '../config/index.js';
import { ApiError } from '../middlewares/error.middleware.js';

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto', // Cloudflare R2 uses 'auto' as region
  endpoint: config.cloudflareR2.endpoint,
  credentials: {
    accessKeyId: config.cloudflareR2.accessKeyId,
    secretAccessKey: config.cloudflareR2.secretAccessKey,
  },
});

/**
 * Upload file to Cloudflare R2
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name
 * @param {string} contentType - File content type
 * @param {string} folder - Folder path (optional)
 * @returns {string} Public URL of uploaded file
 */
export const uploadToR2 = async (fileBuffer, fileName, contentType, folder = 'avatars') => {
  try {
    const key = folder ? `${folder}/${fileName}` : fileName;
    
    const command = new PutObjectCommand({
      Bucket: config.cloudflareR2.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      // Make the object publicly readable
      ACL: 'public-read',
    });

    await s3Client.send(command);
    
    // Return the public URL
    const publicUrl = `${config.cloudflareR2.publicUrl}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new ApiError('Failed to upload file to cloud storage', 500);
  }
};

/**
 * Delete file from Cloudflare R2
 * @param {string} fileUrl - Full URL of the file to delete
 * @returns {boolean} Success status
 */
export const deleteFromR2 = async (fileUrl) => {
  try {
    // Extract the key from the full URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash
    
    const command = new DeleteObjectCommand({
      Bucket: config.cloudflareR2.bucketName,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting from R2:', error);
    // Don't throw error for delete operations, just log it
    return false;
  }
};

/**
 * Generate unique filename
 * @param {string} userId - User ID
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
export const generateUniqueFileName = (userId, originalName) => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `${userId}-${timestamp}.${extension}`;
};

const cloudflareR2Service = {
  uploadToR2,
  deleteFromR2,
  generateUniqueFileName,
};

export default cloudflareR2Service;