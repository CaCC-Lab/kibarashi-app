import { StudentPromptInput } from '../suggestion/studentPromptTemplates';
import { createStudentPrompt } from '../suggestion/studentPromptTemplates';
import { createJobSeekerPrompt, createCareerChangerPrompt, JobHuntingPromptInput } from '../suggestion/jobHuntingPromptTemplates';
import { generateImprovedPrompt } from '../gemini/improvedPromptTemplate';

/**
 * 共通のプロンプト生成ロジック
 * geminiClientとollamaClientで共有して使用
 */
export function createPrompt(
  situation: string,
  duration: number,
  ageGroup: string = 'office_worker',
  studentContext?: Partial<StudentPromptInput>,
  jobHuntingContext?: Partial<JobHuntingPromptInput>,
  previousSuggestions: string[] = []
): string {
  // 学生の場合、詳細なプロンプト生成を使用
  if (ageGroup === 'student' && studentContext) {
    const studentInput: StudentPromptInput = {
      concern: studentContext.concern || '',
      subject: studentContext.subject || '',
      time: duration,
      situation: studentContext.situation || 'studying' as any,
      stressFactor: studentContext.stressFactor
    };
    
    // 学生向けシナリオのマッピング
    const studentSituationMap: Record<string, 'studying' | 'school' | 'commuting' | 'beforeExam'> = {
      studying: 'studying',
      school: 'school',
      commuting: 'commuting',
      beforeExam: 'beforeExam',
      // 既存の状況を学生向けにマッピング
      workplace: 'studying',
      home: 'studying',
      outside: 'school'
    };
    
    studentInput.situation = studentSituationMap[situation] || 'studying';
    
    return createStudentPrompt(studentInput);
  }
  
  // 就活生の場合、専用のプロンプト生成を使用
  if (ageGroup === 'job_seeker' && jobHuntingContext) {
    return createJobSeekerPrompt({
      activityType: 'job_seeking',
      currentPhase: jobHuntingContext.currentPhase,
      concern: jobHuntingContext.concern || '',
      time: duration,
      situation: situation as any,
      stressFactor: jobHuntingContext.stressFactor,
      activityDuration: jobHuntingContext.activityDuration
    });
  }
  
  // 転職活動者の場合、専用のプロンプト生成を使用
  if (ageGroup === 'career_changer' && jobHuntingContext) {
    return createCareerChangerPrompt({
      activityType: 'career_change',
      currentPhase: jobHuntingContext.currentPhase,
      concern: jobHuntingContext.concern || '',
      time: duration,
      situation: situation as any,
      stressFactor: jobHuntingContext.stressFactor,
      activityDuration: jobHuntingContext.activityDuration
    });
  }
  
  // バリエーション豊かな提案のために改善されたプロンプトを使用
  return generateImprovedPrompt(
    situation,
    duration,
    ageGroup,
    previousSuggestions
  );
}