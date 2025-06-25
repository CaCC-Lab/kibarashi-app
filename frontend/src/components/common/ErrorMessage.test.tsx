import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('エラーメッセージを正しく表示する', () => {
    const message = 'ネットワークエラーが発生しました';
    render(<ErrorMessage message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('デフォルトのタイトルを表示する', () => {
    render(<ErrorMessage message="エラー" />);
    
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });

  it('カスタムタイトルを表示する', () => {
    const customTitle = '接続エラー';
    render(<ErrorMessage message="エラー" title={customTitle} />);
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });

  it('onRetryが渡されている場合、再試行ボタンを表示する', () => {
    const onRetry = () => {};
    render(<ErrorMessage message="エラー" onRetry={onRetry} />);
    
    const retryButton = screen.getByText('もう一度試す');
    expect(retryButton).toBeInTheDocument();
  });

  it('再試行ボタンをクリックするとonRetryが呼ばれる', () => {
    let retryCount = 0;
    const onRetry = () => { retryCount++; };
    render(<ErrorMessage message="エラー" onRetry={onRetry} />);
    
    const retryButton = screen.getByText('もう一度試す');
    fireEvent.click(retryButton);
    
    expect(retryCount).toBe(1);
  });

  it('onRetryが渡されていない場合、再試行ボタンを表示しない', () => {
    render(<ErrorMessage message="エラー" />);
    
    expect(screen.queryByText('もう一度試す')).not.toBeInTheDocument();
  });

  it('ネットワークエラーの場合、適切な提案を表示する', () => {
    render(<ErrorMessage message="ネットワークエラー" />);
    
    expect(screen.getByText('💡 Wi-Fiまたはモバイルデータ通信の接続状況を確認し、再度お試しください。')).toBeInTheDocument();
  });

  it('タイムアウトエラーの場合、適切な提案を表示する', () => {
    render(<ErrorMessage message="タイムアウトしました" />);
    
    expect(screen.getByText('💡 ネットワークが不安定な可能性があります。時間をおいてから再度アクセスしてください。')).toBeInTheDocument();
  });

  it('エラーアイコン（！）を表示する', () => {
    render(<ErrorMessage message="エラー" />);
    
    expect(screen.getByText('!')).toBeInTheDocument();
  });
});