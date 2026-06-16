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
    diagnosisId: string | null;
    trainingData: Array<Record<string, any>>;
    carefulTraining: Array<Record<string, any>>;
    difficultyDistribution: Record<string, number>;
    questionIds: string[];
  }) {
    const insertData: Record<string, any> = {
      student_name: '用户',
      subject: '语文',
      question_ids: data.questionIds,
      training_data: data.trainingData,
      careful_training: data.carefulTraining,
      difficulty_distribution: data.difficultyDistribution,
    };
    // 只有 diagnosisId 不为空时才设置外键
    if (data.diagnosisId) {
      insertData.diagnosis_id = data.diagnosisId;
    }

    const { data: result, error } = await this.supabase
      .from('training_records')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      this.logger.error(`保存训练记录失败: ${error.message}`);
      throw new Error('保存训练记录失败');
    }
    return result;
  }

  async getAllTrainings() {
    const { data, error } = await this.supabase
      .from('training_records')
      .select('*')
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