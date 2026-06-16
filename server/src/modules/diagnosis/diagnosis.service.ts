import { Injectable, Logger, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../storage/database/database.module';

@Injectable()
export class DiagnosisService {
  private readonly logger = new Logger(DiagnosisService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async saveDiagnosis(data: {
    studentName: string;
    subject: string;
    errorTypeStats: Record<string, number>;
    topWeaknesses: Array<{ name: string; level: string; count: number }>;
    summary: string;
    questionIds: string[];
  }) {
    const { data: result, error } = await this.supabase
      .from('diagnosis_records')
      .insert({
        student_name: data.studentName,
        subject: data.subject,
        error_type_stats: data.errorTypeStats,
        top_weaknesses: data.topWeaknesses,
        summary: data.summary,
        question_ids: data.questionIds,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`保存诊断记录失败: ${error.message}`);
      throw new Error('保存诊断记录失败');
    }
    return result;
  }

  async getDiagnosesByStudent(studentName: string) {
    const { data, error } = await this.supabase
      .from('diagnosis_records')
      .select('*')
      .eq('student_name', studentName)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`查询诊断记录失败: ${error.message}`);
      throw new Error('查询诊断记录失败');
    }
    return data || [];
  }

  async getDiagnosisById(id: string) {
    const { data, error } = await this.supabase
      .from('diagnosis_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error(`查询诊断详情失败: ${error.message}`);
      throw new Error('查询诊断详情失败');
    }
    return data;
  }
}