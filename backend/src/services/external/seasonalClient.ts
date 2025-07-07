import { logger } from '../../utils/logger';

export interface SeasonalData {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  month: number;
  seasonalEvents: string[];
  holidays: string[];
  specialPeriods: string[];
  seasonalTips: string[];
}

class SeasonalClient {
  /**
   * 現在の季節と関連情報を取得
   */
  getCurrentSeasonalData(): SeasonalData {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const date = now.getDate();
    const year = now.getFullYear();

    const season = this.determineSeason(month, date);
    const holidays = this.getHolidays(month, date, year);
    const seasonalEvents = this.getSeasonalEvents(month, date);
    const specialPeriods = this.getSpecialPeriods(month, date);
    const seasonalTips = this.generateSeasonalTips(season, month, date);

    logger.info('Seasonal data generated', {
      season,
      month,
      eventsCount: seasonalEvents.length,
      holidaysCount: holidays.length
    });

    return {
      season,
      month,
      seasonalEvents,
      holidays,
      specialPeriods,
      seasonalTips
    };
  }

  /**
   * 月日から季節を判定
   */
  private determineSeason(month: number, date: number): SeasonalData['season'] {
    // 日本の季節区分（気象庁基準）
    if ((month === 3 && date >= 20) || month === 4 || month === 5 || (month === 6 && date < 21)) {
      return 'spring';
    } else if ((month === 6 && date >= 21) || month === 7 || month === 8 || (month === 9 && date < 23)) {
      return 'summer';
    } else if ((month === 9 && date >= 23) || month === 10 || month === 11 || (month === 12 && date < 22)) {
      return 'autumn';
    } else {
      return 'winter';
    }
  }

  /**
   * 日本の祝日・記念日を取得
   */
  private getHolidays(month: number, date: number, year: number): string[] {
    const holidays: Array<{ month: number; date: number; name: string; flexible?: boolean }> = [
      { month: 1, date: 1, name: '元日' },
      { month: 1, date: 15, name: '成人の日', flexible: true }, // 実際は第2月曜日
      { month: 2, date: 11, name: '建国記念の日' },
      { month: 2, date: 23, name: '天皇誕生日' },
      { month: 3, date: 20, name: '春分の日', flexible: true },
      { month: 4, date: 29, name: '昭和の日' },
      { month: 5, date: 3, name: '憲法記念日' },
      { month: 5, date: 4, name: 'みどりの日' },
      { month: 5, date: 5, name: 'こどもの日' },
      { month: 7, date: 20, name: '海の日', flexible: true }, // 実際は第3月曜日
      { month: 8, date: 11, name: '山の日' },
      { month: 9, date: 21, name: '敬老の日', flexible: true }, // 実際は第3月曜日
      { month: 9, date: 23, name: '秋分の日', flexible: true },
      { month: 10, date: 12, name: 'スポーツの日', flexible: true }, // 実際は第2月曜日
      { month: 11, date: 3, name: '文化の日' },
      { month: 11, date: 23, name: '勤労感謝の日' },
      { month: 12, date: 25, name: 'クリスマス' } // 祝日ではないが文化的に重要
    ];

    return holidays
      .filter(holiday => holiday.month === month && Math.abs(holiday.date - date) <= 2)
      .map(holiday => holiday.name);
  }

  /**
   * 季節のイベント・行事を取得
   */
  private getSeasonalEvents(month: number, date: number): string[] {
    const events: Array<{ month: number; dateRange: [number, number]; name: string }> = [
      // 春
      { month: 3, dateRange: [20, 31], name: '桜の開花時期' },
      { month: 4, dateRange: [1, 30], name: '新学期・新年度' },
      { month: 4, dateRange: [1, 15], name: 'お花見シーズン' },
      { month: 5, dateRange: [1, 5], name: 'ゴールデンウィーク' },

      // 夏
      { month: 6, dateRange: [10, 20], name: '梅雨入り' },
      { month: 7, dateRange: [1, 31], name: '七夕・夏祭り' },
      { month: 8, dateRange: [1, 31], name: '夏休み・お盆' },
      { month: 8, dateRange: [13, 16], name: 'お盆休み' },

      // 秋
      { month: 9, dateRange: [1, 30], name: '紅葉の始まり' },
      { month: 10, dateRange: [1, 31], name: '紅葉シーズン' },
      { month: 11, dateRange: [1, 30], name: '秋の味覚' },

      // 冬
      { month: 12, dateRange: [1, 31], name: '年末・クリスマス' },
      { month: 12, dateRange: [25, 31], name: '年末年始準備' },
      { month: 1, dateRange: [1, 7], name: '正月・新年' },
      { month: 2, dateRange: [1, 14], name: 'バレンタイン・節分' }
    ];

    return events
      .filter(event => event.month === month && date >= event.dateRange[0] && date <= event.dateRange[1])
      .map(event => event.name);
  }

