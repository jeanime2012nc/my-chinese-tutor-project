import { Module } from '@nestjs/common';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';
import { ErrorQuestionsModule } from '../error-questions/error-questions.module';
import { DiagnosisModule } from '../diagnosis/diagnosis.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [ErrorQuestionsModule, DiagnosisModule, AiModule],
  controllers: [TrainingController],
  providers: [TrainingService],
})
export class TrainingModule {}