#\!/bin/bash

# Fix remaining issues one by one

# Fix HistoryList.test.tsx
sed -i 's/default: ({ item, onDelete: _onDelete, onUpdateRating: _onUpdateRating, onUpdateNote: _onUpdateNote }: MockHistoryItemProps)/default: ({ item }: MockHistoryItemProps)/g' frontend/src/features/history/HistoryList.test.tsx

# Fix HistoryList.tsx
sed -i 's/acceptedFiles: any\[\]/acceptedFiles: File[]/g' frontend/src/features/history/HistoryList.tsx

# Fix SituationSelector.tsx 
sed -i 's/getRootProps: () => any/getRootProps: () => React.HTMLAttributes<HTMLDivElement>/g' frontend/src/features/situation/SituationSelector.tsx

# Fix useABTest files
sed -i 's/trackMetric: (name: string, data: any)/trackMetric: (name: string, data: Record<string, unknown>)/g' frontend/src/hooks/useABTest.ts
sed -i 's/logExperimentExposure: (experimentName: string, variant: any)/logExperimentExposure: (experimentName: string, variant: string)/g' frontend/src/hooks/useABTest.ts

# Remove unused result variables in tests
sed -i '/const { result } = renderHook(() => useABTest());/c\      renderHook(() => useABTest());' frontend/src/hooks/useABTest.test.ts
sed -i '/const { result } = renderHook(() => useStudentABTest());/c\      renderHook(() => useStudentABTest());' frontend/src/hooks/useStudentABTest.test.ts

# Fix Career and Job Seeker AB Test hooks
sed -i 's/trackMetric: (metric: string, data?: any)/trackMetric: (metric: string, data?: Record<string, unknown>)/g' frontend/src/hooks/useCareerChangerABTest.ts frontend/src/hooks/useJobSeekerABTest.ts
sed -i 's/const trackMetric = useCallback((metric: string, data: any = {})/const trackMetric = useCallback((metric: string, data: Record<string, unknown> = {})/g' frontend/src/hooks/useCareerChangerABTest.ts frontend/src/hooks/useJobSeekerABTest.ts

# Fix analytics service
sed -i 's/logEvent(name: string, data: any)/logEvent(name: string, data: Record<string, unknown>)/g' frontend/src/services/analytics/abTestService.ts

# Fix API client
sed -i 's/} catch (error: any) {/} catch (error) {/g' frontend/src/services/api/client.ts

# Fix suggestionAdapter test - use simpler type assertion
sed -i 's/(transformSuggestion as any)\./_transformSuggestion\./g' frontend/src/services/api/suggestionAdapter.test.ts
sed -i '5i const _transformSuggestion = transformSuggestion as { _original?: typeof transformSuggestion };' frontend/src/services/api/suggestionAdapter.test.ts

# Fix TTS service
sed -i 's/cache: Map<string, any>/cache: Map<string, AudioBuffer | string>/g' frontend/src/services/api/tts.ts

# Fix browserTTS test
sed -i 's/(speechSynthesis as any)/speechSynthesis/g' frontend/src/services/browserTTS.test.ts
sed -i 's/(window\.speechSynthesis as any)/_speechSynthesis/g' frontend/src/services/browserTTS.test.ts
sed -i '11i const _speechSynthesis = window.speechSynthesis as SpeechSynthesis & { _voices?: SpeechSynthesisVoice[] };' frontend/src/services/browserTTS.test.ts

# Fix contextAPI
sed -i 's/getMonthlyTrend: async (_month?: number)/getMonthlyTrend: async ()/g' frontend/src/services/contextAPI.ts

# Fix appDataManager test
sed -i '/} catch (error) {/c\    } catch {' frontend/src/services/storage/appDataManager.test.ts
sed -i 's/async (data: any)/async (data: unknown)/g' frontend/src/services/storage/appDataManager.test.ts
sed -i 's/async (callback: (data: any)/async (callback: (data: unknown)/g' frontend/src/services/storage/appDataManager.test.ts

# Fix historyStorage test
sed -i 's/(localStorage\.getItem as any)/(localStorage.getItem as jest.Mock)/g' frontend/src/services/storage/historyStorage.test.ts

# Fix metrics.ts
sed -i 's/recordWebVitals(event: Event)/recordWebVitals()/g' frontend/src/utils/metrics.ts

# Fix SuggestionDetail hook deps
sed -i '/}, \[\]);$/s/\[\]/\[completeHistory, currentHistoryId, duration\]/g' frontend/src/features/suggestion/SuggestionDetail.tsx

# Fix useAudioPlayer hook deps
sed -i '/}, \[isPlaying, audioContext, playerState\]\);$/s/isPlaying, //g' frontend/src/hooks/useAudioPlayer.ts

cd frontend && npm run lint
