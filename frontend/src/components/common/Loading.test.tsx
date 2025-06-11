import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from './Loading';

describe('Loading', () => {
  it('デフォルトのローディングメッセージを表示する', () => {
    render(<Loading />);
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('カスタムメッセージを表示する', () => {
    const customMessage = 'データを取得しています';
    render(<Loading message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('スピナーアニメーションを表示する', () => {
    render(<Loading />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    
    // スピナーアニメーションの要素を確認
    const animatedElement = spinner.querySelector('.animate-spin');
    expect(animatedElement).toBeInTheDocument();
  });

  it('アクセシビリティ用のスクリーンリーダーテキストを含む', () => {
    render(<Loading />);
    
    expect(screen.getByText('コンテンツを読み込んでいます')).toBeInTheDocument();
  });

  it('適切なARIA属性を持つ', () => {
    render(<Loading />);
    
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
});