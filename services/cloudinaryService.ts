/**
 * Cloudinary Media Service
 * Handles uploading files, screenshots, task attachments, and avatars to Cloudinary
 */

export class CloudinaryService {
  private static isConfigured(): boolean {
    return Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }

  /**
   * Upload an image or document (as base64 data URI or raw buffer)
   */
  static async uploadMedia(
    fileDataUri: string,
    folder: string = "nextone_attachments"
  ): Promise<{ url: string; publicId: string }> {
    if (!this.isConfigured()) {
      // In development or when Cloudinary keys are pending, return dataUri or clean mockup URL
      // If it's a data URI, it works directly in browser <img> and download links!
      return {
        url: fileDataUri.startsWith("data:")
          ? fileDataUri
          : `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80`,
        publicId: `dev_${Date.now()}`,
      };
    }

    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      const timestamp = Math.round(new Date().getTime() / 1000);
      
      // Node crypto signature
      const crypto = await import("crypto");
      const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

      const formData = new FormData();
      formData.append("file", fileDataUri);
      formData.append("api_key", apiKey!);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudinary upload failed: ${errorText}`);
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Cloudinary upload error";
      console.warn(`[CloudinaryService] Falling back to direct URL: ${message}`);
      return {
        url: fileDataUri,
        publicId: `fallback_${Date.now()}`,
      };
    }
  }
}

export default CloudinaryService;
