import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeckForm from '../DeckForm';

describe('DeckForm', () => {
  it('名前と任意説明を送信できる', () => {
    const onSubmit = vi.fn();
    render(<DeckForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByTestId('deck-name-input'), { target: { value: '職場用' } });
    fireEvent.change(screen.getByTestId('deck-desc-input'), { target: { value: 'すぐできる' } });
    fireEvent.click(screen.getByTestId('deck-form-submit'));
    expect(onSubmit).toHaveBeenCalledWith('職場用', 'すぐできる');
  });

  it('説明が空のときは undefined を渡す', () => {
    const onSubmit = vi.fn();
    render(<DeckForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByTestId('deck-name-input'), { target: { value: 'A' } });
    fireEvent.click(screen.getByTestId('deck-form-submit'));
    expect(onSubmit).toHaveBeenCalledWith('A', undefined);
  });

  it('キャンセルで onCancel が呼ばれる', () => {
    const onCancel = vi.fn();
    render(<DeckForm onSubmit={() => {}} onCancel={onCancel} />);
    fireEvent.click(screen.getByTestId('deck-form-cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('名前入力は required', () => {
    render(<DeckForm onSubmit={() => {}} />);
    expect(screen.getByTestId('deck-name-input')).toBeRequired();
  });
});
