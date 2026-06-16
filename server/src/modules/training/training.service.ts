import { Injectable, Logger, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../storage/database/database.module';

@Injectable()
export class TrainingService {
  private readonly logger = new Logger(TrainingService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async saveTraining(data: {
    studentName: string;
    subject: string;
    diagnosisId: string;
    trainingData: Array<Record<string, any>>;
    carefulTraining: Array<Record<string, any>>;
    difficultyDistribution: Record<string, number>;
    questionIds: string[];
  }) {
    const { data: result, error } = await this.supabase
      .from('training_records')
      .insert({
        student_name: data.studentName,
        subject: data.subject,
        diagnosis_id: data.diagnosisId,
        question_ids: data.questionIds,
        training_data: data.trainingData,
        careful_training: data.carefulTraining,
        difficulty_distribution: data.difficultyDistribution,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`保存训练记录失败: ${error.message}`);
      throw new Error('保存训练记录失败');
    }
    return result;
  }

  async getTrainingsByStudent(studentName: string) {
    const { data, error } = await this.supabase
      .from('training_records')
      .select('*')
      .eq('student_name', studentName)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`查询训练记录失败: ${error.message}`);
      throw new Error('查询训练记录失败');
    }
    return data || [];
  }

  async getTrainingById(id: string) {
    const { data, error } = await this.supabase
      .from('training_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error(`查询训练详情失败: ${error.message}`);
      throw new Error('查询训练详情失败');
    }
    return data;
  }
}