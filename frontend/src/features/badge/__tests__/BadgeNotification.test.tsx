import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BadgeNotification from '../BadgeNotification';

describe('BadgeNotification', () => {
  it('バッジ情報がないときは何も表示しない', () => {
    // Given: null
    const { container } = render(
      <BadgeNotification badgeName={null} badgeDescription={null} onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('解除時はバッジ名と説明を含む祝福メッセージを表示', () => {
    // Given: バッジ情報
    render(
      <BadgeNotification
        badgeName="はじめの一歩"
        badgeDescription="初めての気晴らしを完了しました"
        onClose={() => {}}
      />,
    );
    // Then: 煽動的な単語は含めない（例）
    expect(screen.getByTestId('celebration-title')).toHaveTextContent('はじめの一歩');
    expect(screen.getByTestId('celebration-desc')).toHaveTextContent('初めての気晴らしを完了しました');
    expect(screen.getByTestId('celebration-desc').textContent).not.toMatch(/最強|勝ち|負け|ランキング/);
  });

  it('確認で onClose が呼ばれる', () => {
    const onClose = vi.fn();
    render(
      <BadgeNotification badgeName="A" badgeDescription="B" onClose={onClose} />,
    );
    fireEvent.click(screen.getByTestId('badge-notification-ok'));
    expect(onClose).toHaveBeenCalled();
  });
});
