import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor() {
    // 兼容 COZE_ 前缀和标准变量名
    const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.COZE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    this.bucketName = process.env.STORAGE_BUCKET || 'uploads';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase 凭证未设置');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    this.ensureBucket();
    this.logger.log(`Upload Service initialized, bucket: ${this.bucketName}`);
  }

  private async ensureBucket(): Promise<void> {
    try {
      const { data: buckets } = await this.supabase.storage.listBuckets();
      const exists = buckets?.some((b) => b.name === this.bucketName);
      if (!exists) {
        await this.supabase.storage.createBucket(this.bucketName, {
          public: true,
        });
        this.logger.log(`Bucket "${this.bucketName}" created`);
      }
    } catch (error: any) {
      this.logger.warn(`Bucket 检查失败: ${error.message}，可能 bucket 已存在`);
    }
  }

  /**
   * 上传文件到 Supabase Storage
   */
  async uploadFile(
    filePath: string,
    fileBuffer: Buffer,
    options?: { contentType?: string },
  ): Promise<{ url: string; key: string }> {
    const fileName = filePath.replace(/^\//, '');
    const contentType = options?.contentType || 'application/octet-stream';

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(fileName, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      this.logger.error(`文件上传失败: ${error.message}`);
      throw error;
    }

    const { data: urlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(fileName);

    this.logger.log(`文件上传成功: ${fileName}`);
    return { url: urlData.publicUrl, key: fileName };
  }

  /**
   * 生成临时访问链接（Supabase Storage 的公共 bucket 不需要签名 URL）
   */
  async generatePresignedUrl(key: string): Promise<{ url: string }> {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(key);

    return { url: data.publicUrl };
  }

  /**
   * 上传图片（兼容 controller 调用）
   */
  async uploadImage(fileBuffer: Buffer, fileName: string): Promise<{ url: string; key: string }> {
    const path = await import('path');
    const ext = path.extname(fileName) || '.jpg';
    const key = `images/${Date.now()}${ext}`;

    return this.uploadFile(key, fileBuffer, {
      contentType: `image/${ext.replace('.', '')}`,
    });
  }
}