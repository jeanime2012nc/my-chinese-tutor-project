import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { DatabaseModule } from '@/storage/database/database.module';
import { AiModule } from '@/modules/ai/ai.module';
import { ErrorQuestionsModule } from '@/modules/error-questions/error-questions.module';
import { DiagnosisModule } from '@/modules/diagnosis/diagnosis.module';
import { TrainingModule } from '@/modules/training/training.module';
import { UploadModule } from '@/modules/upload/upload.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'dist-web'),
      exclude: ['/api/(.*)'],
      serveStaticOptions: {
        extensions: ['html'],
      },
    }),
    DatabaseModule,
    AiModule,
    ErrorQuestionsModule,
    DiagnosisModule,
    TrainingModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}