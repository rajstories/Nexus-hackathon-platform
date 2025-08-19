import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { Readable } from 'stream';

// Azure Blob Storage configuration
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'submissions';

export interface UploadResult {
  url: string;
  blobName: string;
  size: number;
}

export class AzureBlobStorageService {
  private blobServiceClient: BlobServiceClient | null = null;
  private containerName: string;

  constructor() {
    this.containerName = AZURE_STORAGE_CONTAINER_NAME;

    if (AZURE_STORAGE_ACCOUNT_NAME && AZURE_STORAGE_ACCOUNT_KEY) {
      const sharedKeyCredential = new StorageSharedKeyCredential(
        AZURE_STORAGE_ACCOUNT_NAME,
        AZURE_STORAGE_ACCOUNT_KEY
      );

      this.blobServiceClient = new BlobServiceClient(
        `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
        sharedKeyCredential
      );
    }
  }

  /**
   * Check if Azure Blob Storage is configured and available
   */
  isConfigured(): boolean {
    return this.blobServiceClient !== null;
  }

  /**
   * Upload file buffer to Azure Blob Storage
   * @param buffer File buffer
   * @param blobName Unique blob name (path)
   * @param contentType MIME type
   * @param contentLength File size in bytes
   * @returns Upload result with public URL
   */
  async uploadFile(
    buffer: Buffer,
    blobName: string,
    contentType: string,
    contentLength: number
  ): Promise<UploadResult> {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob Storage not configured. Please set AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY environment variables.');
    }

    try {
      // Get container client
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);

      // Ensure container exists
      await containerClient.createIfNotExists({
        access: 'blob' // Public read access for blobs
      });

      // Get blob client
      const blobClient = containerClient.getBlockBlobClient(blobName);

      // Upload buffer
      const uploadResponse = await blobClient.uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
        metadata: {
          uploadedAt: new Date().toISOString(),
        }
      });

      if (!uploadResponse.requestId) {
        throw new Error('Upload failed - no request ID received');
      }

      // Return public URL and metadata
      const publicUrl = blobClient.url;

      return {
        url: publicUrl,
        blobName: blobName,
        size: contentLength
      };

    } catch (error) {
      console.error('Azure Blob Storage upload error:', error);
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload file stream to Azure Blob Storage
   * @param stream File stream
   * @param blobName Unique blob name (path)
   * @param contentType MIME type
   * @param contentLength File size in bytes
   * @returns Upload result with public URL
   */
  async uploadStream(
    stream: Readable,
    blobName: string,
    contentType: string,
    contentLength: number
  ): Promise<UploadResult> {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob Storage not configured. Please set AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY environment variables.');
    }

    try {
      // Get container client
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);

      // Ensure container exists
      await containerClient.createIfNotExists({
        access: 'blob' // Public read access for blobs
      });

      // Get blob client
      const blobClient = containerClient.getBlockBlobClient(blobName);

      // Upload stream
      const uploadResponse = await blobClient.uploadStream(
        stream,
        contentLength,
        5, // Max concurrency
        {
          blobHTTPHeaders: {
            blobContentType: contentType,
          },
          metadata: {
            uploadedAt: new Date().toISOString(),
          }
        }
      );

      if (!uploadResponse.requestId) {
        throw new Error('Upload failed - no request ID received');
      }

      // Return public URL and metadata
      const publicUrl = blobClient.url;

      return {
        url: publicUrl,
        blobName: blobName,
        size: contentLength
      };

    } catch (error) {
      console.error('Azure Blob Storage upload error:', error);
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate blob name with structured path
   * @param eventId Event UUID
   * @param teamId Team UUID
   * @param originalFileName Original file name
   * @returns Structured blob name
   */
  generateBlobName(eventId: string, teamId: string, originalFileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${eventId}/${teamId}/${timestamp}-${sanitizedFileName}`;
  }

  /**
   * Validate file type based on MIME type
   * @param mimeType MIME type to validate
   * @returns True if allowed
   */
  isAllowedMimeType(mimeType: string): boolean {
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'video/mp4',
      'application/pdf'
    ];
    return allowedTypes.includes(mimeType.toLowerCase());
  }

  /**
   * Format file size for display
   * @param bytes File size in bytes
   * @returns Formatted size string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const azureBlobStorage = new AzureBlobStorageService();