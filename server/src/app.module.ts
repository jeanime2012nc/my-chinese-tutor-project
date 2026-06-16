import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { DatabaseModule } from '@/storage/database/database.module';
import { AiModule } from '@/modules/ai/ai.module';
import { ErrorQuestionsModule } from '@/modules/error-questions/error-questions.module';
import { DiagnosisModule } from '@/modules/diagnosis/diagnosis.module';
import { TrainingModule } from '@/modules/training/training.module';

@Module({
  imports: [
    DatabaseModule,
    AiModule,
    ErrorQuestionsModule,
    DiagnosisModule,
    TrainingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}