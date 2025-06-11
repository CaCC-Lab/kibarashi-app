import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DurationSelector from './DurationSelector';

describe('DurationSelector', () => {
  const mockOnSelect = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('すべての時間オプションを表示する', () => {
    render(
      <DurationSelector 
        selected={null} 
        onSelect={mockOnSelect} 
        onBack={mockOnBack} 
      />
    );
    
    expect(screen.getByText('5分')).toBeInTheDocument();
    expect(screen.getByText('15分')).toBeInTheDocument();
    expect(screen.getByText('30分')).toBeInTheDocument();
  });

  it('選択されたオプションにハイライトクラスが適用される', () => {
    render(
      <DurationSelector 
        selected={15} 
        onSelect={mockOnSelect} 
        onBack={mockOnBack} 
      />
    );
    
    const button15min = screen.getByText('15分').closest('button');
    expect(button15min).toHaveClass('border-primary-500');
    expect(button15min).toHaveClass('shadow-lg');
  });

  it('オプションをクリックするとonSelectが呼ばれる', () => {
    render(
      <DurationSelector 
        selected={null} 
        onSelect={mockOnSelect} 
        onBack={mockOnBack} 
      />
    );
    
    const button5min = screen.getByText('5分');
    fireEvent.click(button5min);
    
    expect(mockOnSelect).toHaveBeenCalledWith(5);
  });

  it('各オプションに適切な説明文が表示される', () => {
    render(
      <DurationSelector 
        selected={null} 
        onSelect={mockOnSelect} 
        onBack={mockOnBack} 
      />
    );
    
    expect(screen.getByText('ちょっとした気分転換に')).toBeInTheDocument();
    expect(screen.getByText('しっかりリフレッシュ')).toBeInTheDocument();
    expect(screen.getByText('じっくり気晴らし')).toBeInTheDocument();
  });

  it('振動フィードバックが動作する', () => {
    render(
      <DurationSelector 
        selected={null} 
        onSelect={mockOnSelect} 
        onBack={mockOnBack} 
      />
    );
    
    const button = screen.getByText('5分');
    fireEvent.click(button);
    
    expect(navigator.vibrate).toHaveBeenCalledWith(30);
  });


  it('円形の進捗インジケーターが表示される', () => {
    render(
      <DurationSelector 
        selected={null} 
        onSelect={mockOnSelect} 
        onBack={mockOnBack} 
      />
    );
    
    const svgElements = document.querySelectorAll('svg');
    // 各時間オプションに円形のインジケーターがある
    expect(svgElements.length).toBe(3);
  });
});