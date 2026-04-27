// 日本（JST = UTC+9）のローカル日付を YYYY-MM-DD で返す。
// 注: toISOString() は UTC を返すため、JST 0:00〜9:00 は前日の日付になる。
// ja-JP/Asia/Tokyo で formatToParts して year/month/day を取り出すことで JST の暦日を確実に取得。
export function todayStr(): string {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' });
  return fmt.format(new Date()); // en-CA は YYYY-MM-DD 形式
}
