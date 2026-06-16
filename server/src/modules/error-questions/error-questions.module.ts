import { Module } from '@nestjs/common';
import { ErrorQuestionsController } from './error-questions.controller';
import { ErrorQuestionsService } from './error-questions.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [ErrorQuestionsController],
  providers: [ErrorQuestionsService],
  exports: [ErrorQuestionsService],
})
export class ErrorQuestionsModule {}