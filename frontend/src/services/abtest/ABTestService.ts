// CLAUDE-GENERATED: A/Bテストサービス実装
// パターン: Phase 1 MVP - 基本的なA/B振り分け機能

export interface ABTestAssignment {
  group: 'A' | 'B';
  version: string;
  assignedAt: string;
  userId: string;
}

export class ABTestService {
  private static readonly AB_TEST_KEY = 'ab_test_group';
  private static readonly AB_TEST_VERSION = 'v1_student_optimization';
  
  /**
   * ユーザーのA/Bテストグループを取得
   * 既存の振り分けがあればそれを使用、なければ新規振り分け
   */
  static getTestGroup(): 'A' | 'B' {
    // 1. 既存の振り分けをチェック
    const stored = localStorage.getItem(this.AB_TEST_KEY);
    if (stored) {
      try {
        const parsed: ABTestAssignment = JSON.parse(stored);
        if (parsed.version === this.AB_TEST_VERSION) {
          return parsed.group;
        }
      } catch (error) {
        console.error('Failed to parse AB test assignment:', error);
      }
    }
    
    // 2. 新規振り分け（50:50）
    const group = Math.random() < 0.5 ? 'A' : 'B';
    const assignment: ABTestAssignment = {
      group,
      version: this.AB_TEST_VERSION,
      assignedAt: new Date().toISOString(),
      userId: this.generateAnonymousId()
    };
    
    localStorage.setItem(this.AB_TEST_KEY, JSON.stringify(assignment));
    
    // 3. 初回振り分けイベント送信
    this.trackAssignment(assignment);
    
    return group;
  }
  
  /**
   * 現在の振り分け情報を取得
   */
  static getAssignment(): ABTestAssignment | null {
    const stored = localStorage.getItem(this.AB_TEST_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  
  /**
   * テストグループをリセット（開発用）
   */
  static resetTestGroup(): void {
    localStorage.removeItem(this.AB_TEST_KEY);
  }
  
  /**
   * 匿名ユーザーIDを生成
   */
  private static generateAnonymousId(): string {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 振り分けイベントを記録
   */
  private static trackAssignment(assignment: ABTestAssignment): void {
    // Phase 1では console.log のみ
    // Phase 2でアナリティクスAPIに送信
    console.log('[A/B Test] User assigned:', {
      group: assignment.group,
      version: assignment.version,
      userId: assignment.userId
    });
  }
  
  /**
   * ユーザーが学生最適化版（B群）かどうか
   */
  static isStudentOptimized(): boolean {
    return this.getTestGroup() === 'B';
  }
}