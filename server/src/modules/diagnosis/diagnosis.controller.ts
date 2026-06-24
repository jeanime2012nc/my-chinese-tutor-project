import { Controller, Post, Get, Body, Param, HttpCode, Logger } from '@nestjs/common';
import { DiagnosisService } from './diagnosis.service';
import { ErrorQuestionsService } from '../error-questions/error-questions.service';
import { AiService } from '../ai/ai.service';

@Controller('diagnosis')
export class DiagnosisController {
  private readonly logger = new Logger(DiagnosisController.name);

  constructor(
    private readonly diagnosisService: DiagnosisService,
    private readonly errorQuestionsService: ErrorQuestionsService,
    private readonly aiService: AiService,
  ) {}

  @Post('analyze')
  @HttpCode(200)
  async analyze() {
    this.logger.log('薄弱诊断（语文）');

    const questions = await this.errorQuestionsService.getAllQuestions();
    const wrongQuestions = questions
      .filter(q => q.is_correct === 'wrong')
      .map(q => ({
        questionText: q.question_text,
        studentAnswer: q.student_answer,
        correctAnswer: q.correct_answer,
        errorType: q.error_type,
        errorDetail: q.error_detail,
        trapAnalysis: q.trap_analysis,
        knowledgePoints: q.knowledge_points,
        weaknessLevel: q.weakness_level,
      }));

    if (wrongQuestions.length === 0) {
      return { code: 200, msg: '还没有批改记录哦，先去对话页面提交一道题目吧！', data: null };
    }

    const diagnosisResult = await this.aiService.diagnose({ questions: wrongQuestions });

    const saved = await this.diagnosisService.saveDiagnosis({
      errorTypeStats: diagnosisResult.errorTypeStats,
      topWeaknesses: diagnosisResult.topWeaknesses,
      summary: diagnosisResult.summary,
      questionIds: questions.map(q => q.id as string),
    });

    return { code: 200, msg: 'success', data: saved };
  }

  @Get('latest')
  @HttpCode(200)
  async getLatestDiagnosis() {
    const diagnoses = await this.diagnosisService.getAllDiagnoses();
    const latest = diagnoses.length > 0 ? diagnoses[0] : null;
    return { code: 200, msg: 'success', data: latest };
  }

  @Get(':id')
  @HttpCode(200)
  async getDiagnosis(@Param('id') id: string) {
    const diagnosis = await this.diagnosisService.getDiagnosisById(id);
    return { code: 200, msg: 'success', data: diagnosis };
  }
}