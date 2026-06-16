import { Injectable, Logger, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../storage/database/database.module';

@Injectable()
export class ErrorQuestionsService {
  private readonly logger = new Logger(ErrorQuestionsService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async createQuestion(data: {
    student_name: string;
    subject: string;
    question_text: string;
    student_answer: string;
    correct_answer: string;
    step_by_step: string;
    is_correct: string;
    error_type: string;
    error_detail: string;
    trap_analysis: string;
    knowledge_points: string[];
    weakness_level: string;
  }) {
    const { data: result, error } = await this.supabase
      .from('error_questions')
      .insert(data)
      .select()
      .single();

    if (error) {
      this.logger.error(`创建错题记录失败: ${error.message}`);
      throw new Error('创建错题记录失败');
    }
    return result;
  }

  async getQuestionsByStudent(studentName: string) {
    const { data, error } = await this.supabase
      .from('error_questions')
      .select('*')
      .eq('student_name', studentName)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`查询错题记录失败: ${error.message}`);
      throw new Error('查询错题记录失败');
    }
    return data || [];
  }

  async getQuestionById(id: string) {
    const { data, error } = await this.supabase
      .from('error_questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error(`查询错题详情失败: ${error.message}`);
      throw new Error('查询错题详情失败');
    }
    return data;
  }
}