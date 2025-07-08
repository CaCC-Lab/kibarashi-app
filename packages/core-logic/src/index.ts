// Types
export * from './types/index.js';

// Services - Gemini
export { geminiClient } from './services/gemini/geminiClient.js';
export { APIKeyManager, apiKeyManager } from './services/gemini/apiKeyManager.js';
export { geminiTTS } from './services/gemini/geminiTTS.js';
export { generateImprovedPrompt } from './services/gemini/improvedPromptTemplate.js';

// Services - Suggestion
export { EnhancedSuggestionGenerator } from './services/suggestion/enhancedSuggestionGenerator.js';
export { generateEnhancedSuggestions, EnhancedSuggestion, toLegacySuggestion } from './services/suggestion/enhancedGenerator.js';
export * from './services/suggestion/studentPromptTemplates.js';
export * from './services/suggestion/jobHuntingPromptTemplates.js';

// Services - TTS & Audio
export { SSMLBuilder } from './services/audio/ssmlBuilder.js';

// Services - Context
export { contextualPromptEnhancer, ContextualData, EnhancedPromptParams } from './services/context/contextualPromptEnhancer.js';

// Services - External
export { weatherClient, WeatherData, WeatherApiResponse } from './services/external/weatherClient.js';
export { seasonalClient } from './services/external/seasonalClient.js';

// Utils
export { logger } from './utils/logger.js';