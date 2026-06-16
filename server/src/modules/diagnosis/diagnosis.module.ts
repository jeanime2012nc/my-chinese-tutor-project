import { Module } from '@nestjs/common';
import { DiagnosisController } from './diagnosis.controller';
import { DiagnosisService } from './diagnosis.service';
import { ErrorQuestionsModule } from '../error-questions/error-questions.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [ErrorQuestionsModule, AiModule],
  controllers: [DiagnosisController],
  providers: [DiagnosisService],
  exports: [DiagnosisService],
})
export class DiagnosisModule {}