import { SupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export class ImageHandler {
  private supabase: SupabaseClient;
  private readonly THUMBNAIL_WIDTH = 400;
  private readonly IMAGE_BUCKET = 'article-images';

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async processImage(imageUrl: string): Promise<{
    thumbnailUrl: string;
    imageUrl: string;
  }> {
    try {
      // 1. 画像のダウンロード
      const response = await fetch(imageUrl);
      const imageBuffer = await response.arrayBuffer();

      // 2. サムネイルの生成
      const thumbnail = await sharp(Buffer.from(imageBuffer))
        .resize(this.THUMBNAIL_WIDTH, null, {
          fit: 'contain',
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toBuffer();

      // 3. オリジナル画像の最適化
      const optimizedImage = await sharp(Buffer.from(imageBuffer))
        .webp({ quality: 85 })
        .toBuffer();

      // 4. ファイル名の生成
      const timestamp = Date.now();
      const originalFileName = `original_${timestamp}.webp`;
      const thumbnailFileName = `thumbnail_${timestamp}.webp`;

      // 5. Supabase Storageへのアップロード
      const [originalUpload, thumbnailUpload] = await Promise.all([
        this.supabase.storage
          .from(this.IMAGE_BUCKET)
          .upload(originalFileName, optimizedImage, {
            contentType: 'image/webp',
            cacheControl: '3600'
          }),
        this.supabase.storage
          .from(this.IMAGE_BUCKET)
          .upload(thumbnailFileName, thumbnail, {
            contentType: 'image/webp',
            cacheControl: '3600'
          })
      ]);

      if (originalUpload.error) throw originalUpload.error;
      if (thumbnailUpload.error) throw thumbnailUpload.error;

      // 6. 公開URLの取得
      const { data: { publicUrl: imageUrl } } = this.supabase.storage
        .from(this.IMAGE_BUCKET)
        .getPublicUrl(originalFileName);

      const { data: { publicUrl: thumbnailUrl } } = this.supabase.storage
        .from(this.IMAGE_BUCKET)
        .getPublicUrl(thumbnailFileName);

      return { thumbnailUrl, imageUrl };
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }
} 