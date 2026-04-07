import { FormEvent, useState } from 'react';

export interface DeckFormProps {
  initialName?: string;
  initialDescription?: string;
  submitLabel?: string;
  onSubmit: (name: string, description?: string) => void;
  onCancel?: () => void;
}

export default function DeckForm({
  initialName = '',
  initialDescription = '',
  submitLabel = '保存',
  onSubmit,
  onCancel,
}: DeckFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(name.trim(), description.trim() || undefined);
  };

  return (
    <form data-testid="deck-form" onSubmit={handleSubmit}>
      <label htmlFor="deck-name">デッキ名</label>
      <input
        id="deck-name"
        data-testid="deck-name-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <label htmlFor="deck-desc">説明（任意）</label>
      <textarea
        id="deck-desc"
        data-testid="deck-desc-input"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit" data-testid="deck-form-submit">
        {submitLabel}
      </button>
      {onCancel && (
        <button type="button" data-testid="deck-form-cancel" onClick={onCancel}>
          キャンセル
        </button>
      )}
    </form>
  );
}
