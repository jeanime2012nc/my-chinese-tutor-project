import { Injectable, Logger } from '@nestjs/common';
import { S3Storage } from 'coze-coding-dev-sdk';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private storage: S3Storage;

  constructor() {
    this.storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });
  }

  async uploadImage(buffer: Buffer, originalName: string): Promise<{ key: string; url: string }> {
    const ext = originalName.split('.').pop() || 'png';
    const fileName = `chinese-tutor/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const fileKey = await this.storage.uploadFile({
      fileContent: buffer,
      fileName,
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    });

    this.logger.log(`图片上传成功: ${fileKey}`);

    const url = await this.storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 86400, // 1天有效期
    });

    return { key: fileKey, url };
  }
}