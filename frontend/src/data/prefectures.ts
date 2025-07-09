export interface Prefecture {
  id: string;
  name: string;
  displayName: string;
  region: string;
  capital?: string;
}

export const PREFECTURES: Prefecture[] = [
  // 北海道地方
  { id: 'hokkaido', name: 'Hokkaido', displayName: '北海道', region: '北海道', capital: '札幌市' },
  
  // 東北地方
  { id: 'aomori', name: 'Aomori', displayName: '青森県', region: '東北', capital: '青森市' },
  { id: 'iwate', name: 'Iwate', displayName: '岩手県', region: '東北', capital: '盛岡市' },
  { id: 'miyagi', name: 'Miyagi', displayName: '宮城県', region: '東北', capital: '仙台市' },
  { id: 'akita', name: 'Akita', displayName: '秋田県', region: '東北', capital: '秋田市' },
  { id: 'yamagata', name: 'Yamagata', displayName: '山形県', region: '東北', capital: '山形市' },
  { id: 'fukushima', name: 'Fukushima', displayName: '福島県', region: '東北', capital: '福島市' },
  
  // 関東地方
  { id: 'ibaraki', name: 'Ibaraki', displayName: '茨城県', region: '関東', capital: '水戸市' },
  { id: 'tochigi', name: 'Tochigi', displayName: '栃木県', region: '関東', capital: '宇都宮市' },
  { id: 'gunma', name: 'Gunma', displayName: '群馬県', region: '関東', capital: '前橋市' },
  { id: 'saitama', name: 'Saitama', displayName: '埼玉県', region: '関東', capital: 'さいたま市' },
  { id: 'chiba', name: 'Chiba', displayName: '千葉県', region: '関東', capital: '千葉市' },
  { id: 'tokyo', name: 'Tokyo', displayName: '東京都', region: '関東', capital: '東京' },
  { id: 'kanagawa', name: 'Kanagawa', displayName: '神奈川県', region: '関東', capital: '横浜市' },
  
  // 中部地方
  { id: 'niigata', name: 'Niigata', displayName: '新潟県', region: '中部', capital: '新潟市' },
  { id: 'toyama', name: 'Toyama', displayName: '富山県', region: '中部', capital: '富山市' },
  { id: 'ishikawa', name: 'Ishikawa', displayName: '石川県', region: '中部', capital: '金沢市' },
  { id: 'fukui', name: 'Fukui', displayName: '福井県', region: '中部', capital: '福井市' },
  { id: 'yamanashi', name: 'Yamanashi', displayName: '山梨県', region: '中部', capital: '甲府市' },
  { id: 'nagano', name: 'Nagano', displayName: '長野県', region: '中部', capital: '長野市' },
  { id: 'gifu', name: 'Gifu', displayName: '岐阜県', region: '中部', capital: '岐阜市' },
  { id: 'shizuoka', name: 'Shizuoka', displayName: '静岡県', region: '中部', capital: '静岡市' },
  { id: 'aichi', name: 'Aichi', displayName: '愛知県', region: '中部', capital: '名古屋市' },
  
  // 近畿地方
  { id: 'mie', name: 'Mie', displayName: '三重県', region: '近畿', capital: '津市' },
  { id: 'shiga', name: 'Shiga', displayName: '滋賀県', region: '近畿', capital: '大津市' },
  { id: 'kyoto', name: 'Kyoto', displayName: '京都府', region: '近畿', capital: '京都市' },
  { id: 'osaka', name: 'Osaka', displayName: '大阪府', region: '近畿', capital: '大阪市' },
  { id: 'hyogo', name: 'Hyogo', displayName: '兵庫県', region: '近畿', capital: '神戸市' },
  { id: 'nara', name: 'Nara', displayName: '奈良県', region: '近畿', capital: '奈良市' },
  { id: 'wakayama', name: 'Wakayama', displayName: '和歌山県', region: '近畿', capital: '和歌山市' },
  
  // 中国地方
  { id: 'tottori', name: 'Tottori', displayName: '鳥取県', region: '中国', capital: '鳥取市' },
  { id: 'shimane', name: 'Shimane', displayName: '島根県', region: '中国', capital: '松江市' },
  { id: 'okayama', name: 'Okayama', displayName: '岡山県', region: '中国', capital: '岡山市' },
  { id: 'hiroshima', name: 'Hiroshima', displayName: '広島県', region: '中国', capital: '広島市' },
  { id: 'yamaguchi', name: 'Yamaguchi', displayName: '山口県', region: '中国', capital: '山口市' },
  
  // 四国地方
  { id: 'tokushima', name: 'Tokushima', displayName: '徳島県', region: '四国', capital: '徳島市' },
  { id: 'kagawa', name: 'Kagawa', displayName: '香川県', region: '四国', capital: '高松市' },
  { id: 'ehime', name: 'Ehime', displayName: '愛媛県', region: '四国', capital: '松山市' },
  { id: 'kochi', name: 'Kochi', displayName: '高知県', region: '四国', capital: '高知市' },
  
  // 九州・沖縄地方
  { id: 'fukuoka', name: 'Fukuoka', displayName: '福岡県', region: '九州', capital: '福岡市' },
  { id: 'saga', name: 'Saga', displayName: '佐賀県', region: '九州', capital: '佐賀市' },
  { id: 'nagasaki', name: 'Nagasaki', displayName: '長崎県', region: '九州', capital: '長崎市' },
  { id: 'kumamoto', name: 'Kumamoto', displayName: '熊本県', region: '九州', capital: '熊本市' },
  { id: 'oita', name: 'Oita', displayName: '大分県', region: '九州', capital: '大分市' },
  { id: 'miyazaki', name: 'Miyazaki', displayName: '宮崎県', region: '九州', capital: '宮崎市' },
  { id: 'kagoshima', name: 'Kagoshima', displayName: '鹿児島県', region: '九州', capital: '鹿児島市' },
  { id: 'okinawa', name: 'Okinawa', displayName: '沖縄県', region: '沖縄', capital: '那覇市' },
];

// 地域の順序（UIでの表示順）
export const REGIONS_ORDER = [
  '北海道',
  '東北',
  '関東',
  '中部',
  '近畿',
  '中国',
  '四国',
  '九州',
  '沖縄'
];

// 主要都市を含む都道府県の特別な場所データ（後方互換性のため）
export const MAJOR_CITIES = [
  { prefectureId: 'tokyo', cityName: 'Tokyo', displayName: '東京' },
  { prefectureId: 'osaka', cityName: 'Osaka', displayName: '大阪' },
  { prefectureId: 'kyoto', cityName: 'Kyoto', displayName: '京都' },
  { prefectureId: 'kanagawa', cityName: 'Yokohama', displayName: '横浜' },
  { prefectureId: 'aichi', cityName: 'Nagoya', displayName: '名古屋' },
  { prefectureId: 'hokkaido', cityName: 'Sapporo', displayName: '札幌' },
  { prefectureId: 'fukuoka', cityName: 'Fukuoka', displayName: '福岡' },
  { prefectureId: 'miyagi', cityName: 'Sendai', displayName: '仙台' },
  { prefectureId: 'hiroshima', cityName: 'Hiroshima', displayName: '広島' },
  { prefectureId: 'hyogo', cityName: 'Kobe', displayName: '神戸' },
];