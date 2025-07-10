import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataSourceBadge } from '../DataSourceBadge';

describe('DataSourceBadge', () => {
  describe('基本的な表示', () => {
    test('AI生成バッジが正しく表示される', () => {
      render(<DataSourceBadge source="ai" />);
      
      expect(screen.getByText('AI生成')).toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
    });

    test('フォールバックバッジが正しく表示される', () => {
      render(<DataSourceBadge source="fallback" />);
      
      expect(screen.getByText('保存データ')).toBeInTheDocument();
      expect(screen.getByText('📝')).toBeInTheDocument();
    });

    test('キャッシュバッジが正しく表示される', () => {
      render(<DataSourceBadge source="cache" />);
      
      expect(screen.getByText('キャッシュ')).toBeInTheDocument();
      expect(screen.getByText('💾')).toBeInTheDocument();
    });

    test('エラーバッジが正しく表示される', () => {
      render(<DataSourceBadge source="error" />);
      
      expect(screen.getByText('エラー時データ')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });
  });

  describe('デバッグモード', () => {
    test('showDetails=trueの時、詳細情報が表示される', () => {
      render(
        <DataSourceBadge 
          source="ai" 
          showDetails={true}
          responseTime={245}
          apiKeyIndex={2}
        />
      );
      
      expect(screen.getByText('245ms')).toBeInTheDocument();
      expect(screen.getByText('Key #2')).toBeInTheDocument();
    });

    test('showDetails=falseの時、詳細情報は表示されない', () => {
      render(
        <DataSourceBadge 
          source="ai" 
          showDetails={false}
          responseTime={245}
          apiKeyIndex={2}
        />
      );
      
      expect(screen.queryByText('245ms')).not.toBeInTheDocument();
      expect(screen.queryByText('Key #2')).not.toBeInTheDocument();
    });

    test('responseTimeのみの場合も正しく表示される', () => {
      render(
        <DataSourceBadge 
          source="ai" 
          showDetails={true}
          responseTime={1234}
        />
      );
      
      expect(screen.getByText('1234ms')).toBeInTheDocument();
    });

    test('apiKeyIndexのみの場合も正しく表示される', () => {
      render(
        <DataSourceBadge 
          source="ai" 
          showDetails={true}
          apiKeyIndex={5}
        />
      );
      
      expect(screen.getByText('Key #5')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('適切なARIA属性が設定されている', () => {
      render(<DataSourceBadge source="ai" />);
      
      const badge = screen.getByLabelText('この提案はAIによって生成されました');
      expect(badge).toBeInTheDocument();
    });

    test('各データソースに適切なARIAラベルが設定されている', () => {
      const { rerender } = render(<DataSourceBadge source="fallback" />);
      expect(screen.getByLabelText('この提案は事前に用意された内容です')).toBeInTheDocument();
      
      rerender(<DataSourceBadge source="cache" />);
      expect(screen.getByLabelText('この提案はキャッシュから取得されました')).toBeInTheDocument();
      
      rerender(<DataSourceBadge source="error" />);
      expect(screen.getByLabelText('エラー発生時のフォールバックデータです')).toBeInTheDocument();
    });
  });

  describe('スタイリング', () => {
    test('カスタムclassNameが適用される', () => {
      render(<DataSourceBadge source="ai" className="custom-class" />);
      
      const badge = screen.getByLabelText('この提案はAIによって生成されました');
      expect(badge).toHaveClass('custom-class');
    });

    test('各データソースに適切な色が適用される', () => {
      const { rerender } = render(<DataSourceBadge source="ai" />);
      let badge = screen.getByLabelText('この提案はAIによって生成されました');
      expect(badge).toHaveClass('text-purple-600', 'bg-purple-50', 'border-purple-200');
      
      rerender(<DataSourceBadge source="fallback" />);
      badge = screen.getByLabelText('この提案は事前に用意された内容です');
      expect(badge).toHaveClass('text-yellow-600', 'bg-yellow-50', 'border-yellow-200');
      
      rerender(<DataSourceBadge source="cache" />);
      badge = screen.getByLabelText('この提案はキャッシュから取得されました');
      expect(badge).toHaveClass('text-blue-600', 'bg-blue-50', 'border-blue-200');
      
      rerender(<DataSourceBadge source="error" />);
      badge = screen.getByLabelText('エラー発生時のフォールバックデータです');
      expect(badge).toHaveClass('text-red-600', 'bg-red-50', 'border-red-200');
    });
  });

  describe('ホバー動作', () => {
    test('ホバー時にツールチップが表示される', async () => {
      const user = userEvent.setup();
      render(<DataSourceBadge source="ai" />);
      
      const badge = screen.getByLabelText('この提案はAIによって生成されました');
      
      // ホバー前はツールチップが表示されない
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      
      // ホバー時のtitle属性を確認
      await user.hover(badge);
      expect(badge).toHaveAttribute('title', 'Gemini APIを使用して生成された最新の提案です');
    });
  });

  describe('エッジケース', () => {
    test('無効なデータソースの場合もクラッシュしない', () => {
      // @ts-ignore - テスト目的で無効な値を渡す
      render(<DataSourceBadge source="invalid" />);
      
      // デフォルトのスタイルが適用されることを確認
      const badge = screen.getByText('invalid');
      expect(badge).toBeInTheDocument();
    });
  });
});