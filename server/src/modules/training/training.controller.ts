import { Controller, Post, Get, Body, Param, HttpCode, Logger } from '@nestjs/common';
import { TrainingService } from './training.service';
import { ErrorQuestionsService } from '../error-questions/error-questions.service';
import { DiagnosisService } from '../diagnosis/diagnosis.service';
import { AiService } from '../ai/ai.service';

@Controller('training')
export class TrainingController {
  private readonly logger = new Logger(TrainingController.name);

  constructor(
    private readonly trainingService: TrainingService,
    private readonly errorQuestionsService: ErrorQuestionsService,
    private readonly diagnosisService: DiagnosisService,
    private readonly aiService: AiService,
  ) {}

  @Post('generate')
  @HttpCode(200)
  async generate(@Body() body: { studentName: string; subject: string; diagnosisId: string }) {
    this.logger.log(`生成训练: ${body.studentName}, ${body.subject}`);

    const questions = await this.errorQuestionsService.getQuestionsByStudent(body.studentName);
    const subjectQuestions = questions.filter(q => q.subject === body.subject);

    if (subjectQuestions.length === 0) {
      return { code: 200, msg: 'success', data: { message: '暂无错题记录' } };
    }

    // 统计薄弱等级
    const weaknessLevels = subjectQuestions.map(q => q.weakness_level);
    const severeCount = weaknessLevels.filter(l => l === 'severe').length;
    const moderateCount = weaknessLevels.filter(l => l === 'moderate').length;

    let overallWeakness = 'mild';
    if (severeCount >= 2) overallWeakness = 'severe';
    else if (moderateCount >= 2 || severeCount >= 1) overallWeakness = 'moderate';

    const trainingQuestions = subjectQuestions.map(q => ({
      questionText: q.question_text,
      knowledgePoints: q.knowledge_points || [],
      weaknessLevel: q.weakness_level,
      errorType: q.error_type,
    }));

    const trainingResult = await this.aiService.generateTraining({
      subject: body.subject,
      questions: trainingQuestions,
      weaknessLevel: overallWeakness,
    });

    const saved = await this.trainingService.saveTraining({
      studentName: body.studentName,
      subject: body.subject,
      diagnosisId: body.diagnosisId,
      trainingData: trainingResult.trainingData,
      carefulTraining: trainingResult.carefulTraining,
      difficultyDistribution: trainingResult.difficultyDistribution,
      questionIds: subjectQuestions.map(q => q.id as string),
    });

    return { code: 200, msg: 'success', data: saved };
  }

  @Get('list/:studentName')
  @HttpCode(200)
  async listTrainings(@Param('studentName') studentName: string) {
    const trainings = await this.trainingService.getTrainingsByStudent(studentName);
    return { code: 200, msg: 'success', data: trainings };
  }

  @Get(':id')
  @HttpCode(200)
  async getTraining(@Param('id') id: string) {
    const training = await this.trainingService.getTrainingById(id);
    return { code: 200, msg: 'success', data: training };
  }
}