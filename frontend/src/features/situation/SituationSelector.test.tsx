import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SituationSelector from './SituationSelector';

// navigator.vibrateのモック
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true
});

describe('SituationSelector', () => {
  const mockOnSelect = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('すべての状況オプションを表示する', () => {
    render(
      <SituationSelector 
        selected={null} 
        onSelect={mockOnSelect} 
        onBack={mockOnBack} 
      />
    );
    
    expect(screen.getByText('職場')).toBeInTheDocument();
    expect(screen.getByText('家')).toBeInTheDocument();
    expect(screen.getByText('外出先')).toBeInTheDocument();
  });

  it('選択されたオプションにハイライトクラスが適用される', () => {
    render(
      <SituationSelector 
        selected="workplace" 
        onSelect={mockOnSelect} 
        onBack={mockOnBack} 
      />
    );
    
    const officeButton = screen.getByText('職場').closest('button');
    expect(officeButton).toHaveClass('border-primary-500');
    expect(officeButton).toHaveClass('shadow-lg');
  });

  it('オプションをクリックするとonSelectが呼ばれる', () => {
    render(
      <SituationSelector 
        selected={null} 
        onSelect={mockOnSelect} 
        onBack={mockOnBack} 
      />
    );
    
    const homeButton = screen.getByText('家');
    fireEvent.click(homeButton);
    
    expect(mockOnSelect).toHaveBeenCalledWith('home');
  });

  it('振動対応デバイスでは振動フィードバックが動作する', () => {
    const vibrateValue = 30;
    render(
      <SituationSelector 
        selected={null} 
        onSelect={mockOnSelect} 
        onBack={mockOnBack} 
      />
    );
    
    const button = screen.getByText('職場');
    fireEvent.click(button);
    
    expect(navigator.vibrate).toHaveBeenCalledWith(vibrateValue);
  });


  it('各オプションに適切なアイコンが表示される', () => {
    render(
      <SituationSelector 
        selected={null} 
        onSelect={mockOnSelect} 
        onBack={mockOnBack} 
      />
    );
    
    // SVGアイコンの存在を確認
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThanOrEqual(3); // 各オプションのアイコン
  });
});