  /**
   * 特別な期間を判定
   */
  private getSpecialPeriods(month: number, date: number): string[] {
    const periods: string[] = [];

    // 年末年始
    if ((month === 12 && date >= 29) || (month === 1 && date <= 3)) {
      periods.push('年末年始');
    }

    // ゴールデンウィーク
    if ((month === 4 && date >= 29) || (month === 5 && date <= 5)) {
      periods.push('ゴールデンウィーク');
    }

    // お盆
    if (month === 8 && date >= 13 && date <= 16) {
      periods.push('お盆');
    }

    // 夏休み期間
    if ((month === 7 && date >= 20) || month === 8 || (month === 9 && date <= 1)) {
      periods.push('夏休みシーズン');
    }

    return periods;
  }

  /**
   * 季節に応じた気晴らしのヒントを生成
   */
  private generateSeasonalTips(season: SeasonalData['season'], month: number, date: number): string[] {
    const tips: string[] = [];

    switch (season) {
      case 'spring':
        tips.push('🌸 桜や花の写真を撮る', '🌿 新緑を感じながら深呼吸', '📚 新しいことを始める季節');
        if (month === 4) {
          tips.push('🌱 新年度の目標を立ててみる');
        }
        break;

      case 'summer':
        tips.push('🌊 涼しい音楽を聴く', '🍧 冷たい飲み物でリフレッシュ', '🌟 夏の思い出を振り返る');
        if (month === 7) {
          tips.push('🎋 七夕の願い事を考える');
        }
        break;

      case 'autumn':
        tips.push('🍂 紅葉の写真を見る', '📖 読書でのんびり過ごす', '🍁 秋の味覚を楽しむ');
        if (month === 11) {
          tips.push('🙏 今年一年を振り返る');
        }
        break;

      case 'winter':
        tips.push('❄️ 雪景色や冬の風景を楽しむ', '☕ 温かい飲み物で暖まる', '🧦 暖かい場所でくつろぐ');
        if (month === 12) {
          tips.push('🎄 年末の整理整頓をする');
        }
        if (month === 1) {
          tips.push('🎍 新年の抱負を考える');
        }
        break;
    }

    // 月別の特別なヒント
    const monthlyTips: Record<number, string[]> = {
      2: ['💌 大切な人への感謝を込めたメッセージを考える'],
      3: ['🎓 新しいスキルや趣味を探してみる'],
      6: ['☔ 雨音を聞きながらリラックス'],
      10: ['🏃‍♂️ スポーツや運動で体を動かす'],
      12: ['🎁 今年の良かったことを3つ思い出す']
    };

    if (monthlyTips[month]) {
      tips.push(...monthlyTips[month]);
    }

    return tips;
  }

  /**
   * 季節のアイコンを取得
   */
  getSeasonIcon(season: SeasonalData['season']): string {
    const icons = {
      spring: '🌸',
      summer: '☀️', 
      autumn: '🍂',
      winter: '❄️'
    };
    return icons[season];
  }

  /**
   * 季節の色テーマを取得
   */
  getSeasonTheme(season: SeasonalData['season']): { primary: string; secondary: string } {
    const themes = {
      spring: { primary: 'text-pink-600', secondary: 'bg-pink-50' },
      summer: { primary: 'text-blue-600', secondary: 'bg-blue-50' },
      autumn: { primary: 'text-orange-600', secondary: 'bg-orange-50' },
      winter: { primary: 'text-cyan-600', secondary: 'bg-cyan-50' }
    };
    return themes[season];
  }
}

// シングルトンインスタンス
let instance: SeasonalClient | null = null;

export const seasonalClient = {
  getCurrentSeasonalData: () => {
    if (!instance) {
      instance = new SeasonalClient();
    }
    return instance.getCurrentSeasonalData();
  },

  getSeasonIcon: (season: SeasonalData['season']) => {
    if (!instance) {
      instance = new SeasonalClient();
    }
    return instance.getSeasonIcon(season);
  },

  getSeasonTheme: (season: SeasonalData['season']) => {
    if (!instance) {
      instance = new SeasonalClient();
    }
    return instance.getSeasonTheme(season);
  }
};