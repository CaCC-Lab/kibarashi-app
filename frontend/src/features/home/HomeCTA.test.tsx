import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomeCTA from './HomeCTA';
import { SituationId } from '../../types/situation';

vi.mock('../../hooks/useAgeGroup', () => ({
  useAgeGroup: vi.fn(() => ({
    currentAgeGroup: 'office_worker',
    profile: null,
    isFirstTimeUser: false,
    isLoading: false,
    updateAgeGroup: vi.fn(),
    resetProfile: vi.fn(),
    availableAgeGroups: [],
  })),
}));

import { useAgeGroup } from '../../hooks/useAgeGroup';
const mockedUseAgeGroup = vi.mocked(useAgeGroup);

const mockUseAgeGroup = (currentAgeGroup: string) => {
  mockedUseAgeGroup.mockReturnValue({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentAgeGroup: currentAgeGroup as any,
    profile: null,
    isFirstTimeUser: false,
    isLoading: false,
    updateAgeGroup: vi.fn(),
    resetProfile: vi.fn(),
    availableAgeGroups: [],
  });
};

describe('HomeCTA', () => {
  let situationCount = 0;
  let durationCount = 0;
  let quickStartCount = 0;
  let selectedSituation: SituationId | null = null;
  let selectedDuration: 5 | 15 | 30 | null = null;

  const onSituationChange = (s: SituationId) => {
    situationCount++;
    selectedSituation = s;
  };
  const onDurationChange = (d: 5 | 15 | 30) => {
    durationCount++;
    selectedDuration = d;
  };
  const onQuickStart = () => {
    quickStartCount++;
  };

  beforeEach(() => {
    situationCount = 0;
    durationCount = 0;
    quickStartCount = 0;
    selectedSituation = null;
    selectedDuration = null;
    mockUseAgeGroup('office_worker');
  });

  describe('年齢層に応じた状況ボタンの表示', () => {
    it('社会人の場合、職場・家・外出先が表示される', () => {
      mockUseAgeGroup('office_worker');
      render(
        <HomeCTA
          situation={null}
          duration={null}
          onSituationChange={onSituationChange}
          onDurationChange={onDurationChange}
          onQuickStart={onQuickStart}
        />
      );
      expect(screen.getByRole('button', { name: '職場' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '家' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '外出先' })).toBeInTheDocument();
    });

    it('学生の場合、勉強中・学校・家・通学中が表示される', () => {
      mockUseAgeGroup('student');
      render(
        <HomeCTA
          situation={null}
          duration={null}
          onSituationChange={onSituationChange}
          onDurationChange={onDurationChange}
          onQuickStart={onQuickStart}
        />
      );
      expect(screen.getByRole('button', { name: '勉強中' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '学校' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '家' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '通学中' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '職場' })).not.toBeInTheDocument();
    });

    it('就職活動者の場合、就職・転職活動を含む4項目が表示される', () => {
      mockUseAgeGroup('job_seeker');
      render(
        <HomeCTA
          situation={null}
          duration={null}
          onSituationChange={onSituationChange}
          onDurationChange={onDurationChange}
          onQuickStart={onQuickStart}
        />
      );
      expect(screen.getByRole('button', { name: '就職・転職活動' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '家' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '外出先' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '職場' })).toBeInTheDocument();
    });

    it('主婦の場合、家・外出先のみが表示される', () => {
      mockUseAgeGroup('housewife');
      render(
        <HomeCTA
          situation={null}
          duration={null}
          onSituationChange={onSituationChange}
          onDurationChange={onDurationChange}
          onQuickStart={onQuickStart}
        />
      );
      expect(screen.getByRole('button', { name: '家' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '外出先' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '職場' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '勉強中' })).not.toBeInTheDocument();
    });
  });

  describe('インタラクション', () => {
    it('状況ボタンをクリックするとonSituationChangeが呼ばれる', () => {
      mockUseAgeGroup('student');
      render(
        <HomeCTA
          situation={null}
          duration={null}
          onSituationChange={onSituationChange}
          onDurationChange={onDurationChange}
          onQuickStart={onQuickStart}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: '勉強中' }));
      expect(situationCount).toBe(1);
      expect(selectedSituation).toBe('studying');
    });

    it('時間ボタンをクリックするとonDurationChangeが呼ばれる', () => {
      render(
        <HomeCTA
          situation={null}
          duration={null}
          onSituationChange={onSituationChange}
          onDurationChange={onDurationChange}
          onQuickStart={onQuickStart}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: '15分' }));
      expect(durationCount).toBe(1);
      expect(selectedDuration).toBe(15);
    });

    it('CTAボタンをクリックするとonQuickStartが呼ばれる', () => {
      render(
        <HomeCTA
          situation={null}
          duration={null}
          onSituationChange={onSituationChange}
          onDurationChange={onDurationChange}
          onQuickStart={onQuickStart}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /気晴らし/ }));
      expect(quickStartCount).toBe(1);
    });
  });
});
