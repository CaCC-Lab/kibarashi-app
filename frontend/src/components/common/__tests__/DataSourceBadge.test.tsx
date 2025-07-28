import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataSourceBadge from '../DataSourceBadge';

describe('DataSourceBadge', () => {
  describe('基本的な表示', () => {
    test('AI生成バッジが正しく表示される', () => {
      render(<DataSourceBadge source="ai" />);
      
      expect(screen.getByText('AI生成')).toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
    });

    test('フォールバックバッジが正しく表示される', () => {
      render(<DataSourceBadge source="fallback" />);
      
      expect(screen.getByText('オフライン')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument();
    });

    test('キャッシュバッジが正しく表示される', () => {
      render(<DataSourceBadge source="cache" />);
      
      expect(screen.getByText('キャッシュ')).toBeInTheDocument();
      expect(screen.getByText('💾')).toBeInTheDocument();
    });

    test('エラーバッジが正しく表示される', () => {
      render(<DataSourceBadge source="error" />);
      
      expect(screen.getByText('フォールバック')).toBeInTheDocument();
      expect(screen.getByText('⚡')).toBeInTheDocument();
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
      expect(screen.getByLabelText('この提案は事前に準備されたデータから提供されています')).toBeInTheDocument();
      
      rerender(<DataSourceBadge source="cache" />);
      expect(screen.getByLabelText('この提案はキャッシュから取得されました')).toBeInTheDocument();
      
      rerender(<DataSourceBadge source="error" />);
      expect(screen.getByLabelText('通信エラーのため、事前準備された提案を表示しています')).toBeInTheDocument();
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
      badge = screen.getByLabelText('この提案は事前に準備されたデータから提供されています');
      expect(badge).toHaveClass('text-gray-600', 'bg-gray-50', 'border-gray-200');
      
      rerender(<DataSourceBadge source="cache" />);
      badge = screen.getByLabelText('この提案はキャッシュから取得されました');
      expect(badge).toHaveClass('text-blue-600', 'bg-blue-50', 'border-blue-200');
      
      rerender(<DataSourceBadge source="error" />);
      badge = screen.getByLabelText('通信エラーのため、事前準備された提案を表示しています');
      expect(badge).toHaveClass('text-amber-600', 'bg-amber-50', 'border-amber-200');
    });
  });

  describe('ホバー動作', () => {
    test('詳細情報表示の設定', () => {
      const { rerender } = render(<DataSourceBadge source="ai" />);
      
      // showDetails=falseの時は詳細情報が表示されない
      expect(screen.queryByText('ms')).not.toBeInTheDocument();
      
      // showDetails=trueの時は詳細情報が表示される
      rerender(<DataSourceBadge source="ai" showDetails={true} responseTime={100} />);
      expect(screen.getByText('100ms')).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    test('無効なデータソースの場合もクラッシュしない', () => {
      // @ts-expect-error - テスト目的で無効な値を渡す
      render(<DataSourceBadge source="invalid" />);
      
      // デフォルトでfallbackが使用されることを確認
      const badge = screen.getByText('オフライン');
      expect(badge).toBeInTheDocument();
    });
  });
});