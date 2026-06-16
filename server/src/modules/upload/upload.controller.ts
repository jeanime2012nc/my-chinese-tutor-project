import { Controller, Post, UseInterceptors, UploadedFile, HttpCode, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    this.logger.log(`上传图片: ${file.originalname}, 大小: ${file.buffer.length}`);

    let content: Buffer;
    if (file.path) {
      const fs = await import('fs/promises');
      content = await fs.readFile(file.path);
    } else if (file.buffer) {
      content = file.buffer;
    } else {
      throw new Error('无法获取文件内容');
    }

    const result = await this.uploadService.uploadImage(content, file.originalname);
    return { code: 200, msg: 'success', data: result };
  }
}