import { geminiClient, StudentPromptInput, JobHuntingPromptInput } from 'core-logic';
import { ollamaClient } from './ollama';
import { difyClient } from './dify';
import { logger } from '../utils/logger';

type AIProvider = 'gemini' | 'ollama' | 'dify';

function getProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase();
  if (provider === 'ollama') return 'ollama';
  if (provider === 'dify') return 'dify';
  return 'gemini';
}

/**
 * AI provider が利用可能かどうかを判定
 */
export function isAIProviderConfigured(): boolean {
  const provider = getProvider();
  if (provider === 'ollama') return true;
  if (provider === 'dify') return !!process.env.DIFY_API_KEY;
  return !!(
    process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY_1
  );
}

/**
 * ログ用に provider 情報を返す
 */
export function getAIProviderInfo(): { provider: string; model?: string; url?: string } {
  const provider = getProvider();
  if (provider === 'ollama') {
    return {
      provider: 'ollama',
      model: process.env.OLLAMA_MODEL || 'gemma4:26b',
      url: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    };
  }
  if (provider === 'dify') {
    return {
      provider: 'dify',
      url: process.env.DIFY_BASE_URL || 'http://localhost:5001',
    };
  }
  return { provider: 'gemini' };
}

/**
 * AI 提案を生成（provider に応じて Dify / Ollama / Gemini を呼び分け）
 */
export async function generateAISuggestions(
  situation: 'workplace' | 'home' | 'outside' | 'studying' | 'school' | 'commuting' | 'job_hunting',
  duration: number,
  ageGroup?: string,
  studentContext?: Partial<StudentPromptInput>,
  jobHuntingContext?: Partial<JobHuntingPromptInput>,
): Promise<unknown[]> {
  const provider = getProvider();

  if (provider === 'dify') {
    logger.info('Using Dify for suggestion generation');
    return difyClient.generateSuggestions(situation, duration, ageGroup);
  }

  if (provider === 'ollama') {
    logger.info('Using Ollama for suggestion generation');
    return ollamaClient.generateSuggestions(situation, duration, ageGroup, studentContext, jobHuntingContext);
  }

  logger.info('Using Gemini for suggestion generation');
  return geminiClient.generateSuggestions(situation, duration, ageGroup, studentContext, jobHuntingContext);
}

/**
 * AI 拡張提案を生成（provider に応じて Dify / Ollama / Gemini を呼び分け）
 */
export async function generateAIEnhancedSuggestions(
  situation: string,
  duration: number,
  ageGroup?: string,
  studentContext?: Partial<StudentPromptInput>,
  jobHuntingContext?: Partial<JobHuntingPromptInput>,
  location?: string,
): Promise<unknown[]> {
  const provider = getProvider();

  if (provider === 'dify') {
    logger.info('Using Dify for enhanced suggestion generation');
    return difyClient.generateEnhancedSuggestions(situation, duration, ageGroup);
  }

  if (provider === 'ollama') {
    logger.info('Using Ollama for enhanced suggestion generation');
    return ollamaClient.generateEnhancedSuggestions(situation, duration, ageGroup, studentContext, jobHuntingContext);
  }

  logger.info('Using Gemini for enhanced suggestion generation');
  return geminiClient.generateEnhancedSuggestions(situation, duration, ageGroup, studentContext, jobHuntingContext, location);
}
