import { Controller, Post, Get, Param, Body, HttpCode, Logger } from '@nestjs/common';
import { ErrorQuestionsService } from './error-questions.service';
import { AiService } from '../ai/ai.service';

@Controller('error-questions')
export class ErrorQuestionsController {
  private readonly logger = new Logger(ErrorQuestionsController.name);

  constructor(
    private readonly errorQuestionsService: ErrorQuestionsService,
    private readonly aiService: AiService,
  ) {}

  /**
   * 对话式批改：支持文字+图片提交
   */
  @Post('chat')
  @HttpCode(200)
  async chatGrade(@Body() body: {
    message: string;
    imageUrl?: string;
    history?: Array<{ role: string; content: string }>;
  }) {
    this.logger.log(`对话批改: ${body.message.substring(0, 40)}...`);

    const result = await this.aiService.chatGrade({
      message: body.message,
      imageUrl: body.imageUrl,
      history: body.history,
    });

    // 如果 AI 识别出是批改场景且有结构化数据，保存错题记录
    let savedQuestion = null;
    if (result.grading) {
      try {
        savedQuestion = await this.errorQuestionsService.createQuestion({
          student_name: '用户',
          subject: '语文',
          question_text: body.message,
          student_answer: '（对话式提交，详见上下文）',
          correct_answer: result.grading.correctAnswer,
          step_by_step: result.grading.stepByStep,
          is_correct: result.grading.isCorrect,
          error_type: result.grading.errorType,
          error_detail: result.grading.errorDetail,
          trap_analysis: result.grading.trapAnalysis,
          knowledge_points: result.grading.knowledgePoints,
          weakness_level: result.grading.weaknessLevel,
        });
      } catch (err: any) {
        this.logger.warn(`保存错题记录失败（不影响对话）: ${err.message}`);
      }
    }

    return {
      code: 200,
      msg: 'success',
      data: {
        reply: result.reply,
        grading: result.grading,
        savedQuestion,
      },
    };
  }

  @Get('list')
  @HttpCode(200)
  async listQuestions() {
    const questions = await this.errorQuestionsService.getAllQuestions();
    return { code: 200, msg: 'success', data: questions };
  }

  @Get(':id')
  @HttpCode(200)
  async getQuestion(@Param('id') id: string) {
    const question = await this.errorQuestionsService.getQuestionById(id);
    return { code: 200, msg: 'success', data: question };
  }
}