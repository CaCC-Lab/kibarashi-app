// 47都道府県の県庁所在地座標データ
export interface JapanCity {
  id: string;
  name: string;
  japaneseDisplayName: string;
  prefecture: string;
  lat: number;
  lon: number;
  region: string;
}

export const JAPAN_CITIES: JapanCity[] = [
  // 北海道地方
  { id: 'Hokkaido', name: 'Sapporo', japaneseDisplayName: '北海道', prefecture: 'Hokkaido', lat: 43.0642, lon: 141.3469, region: 'Hokkaido' },
  
  // 東北地方
  { id: 'Aomori', name: 'Aomori', japaneseDisplayName: '青森県', prefecture: 'Aomori', lat: 40.8244, lon: 140.7400, region: 'Tohoku' },
  { id: 'Iwate', name: 'Morioka', japaneseDisplayName: '岩手県', prefecture: 'Iwate', lat: 39.7036, lon: 141.1527, region: 'Tohoku' },
  { id: 'Miyagi', name: 'Sendai', japaneseDisplayName: '宮城県', prefecture: 'Miyagi', lat: 38.2682, lon: 140.8694, region: 'Tohoku' },
  { id: 'Akita', name: 'Akita', japaneseDisplayName: '秋田県', prefecture: 'Akita', lat: 39.7186, lon: 140.1024, region: 'Tohoku' },
  { id: 'Yamagata', name: 'Yamagata', japaneseDisplayName: '山形県', prefecture: 'Yamagata', lat: 38.2404, lon: 140.3633, region: 'Tohoku' },
  { id: 'Fukushima', name: 'Fukushima', japaneseDisplayName: '福島県', prefecture: 'Fukushima', lat: 37.7608, lon: 140.4747, region: 'Tohoku' },
  
  // 関東地方
  { id: 'Ibaraki', name: 'Mito', japaneseDisplayName: '茨城県', prefecture: 'Ibaraki', lat: 36.3417, lon: 140.4469, region: 'Kanto' },
  { id: 'Tochigi', name: 'Utsunomiya', japaneseDisplayName: '栃木県', prefecture: 'Tochigi', lat: 36.5658, lon: 139.8836, region: 'Kanto' },
  { id: 'Gunma', name: 'Maebashi', japaneseDisplayName: '群馬県', prefecture: 'Gunma', lat: 36.3906, lon: 139.0608, region: 'Kanto' },
  { id: 'Saitama', name: 'Saitama', japaneseDisplayName: '埼玉県', prefecture: 'Saitama', lat: 35.8569, lon: 139.6489, region: 'Kanto' },
  { id: 'Chiba', name: 'Chiba', japaneseDisplayName: '千葉県', prefecture: 'Chiba', lat: 35.6074, lon: 140.1061, region: 'Kanto' },
  { id: 'Tokyo', name: 'Tokyo', japaneseDisplayName: '東京都', prefecture: 'Tokyo', lat: 35.6762, lon: 139.6503, region: 'Kanto' },
  { id: 'Kanagawa', name: 'Yokohama', japaneseDisplayName: '神奈川県', prefecture: 'Kanagawa', lat: 35.4478, lon: 139.6425, region: 'Kanto' },
  
  // 中部地方
  { id: 'Niigata', name: 'Niigata', japaneseDisplayName: '新潟県', prefecture: 'Niigata', lat: 37.9026, lon: 139.0232, region: 'Chubu' },
  { id: 'Toyama', name: 'Toyama', japaneseDisplayName: '富山県', prefecture: 'Toyama', lat: 36.6953, lon: 137.2113, region: 'Chubu' },
  { id: 'Ishikawa', name: 'Kanazawa', japaneseDisplayName: '石川県', prefecture: 'Ishikawa', lat: 36.5944, lon: 136.6256, region: 'Chubu' },
  { id: 'Fukui', name: 'Fukui', japaneseDisplayName: '福井県', prefecture: 'Fukui', lat: 36.0652, lon: 136.2217, region: 'Chubu' },
  { id: 'Yamanashi', name: 'Kofu', japaneseDisplayName: '山梨県', prefecture: 'Yamanashi', lat: 35.6642, lon: 138.5686, region: 'Chubu' },
  { id: 'Nagano', name: 'Nagano', japaneseDisplayName: '長野県', prefecture: 'Nagano', lat: 36.6513, lon: 138.1811, region: 'Chubu' },
  { id: 'Gifu', name: 'Gifu', japaneseDisplayName: '岐阜県', prefecture: 'Gifu', lat: 35.3911, lon: 136.7222, region: 'Chubu' },
  { id: 'Shizuoka', name: 'Shizuoka', japaneseDisplayName: '静岡県', prefecture: 'Shizuoka', lat: 34.9769, lon: 138.3833, region: 'Chubu' },
  { id: 'Aichi', name: 'Nagoya', japaneseDisplayName: '愛知県', prefecture: 'Aichi', lat: 35.1802, lon: 136.9066, region: 'Chubu' },
  
  // 近畿地方
  { id: 'Mie', name: 'Tsu', japaneseDisplayName: '三重県', prefecture: 'Mie', lat: 34.7303, lon: 136.5086, region: 'Kansai' },
  { id: 'Shiga', name: 'Otsu', japaneseDisplayName: '滋賀県', prefecture: 'Shiga', lat: 35.0044, lon: 135.8686, region: 'Kansai' },
  { id: 'Kyoto', name: 'Kyoto', japaneseDisplayName: '京都府', prefecture: 'Kyoto', lat: 35.0211, lon: 135.7556, region: 'Kansai' },
  { id: 'Osaka', name: 'Osaka', japaneseDisplayName: '大阪府', prefecture: 'Osaka', lat: 34.6937, lon: 135.5023, region: 'Kansai' },
  { id: 'Hyogo', name: 'Kobe', japaneseDisplayName: '兵庫県', prefecture: 'Hyogo', lat: 34.6913, lon: 135.1830, region: 'Kansai' },
  { id: 'Nara', name: 'Nara', japaneseDisplayName: '奈良県', prefecture: 'Nara', lat: 34.6851, lon: 135.8050, region: 'Kansai' },
  { id: 'Wakayama', name: 'Wakayama', japaneseDisplayName: '和歌山県', prefecture: 'Wakayama', lat: 34.2261, lon: 135.1675, region: 'Kansai' },
  
  // 中国地方
  { id: 'Tottori', name: 'Tottori', japaneseDisplayName: '鳥取県', prefecture: 'Tottori', lat: 35.5036, lon: 134.2381, region: 'Chugoku' },
  { id: 'Shimane', name: 'Matsue', japaneseDisplayName: '島根県', prefecture: 'Shimane', lat: 35.4722, lon: 133.0506, region: 'Chugoku' },
  { id: 'Okayama', name: 'Okayama', japaneseDisplayName: '岡山県', prefecture: 'Okayama', lat: 34.6617, lon: 133.9347, region: 'Chugoku' },
  { id: 'Hiroshima', name: 'Hiroshima', japaneseDisplayName: '広島県', prefecture: 'Hiroshima', lat: 34.3853, lon: 132.4553, region: 'Chugoku' },
  { id: 'Yamaguchi', name: 'Yamaguchi', japaneseDisplayName: '山口県', prefecture: 'Yamaguchi', lat: 34.1861, lon: 131.4706, region: 'Chugoku' },
  
  // 四国地方
  { id: 'Tokushima', name: 'Tokushima', japaneseDisplayName: '徳島県', prefecture: 'Tokushima', lat: 34.0658, lon: 134.5594, region: 'Shikoku' },
  { id: 'Kagawa', name: 'Takamatsu', japaneseDisplayName: '香川県', prefecture: 'Kagawa', lat: 34.3428, lon: 134.0431, region: 'Shikoku' },
  { id: 'Ehime', name: 'Matsuyama', japaneseDisplayName: '愛媛県', prefecture: 'Ehime', lat: 33.8417, lon: 132.7656, region: 'Shikoku' },
  { id: 'Kochi', name: 'Kochi', japaneseDisplayName: '高知県', prefecture: 'Kochi', lat: 33.5597, lon: 133.5311, region: 'Shikoku' },
  
  // 九州地方
  { id: 'Fukuoka', name: 'Fukuoka', japaneseDisplayName: '福岡県', prefecture: 'Fukuoka', lat: 33.6064, lon: 130.4181, region: 'Kyushu' },
  { id: 'Saga', name: 'Saga', japaneseDisplayName: '佐賀県', prefecture: 'Saga', lat: 33.2494, lon: 130.2989, region: 'Kyushu' },
  { id: 'Nagasaki', name: 'Nagasaki', japaneseDisplayName: '長崎県', prefecture: 'Nagasaki', lat: 32.7503, lon: 129.8781, region: 'Kyushu' },
  { id: 'Kumamoto', name: 'Kumamoto', japaneseDisplayName: '熊本県', prefecture: 'Kumamoto', lat: 32.8031, lon: 130.7058, region: 'Kyushu' },
  { id: 'Oita', name: 'Oita', japaneseDisplayName: '大分県', prefecture: 'Oita', lat: 33.2382, lon: 131.6125, region: 'Kyushu' },
  { id: 'Miyazaki', name: 'Miyazaki', japaneseDisplayName: '宮崎県', prefecture: 'Miyazaki', lat: 31.9077, lon: 131.4202, region: 'Kyushu' },
  { id: 'Kagoshima', name: 'Kagoshima', japaneseDisplayName: '鹿児島県', prefecture: 'Kagoshima', lat: 31.5602, lon: 130.5581, region: 'Kyushu' },
  
  // 沖縄地方
  { id: 'Okinawa', name: 'Naha', japaneseDisplayName: '沖縄県', prefecture: 'Okinawa', lat: 26.2124, lon: 127.6792, region: 'Okinawa' }
];

/**
 * 都道府県IDから都市データを取得
 */
export function getCityByPrefecture(prefectureId: string): JapanCity | undefined {
  return JAPAN_CITIES.find(city => city.id === prefectureId);
}

/**
 * 都道府県一覧を取得
 */
export function getAllPrefectures(): JapanCity[] {
  return JAPAN_CITIES;
}