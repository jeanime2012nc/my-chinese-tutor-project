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

    // 构建消息数组
    const messages: Array<{ role: string; content: any }> = [];

    // 添加历史消息
    if (body.history && body.history.length > 0) {
      for (const msg of body.history) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // 添加当前消息（支持图片）
    if (body.imageUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: body.message },
          { type: 'image_url', image_url: { url: body.imageUrl } },
        ],
      });
    } else {
      messages.push({ role: 'user', content: body.message });
    }

    const result = await this.aiService.chatGrade(messages);

    // 如果 AI 识别出是批改场景且有结构化数据，保存错题记录
    let savedQuestion = null;
    const grading = result.grading;
    if (grading && grading.isCorrect && grading.isCorrect !== 'unknown') {
      try {
        savedQuestion = await this.errorQuestionsService.createQuestion({
          student_name: '用户',
          subject: '语文',
          question_text: body.message,
          student_answer: '（对话式提交，详见上下文）',
          correct_answer: (grading as any).correctAnswer || '',
          step_by_step: (grading as any).stepByStep || '',
          is_correct: grading.isCorrect,
          error_type: grading.errorType || '',
          error_detail: grading.errorAnalysis || '',
          trap_analysis: grading.trapAnalysis || '',
          knowledge_points: (grading as any).knowledgePoints || [],
          weakness_level: (grading as any).weaknessLevel || 'light',
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