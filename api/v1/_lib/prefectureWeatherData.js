// 47都道府県の天気データ設定
const prefectureWeatherData = {
  // 北海道地方
  'Hokkaido': {
    baseName: '北海道',
    temperatureRange: { min: -8, max: 28 },
    commonConditions: ['sunny', 'cloudy', 'snowy'],
    seasonalAdjustment: {
      'winter': -15, 'spring': -5, 'summer': 3, 'autumn': -8
    }
  },
  
  // 東北地方
  'Aomori': {
    baseName: '青森県',
    temperatureRange: { min: -5, max: 29 },
    commonConditions: ['sunny', 'cloudy', 'snowy'],
    seasonalAdjustment: {
      'winter': -12, 'spring': -3, 'summer': 4, 'autumn': -6
    }
  },
  'Iwate': {
    baseName: '岩手県',
    temperatureRange: { min: -4, max: 30 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -10, 'spring': -2, 'summer': 5, 'autumn': -5
    }
  },
  'Miyagi': {
    baseName: '宮城県',
    temperatureRange: { min: 3, max: 30 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -8, 'spring': -2, 'summer': 5, 'autumn': -4
    }
  },
  'Akita': {
    baseName: '秋田県',
    temperatureRange: { min: -3, max: 30 },
    commonConditions: ['sunny', 'cloudy', 'snowy'],
    seasonalAdjustment: {
      'winter': -11, 'spring': -3, 'summer': 4, 'autumn': -6
    }
  },
  'Yamagata': {
    baseName: '山形県',
    temperatureRange: { min: -2, max: 32 },
    commonConditions: ['sunny', 'cloudy', 'snowy'],
    seasonalAdjustment: {
      'winter': -10, 'spring': -1, 'summer': 6, 'autumn': -5
    }
  },
  'Fukushima': {
    baseName: '福島県',
    temperatureRange: { min: 0, max: 32 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -7, 'spring': 0, 'summer': 6, 'autumn': -3
    }
  },
  
  // 関東地方
  'Ibaraki': {
    baseName: '茨城県',
    temperatureRange: { min: 2, max: 32 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -6, 'spring': 0, 'summer': 7, 'autumn': -2
    }
  },
  'Tochigi': {
    baseName: '栃木県',
    temperatureRange: { min: 0, max: 33 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -7, 'spring': 0, 'summer': 8, 'autumn': -3
    }
  },
  'Gunma': {
    baseName: '群馬県',
    temperatureRange: { min: 1, max: 35 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -6, 'spring': 1, 'summer': 10, 'autumn': -2
    }
  },
  'Saitama': {
    baseName: '埼玉県',
    temperatureRange: { min: 4, max: 36 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -4, 'spring': 1, 'summer': 10, 'autumn': -1
    }
  },
  'Chiba': {
    baseName: '千葉県',
    temperatureRange: { min: 6, max: 32 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -3, 'spring': 1, 'summer': 7, 'autumn': 0
    }
  },
  'Tokyo': {
    baseName: '東京都',
    temperatureRange: { min: 8, max: 32 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -5, 'spring': 0, 'summer': 8, 'autumn': -2
    }
  },
  'Kanagawa': {
    baseName: '神奈川県',
    temperatureRange: { min: 9, max: 30 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -4, 'spring': 1, 'summer': 6, 'autumn': -1
    }
  },
  
  // 中部地方
  'Niigata': {
    baseName: '新潟県',
    temperatureRange: { min: 2, max: 31 },
    commonConditions: ['sunny', 'cloudy', 'snowy'],
    seasonalAdjustment: {
      'winter': -9, 'spring': -1, 'summer': 6, 'autumn': -4
    }
  },
  'Toyama': {
    baseName: '富山県',
    temperatureRange: { min: 3, max: 31 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -8, 'spring': 0, 'summer': 7, 'autumn': -3
    }
  },
  'Ishikawa': {
    baseName: '石川県',
    temperatureRange: { min: 3, max: 31 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -8, 'spring': 0, 'summer': 7, 'autumn': -3
    }
  },
  'Fukui': {
    baseName: '福井県',
    temperatureRange: { min: 3, max: 32 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -7, 'spring': 0, 'summer': 8, 'autumn': -3
    }
  },
  'Yamanashi': {
    baseName: '山梨県',
    temperatureRange: { min: 2, max: 35 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -7, 'spring': 1, 'summer': 10, 'autumn': -2
    }
  },
  'Nagano': {
    baseName: '長野県',
    temperatureRange: { min: -2, max: 32 },
    commonConditions: ['sunny', 'cloudy', 'snowy'],
    seasonalAdjustment: {
      'winter': -10, 'spring': -1, 'summer': 7, 'autumn': -5
    }
  },
  'Gifu': {
    baseName: '岐阜県',
    temperatureRange: { min: 4, max: 36 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -6, 'spring': 1, 'summer': 11, 'autumn': -2
    }
  },
  'Shizuoka': {
    baseName: '静岡県',
    temperatureRange: { min: 7, max: 33 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -3, 'spring': 2, 'summer': 8, 'autumn': 0
    }
  },
  'Aichi': {
    baseName: '愛知県',
    temperatureRange: { min: 6, max: 36 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -6, 'spring': 1, 'summer': 11, 'autumn': -2
    }
  },
  
  // 近畿地方
  'Mie': {
    baseName: '三重県',
    temperatureRange: { min: 6, max: 34 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -4, 'spring': 1, 'summer': 9, 'autumn': -1
    }
  },
  'Shiga': {
    baseName: '滋賀県',
    temperatureRange: { min: 4, max: 34 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -6, 'spring': 1, 'summer': 10, 'autumn': -2
    }
  },
  'Kyoto': {
    baseName: '京都府',
    temperatureRange: { min: 5, max: 38 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -7, 'spring': 1, 'summer': 12, 'autumn': -1
    }
  },
  'Osaka': {
    baseName: '大阪府',
    temperatureRange: { min: 10, max: 35 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -3, 'spring': 2, 'summer': 10, 'autumn': 0
    }
  },
  'Hyogo': {
    baseName: '兵庫県',
    temperatureRange: { min: 9, max: 32 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -3, 'spring': 1, 'summer': 7, 'autumn': -1
    }
  },
  'Nara': {
    baseName: '奈良県',
    temperatureRange: { min: 5, max: 35 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -6, 'spring': 1, 'summer': 11, 'autumn': -2
    }
  },
  'Wakayama': {
    baseName: '和歌山県',
    temperatureRange: { min: 8, max: 33 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -2, 'spring': 2, 'summer': 8, 'autumn': 1
    }
  },
  
  // 中国地方
  'Tottori': {
    baseName: '鳥取県',
    temperatureRange: { min: 5, max: 32 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -5, 'spring': 1, 'summer': 8, 'autumn': -2
    }
  },
  'Shimane': {
    baseName: '島根県',
    temperatureRange: { min: 5, max: 31 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -5, 'spring': 1, 'summer': 7, 'autumn': -2
    }
  },
  'Okayama': {
    baseName: '岡山県',
    temperatureRange: { min: 6, max: 33 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -4, 'spring': 2, 'summer': 9, 'autumn': -1
    }
  },
  'Hiroshima': {
    baseName: '広島県',
    temperatureRange: { min: 8, max: 33 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -2, 'spring': 2, 'summer': 8, 'autumn': 0
    }
  },
  'Yamaguchi': {
    baseName: '山口県',
    temperatureRange: { min: 8, max: 32 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -2, 'spring': 2, 'summer': 8, 'autumn': 0
    }
  },
  
  // 四国地方
  'Tokushima': {
    baseName: '徳島県',
    temperatureRange: { min: 8, max: 33 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -1, 'spring': 2, 'summer': 8, 'autumn': 1
    }
  },
  'Kagawa': {
    baseName: '香川県',
    temperatureRange: { min: 7, max: 33 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -2, 'spring': 2, 'summer': 9, 'autumn': 1
    }
  },
  'Ehime': {
    baseName: '愛媛県',
    temperatureRange: { min: 8, max: 33 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -1, 'spring': 2, 'summer': 8, 'autumn': 1
    }
  },
  'Kochi': {
    baseName: '高知県',
    temperatureRange: { min: 9, max: 33 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': 0, 'spring': 3, 'summer': 8, 'autumn': 2
    }
  },
  
  // 九州地方
  'Fukuoka': {
    baseName: '福岡県',
    temperatureRange: { min: 12, max: 34 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -1, 'spring': 3, 'summer': 9, 'autumn': 1
    }
  },
  'Saga': {
    baseName: '佐賀県',
    temperatureRange: { min: 10, max: 34 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -1, 'spring': 3, 'summer': 9, 'autumn': 1
    }
  },
  'Nagasaki': {
    baseName: '長崎県',
    temperatureRange: { min: 11, max: 33 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': 0, 'spring': 3, 'summer': 8, 'autumn': 2
    }
  },
  'Kumamoto': {
    baseName: '熊本県',
    temperatureRange: { min: 10, max: 35 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -1, 'spring': 3, 'summer': 10, 'autumn': 1
    }
  },
  'Oita': {
    baseName: '大分県',
    temperatureRange: { min: 9, max: 33 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -1, 'spring': 3, 'summer': 9, 'autumn': 1
    }
  },
  'Miyazaki': {
    baseName: '宮崎県',
    temperatureRange: { min: 11, max: 33 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': 1, 'spring': 4, 'summer': 8, 'autumn': 2
    }
  },
  'Kagoshima': {
    baseName: '鹿児島県',
    temperatureRange: { min: 12, max: 33 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': 2, 'spring': 4, 'summer': 8, 'autumn': 3
    }
  },
  
  // 沖縄地方
  'Okinawa': {
    baseName: '沖縄県',
    temperatureRange: { min: 16, max: 32 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': 8, 'spring': 6, 'summer': 6, 'autumn': 7
    }
  },
  
  // 既存の主要都市（後方互換性のため保持）
  'Yokohama': {
    baseName: '横浜',
    temperatureRange: { min: 9, max: 30 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -4, 'spring': 1, 'summer': 6, 'autumn': -1
    }
  },
  'Nagoya': {
    baseName: '名古屋',
    temperatureRange: { min: 6, max: 36 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -6, 'spring': 1, 'summer': 11, 'autumn': -2
    }
  },
  'Sapporo': {
    baseName: '札幌',
    temperatureRange: { min: -8, max: 28 },
    commonConditions: ['sunny', 'cloudy', 'snowy'],
    seasonalAdjustment: {
      'winter': -15, 'spring': -5, 'summer': 3, 'autumn': -8
    }
  },
  'Sendai': {
    baseName: '仙台',
    temperatureRange: { min: 3, max: 30 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -8, 'spring': -2, 'summer': 5, 'autumn': -4
    }
  },
  'Kobe': {
    baseName: '神戸',
    temperatureRange: { min: 9, max: 32 },
    commonConditions: ['sunny', 'cloudy', 'rainy'],
    seasonalAdjustment: {
      'winter': -3, 'spring': 1, 'summer': 7, 'autumn': -1
    }
  }
};

module.exports = prefectureWeatherData;