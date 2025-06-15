import React, { useState, useEffect } from 'react';
import { useCustomSuggestions } from '../../hooks/useCustomSuggestions';
import { CustomSuggestion, CustomSuggestionFormData } from '../../types/custom';

interface CustomSuggestionFormProps {
  editingSuggestion?: CustomSuggestion | null;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * カスタム気晴らし登録・編集フォーム
 * 
 * 設計思想：
 * - シンプルで分かりやすい入力フォーム
 * - リアルタイムバリデーション機能
 * - ステップ形式のガイド入力をサポート
 * - 新規作成と編集を同一フォームで対応
 */
const CustomSuggestionForm: React.FC<CustomSuggestionFormProps> = ({
  editingSuggestion,
  onSuccess,
  onCancel
}) => {
  const {
    addCustomSuggestion,
    updateCustomSuggestion,
    validationErrors,
    isLoading,
    clearValidationErrors
  } = useCustomSuggestions();

  const [formData, setFormData] = useState<CustomSuggestionFormData>({
    title: '',
    description: '',
    category: '認知的',
    duration: 5,
    steps: ['']
  });

  // 編集モードの場合、初期値を設定
  useEffect(() => {
    if (editingSuggestion) {
      setFormData({
        title: editingSuggestion.title,
        description: editingSuggestion.description,
        category: editingSuggestion.category,
        duration: editingSuggestion.duration,
        steps: editingSuggestion.steps && editingSuggestion.steps.length > 0 
          ? editingSuggestion.steps 
          : ['']
      });
    }
  }, [editingSuggestion]);

  // フォームのクリーンアップ
  useEffect(() => {
    return () => {
      clearValidationErrors();
    };
  }, [clearValidationErrors]);

  const handleInputChange = (field: keyof CustomSuggestionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const addStep = () => {
    if (formData.steps.length < 10) {
      setFormData(prev => ({
        ...prev,
        steps: [...prev.steps, '']
      }));
    }
  };

  const removeStep = (index: number) => {
    if (formData.steps.length > 1) {
      const newSteps = formData.steps.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        steps: newSteps
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = editingSuggestion
      ? await updateCustomSuggestion(editingSuggestion.id, formData)
      : await addCustomSuggestion(formData);
    
    if (success) {
      onSuccess();
    }
  };

  const isEditing = !!editingSuggestion;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-10 dark:ring-white dark:ring-opacity-10 border border-primary-200 dark:border-gray-600 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary dark:text-white">
              {isEditing ? 'カスタム気晴らしを編集' : '新しいカスタム気晴らしを追加'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus-ring"
              aria-label="閉じる"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* タイトル */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                タイトル <span className="text-secondary-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus-ring ${
                  validationErrors.title
                    ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20'
                    : 'border-primary-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                } text-text-primary dark:text-white placeholder-text-muted focus:border-primary-500`}
                placeholder="例: 深呼吸でリラックス"
                maxLength={100}
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-secondary-500">{validationErrors.title}</p>
              )}
            </div>

            {/* 説明 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                説明 <span className="text-secondary-500">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus-ring resize-none ${
                  validationErrors.description
                    ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20'
                    : 'border-primary-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                } text-text-primary dark:text-white placeholder-text-muted focus:border-primary-500`}
                placeholder="どのような気晴らしか、効果や目的を説明してください"
                maxLength={500}
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-secondary-500">{validationErrors.description}</p>
              )}
            </div>

            {/* カテゴリーと時間 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* カテゴリー */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                  カテゴリー
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value as '認知的' | '行動的')}
                  className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-text-primary dark:text-white focus-ring focus:border-primary-500"
                >
                  <option value="認知的">認知的（考える・感じる）</option>
                  <option value="行動的">行動的（体を動かす）</option>
                </select>
              </div>

              {/* 時間 */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                  時間（分）
                </label>
                <input
                  type="number"
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 5)}
                  min={1}
                  max={120}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors focus-ring ${
                    validationErrors.duration
                      ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20'
                      : 'border-primary-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                  } text-text-primary dark:text-white focus:border-primary-500`}
                />
                {validationErrors.duration && (
                  <p className="mt-1 text-sm text-secondary-500">{validationErrors.duration}</p>
                )}
              </div>
            </div>

            {/* ステップ */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-text-primary dark:text-white">
                  実行ステップ（任意）
                </label>
                <span className="text-sm text-text-muted">
                  {formData.steps.length}/10
                </span>
              </div>
              <div className="space-y-2">
                {formData.steps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-text-inverse rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-primary-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-text-primary dark:text-white placeholder-text-muted focus-ring focus:border-primary-500"
                      placeholder={`ステップ ${index + 1}の内容`}
                      maxLength={200}
                    />
                    {formData.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="flex-shrink-0 p-2 text-text-muted hover:text-secondary-500 transition-colors focus-ring rounded"
                        aria-label={`ステップ ${index + 1}を削除`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {formData.steps.length < 10 && (
                <button
                  type="button"
                  onClick={addStep}
                  className="mt-2 flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors focus-ring rounded px-2 py-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm">ステップを追加</span>
                </button>
              )}
              {validationErrors.steps && (
                <p className="mt-1 text-sm text-secondary-500">{validationErrors.steps}</p>
              )}
            </div>

            {/* ボタン */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-primary-100 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-text-secondary hover:text-text-primary transition-colors focus-ring rounded-lg"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-text-inverse rounded-lg transition-colors focus-ring font-medium"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    処理中...
                  </>
                ) : (
                  isEditing ? '更新' : '追加'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomSuggestionForm;