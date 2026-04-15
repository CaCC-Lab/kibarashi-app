-- 自動生成: generate-seed.py
-- 提案マスタのシードデータ
-- 159 件

DELETE FROM suggestions_master;

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '楽しかった思い出を振り返る',
  '最近の楽しかった出来事や、好きな場所の思い出を思い出してみましょう',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['目を閉じて、最近楽しかったことを思い出してみましょう。', '誰と一緒でしたか？どんな気持ちでしたか？']::text[],
  '目を閉じて、最近楽しかったことを思い出してみましょう。誰と一緒でしたか？どんな気持ちでしたか？',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '楽しかった思い出を振り返る',
  '最近の楽しかった出来事や、好きな場所の思い出を思い出してみましょう',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['お気に入りの場所を思い出してください。', 'その場所の景色、音、香り、感触を一つずつ思い出してみましょう。']::text[],
  'お気に入りの場所を思い出してください。その場所の景色、音、香り、感触を一つずつ思い出してみましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '楽しかった思い出を振り返る',
  '最近の楽しかった出来事や、好きな場所の思い出を思い出してみましょう',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['人生で最も幸せだった瞬間を3つ選んで、それぞれじっくりと思い出してください。', '当時の気持ちを味わいましょう。']::text[],
  '人生で最も幸せだった瞬間を3つ選んで、それぞれじっくりと思い出してください。当時の気持ちを味わいましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '温かい飲み物でリラックス',
  'コーヒーや紅茶など、お気に入りの温かい飲み物をゆっくり楽しみましょう',
  5,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['まず深呼吸をして、飲み物の香りを楽しみましょう。', '一口ずつゆっくりと味わってください。']::text[],
  'まず深呼吸をして、飲み物の香りを楽しみましょう。一口ずつゆっくりと味わってください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '温かい飲み物でリラックス',
  'コーヒーや紅茶など、お気に入りの温かい飲み物をゆっくり楽しみましょう',
  15,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['飲み物を準備するところから始めましょう。', 'お湯を沸かす音、立ち上る湯気、カップの温もりを感じながら、ゆっくりと時間をかけて楽しんでください。']::text[],
  '飲み物を準備するところから始めましょう。お湯を沸かす音、立ち上る湯気、カップの温もりを感じながら、ゆっくりと時間をかけて楽しんでください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '自分への優しい言葉かけ',
  '「頑張っているね」「大丈夫だよ」など、自分に優しい言葉をかけてあげましょう',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['手を胸に当てて、「よく頑張っているね」と自分に言ってあげましょう。', '今日頑張ったことを3つ思い出して、自分を褒めてあげてください。']::text[],
  '手を胸に当てて、「よく頑張っているね」と自分に言ってあげましょう。今日頑張ったことを3つ思い出して、自分を褒めてあげてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '軽いストレッチ',
  '肩を回したり、首を伸ばしたり、軽いストレッチで体をほぐしましょう',
  5,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['まず肩を大きく回しましょう。', '前に5回、後ろに5回。', '次に首をゆっくり左右に倒して、各10秒キープしてください。']::text[],
  'まず肩を大きく回しましょう。前に5回、後ろに5回。次に首をゆっくり左右に倒して、各10秒キープしてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '軽いストレッチ',
  '肩を回したり、首を伸ばしたり、軽いストレッチで体をほぐしましょう',
  15,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['立ち上がって、全身のストレッチをしましょう。', '腕を上に伸ばし、体を左右にゆっくり傾けます。', '前屈して背中を伸ばし、最後に深呼吸を3回行いましょう。']::text[],
  '立ち上がって、全身のストレッチをしましょう。腕を上に伸ばし、体を左右にゆっくり傾けます。前屈して背中を伸ばし、最後に深呼吸を3回行いましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '少し歩いてみる',
  '近くを少し歩いて、景色を眺めながら気分転換しましょう',
  5,
  '行動的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['建物の周りを一周歩いてみましょう。', '歩きながら深呼吸をして、周りの景色に注目してください。']::text[],
  '建物の周りを一周歩いてみましょう。歩きながら深呼吸をして、周りの景色に注目してください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '少し歩いてみる',
  '近くを少し歩いて、景色を眺めながら気分転換しましょう',
  15,
  '行動的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['いつもとは違う道を選んで歩いてみましょう。', '新しい発見があるかもしれません。', '歩くペースはゆっくりで構いません。']::text[],
  'いつもとは違う道を選んで歩いてみましょう。新しい発見があるかもしれません。歩くペースはゆっくりで構いません。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '少し歩いてみる',
  '近くを少し歩いて、景色を眺めながら気分転換しましょう',
  30,
  '行動的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['近くの公園や静かな場所まで歩いてみましょう。', '自然の音に耳を傾けながら、のんびりと散歩を楽しんでください。']::text[],
  '近くの公園や静かな場所まで歩いてみましょう。自然の音に耳を傾けながら、のんびりと散歩を楽しんでください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '理想の休暇を想像する',
  '行きたい場所や、やりたいことを自由に想像してみましょう',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['目を閉じて、行ってみたい場所を一つ思い浮かべてください。', 'そこで何をしているか、誰と一緒か、想像してみましょう。']::text[],
  '目を閉じて、行ってみたい場所を一つ思い浮かべてください。そこで何をしているか、誰と一緒か、想像してみましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '理想の休暇を想像する',
  '行きたい場所や、やりたいことを自由に想像してみましょう',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['理想の一日を最初から最後まで想像してみましょう。', '朝起きてから夜眠るまで、どんな素敵な一日を過ごしますか？']::text[],
  '理想の一日を最初から最後まで想像してみましょう。朝起きてから夜眠るまで、どんな素敵な一日を過ごしますか？',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '深呼吸でリラックス',
  'ゆっくりと深い呼吸を繰り返して、心と体を落ち着けましょう',
  5,
  '行動的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['4秒かけて鼻から息を吸い、4秒息を止め、4秒かけて口から息を吐きます。', 'これを5回繰り返しましょう。']::text[],
  '4秒かけて鼻から息を吸い、4秒息を止め、4秒かけて口から息を吐きます。これを5回繰り返しましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '好きな音楽を聴く',
  'お気に入りの曲を聴いて、気分をリフレッシュしましょう',
  5,
  '行動的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['今の気分に合う曲を1曲選んで聴きましょう。', '音楽に集中して、メロディーやリズムを楽しんでください。']::text[],
  '今の気分に合う曲を1曲選んで聴きましょう。音楽に集中して、メロディーやリズムを楽しんでください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '好きな音楽を聴く',
  'お気に入りの曲を聴いて、気分をリフレッシュしましょう',
  15,
  '行動的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['プレイリストを作って、ゆったりと音楽を楽しみましょう。', '目を閉じて、音楽の世界に浸ってください。']::text[],
  'プレイリストを作って、ゆったりと音楽を楽しみましょう。目を閉じて、音楽の世界に浸ってください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '好きな音楽を聴く',
  'お気に入りの曲を聴いて、気分をリフレッシュしましょう',
  30,
  '行動的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['アルバムを1枚通して聴いてみましょう。', '歌詞の意味を考えたり、楽器の音を聴き分けたりしながら、じっくり楽しんでください。']::text[],
  'アルバムを1枚通して聴いてみましょう。歌詞の意味を考えたり、楽器の音を聴き分けたりしながら、じっくり楽しんでください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '今の気持ちを受け入れる',
  '今の自分の気持ちをそのまま認めて、「それでいいよ」と受け入れてみましょう',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['今の気持ちを言葉にしてみましょう。', '「疲れている」「イライラしている」など。', 'そして「それでも大丈夫」と自分に言ってあげてください。']::text[],
  '今の気持ちを言葉にしてみましょう。「疲れている」「イライラしている」など。そして「それでも大丈夫」と自分に言ってあげてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '窓の外を眺める',
  '窓から外の景色をぼんやり眺めて、心を休めましょう',
  5,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['窓の外を眺めて、空の色や雲の形に注目してみましょう。', '鳥が飛んでいたら、その動きを追ってみてください。']::text[],
  '窓の外を眺めて、空の色や雲の形に注目してみましょう。鳥が飛んでいたら、その動きを追ってみてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '窓の外を眺める',
  '窓から外の景色をぼんやり眺めて、心を休めましょう',
  15,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['窓際に座って、外の景色をゆっくり観察しましょう。', '季節の変化、人々の様子、自然の動きなど、いろいろなものに気づくはずです。']::text[],
  '窓際に座って、外の景色をゆっくり観察しましょう。季節の変化、人々の様子、自然の動きなど、いろいろなものに気づくはずです。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'デスク周りを整理する',
  '身の回りを少し片付けて、すっきりした気分になりましょう',
  5,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['デスクの上の不要なものを片付けましょう。', 'ペンを揃えたり、書類を整理したり、小さなことから始めてください。']::text[],
  'デスクの上の不要なものを片付けましょう。ペンを揃えたり、書類を整理したり、小さなことから始めてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'デスク周りを整理する',
  '身の回りを少し片付けて、すっきりした気分になりましょう',
  15,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['引き出しの中も含めて整理しましょう。', '使わないものは処分し、必要なものは使いやすい場所に配置してください。']::text[],
  '引き出しの中も含めて整理しましょう。使わないものは処分し、必要なものは使いやすい場所に配置してください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '感謝できることを数える',
  '今日あった小さな良いことや、感謝できることを思い出してみましょう',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['今日の中で「ありがたいな」と思えることを3つ思い出してみましょう。', '小さなことで構いません。']::text[],
  '今日の中で「ありがたいな」と思えることを3つ思い出してみましょう。小さなことで構いません。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '感謝できることを数える',
  '今日あった小さな良いことや、感謝できることを思い出してみましょう',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['最近お世話になった人を思い出して、心の中で「ありがとう」を伝えてみましょう。', 'その人との良い思い出も振り返ってみてください。']::text[],
  '最近お世話になった人を思い出して、心の中で「ありがとう」を伝えてみましょう。その人との良い思い出も振り返ってみてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '落書きをしてみる',
  '紙とペンで自由に落書きして、創造的な時間を楽しみましょう',
  5,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['円や線、模様など、何も考えずに手を動かしてみましょう。', '上手い下手は関係ありません。']::text[],
  '円や線、模様など、何も考えずに手を動かしてみましょう。上手い下手は関係ありません。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '落書きをしてみる',
  '紙とペンで自由に落書きして、創造的な時間を楽しみましょう',
  15,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['好きなものを描いてみましょう。', '花、動物、風景など、思いつくままに描いてください。', '色をつけても楽しいですね。']::text[],
  '好きなものを描いてみましょう。花、動物、風景など、思いつくままに描いてください。色をつけても楽しいですね。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '大切な人にメッセージを送る',
  '家族や友人に短いメッセージを送って、つながりを感じましょう',
  5,
  '行動的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['「元気？」「今日もお疲れさま」など、短いメッセージを送ってみましょう。', 'スタンプだけでも構いません。']::text[],
  '「元気？」「今日もお疲れさま」など、短いメッセージを送ってみましょう。スタンプだけでも構いません。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '違う視点で考えてみる',
  '今の状況を別の角度から見てみて、新しい発見をしてみましょう',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['今のストレスを「成長のチャンス」として捉えてみましょう。', 'この経験から何を学べるか考えてみてください。']::text[],
  '今のストレスを「成長のチャンス」として捉えてみましょう。この経験から何を学べるか考えてみてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '違う視点で考えてみる',
  '今の状況を別の角度から見てみて、新しい発見をしてみましょう',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['5年後の自分から今の自分を見たらどう思うか想像してみましょう。', 'きっと違う見方ができるはずです。']::text[],
  '5年後の自分から今の自分を見たらどう思うか想像してみましょう。きっと違う見方ができるはずです。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '好きな香りを楽しむ',
  'アロマやハンドクリームなど、好きな香りでリラックスしましょう',
  5,
  '行動的',
  ARRAY['home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['ハンドクリームを手に取って、ゆっくりとマッサージしながら香りを楽しみましょう。']::text[],
  'ハンドクリームを手に取って、ゆっくりとマッサージしながら香りを楽しみましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '好きな香りを楽しむ',
  'アロマやハンドクリームなど、好きな香りでリラックスしましょう',
  15,
  '行動的',
  ARRAY['home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['お気に入りのアロマオイルやお香を焚いて、香りに包まれながらリラックスしてください。']::text[],
  'お気に入りのアロマオイルやお香を焚いて、香りに包まれながらリラックスしてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '目を閉じて休憩',
  'しばらく目を閉じて、頭と目を休めましょう',
  5,
  '行動的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['椅子に深く座って目を閉じ、まぶたの裏の暗さを感じてください。', '何も考えなくて大丈夫です。']::text[],
  '椅子に深く座って目を閉じ、まぶたの裏の暗さを感じてください。何も考えなくて大丈夫です。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '目を閉じて休憩',
  'しばらく目を閉じて、頭と目を休めましょう',
  15,
  '行動的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['横になれる場所があれば横になって、全身の力を抜いてください。', 'アラームをセットして、少し仮眠を取るのも良いでしょう。']::text[],
  '横になれる場所があれば横になって、全身の力を抜いてください。アラームをセットして、少し仮眠を取るのも良いでしょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '楽しい予定を立てる',
  '週末や休暇の楽しい計画を立てて、ワクワクする気持ちを味わいましょう',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['次の週末にやりたいことをリストアップしてみましょう。', '美味しいものを食べる、映画を見る、どこかに出かけるなど。']::text[],
  '次の週末にやりたいことをリストアップしてみましょう。美味しいものを食べる、映画を見る、どこかに出かけるなど。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '楽しい予定を立てる',
  '週末や休暇の楽しい計画を立てて、ワクワクする気持ちを味わいましょう',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['次の長期休暇の計画を立ててみましょう。', '行きたい場所、会いたい人、やりたいことを具体的に想像してください。']::text[],
  '次の長期休暇の計画を立ててみましょう。行きたい場所、会いたい人、やりたいことを具体的に想像してください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '好きな写真や動画を見る',
  'スマホの中の楽しい写真や、お気に入りの動画を見て気分転換しましょう',
  5,
  '行動的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['スマホのアルバムから、笑顔の写真や美しい風景の写真を選んで眺めてみましょう。']::text[],
  'スマホのアルバムから、笑顔の写真や美しい風景の写真を選んで眺めてみましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '好きな写真や動画を見る',
  'スマホの中の楽しい写真や、お気に入りの動画を見て気分転換しましょう',
  15,
  '行動的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['お気に入りの動画を見たり、面白い動画を探したりして、楽しい時間を過ごしてください。']::text[],
  'お気に入りの動画を見たり、面白い動画を探したりして、楽しい時間を過ごしてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '今この瞬間に集中する',
  '過去や未来ではなく、今この瞬間の感覚に意識を向けてみましょう',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['今聞こえる音、見えるもの、感じる温度など、五感で感じることに注意を向けてみましょう。']::text[],
  '今聞こえる音、見えるもの、感じる温度など、五感で感じることに注意を向けてみましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '今この瞬間に集中する',
  '過去や未来ではなく、今この瞬間の感覚に意識を向けてみましょう',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['体の各部分に意識を向けて、緊張している場所を見つけたら、そこに息を送るイメージで力を抜いていきましょう。']::text[],
  '体の各部分に意識を向けて、緊張している場所を見つけたら、そこに息を送るイメージで力を抜いていきましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '成功体験を思い出す',
  '過去の成功体験や達成感を感じた瞬間を振り返りましょう',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['これまでに達成した目標や乗り越えた困難を思い出してください。', 'その時の達成感や誇らしい気持ちを再体験しましょう。']::text[],
  'これまでに達成した目標や乗り越えた困難を思い出してください。その時の達成感や誇らしい気持ちを再体験しましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '成功体験を思い出す',
  '過去の成功体験や達成感を感じた瞬間を振り返りましょう',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['人生で最も誇りに思う3つの成功体験を詳細に思い出してください。', 'それぞれについて、どんな努力をしたか、どんな困難があったか、どう乗り越えたかを振り返りましょう。']::text[],
  '人生で最も誇りに思う3つの成功体験を詳細に思い出してください。それぞれについて、どんな努力をしたか、どんな困難があったか、どう乗り越えたかを振り返りましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '簡単な日記を書く',
  '今日の出来事や感情を短い文章で記録してみましょう',
  15,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['今日の出来事を3つ選んで、それぞれ2-3文で記録してみましょう。', '良かったこと、学んだこと、感謝したいことを含めてください。']::text[],
  '今日の出来事を3つ選んで、それぞれ2-3文で記録してみましょう。良かったこと、学んだこと、感謝したいことを含めてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '簡単な日記を書く',
  '今日の出来事や感情を短い文章で記録してみましょう',
  30,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['今日一日を振り返って、詳しい日記を書いてみましょう。', '出来事だけでなく、その時の感情や考えたことも記録してください。', '明日への目標も一つ書き加えましょう。']::text[],
  '今日一日を振り返って、詳しい日記を書いてみましょう。出来事だけでなく、その時の感情や考えたことも記録してください。明日への目標も一つ書き加えましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '階段の上り下り',
  '階段を使って軽い有酸素運動をしてみましょう',
  5,
  '行動的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['近くの階段を見つけて、ゆっくりと2往復してみましょう。', '呼吸を意識しながら、一段一段丁寧に上り下りしてください。']::text[],
  '近くの階段を見つけて、ゆっくりと2往復してみましょう。呼吸を意識しながら、一段一段丁寧に上り下りしてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '階段の上り下り',
  '階段を使って軽い有酸素運動をしてみましょう',
  15,
  '行動的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['階段を使って軽い運動をしましょう。', '通常のペースで5往復、その後ゆっくり歩いて呼吸を整えてください。']::text[],
  '階段を使って軽い運動をしましょう。通常のペースで5往復、その後ゆっくり歩いて呼吸を整えてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '階段の上り下り',
  '階段を使って軽い有酸素運動をしてみましょう',
  30,
  '行動的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['階段運動で体を動かしましょう。', '3分上り下り、2分休憩のセットを5回繰り返してください。', '自分のペースで無理なく行いましょう。']::text[],
  '階段運動で体を動かしましょう。3分上り下り、2分休憩のセットを5回繰り返してください。自分のペースで無理なく行いましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'ボディスキャン瞑想',
  '体の各部分に意識を向けて、緊張をほぐしていきましょう',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['椅子に座って目を閉じ、足先から頭頂部まで順番に意識を向けていきます。', '各部位の緊張に気づいたら、呼吸とともに力を抜いていきましょう。']::text[],
  '椅子に座って目を閉じ、足先から頭頂部まで順番に意識を向けていきます。各部位の緊張に気づいたら、呼吸とともに力を抜いていきましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'ボディスキャン瞑想',
  '体の各部分に意識を向けて、緊張をほぐしていきましょう',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['横になれる場所で、じっくりとボディスキャンを行いましょう。', 'つま先から始めて、足、ふくらはぎ、太もも、腰、背中、肩、腕、首、顔と、各部位に2-3分ずつ意識を向けて、完全にリラックスさせていきます。']::text[],
  '横になれる場所で、じっくりとボディスキャンを行いましょう。つま先から始めて、足、ふくらはぎ、太もも、腰、背中、肩、腕、首、顔と、各部位に2-3分ずつ意識を向けて、完全にリラックスさせていきます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '感謝の手紙を書く',
  'お世話になった人への感謝の気持ちを手紙にしてみましょう',
  30,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['最近お世話になった人、または長年感謝を伝えたかった人を一人選んで、手紙を書いてみましょう。', '具体的なエピソードを交えながら、その人があなたの人生にどんな影響を与えてくれたか書いてください。', '送らなくても構いません。']::text[],
  '最近お世話になった人、または長年感謝を伝えたかった人を一人選んで、手紙を書いてみましょう。具体的なエピソードを交えながら、その人があなたの人生にどんな影響を与えてくれたか書いてください。送らなくても構いません。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '新しい言葉を学ぶ',
  '外国語の単語や新しい日本語表現を覚えてみましょう',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['スマホの辞書アプリや翻訳アプリを使って、新しい言葉を5つ学んでみましょう。', 'その言葉を使った例文も作ってみてください。']::text[],
  'スマホの辞書アプリや翻訳アプリを使って、新しい言葉を5つ学んでみましょう。その言葉を使った例文も作ってみてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '新しい言葉を学ぶ',
  '外国語の単語や新しい日本語表現を覚えてみましょう',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['興味のある言語の基本的な挨拶や日常会話フレーズを10個学んでみましょう。', '発音も練習して、実際に声に出して言ってみてください。']::text[],
  '興味のある言語の基本的な挨拶や日常会話フレーズを10個学んでみましょう。発音も練習して、実際に声に出して言ってみてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '植物の観察',
  '近くの植物をじっくり観察して、自然の美しさを感じましょう',
  15,
  '行動的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['窓から見える木や、部屋の観葉植物をじっくり観察してみましょう。', '葉の形、色の濃淡、成長の様子など、普段気づかない細部に注目してください。']::text[],
  '窓から見える木や、部屋の観葉植物をじっくり観察してみましょう。葉の形、色の濃淡、成長の様子など、普段気づかない細部に注目してください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '植物の観察',
  '近くの植物をじっくり観察して、自然の美しさを感じましょう',
  30,
  '行動的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['外に出て、公園や道端の植物を観察してみましょう。', '季節の変化、虫との関わり、風に揺れる様子など、自然の営みを感じ取ってください。', '可能なら写真を撮って記録してみても良いでしょう。']::text[],
  '外に出て、公園や道端の植物を観察してみましょう。季節の変化、虫との関わり、風に揺れる様子など、自然の営みを感じ取ってください。可能なら写真を撮って記録してみても良いでしょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'パズルや頭の体操',
  '簡単なパズルや頭の体操で脳を活性化させましょう',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['スマホのパズルアプリや、紙とペンで簡単な図形パズルを解いてみましょう。', '数独、クロスワード、間違い探しなど、好きなものを選んでください。']::text[],
  'スマホのパズルアプリや、紙とペンで簡単な図形パズルを解いてみましょう。数独、クロスワード、間違い探しなど、好きなものを選んでください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'パズルや頭の体操',
  '簡単なパズルや頭の体操で脳を活性化させましょう',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['じっくりと頭を使うパズルに挑戦してみましょう。', '難しめの数独、詰将棋、論理パズルなど、集中力を要するものに取り組んでください。', '解けなくても考える過程を楽しみましょう。']::text[],
  'じっくりと頭を使うパズルに挑戦してみましょう。難しめの数独、詰将棋、論理パズルなど、集中力を要するものに取り組んでください。解けなくても考える過程を楽しみましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '写真の整理',
  'スマホの写真を整理して、思い出を振り返りましょう',
  30,
  '行動的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['スマホに溜まった写真を整理してみましょう。', '不要な写真を削除し、大切な写真はアルバムに分類します。', 'お気に入りの写真を見返しながら、その時の思い出に浸ってください。']::text[],
  'スマホに溜まった写真を整理してみましょう。不要な写真を削除し、大切な写真はアルバムに分類します。お気に入りの写真を見返しながら、その時の思い出に浸ってください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'バケットリストを作る',
  '人生でやりたいことリストを作成してみましょう',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  '{}'::text[],
  ARRAY['人生でやってみたいこと、行ってみたい場所、会いたい人などをリストアップしてみましょう。', '大きな夢から小さな目標まで、思いつくままに書き出してください。', 'それぞれについて、なぜやりたいのか、いつまでに実現したいかも考えてみましょう。']::text[],
  '人生でやってみたいこと、行ってみたい場所、会いたい人などをリストアップしてみましょう。大きな夢から小さな目標まで、思いつくままに書き出してください。それぞれについて、なぜやりたいのか、いつまでに実現したいかも考えてみましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '1分間の深呼吸リセット',
  '面接前の緊張を和らげる効果的な呼吸法。心拍数を落ち着かせ、集中力を高めます',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['背筋を伸ばして座り、4秒かけて鼻から息を吸い、4秒止めて、4秒かけて口から吐きます。', 'これを5回繰り返しましょう。', '「私は準備ができている」と心の中で唱えてください。']::text[],
  '背筋を伸ばして座り、4秒かけて鼻から息を吸い、4秒止めて、4秒かけて口から吐きます。これを5回繰り返しましょう。「私は準備ができている」と心の中で唱えてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '1分間の深呼吸リセット',
  '面接前の緊張を和らげる効果的な呼吸法。心拍数を落ち着かせ、集中力を高めます',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['快適な姿勢で座り、目を閉じます。', '4-7-8呼吸法を実践しましょう。', '4秒で吸い、7秒止め、8秒で吐きます。', 'これを4サイクル行い、その後普通の呼吸に戻して5分間、呼吸に意識を向けます。', '緊張が和らぐのを感じてください。']::text[],
  '快適な姿勢で座り、目を閉じます。4-7-8呼吸法を実践しましょう。4秒で吸い、7秒止め、8秒で吐きます。これを4サイクル行い、その後普通の呼吸に戻して5分間、呼吸に意識を向けます。緊張が和らぐのを感じてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '1分間の深呼吸リセット',
  '面接前の緊張を和らげる効果的な呼吸法。心拍数を落ち着かせ、集中力を高めます',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['リラックスした環境で、本格的な瞑想セッションを行います。', 'まず5分間4-7-8呼吸法で深くリラックスし、続いて20分間ボディスキャン瞑想を実践します。', '足の先から頭まで、各部位の感覚に意識を向けながら緊張を手放していきます。', '最後の5分で深呼吸に戻り、「私は落ち着いている」「私は準備ができている」と心の中で唱えて終了します。']::text[],
  'リラックスした環境で、本格的な瞑想セッションを行います。まず5分間4-7-8呼吸法で深くリラックスし、続いて20分間ボディスキャン瞑想を実践します。足の先から頭まで、各部位の感覚に意識を向けながら緊張を手放していきます。最後の5分で深呼吸に戻り、「私は落ち着いている」「私は準備ができている」と心の中で唱えて終了します。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '自信を高めるアファメーション',
  '自己肯定感を高め、前向きな気持ちで活動に臨むための言葉かけ',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['鏡を見て、または心の中で次の言葉を3回唱えましょう。', '「私には価値がある」「私の経験は貴重だ」「最適な場所が私を待っている」。', 'そして、自分の長所を3つ思い浮かべてください。']::text[],
  '鏡を見て、または心の中で次の言葉を3回唱えましょう。「私には価値がある」「私の経験は貴重だ」「最適な場所が私を待っている」。そして、自分の長所を3つ思い浮かべてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '自信を高めるアファメーション',
  '自己肯定感を高め、前向きな気持ちで活動に臨むための言葉かけ',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['静かな場所で座り、深呼吸を数回行います。', '目を閉じて、これまでの成功体験を5つ思い出します。', 'それぞれについて「私はその時〇〇を成し遂げた」と心の中で確認し、その時の達成感を味わいます。', '最後に「私は必ず道を見つける」と力強く唱えます。']::text[],
  '静かな場所で座り、深呼吸を数回行います。目を閉じて、これまでの成功体験を5つ思い出します。それぞれについて「私はその時〇〇を成し遂げた」と心の中で確認し、その時の達成感を味わいます。最後に「私は必ず道を見つける」と力強く唱えます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '自信を高めるアファメーション',
  '自己肯定感を高め、前向きな気持ちで活動に臨むための言葉かけ',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['自分史を振り返るセッションを行います。', '紙に人生の重要な節目と成長を時系列で書き出し、それぞれでどんな力を発揮したかを記録します。', '困難を乗り越えた経験に特に注目し、その時の自分を褒めてあげましょう。', '最後に、その経験が今の活動にどう活かせるかを考えて記録します。']::text[],
  '自分史を振り返るセッションを行います。紙に人生の重要な節目と成長を時系列で書き出し、それぞれでどんな力を発揮したかを記録します。困難を乗り越えた経験に特に注目し、その時の自分を褒めてあげましょう。最後に、その経験が今の活動にどう活かせるかを考えて記録します。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '肩の力を抜くクイックストレッチ',
  'PC作業や緊張で固まった肩と首をほぐし、リフレッシュ',
  5,
  '行動的',
  ARRAY['workplace', 'home', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['両肩を耳に向けて持ち上げ、3秒キープしてからストンと落とします。', 'これを3回。', '次に首を右に傾けて10秒、左に10秒。', '最後に両手を組んで頭上に伸ばし、深呼吸を3回しましょう。']::text[],
  '両肩を耳に向けて持ち上げ、3秒キープしてからストンと落とします。これを3回。次に首を右に傾けて10秒、左に10秒。最後に両手を組んで頭上に伸ばし、深呼吸を3回しましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '肩の力を抜くクイックストレッチ',
  'PC作業や緊張で固まった肩と首をほぐし、リフレッシュ',
  15,
  '行動的',
  ARRAY['workplace', 'home', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['5分間の基本ストレッチを3セット行います。', '肩の上下運動、首の側屈、肩甲骨寄せ、肩回しをゆっくりと行い、各ストレッチの間に深呼吸を取り入れます。', '最後に全身の力を抜いてリラックスしましょう。']::text[],
  '5分間の基本ストレッチを3セット行います。肩の上下運動、首の側屈、肩甲骨寄せ、肩回しをゆっくりと行い、各ストレッチの間に深呼吸を取り入れます。最後に全身の力を抜いてリラックスしましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '肩の力を抜くクイックストレッチ',
  'PC作業や緊張で固まった肩と首をほぐし、リフレッシュ',
  30,
  '行動的',
  ARRAY['workplace', 'home', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['包括的な上半身リフレッシュプログラムを実施します。', 'ウォーミングアップ（5分）、肩・首・背中の詳細ストレッチ（20分）、クールダウンの瞑想（5分）を順番に行い、PC作業での蓄積疲労を完全にリセットします。']::text[],
  '包括的な上半身リフレッシュプログラムを実施します。ウォーミングアップ（5分）、肩・首・背中の詳細ストレッチ（20分）、クールダウンの瞑想（5分）を順番に行い、PC作業での蓄積疲労を完全にリセットします。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '感情を受け入れるナレーション',
  '不採用通知後の複雑な感情を整理し、次へ進む力を得る',
  5,
  '認知的',
  ARRAY['home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['「今、私は〇〇と感じている」と、今の感情に名前をつけてみましょう。', '悔しさ、悲しさ、焦り...それらはすべて自然な感情です。', '深呼吸をして、「この経験も私の成長の一部」と優しく自分に語りかけましょう。']::text[],
  '「今、私は〇〇と感じている」と、今の感情に名前をつけてみましょう。悔しさ、悲しさ、焦り...それらはすべて自然な感情です。深呼吸をして、「この経験も私の成長の一部」と優しく自分に語りかけましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '感情を受け入れるナレーション',
  '不採用通知後の複雑な感情を整理し、次へ進む力を得る',
  15,
  '認知的',
  ARRAY['home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['紙とペンを用意し、今の気持ちを5分間自由に書き出します。', '次に、この経験から学んだことを3つ書きます。', '最後に、「次はもっと良い結果が待っている」というメッセージを自分に送りましょう。']::text[],
  '紙とペンを用意し、今の気持ちを5分間自由に書き出します。次に、この経験から学んだことを3つ書きます。最後に、「次はもっと良い結果が待っている」というメッセージを自分に送りましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '感情を受け入れるナレーション',
  '不採用通知後の複雑な感情を整理し、次へ進む力を得る',
  30,
  '認知的',
  ARRAY['home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['不採用通知後の感情を完全に受容し、次のステップへの力を育むセッション。', 'まず10分間、感情を素直に感じて受け入れます。', '次に10分間でこの経験から得られた学びと成長を書き出し、最後の10分で未来の可能性と希望を描きます。', 'このプロセスを通じて、挫折を成長の糧に変える力を育てましょう。']::text[],
  '不採用通知後の感情を完全に受容し、次のステップへの力を育むセッション。まず10分間、感情を素直に感じて受け入れます。次に10分間でこの経験から得られた学びと成長を書き出し、最後の10分で未来の可能性と希望を描きます。このプロセスを通じて、挫折を成長の糧に変える力を育てましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '小さな達成感タスク',
  'すぐに完了できる簡単なタスクで、達成感と前向きな気持ちを取り戻す',
  5,
  '行動的',
  ARRAY['home', 'workplace', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['机の上の書類を整理する、メールを1通返信する、ToDoリストを更新するなど、5分で完了できるタスクを1つ選んで実行しましょう。', '完了したら「よくやった！」と自分を褒めてください。']::text[],
  '机の上の書類を整理する、メールを1通返信する、ToDoリストを更新するなど、5分で完了できるタスクを1つ選んで実行しましょう。完了したら「よくやった！」と自分を褒めてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '小さな達成感タスク',
  'すぐに完了できる簡単なタスクで、達成感と前向きな気持ちを取り戻す',
  15,
  '行動的',
  ARRAY['home', 'workplace', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['部屋の一角を片付ける、履歴書のフォーマットを整える、LinkedInプロフィールを更新するなど、少し時間のかかるタスクに取り組みましょう。', '完了後は達成感を味わってください。']::text[],
  '部屋の一角を片付ける、履歴書のフォーマットを整える、LinkedInプロフィールを更新するなど、少し時間のかかるタスクに取り組みましょう。完了後は達成感を味わってください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '小さな達成感タスク',
  'すぐに完了できる簡単なタスクで、達成感と前向きな気持ちを取り戻す',
  30,
  '行動的',
  ARRAY['home', 'workplace', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['大きな達成感プロジェクトに取り組みます。', '部屋の大幅な整理整頓、ポートフォリオサイトの改善、技術ブログの執筆、または新しいスキルの習得（オンライン講座の受講）など、将来に役立つ本格的なタスクを実行します。', '完了時の達成感と自信の向上は、次の活動への大きなエネルギーとなります。']::text[],
  '大きな達成感プロジェクトに取り組みます。部屋の大幅な整理整頓、ポートフォリオサイトの改善、技術ブログの執筆、または新しいスキルの習得（オンライン講座の受講）など、将来に役立つ本格的なタスクを実行します。完了時の達成感と自信の向上は、次の活動への大きなエネルギーとなります。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'PC疲れを癒す目の体操',
  'ES作成や企業研究で疲れた目をリフレッシュ',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['画面から目を離し、20フィート（約6m）先を20秒見つめます。', '次に目を閉じて、眼球を時計回りに5回、反時計回りに5回ゆっくり回します。', '最後に手のひらで目を覆い、30秒間暗闇でリラックスしましょう。']::text[],
  '画面から目を離し、20フィート（約6m）先を20秒見つめます。次に目を閉じて、眼球を時計回りに5回、反時計回りに5回ゆっくり回します。最後に手のひらで目を覆い、30秒間暗闇でリラックスしましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'PC疲れを癒す目の体操',
  'ES作成や企業研究で疲れた目をリフレッシュ',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['PC作業による目の疲労を本格的に回復させます。', '20-20-20ルール（20分ごとに20フィート先を20秒見る）を実践し、温湿布で目を温め、眼球運動とまばたき運動を組み合わせた専用プログラムを実施します。']::text[],
  'PC作業による目の疲労を本格的に回復させます。20-20-20ルール（20分ごとに20フィート先を20秒見る）を実践し、温湿布で目を温め、眼球運動とまばたき運動を組み合わせた専用プログラムを実施します。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'PC疲れを癒す目の体操',
  'ES作成や企業研究で疲れた目をリフレッシュ',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['デジタル疲労からの完全回復セッション。', '目を使わないリラクゼーション（音楽瞑想）、アイマスク着用での休息、目周りのマッサージ、視力回復エクササイズを段階的に行い、視覚システム全体をリフレッシュします。']::text[],
  'デジタル疲労からの完全回復セッション。目を使わないリラクゼーション（音楽瞑想）、アイマスク着用での休息、目周りのマッサージ、視力回復エクササイズを段階的に行い、視覚システム全体をリフレッシュします。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '偉人の名言でモチベーションアップ',
  '困難を乗り越えた人々の言葉から勇気をもらう',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['「失敗は成功のもと」「継続は力なり」など、心に響く名言を1つ選んで、3回声に出して読みましょう。', 'その言葉が自分の状況にどう当てはまるか考え、前向きなエネルギーを感じてください。']::text[],
  '「失敗は成功のもと」「継続は力なり」など、心に響く名言を1つ選んで、3回声に出して読みましょう。その言葉が自分の状況にどう当てはまるか考え、前向きなエネルギーを感じてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '偉人の名言でモチベーションアップ',
  '困難を乗り越えた人々の言葉から勇気をもらう',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['偉人の名言集から3-5つの言葉を選び、それぞれについて自分の体験と関連付けて考察します。', 'ノートに感想を書き、その名言が示す教訓を今の活動にどう活かせるかを具体的にプランニングします。']::text[],
  '偉人の名言集から3-5つの言葉を選び、それぞれについて自分の体験と関連付けて考察します。ノートに感想を書き、その名言が示す教訓を今の活動にどう活かせるかを具体的にプランニングします。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '偉人の名言でモチベーションアップ',
  '困難を乗り越えた人々の言葉から勇気をもらう',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['motivational quotes journaling セッション。', '10の名言を選び、それぞれに対する深い省察と、自分の人生・キャリアへの適用方法を文章で記録します。', '最後に、最も心に響いた名言を筆ペンで美しく書いて、見える場所に飾りましょう。']::text[],
  'motivational quotes journaling セッション。10の名言を選び、それぞれに対する深い省察と、自分の人生・キャリアへの適用方法を文章で記録します。最後に、最も心に響いた名言を筆ペンで美しく書いて、見える場所に飾りましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'コーヒーブレイク瞑想',
  '飲み物を楽しみながら、今この瞬間に集中する',
  5,
  '行動的',
  ARRAY['workplace', 'home', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['お気に入りの飲み物を用意し、最初の一口を取る前に香りを楽しみます。', 'ゆっくりと一口飲み、味と温度を感じます。', '「今、この瞬間を大切に」と心で唱えながら、残りも味わいましょう。']::text[],
  'お気に入りの飲み物を用意し、最初の一口を取る前に香りを楽しみます。ゆっくりと一口飲み、味と温度を感じます。「今、この瞬間を大切に」と心で唱えながら、残りも味わいましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'コーヒーブレイク瞑想',
  '飲み物を楽しみながら、今この瞬間に集中する',
  15,
  '行動的',
  ARRAY['workplace', 'home', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['飲み物を準備する過程から瞑想を始めます。', 'お湯を沸かす音、カップの感触、立ち上る湯気...すべてに意識を向けます。', '飲みながら、今日の良かったことを3つ思い出してください。']::text[],
  '飲み物を準備する過程から瞑想を始めます。お湯を沸かす音、カップの感触、立ち上る湯気...すべてに意識を向けます。飲みながら、今日の良かったことを3つ思い出してください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'コーヒーブレイク瞑想',
  '飲み物を楽しみながら、今この瞬間に集中する',
  30,
  '行動的',
  ARRAY['workplace', 'home', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['本格的なティーセレモニー・瞑想セッション。', '複数の飲み物（お茶、コーヒー、ハーブティー）を準備し、それぞれの香り、色、味を丁寧に観察・比較します。', '飲み物の文化的背景を調べたり、今日一日の感謝の気持ちを振り返ったりしながら、心と体を完全にリラックスさせる贅沢な時間を過ごしましょう。']::text[],
  '本格的なティーセレモニー・瞑想セッション。複数の飲み物（お茶、コーヒー、ハーブティー）を準備し、それぞれの香り、色、味を丁寧に観察・比較します。飲み物の文化的背景を調べたり、今日一日の感謝の気持ちを振り返ったりしながら、心と体を完全にリラックスさせる贅沢な時間を過ごしましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '未来の自分への手紙',
  '活動が実を結んだ未来の自分を想像し、希望を持つ',
  15,
  '認知的',
  ARRAY['home', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['1年後の自分に向けて短い手紙を書きます。', '「希望の仕事に就いた自分」を想像し、今の努力がどう実を結んだか、どんな毎日を送っているかを書きましょう。', '最後に今の自分へのエールも添えて。']::text[],
  '1年後の自分に向けて短い手紙を書きます。「希望の仕事に就いた自分」を想像し、今の努力がどう実を結んだか、どんな毎日を送っているかを書きましょう。最後に今の自分へのエールも添えて。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '未来の自分への手紙',
  '活動が実を結んだ未来の自分を想像し、希望を持つ',
  30,
  '認知的',
  ARRAY['home', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['詳細な未来日記を書きます。', '理想の職場での1日の流れ、仕事内容、同僚との関係、達成感などを具体的に描写します。', 'その後、そこに至るまでの道のりを逆算して考えてみましょう。']::text[],
  '詳細な未来日記を書きます。理想の職場での1日の流れ、仕事内容、同僚との関係、達成感などを具体的に描写します。その後、そこに至るまでの道のりを逆算して考えてみましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'キャリアの棚卸し5分スプリント',
  'これまでの経験と成果を素早く整理し、自信を取り戻す（転職者向け）',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'job_hunting']::text[],
  ARRAY['career_changer']::text[],
  '{}'::text[],
  ARRAY['タイマーをセットし、これまでの仕事で達成したこと、褒められたこと、感謝されたことを思いつくまま書き出します。', '小さなことでもOK。', '5分後、リストを見返して「私には価値がある」と確認しましょう。']::text[],
  'タイマーをセットし、これまでの仕事で達成したこと、褒められたこと、感謝されたことを思いつくまま書き出します。小さなことでもOK。5分後、リストを見返して「私には価値がある」と確認しましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'キャリアの棚卸し5分スプリント',
  'これまでの経験と成果を素早く整理し、自信を取り戻す（転職者向け）',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'job_hunting']::text[],
  ARRAY['career_changer']::text[],
  '{}'::text[],
  ARRAY['職歴を3つの期間に分け、それぞれで得たスキル、達成した成果、乗り越えた困難を整理します。', '最後に、これらの経験が次の職場でどう活きるかを考えてみましょう。']::text[],
  '職歴を3つの期間に分け、それぞれで得たスキル、達成した成果、乗り越えた困難を整理します。最後に、これらの経験が次の職場でどう活きるかを考えてみましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'キャリアの棚卸し5分スプリント',
  'これまでの経験と成果を素早く整理し、自信を取り戻す（転職者向け）',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'job_hunting']::text[],
  ARRAY['career_changer']::text[],
  '{}'::text[],
  ARRAY['包括的なキャリア価値分析セッション。', '職歴を詳細に分析し、技術的スキル、ソフトスキル、リーダーシップ経験、問題解決事例、人脈・ネットワークを整理します。', 'さらに、今後のキャリアビジョンを描き、現在の経験をどう活かせるかの戦略的プランを作成します。', 'これにより、面接での自信と説得力が大幅に向上します。']::text[],
  '包括的なキャリア価値分析セッション。職歴を詳細に分析し、技術的スキル、ソフトスキル、リーダーシップ経験、問題解決事例、人脈・ネットワークを整理します。さらに、今後のキャリアビジョンを描き、現在の経験をどう活かせるかの戦略的プランを作成します。これにより、面接での自信と説得力が大幅に向上します。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '感謝を伝える5分間ミッション',
  '支えてくれる人への感謝を思い出し、心を温かくする',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['活動を支えてくれている人（家族、友人、エージェントなど）を1人思い浮かべ、心の中で感謝を伝えます。', '可能なら、簡単なメッセージを送ってみましょう。', '感謝の気持ちが自分も温かくしてくれます。']::text[],
  '活動を支えてくれている人（家族、友人、エージェントなど）を1人思い浮かべ、心の中で感謝を伝えます。可能なら、簡単なメッセージを送ってみましょう。感謝の気持ちが自分も温かくしてくれます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '感謝を伝える5分間ミッション',
  '支えてくれる人への感謝を思い出し、心を温かくする',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['感謝ジャーナルタイム。', '紙に今週支えてくれた人々をリストアップし、それぞれに対する具体的な感謝の理由を書きます。', '時間があれば、そのうち数人に実際に感謝のメッセージを送ってみましょう。']::text[],
  '感謝ジャーナルタイム。紙に今週支えてくれた人々をリストアップし、それぞれに対する具体的な感謝の理由を書きます。時間があれば、そのうち数人に実際に感謝のメッセージを送ってみましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '感謝を伝える5分間ミッション',
  '支えてくれる人への感謝を思い出し、心を温かくする',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['人生の感謝マップを作成します。', '家族、友人、同僚、メンター、そして意外な場所で出会った人々への感謝を可視化し、その人たちがどのように自分の人生を豊かにしてくれたかを詳細に記録します。', '感謝の手紙を数通書いてみるのも素晴らしいでしょう。']::text[],
  '人生の感謝マップを作成します。家族、友人、同僚、メンター、そして意外な場所で出会った人々への感謝を可視化し、その人たちがどのように自分の人生を豊かにしてくれたかを詳細に記録します。感謝の手紙を数通書いてみるのも素晴らしいでしょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'マインドフル・ウォーキング',
  '移動時間を瞑想の時間に変える',
  5,
  '行動的',
  ARRAY['outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['次の目的地まで、または5分間、歩くことに完全に集中します。', '足が地面に触れる感覚、呼吸のリズム、周りの音に意識を向けます。', '考えが浮かんでも、また歩くことに注意を戻しましょう。']::text[],
  '次の目的地まで、または5分間、歩くことに完全に集中します。足が地面に触れる感覚、呼吸のリズム、周りの音に意識を向けます。考えが浮かんでも、また歩くことに注意を戻しましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'マインドフル・ウォーキング',
  '移動時間を瞑想の時間に変える',
  15,
  '行動的',
  ARRAY['outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['ゆっくりとしたペースで歩き始めます。', '最初の5分は呼吸に、次の5分は体の感覚に、最後の5分は周囲の景色に注意を向けます。', '面接への不安も、この時間だけは手放しましょう。']::text[],
  'ゆっくりとしたペースで歩き始めます。最初の5分は呼吸に、次の5分は体の感覚に、最後の5分は周囲の景色に注意を向けます。面接への不安も、この時間だけは手放しましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'マインドフル・ウォーキング',
  '移動時間を瞑想の時間に変える',
  30,
  '行動的',
  ARRAY['outside', 'job_hunting']::text[],
  ARRAY['job_seeker', 'career_changer']::text[],
  '{}'::text[],
  ARRAY['本格的なマインドフル・ウォーキング体験を行います。', '最初の10分は歩行のメカニズム（足の裏の感覚、筋肉の動き、バランス）に集中し、次の10分は呼吸と歩行の同期、景色や音への気づきを深めます。', '最後の10分では、面接や将来への希望的な想像を巡らせながら、「一歩一歩が成長への道」と心の中で唱え、自信と安らぎを育てます。']::text[],
  '本格的なマインドフル・ウォーキング体験を行います。最初の10分は歩行のメカニズム（足の裏の感覚、筋肉の動き、バランス）に集中し、次の10分は呼吸と歩行の同期、景色や音への気づきを深めます。最後の10分では、面接や将来への希望的な想像を巡らせながら、「一歩一歩が成長への道」と心の中で唱え、自信と安らぎを育てます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'マインドフル・スナック',
  '健康的な間食を五感で味わい、今この瞬間に集中する',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['マインドフルネス', '食事', '五感']::text[],
  ARRAY['ナッツやドライフルーツなど健康的なスナックを一つ選び、手に取った時の重さや温度を感じましょう。', '香りを嗅ぎ、ゆっくり噛んで味と食感に集中してください。', '飲み込む瞬間まで意識を向けましょう。']::text[],
  'ナッツやドライフルーツなど健康的なスナックを一つ選び、手に取った時の重さや温度を感じましょう。香りを嗅ぎ、ゆっくり噛んで味と食感に集中してください。飲み込む瞬間まで意識を向けましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'マインドフル・スナック',
  '健康的な間食を五感で味わい、今この瞬間に集中する',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['マインドフルネス', '食事', '五感']::text[],
  ARRAY['お気に入りの健康的なスナックを用意し、食べる前に深呼吸を3回行います。', '食べ物の見た目、香り、手触りを観察し、一口ずつゆっくりと味わいます。', '噛む回数を意識し、味の変化や体の反応に注目してください。', '食後は感謝の気持ちを込めて深呼吸で締めくくります。']::text[],
  'お気に入りの健康的なスナックを用意し、食べる前に深呼吸を3回行います。食べ物の見た目、香り、手触りを観察し、一口ずつゆっくりと味わいます。噛む回数を意識し、味の変化や体の反応に注目してください。食後は感謝の気持ちを込めて深呼吸で締めくくります。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '冷温刺激リセット',
  '冷たい水や温かいタオルで感覚をリセットし、気分転換',
  5,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['感覚刺激', '覚醒', '簡単']::text[],
  ARRAY['手首に冷たい水をかけるか、温かいタオルを首の後ろに当てます。', '温度の変化を意識的に感じ、「今、私は新しいエネルギーを取り入れている」と心の中で唱えましょう。', '最後に深呼吸を3回行い、リフレッシュした感覚を味わってください。']::text[],
  '手首に冷たい水をかけるか、温かいタオルを首の後ろに当てます。温度の変化を意識的に感じ、「今、私は新しいエネルギーを取り入れている」と心の中で唱えましょう。最後に深呼吸を3回行い、リフレッシュした感覚を味わってください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '価値に基づく行動確認',
  '自分の価値観を思い出し、今の行動との一致を確認する（ACT技法）',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['価値観', 'ACT', '動機']::text[],
  ARRAY['まず3回深呼吸をして心を落ち着けます。', '自分の人生で大切にしたい価値（家族、成長、創造性など）を3つ思い浮かべてください。', '今取り組んでいることが、これらの価値とどうつながっているかを考えましょう。', 'つながりを感じられたら、その価値のために今できる小さな行動を一つ決めて実行してください。']::text[],
  'まず3回深呼吸をして心を落ち着けます。自分の人生で大切にしたい価値（家族、成長、創造性など）を3つ思い浮かべてください。今取り組んでいることが、これらの価値とどうつながっているかを考えましょう。つながりを感じられたら、その価値のために今できる小さな行動を一つ決めて実行してください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'デスク・ヨガ',
  '椅子に座ったままできる簡単なヨガポーズで体をほぐす',
  5,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['ヨガ', 'デスクワーク', '血行']::text[],
  ARRAY['椅子に深く座り、両手を上に伸ばして背伸びをします。', '次に右手を左肩に置き、左手で右肘を優しく引っ張って肩をストレッチ。', '反対側も同様に。', '最後に首を左右にゆっくり回して終了です。']::text[],
  '椅子に深く座り、両手を上に伸ばして背伸びをします。次に右手を左肩に置き、左手で右肘を優しく引っ張って肩をストレッチ。反対側も同様に。最後に首を左右にゆっくり回して終了です。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'デスク・ヨガ',
  '椅子に座ったままできる簡単なヨガポーズで体をほぐす',
  15,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['ヨガ', 'デスクワーク', '血行']::text[],
  ARRAY['椅子ヨガのフルシーケンスを行います。', '①背伸び（1分）②肩回し（2分）③体側伸ばし左右（3分）④ねじりポーズ左右（5分）⑤前屈とバックベンド（2分）⑥最後に瞑想呼吸（2分）。', '各ポーズで深い呼吸を意識し、筋肉の伸びを感じてください。']::text[],
  '椅子ヨガのフルシーケンスを行います。①背伸び（1分）②肩回し（2分）③体側伸ばし左右（3分）④ねじりポーズ左右（5分）⑤前屈とバックベンド（2分）⑥最後に瞑想呼吸（2分）。各ポーズで深い呼吸を意識し、筋肉の伸びを感じてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '思考の客観視',
  'ネガティブな思考を客観的に観察し、現実的に評価する（CBT技法）',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['CBT', '思考', '客観視']::text[],
  ARRAY['今感じているストレスや不安の原因となる思考を一つ選びます。', '紙に「この思考は事実か？」「別の見方はないか？」「この思考は役に立つか？」と質問を書き、それぞれに答えてみましょう。', '最後に、より現実的で建設的な考え方を1つ見つけて書き留めます。']::text[],
  '今感じているストレスや不安の原因となる思考を一つ選びます。紙に「この思考は事実か？」「別の見方はないか？」「この思考は役に立つか？」と質問を書き、それぞれに答えてみましょう。最後に、より現実的で建設的な考え方を1つ見つけて書き留めます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '思考の客観視',
  'ネガティブな思考を客観的に観察し、現実的に評価する（CBT技法）',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['CBT', '思考', '客観視']::text[],
  ARRAY['思考記録の詳細分析を行います。', '①状況の記録（5分）②感情と強度の特定（5分）③自動思考の特定（10分）④証拠の検討（5分）⑤バランスの取れた思考の開発（5分）。', 'このプロセスを通じて、ストレスの根本的な認知パターンを理解し、より健全な思考パターンを構築します。']::text[],
  '思考記録の詳細分析を行います。①状況の記録（5分）②感情と強度の特定（5分）③自動思考の特定（10分）④証拠の検討（5分）⑤バランスの取れた思考の開発（5分）。このプロセスを通じて、ストレスの根本的な認知パターンを理解し、より健全な思考パターンを構築します。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '同僚への感謝表現',
  '職場の人への小さな感謝を表現して、人間関係を改善',
  5,
  '行動的',
  ARRAY['workplace']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['感謝', '人間関係', '職場']::text[],
  ARRAY['今日お世話になった同僚を一人思い浮かべ、その人に直接またはメッセージで「ありがとう」を伝えましょう。', '具体的なことを挙げて感謝すると効果的です。', '例：「資料作成を手伝ってくれてありがとう」。', '相手の反応を楽しみに、温かい気持ちで一日を過ごしてください。']::text[],
  '今日お世話になった同僚を一人思い浮かべ、その人に直接またはメッセージで「ありがとう」を伝えましょう。具体的なことを挙げて感謝すると効果的です。例：「資料作成を手伝ってくれてありがとう」。相手の反応を楽しみに、温かい気持ちで一日を過ごしてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '創造的問題解決',
  '今の課題を創造的・多角的に捉え直してみる',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['創造性', '問題解決', '発想']::text[],
  ARRAY['今直面している課題を一つ選びます。', 'この問題を①子どもだったらどう解決するか？②好きなキャラクターならどうするか？③100年前の人ならどうするか？という3つの視点で考えてみましょう。', '普段思いつかない解決策が見えてくるかもしれません。']::text[],
  '今直面している課題を一つ選びます。この問題を①子どもだったらどう解決するか？②好きなキャラクターならどうするか？③100年前の人ならどうするか？という3つの視点で考えてみましょう。普段思いつかない解決策が見えてくるかもしれません。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '創造的問題解決',
  '今の課題を創造的・多角的に捉え直してみる',
  30,
  '認知的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['創造性', '問題解決', '発想']::text[],
  ARRAY['創造的問題解決セッション。', '①問題の再定義（5分）②ブレインストーミング・10のアイデア生成（10分）③アイデアの組み合わせ・発展（10分）④実現可能性の評価と選択（5分）。', 'このプロセスで、固定観念を打破し、革新的な解決策を見つけることができます。']::text[],
  '創造的問題解決セッション。①問題の再定義（5分）②ブレインストーミング・10のアイデア生成（10分）③アイデアの組み合わせ・発展（10分）④実現可能性の評価と選択（5分）。このプロセスで、固定観念を打破し、革新的な解決策を見つけることができます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '窓際グリーンタイム',
  '窓際で植物や緑を眺めながら自然とのつながりを感じる',
  5,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['自然', '緑', '回復']::text[],
  ARRAY['窓際に移動し、外の緑や空を眺めます。', '深呼吸をしながら、見える植物や自然の色彩に注目してください。', '「自然とつながっている」と感じながら、都市の中でも自然の力を受け取りましょう。', '目を閉じて、自然の音に耳を傾けることも効果的です。']::text[],
  '窓際に移動し、外の緑や空を眺めます。深呼吸をしながら、見える植物や自然の色彩に注目してください。「自然とつながっている」と感じながら、都市の中でも自然の力を受け取りましょう。目を閉じて、自然の音に耳を傾けることも効果的です。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '窓際グリーンタイム',
  '窓際で植物や緑を眺めながら自然とのつながりを感じる',
  15,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['自然', '緑', '回復']::text[],
  ARRAY['窓際でプチ自然瞑想セッション。', '①3分間自然観察②5分間自然音の聴き分け（鳥のさえずり、風の音など）③3分間「自然の一部としての自分」を意識④4分間感謝の瞑想。', '室内にいながら自然の治癒力を十分に受け取ることができます。']::text[],
  '窓際でプチ自然瞑想セッション。①3分間自然観察②5分間自然音の聴き分け（鳥のさえずり、風の音など）③3分間「自然の一部としての自分」を意識④4分間感謝の瞑想。室内にいながら自然の治癒力を十分に受け取ることができます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '時間軸拡張思考',
  '現在の問題を長期的な視点から捉え直し、相対化する',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['時間', '視点', '相対化']::text[],
  ARRAY['今のストレスや課題を時間の流れの中で捉え直してみましょう。', '①1週間後この問題はどう見えるか？②1ヶ月後はどうか？③1年後はどうか？④5年後の自分から見たらどうか？⑤人生全体から見たらどんな意味があるか？この視点の変化で、問題の重要度が変わることを感じてください。']::text[],
  '今のストレスや課題を時間の流れの中で捉え直してみましょう。①1週間後この問題はどう見えるか？②1ヶ月後はどうか？③1年後はどうか？④5年後の自分から見たらどうか？⑤人生全体から見たらどんな意味があるか？この視点の変化で、問題の重要度が変わることを感じてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'マイクロムーブメント',
  '座ったままできる極小の運動で血行を促進',
  5,
  '行動的',
  ARRAY['workplace', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['運動', '血行', '座位']::text[],
  ARRAY['座ったままで以下を順番に実行：①足首を10回回す②つま先立ちを10回③肩を前後に10回ずつ回す④手をグーパーと10回⑤首を左右に5回ずつ傾ける。', 'これらの小さな動きで血流を改善し、頭をスッキリさせましょう。']::text[],
  '座ったままで以下を順番に実行：①足首を10回回す②つま先立ちを10回③肩を前後に10回ずつ回す④手をグーパーと10回⑤首を左右に5回ずつ傾ける。これらの小さな動きで血流を改善し、頭をスッキリさせましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'セルフ・コンパッション',
  '自分に対して友人のような優しさを向ける練習',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['自己受容', '優しさ', 'コンパッション']::text[],
  ARRAY['手を心臓の上に置き、深呼吸をします。', '「今の辛さは人間として自然なこと」「私だけではない」「自分に優しくしよう」と心の中で唱えてください。', '親友に話すような優しい声で、今の自分を励ましてあげましょう。']::text[],
  '手を心臓の上に置き、深呼吸をします。「今の辛さは人間として自然なこと」「私だけではない」「自分に優しくしよう」と心の中で唱えてください。親友に話すような優しい声で、今の自分を励ましてあげましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'セルフ・コンパッション',
  '自分に対して友人のような優しさを向ける練習',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['自己受容', '優しさ', 'コンパッション']::text[],
  ARRAY['セルフ・コンパッション瞑想。', '①現在の苦痛を認識（3分）②人類共通の経験として理解（4分）③自分への優しい言葉かけ（5分）④温かい気持ちを体全体に広げる（3分）。', '自分を批判する内なる声を、支援的で理解ある声に変えていきます。']::text[],
  'セルフ・コンパッション瞑想。①現在の苦痛を認識（3分）②人類共通の経験として理解（4分）③自分への優しい言葉かけ（5分）④温かい気持ちを体全体に広げる（3分）。自分を批判する内なる声を、支援的で理解ある声に変えていきます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '1分間デジタルデトックス',
  'すべてのデバイスから離れ、アナログな感覚に回帰',
  5,
  '行動的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['デジタル', 'デトックス', 'アナログ']::text[],
  ARRAY['スマホやPCの電源を切るか、画面を伏せます。', '目を閉じて、デジタル世界から完全に離れましょう。', '自分の呼吸、体の感覚、周囲の自然音に耳を傾けてください。', '5分後、リフレッシュした気分でデジタル世界に戻りましょう。']::text[],
  'スマホやPCの電源を切るか、画面を伏せます。目を閉じて、デジタル世界から完全に離れましょう。自分の呼吸、体の感覚、周囲の自然音に耳を傾けてください。5分後、リフレッシュした気分でデジタル世界に戻りましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '1分間デジタルデトックス',
  'すべてのデバイスから離れ、アナログな感覚に回帰',
  15,
  '行動的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['デジタル', 'デトックス', 'アナログ']::text[],
  ARRAY['完全デジタルデトックスセッション。', '①すべてのデバイスを別室に移動または電源オフ（5分）②紙と鉛筆で今の気持ちを書く（5分）③窓の外を眺めるか、室内の実物を観察（5分）。', 'アナログな世界の豊かさを再発見してください。']::text[],
  '完全デジタルデトックスセッション。①すべてのデバイスを別室に移動または電源オフ（5分）②紙と鉛筆で今の気持ちを書く（5分）③窓の外を眺めるか、室内の実物を観察（5分）。アナログな世界の豊かさを再発見してください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '心の錨（アンカー）',
  '安心できる場所や人を思い出し、心理的安定を得る',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['安心感', '愛着', '安定']::text[],
  ARRAY['目を閉じて、最も安心できる場所（実家、好きなカフェ、自然の中など）を思い浮かべます。', 'その場所の詳細（匂い、温度、音、色）を鮮明に思い出してください。', '「いつでもここに帰ることができる」と心の中で唱え、安心感を味わいましょう。']::text[],
  '目を閉じて、最も安心できる場所（実家、好きなカフェ、自然の中など）を思い浮かべます。その場所の詳細（匂い、温度、音、色）を鮮明に思い出してください。「いつでもここに帰ることができる」と心の中で唱え、安心感を味わいましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '心の錨（アンカー）',
  '安心できる場所や人を思い出し、心理的安定を得る',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['安心感', '愛着', '安定']::text[],
  ARRAY['心の錨の詳細構築。', '①安心できる場所の詳細な再現（7分）②そこで過ごす大切な人との思い出（5分）③その場所から受け取る愛とサポートを感じる（3分）。', 'このイメージを「心の錨」として記憶し、必要な時にいつでもアクセスできるようにします。']::text[],
  '心の錨の詳細構築。①安心できる場所の詳細な再現（7分）②そこで過ごす大切な人との思い出（5分）③その場所から受け取る愛とサポートを感じる（3分）。このイメージを「心の錨」として記憶し、必要な時にいつでもアクセスできるようにします。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'リズム呼吸',
  '音楽のリズムに合わせた呼吸で心拍数を調整',
  5,
  '行動的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['リズム', '呼吸', '音楽']::text[],
  ARRAY['落ち着いた音楽（クラシック、アンビエント）を流し、そのリズムに合わせて呼吸してください。', '4拍で吸い、4拍で吐くを基本に、音楽のテンポに身を任せます。', '音楽と呼吸の調和を感じることで、深いリラックス状態に入ることができます。']::text[],
  '落ち着いた音楽（クラシック、アンビエント）を流し、そのリズムに合わせて呼吸してください。4拍で吸い、4拍で吐くを基本に、音楽のテンポに身を任せます。音楽と呼吸の調和を感じることで、深いリラックス状態に入ることができます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'リズム呼吸',
  '音楽のリズムに合わせた呼吸で心拍数を調整',
  15,
  '行動的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['リズム', '呼吸', '音楽']::text[],
  ARRAY['音楽瞑想呼吸セッション。', '①好きなインストゥルメンタル曲を選択②最初の5分は音楽に耳を傾ける③次の5分でリズムに合わせた呼吸④最後の5分で音楽と一体になる感覚を楽しむ。', '心拍数が音楽のテンポに同期し、深い平静を得られます。']::text[],
  '音楽瞑想呼吸セッション。①好きなインストゥルメンタル曲を選択②最初の5分は音楽に耳を傾ける③次の5分でリズムに合わせた呼吸④最後の5分で音楽と一体になる感覚を楽しむ。心拍数が音楽のテンポに同期し、深い平静を得られます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '思考の思考（メタ認知）',
  '自分の思考パターンを客観的に観察し、認識する',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['メタ認知', '思考観察', '自己理解']::text[],
  ARRAY['今の自分の思考プロセスを第三者の視点で観察してみましょう。', '①「今、私は〇〇について考えている」と実況②「この思考パターンは普段からある」か分析③「この思考は役に立つか？」を評価④「より建設的な思考はないか？」を探索⑤新しい思考パターンを意識的に採用。', '思考の思考により、感情や行動をより良くコントロールできるようになります。']::text[],
  '今の自分の思考プロセスを第三者の視点で観察してみましょう。①「今、私は〇〇について考えている」と実況②「この思考パターンは普段からある」か分析③「この思考は役に立つか？」を評価④「より建設的な思考はないか？」を探索⑤新しい思考パターンを意識的に採用。思考の思考により、感情や行動をより良くコントロールできるようになります。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '触感リラクゼーション',
  '身近な素材の触感を楽しみ、感覚的にリラックス',
  5,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['触感', '感覚', 'グラウンディング']::text[],
  ARRAY['身近にある異なる材質のもの（木、金属、布、石など）を触ってみましょう。', 'それぞれの温度、硬さ、表面の感触に集中してください。', '好きな感触を見つけたら、その感覚を十分に味わい、「今、ここにいる」ことを実感してください。']::text[],
  '身近にある異なる材質のもの（木、金属、布、石など）を触ってみましょう。それぞれの温度、硬さ、表面の感触に集中してください。好きな感触を見つけたら、その感覚を十分に味わい、「今、ここにいる」ことを実感してください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '触感リラクゼーション',
  '身近な素材の触感を楽しみ、感覚的にリラックス',
  15,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['触感', '感覚', 'グラウンディング']::text[],
  ARRAY['触感瞑想セッション。', '5つの異なる素材を用意し、各素材に3分ずつ集中します。', '目を閉じて触り、温度の変化、質感の違い、手の感覚の変化を観察してください。', '各素材から受ける印象や感情も記録し、どの触感が最もリラックス効果があるかを発見しましょう。']::text[],
  '触感瞑想セッション。5つの異なる素材を用意し、各素材に3分ずつ集中します。目を閉じて触り、温度の変化、質感の違い、手の感覚の変化を観察してください。各素材から受ける印象や感情も記録し、どの触感が最もリラックス効果があるかを発見しましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'エネルギー・ビジュアライゼーション',
  '体内のエネルギーフローを想像し、活力を高める',
  15,
  '認知的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['エネルギー', '視覚化', '活力']::text[],
  ARRAY['快適な姿勢で目を閉じ、体の中を光のエネルギーが流れているイメージをします。', '足先から頭頂部まで、温かい金色の光が循環し、疲れた部分を癒していく様子を詳細に想像してください。', '光が体全体を満たした時の活力と平和を感じましょう。']::text[],
  '快適な姿勢で目を閉じ、体の中を光のエネルギーが流れているイメージをします。足先から頭頂部まで、温かい金色の光が循環し、疲れた部分を癒していく様子を詳細に想像してください。光が体全体を満たした時の活力と平和を感じましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'エネルギー・ビジュアライゼーション',
  '体内のエネルギーフローを想像し、活力を高める',
  30,
  '認知的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['エネルギー', '視覚化', '活力']::text[],
  ARRAY['完全エネルギー・リチャージセッション。', '①体のスキャンと疲労部位の特定（5分）②地球からエネルギーを受け取るイメージ（10分）③宇宙からの光のシャワーを浴びる（10分）④体内でエネルギーが完全に調和する（5分）。', 'このプロセスで、身体と精神の両方に新鮮なエネルギーを供給します。']::text[],
  '完全エネルギー・リチャージセッション。①体のスキャンと疲労部位の特定（5分）②地球からエネルギーを受け取るイメージ（10分）③宇宙からの光のシャワーを浴びる（10分）④体内でエネルギーが完全に調和する（5分）。このプロセスで、身体と精神の両方に新鮮なエネルギーを供給します。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '5分間整理術',
  '身の回りの小さな場所を集中的に整理して達成感を得る',
  5,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['整理', '達成感', '環境']::text[],
  ARRAY['デスクの引き出し一つ、カバンの中、または本棚の一段など、小さな範囲を選んで集中的に整理します。', '不要なものは処分し、必要なものは使いやすく配置してください。', '完了後は整理された空間を眺めて達成感を味わいましょう。']::text[],
  'デスクの引き出し一つ、カバンの中、または本棚の一段など、小さな範囲を選んで集中的に整理します。不要なものは処分し、必要なものは使いやすく配置してください。完了後は整理された空間を眺めて達成感を味わいましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '5分間整理術',
  '身の回りの小さな場所を集中的に整理して達成感を得る',
  15,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['整理', '達成感', '環境']::text[],
  ARRAY['システマティック整理セッション。', '3つの小さな場所を選び、各5分で集中整理します。', '①分類（必要・不要・迷い）②配置の最適化③清拭と仕上げ。', '整理前後の写真を撮ると達成感がより高まります。', '整理された環境で作業効率も向上するでしょう。']::text[],
  'システマティック整理セッション。3つの小さな場所を選び、各5分で集中整理します。①分類（必要・不要・迷い）②配置の最適化③清拭と仕上げ。整理前後の写真を撮ると達成感がより高まります。整理された環境で作業効率も向上するでしょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '理想の未来自分との対話',
  '10年後の理想の自分と対話し、今へのアドバイスをもらう',
  30,
  '認知的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['未来自分', '対話', '目標']::text[],
  ARRAY['リラックスした状態で目を閉じ、10年後の理想の自分を詳細にイメージします。', '①その人の外見、服装、表情②どんな場所にいるか③どんな仕事をしているか④どんな人間関係を築いているか。', '次に、その理想の自分に今の悩みを相談し、アドバイスを聞いてください。', '最後に、理想の未来に向けて今日からできることを3つ決めましょう。']::text[],
  'リラックスした状態で目を閉じ、10年後の理想の自分を詳細にイメージします。①その人の外見、服装、表情②どんな場所にいるか③どんな仕事をしているか④どんな人間関係を築いているか。次に、その理想の自分に今の悩みを相談し、アドバイスを聞いてください。最後に、理想の未来に向けて今日からできることを3つ決めましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '自然音セラピー',
  '雨音、波音、鳥のさえずりなどの自然音でリラックス',
  15,
  '行動的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['自然音', '音響療法', '癒し']::text[],
  ARRAY['お気に入りの自然音（雨音、波音、森の音など）をイヤホンで聞きます。', '目を閉じて、その音の中にいることをイメージしてください。', '音の層（風の音、鳥の声、水の流れ）を意識的に聞き分け、自然の中で深くリラックスしている感覚を味わいましょう。']::text[],
  'お気に入りの自然音（雨音、波音、森の音など）をイヤホンで聞きます。目を閉じて、その音の中にいることをイメージしてください。音の層（風の音、鳥の声、水の流れ）を意識的に聞き分け、自然の中で深くリラックスしている感覚を味わいましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '自然音セラピー',
  '雨音、波音、鳥のさえずりなどの自然音でリラックス',
  30,
  '行動的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['自然音', '音響療法', '癒し']::text[],
  ARRAY['完全自然音イマージョン。', '複数の自然音を組み合わせ、バーチャル自然環境を作ります。', '①海辺の朝（波音+鳥のさえずり）②森の午後（風音+葉の擦れる音）③雨の夜（雨音+遠くの雷）の3つの場面を10分ずつ体験し、それぞれの環境から受ける癒しと平和を十分に感じてください。']::text[],
  '完全自然音イマージョン。複数の自然音を組み合わせ、バーチャル自然環境を作ります。①海辺の朝（波音+鳥のさえずり）②森の午後（風音+葉の擦れる音）③雨の夜（雨音+遠くの雷）の3つの場面を10分ずつ体験し、それぞれの環境から受ける癒しと平和を十分に感じてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '3-2-1完全リセット',
  '3つ見る、2つ聞く、1つ触る。瞬時に「今」に戻る技法',
  5,
  '行動的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['即効性', 'グラウンディング', '3-2-1']::text[],
  ARRAY['まず周りを見回して3つのものを意識的に見つめ、名前を心の中で言います。', '次に2つの音（エアコンの音、鳥の声など）を特定して聞きます。', '最後に1つのもの（机、椅子、自分の手など）を触って感触を確認します。', 'これで脳が「今この瞬間」にしっかりと着地します。']::text[],
  'まず周りを見回して3つのものを意識的に見つめ、名前を心の中で言います。次に2つの音（エアコンの音、鳥の声など）を特定して聞きます。最後に1つのもの（机、椅子、自分の手など）を触って感触を確認します。これで脳が「今この瞬間」にしっかりと着地します。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '7秒吐き出し呼吸',
  '吸うより吐くことに集中した緊急リラックス法',
  5,
  '行動的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['呼吸', '副交感神経', '7秒']::text[],
  ARRAY['4秒で鼻から息を吸い、7秒かけて口からゆっくりと息を吐きます。', '吐くときは「ふぅ〜」と音を立てても構いません。', 'この1:1.75の比率で5回繰り返すと、自律神経が自動的にリラックスモードに切り替わります。', '緊張した会議の前や電車の中でも効果的です。']::text[],
  '4秒で鼻から息を吸い、7秒かけて口からゆっくりと息を吐きます。吐くときは「ふぅ〜」と音を立てても構いません。この1:1.75の比率で5回繰り返すと、自律神経が自動的にリラックスモードに切り替わります。緊張した会議の前や電車の中でも効果的です。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '感謝3秒スプリント',
  '3つの感謝を3秒で見つけて気分を即座に変える',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['感謝', '3秒', '即効性']::text[],
  ARRAY['今この瞬間にある3つの「当たり前」に感謝してみましょう。', '①呼吸ができること②座れる場所があること③温度が快適なこと、など。', 'どんなに小さなことでもOK。', '「ありがたい」と心の中で3回唱えるだけで、脳内の幸福物質が分泌され始めます。']::text[],
  '今この瞬間にある3つの「当たり前」に感謝してみましょう。①呼吸ができること②座れる場所があること③温度が快適なこと、など。どんなに小さなことでもOK。「ありがたい」と心の中で3回唱えるだけで、脳内の幸福物質が分泌され始めます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '肩ストン・リリース',
  '肩の力を一気に抜いて緊張をリセット',
  5,
  '行動的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['筋弛緩', '肩', 'リリース']::text[],
  ARRAY['①両肩を思いっきり上に持ち上げて5秒キープ②「ストン！」と一気に力を抜いて肩を下ろす③この瞬間の「ほぐれた感覚」を味わう④3回繰り返す⑤最後に首を左右にゆっくり回す。', 'デスクワーク中でも目立たずにできる緊張リセット法です。']::text[],
  '①両肩を思いっきり上に持ち上げて5秒キープ②「ストン！」と一気に力を抜いて肩を下ろす③この瞬間の「ほぐれた感覚」を味わう④3回繰り返す⑤最後に首を左右にゆっくり回す。デスクワーク中でも目立たずにできる緊張リセット法です。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '「リセット」魔法の言葉',
  '「リセット」と唱えるだけで思考パターンを切り替える',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['リセット', '思考切替', '魔法の言葉']::text[],
  ARRAY['ネガティブ思考や心配事が頭をぐるぐるしているとき、「リセット！」と心の中で（または小声で）3回唱えてください。', 'パソコンを再起動するように、脳の思考回路を一度クリアにするイメージです。', '「今から新しい気持ちでスタート」と続けると効果が高まります。']::text[],
  'ネガティブ思考や心配事が頭をぐるぐるしているとき、「リセット！」と心の中で（または小声で）3回唱えてください。パソコンを再起動するように、脳の思考回路を一度クリアにするイメージです。「今から新しい気持ちでスタート」と続けると効果が高まります。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '冷水手首クール',
  '手首の冷却で自律神経を即座にリセット',
  5,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['冷却', '手首', '覚醒']::text[],
  ARRAY['洗面所で冷たい水を手首（脈を取る部分）に20秒当てます。', '両手首を交互に冷やし、冷たい感覚が腕を伝って体全体に広がるのを感じてください。', '瞬時に頭がスッキリし、集中力が戻ります。', '会議中の眠気や午後のだるさに特に効果的です。']::text[],
  '洗面所で冷たい水を手首（脈を取る部分）に20秒当てます。両手首を交互に冷やし、冷たい感覚が腕を伝って体全体に広がるのを感じてください。瞬時に頭がスッキリし、集中力が戻ります。会議中の眠気や午後のだるさに特に効果的です。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '10年後視点',
  '10年後の自分から見た今の問題の捉え方',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['未来視点', '相対化', '10年後']::text[],
  ARRAY['今悩んでいることを、10年後の自分の立場から見てみましょう。', '「10年後の私から見て、この問題はどのくらい重要だろう？」「その時の私なら、今の私にどんなアドバイスをするだろう？」この視点の変化で、問題の大きさが適正に調整されます。']::text[],
  '今悩んでいることを、10年後の自分の立場から見てみましょう。「10年後の私から見て、この問題はどのくらい重要だろう？」「その時の私なら、今の私にどんなアドバイスをするだろう？」この視点の変化で、問題の大きさが適正に調整されます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '1分片付け',
  '手の届く範囲の1分間整理で達成感と清涼感を得る',
  5,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['片付け', '達成感', '1分']::text[],
  ARRAY['デスクの上、カバンの中、本棚の一段など、手の届く小さな範囲を選んで1分間で集中整理します。', '不要なものは捨て、必要なものは整列させてください。', '完了後の「スッキリ感」と「やり遂げた感」が、心のモヤモヤもクリアにしてくれます。']::text[],
  'デスクの上、カバンの中、本棚の一段など、手の届く小さな範囲を選んで1分間で集中整理します。不要なものは捨て、必要なものは整列させてください。完了後の「スッキリ感」と「やり遂げた感」が、心のモヤモヤもクリアにしてくれます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '「大丈夫」マントラ',
  '「大丈夫」を繰り返して安心感を作る',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['マントラ', '大丈夫', '安心感']::text[],
  ARRAY['「大丈夫、大丈夫、大丈夫」と心の中で、またはささやくように繰り返します。', '呼吸に合わせて「息を吸って→大丈夫、息を吐いて→大丈夫」でも効果的です。', 'この言葉の繰り返しが脳に安心のシグナルを送り、不安や心配を和らげてくれます。']::text[],
  '「大丈夫、大丈夫、大丈夫」と心の中で、またはささやくように繰り返します。呼吸に合わせて「息を吸って→大丈夫、息を吐いて→大丈夫」でも効果的です。この言葉の繰り返しが脳に安心のシグナルを送り、不安や心配を和らげてくれます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'パワーポーズ2分',
  '自信を高める姿勢で内側からエネルギーチャージ',
  5,
  '行動的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['パワーポーズ', '自信', '姿勢']::text[],
  ARRAY['一人になれる場所で、両手を腰に当てて胸を張り、足を肩幅に開いて立ちます（スーパーマンポーズでもOK）。', 'この姿勢を2分間キープし、「私は強い」「私にはできる」と心の中で唱えてください。', '姿勢が心の状態を変え、自信とエネルギーが湧いてきます。']::text[],
  '一人になれる場所で、両手を腰に当てて胸を張り、足を肩幅に開いて立ちます（スーパーマンポーズでもOK）。この姿勢を2分間キープし、「私は強い」「私にはできる」と心の中で唱えてください。姿勢が心の状態を変え、自信とエネルギーが湧いてきます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '安心の場所イメージ',
  '安心できる場所を瞬時に思い出してそこにいる感覚を味わう',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['安心の場所', 'イメージ', '心理的避難']::text[],
  ARRAY['目を閉じて、最も安心できる場所（実家、好きなカフェ、海辺、森など）を思い浮かべます。', 'そこにいる時の感覚（温度、音、匂い、安心感）を鮮明に再現してください。', '「いつでもここに帰ることができる」「私は安全だ」と感じながら、心の避難場所でほっと一息ついてください。']::text[],
  '目を閉じて、最も安心できる場所（実家、好きなカフェ、海辺、森など）を思い浮かべます。そこにいる時の感覚（温度、音、匂い、安心感）を鮮明に再現してください。「いつでもここに帰ることができる」「私は安全だ」と感じながら、心の避難場所でほっと一息ついてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '30秒全身伸び',
  '座ったままできる最短全身ストレッチ',
  5,
  '行動的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['ストレッチ', '30秒', '座位']::text[],
  ARRAY['座ったまま以下を30秒で実行：①両手を頭上に伸ばして背伸び（10秒）②体を左右に傾けて脇腹伸ばし（各5秒）③肩を前後に大きく回す（10秒）。', '短時間でも筋肉がほぐれ、血流が改善して頭も体もスッキリします。']::text[],
  '座ったまま以下を30秒で実行：①両手を頭上に伸ばして背伸び（10秒）②体を左右に傾けて脇腹伸ばし（各5秒）③肩を前後に大きく回す（10秒）。短時間でも筋肉がほぐれ、血流が改善して頭も体もスッキリします。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '「終わった」宣言',
  '心配事やタスクに区切りをつける心理的完了法',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['完了', '区切り', '切り替え']::text[],
  ARRAY['今考えている心配事やタスクについて「今はここまで。', '終わり！」と心の中で明確に宣言します。', '深呼吸を一回して「次の時間は〇〇に集中する」と新しいモードを設定してください。', '脳に明確な区切りを与えることで、注意の切り替えがスムーズになります。']::text[],
  '今考えている心配事やタスクについて「今はここまで。終わり！」と心の中で明確に宣言します。深呼吸を一回して「次の時間は〇〇に集中する」と新しいモードを設定してください。脳に明確な区切りを与えることで、注意の切り替えがスムーズになります。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '作り笑顔30秒',
  '意図的な笑顔で脳を騙して気分を向上させる',
  5,
  '行動的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['笑顔', '表情', '気分向上']::text[],
  ARRAY['鏡を見るか、人がいない場所で意図的に笑顔を作ります。', '口角を上げ、頬を高く上げて、目も細める本格的な笑顔を30秒キープ。', '最初は違和感があっても続けてください。', '脳が「楽しい」と錯覚し始め、実際に気分が明るくなってきます。']::text[],
  '鏡を見るか、人がいない場所で意図的に笑顔を作ります。口角を上げ、頬を高く上げて、目も細める本格的な笑顔を30秒キープ。最初は違和感があっても続けてください。脳が「楽しい」と錯覚し始め、実際に気分が明るくなってきます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '「今一番大切なこと」質問',
  '優先順位を瞬時に明確にして迷いを解消',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['優先順位', '価値', '意思決定']::text[],
  ARRAY['「今この瞬間、私にとって一番大切なことは何？」と自分に問いかけ、3秒以内に答えを見つけてください。', 'それが今日すべき最優先事項です。', '他のことは一旦脇に置き、その一番大切なことに集中しましょう。', 'シンプルな問いが混乱した思考を整理してくれます。']::text[],
  '「今この瞬間、私にとって一番大切なことは何？」と自分に問いかけ、3秒以内に答えを見つけてください。それが今日すべき最優先事項です。他のことは一旦脇に置き、その一番大切なことに集中しましょう。シンプルな問いが混乱した思考を整理してくれます。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '和の心で気持ちを整える',
  '日本の「わび・さび」の美学を活用して、不完全さを受け入れる',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['和', 'わびさび', '受容']::text[],
  ARRAY['今の自分の不完全さや課題を思い浮かべ、それを「侘び寂び」として捉えてみましょう。', '「完璧でなくても美しい。', '今のこの状態にも価値がある」と心の中で唱え、日本古来の美意識で現状を受け入れてください。']::text[],
  '今の自分の不完全さや課題を思い浮かべ、それを「侘び寂び」として捉えてみましょう。「完璧でなくても美しい。今のこの状態にも価値がある」と心の中で唱え、日本古来の美意識で現状を受け入れてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '和の心で気持ちを整える',
  '日本の「わび・さび」の美学を活用して、不完全さを受け入れる',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['和', 'わびさび', '受容']::text[],
  ARRAY['和室に座る（または正座する）姿勢で、日本庭園や茶道の世界をイメージします。', '不完全な石、曲がった枝、苔の生えた岩...それらすべてに美しさを見出す日本の心を感じながら、自分の人生の「不完全な美しさ」を発見してください。', '5分間の静寂で心を整え、最後に「ありがたし」と感謝を込めて締めくくります。']::text[],
  '和室に座る（または正座する）姿勢で、日本庭園や茶道の世界をイメージします。不完全な石、曲がった枝、苔の生えた岩...それらすべてに美しさを見出す日本の心を感じながら、自分の人生の「不完全な美しさ」を発見してください。5分間の静寂で心を整え、最後に「ありがたし」と感謝を込めて締めくくります。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'お茶の時間（茶道の心）',
  '茶道の精神「一期一会」を活かした mindful tea time',
  15,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['茶道', '一期一会', 'マインドフルネス']::text[],
  ARRAY['お茶（緑茶、紅茶、何でも）を丁寧に淹れます。', '湯を沸かす音、茶葉の香り、湯気の立ち上る様子に「今この瞬間」への感謝を込めてください。', '飲むときは「一期一会」を心に留め、このお茶の時間が二度とない貴重な瞬間であることを味わいましょう。']::text[],
  'お茶（緑茶、紅茶、何でも）を丁寧に淹れます。湯を沸かす音、茶葉の香り、湯気の立ち上る様子に「今この瞬間」への感謝を込めてください。飲むときは「一期一会」を心に留め、このお茶の時間が二度とない貴重な瞬間であることを味わいましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'お茶の時間（茶道の心）',
  '茶道の精神「一期一会」を活かした mindful tea time',
  30,
  '行動的',
  ARRAY['workplace', 'home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['茶道', '一期一会', 'マインドフルネス']::text[],
  ARRAY['本格的な茶の湯体験。', '①心を整える（5分）②茶を点てる作業に集中（10分）③「一期一会」の精神で味わう（10分）④感謝と静寂の時間（5分）。', '作法は不完璧でも構いません。', '大切なのは「今」に集中し、一杯のお茶から日本の心を学ぶことです。']::text[],
  '本格的な茶の湯体験。①心を整える（5分）②茶を点てる作業に集中（10分）③「一期一会」の精神で味わう（10分）④感謝と静寂の時間（5分）。作法は不完璧でも構いません。大切なのは「今」に集中し、一杯のお茶から日本の心を学ぶことです。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '四季を感じる瞑想',
  '日本人特有の季節感を活用した情緒的安定法',
  15,
  '認知的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['四季', '季節感', '自然調和']::text[],
  ARRAY['今の季節を五感で感じてみましょう。', '春なら新緑と花の香り、夏なら蝉の声、秋なら紅葉と風の涼しさ、冬なら雪の静寂。', '窓の外を見るか、季節の写真を眺めながら「今年もこの季節を迎えられた」ことに感謝し、季節の移り変わりとともにある自分を受け入れてください。']::text[],
  '今の季節を五感で感じてみましょう。春なら新緑と花の香り、夏なら蝉の声、秋なら紅葉と風の涼しさ、冬なら雪の静寂。窓の外を見るか、季節の写真を眺めながら「今年もこの季節を迎えられた」ことに感謝し、季節の移り変わりとともにある自分を受け入れてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '四季を感じる瞑想',
  '日本人特有の季節感を活用した情緒的安定法',
  30,
  '認知的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['四季', '季節感', '自然調和']::text[],
  ARRAY['四季の記憶瞑想。', '子どもの頃から今まで、印象深い各季節の思い出を一つずつ思い出します（各季節7-8分）。', '桜の下での入学式、夏祭りの思い出、紅葉狩り、雪だるま作り...。', '季節とともに成長してきた自分の人生に感謝し、今後も季節と調和して生きていく決意を新たにしましょう。']::text[],
  '四季の記憶瞑想。子どもの頃から今まで、印象深い各季節の思い出を一つずつ思い出します（各季節7-8分）。桜の下での入学式、夏祭りの思い出、紅葉狩り、雪だるま作り...。季節とともに成長してきた自分の人生に感謝し、今後も季節と調和して生きていく決意を新たにしましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'おもてなしの心を自分に',
  '日本の「おもてなし」精神を自分自身に向ける',
  15,
  '行動的',
  ARRAY['home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['おもてなし', '自己ケア', '心遣い']::text[],
  ARRAY['自分を大切なお客様として扱ってみましょう。', 'お気に入りの茶碗でお茶を飲む、好きな音楽をかける、部屋を心地よく整える...「自分をもてなす」ことで心に余裕を作ります。', '「今日もお疲れさまでした」と自分に声をかけてあげてください。']::text[],
  '自分を大切なお客様として扱ってみましょう。お気に入りの茶碗でお茶を飲む、好きな音楽をかける、部屋を心地よく整える...「自分をもてなす」ことで心に余裕を作ります。「今日もお疲れさまでした」と自分に声をかけてあげてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  'おもてなしの心を自分に',
  '日本の「おもてなし」精神を自分自身に向ける',
  30,
  '行動的',
  ARRAY['home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['おもてなし', '自己ケア', '心遣い']::text[],
  ARRAY['完全セルフおもてなしタイム。', '①環境を整える（照明、音楽、香り）②特別なお茶やお菓子を用意③ゆっくりと味わう④自分の体や心の状態を気遣う⑤明日への準備を丁寧に⑥「ありがとう」で締めくくる。', '他者への気遣いと同じ丁寧さで自分をケアしましょう。']::text[],
  '完全セルフおもてなしタイム。①環境を整える（照明、音楽、香り）②特別なお茶やお菓子を用意③ゆっくりと味わう④自分の体や心の状態を気遣う⑤明日への準備を丁寧に⑥「ありがとう」で締めくくる。他者への気遣いと同じ丁寧さで自分をケアしましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '「がんばらない」練習',
  '日本人特有の「頑張りすぎ」文化から距離を置く練習',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['がんばらない', '脱力', 'バランス']::text[],
  ARRAY['「今日はがんばらなくてもいい」と心の中で3回唱えてみましょう。', '完璧を目指さず、「まあいいか」「適当でいいや」という気持ちを意識的に採用してください。', '罪悪感が湧いても、それも含めて「がんばらない」練習です。']::text[],
  '「今日はがんばらなくてもいい」と心の中で3回唱えてみましょう。完璧を目指さず、「まあいいか」「適当でいいや」という気持ちを意識的に採用してください。罪悪感が湧いても、それも含めて「がんばらない」練習です。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '「がんばらない」練習',
  '日本人特有の「頑張りすぎ」文化から距離を置く練習',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['がんばらない', '脱力', 'バランス']::text[],
  ARRAY['脱・頑張り主義セッション。', '①今日頑張ったことをリストアップ②その中で「頑張らなくても良かったもの」を特定③明日は「頑張らずに済む方法」を考える④「程々で良い」「60点で合格」という新しい基準を設定⑤「頑張らない勇気」を自分に与える。', '日本人の美徳を保ちつつ、持続可能な生き方を見つけましょう。']::text[],
  '脱・頑張り主義セッション。①今日頑張ったことをリストアップ②その中で「頑張らなくても良かったもの」を特定③明日は「頑張らずに済む方法」を考える④「程々で良い」「60点で合格」という新しい基準を設定⑤「頑張らない勇気」を自分に与える。日本人の美徳を保ちつつ、持続可能な生き方を見つけましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '書道・筆文字でマインドフルネス',
  '筆で文字を書くことによる集中と心の安定',
  15,
  '行動的',
  ARRAY['home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['書道', '筆文字', '集中']::text[],
  ARRAY['筆ペンやサインペンで、好きな一文字（「和」「静」「楽」など）をゆっくりと書いてみましょう。', '線の始まりから終わりまで、筆先に意識を集中させてください。', '同じ文字を何度書いても構いません。', '書くことで心が落ち着いていく感覚を味わってください。']::text[],
  '筆ペンやサインペンで、好きな一文字（「和」「静」「楽」など）をゆっくりと書いてみましょう。線の始まりから終わりまで、筆先に意識を集中させてください。同じ文字を何度書いても構いません。書くことで心が落ち着いていく感覚を味わってください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '書道・筆文字でマインドフルネス',
  '筆で文字を書くことによる集中と心の安定',
  30,
  '行動的',
  ARRAY['home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['書道', '筆文字', '集中']::text[],
  ARRAY['本格書道瞑想。', '①心を整える（5分）②基本線の練習（5分）③好きな言葉を選んで清書（15分）④作品を鑑賞して心境の変化を感じる（5分）。', '「下手でも心を込めて」が大切です。', '文字を通じて自分の心と対話し、日本の文字文化の深さを体験しましょう。']::text[],
  '本格書道瞑想。①心を整える（5分）②基本線の練習（5分）③好きな言葉を選んで清書（15分）④作品を鑑賞して心境の変化を感じる（5分）。「下手でも心を込めて」が大切です。文字を通じて自分の心と対話し、日本の文字文化の深さを体験しましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '「すみません」から「ありがとう」へ',
  '日本人特有の謝罪文化を感謝文化に転換する練習',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['感謝', '謝罪', '言葉の力']::text[],
  ARRAY['今日「すみません」と言いそうになった場面を思い出し、それを「ありがとう」に変換してみましょう。', '「すみません、遅れて」→「待っていてくれてありがとう」「すみません、手伝って」→「手伝ってくれてありがとう」。', '同じ気持ちをポジティブに表現する練習です。']::text[],
  '今日「すみません」と言いそうになった場面を思い出し、それを「ありがとう」に変換してみましょう。「すみません、遅れて」→「待っていてくれてありがとう」「すみません、手伝って」→「手伝ってくれてありがとう」。同じ気持ちをポジティブに表現する練習です。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '「すみません」から「ありがとう」へ',
  '日本人特有の謝罪文化を感謝文化に転換する練習',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['感謝', '謝罪', '言葉の力']::text[],
  ARRAY['感謝変換トレーニング。', '①今週「すみません」を使った場面を5つ思い出す②それぞれを「ありがとう」表現に変換③実際に声に出して言い直してみる④どちらが心地よいか感じる⑤明日から使える感謝表現を3つ決める。', '日本人の謙遜文化を保ちながら、よりポジティブなコミュニケーションを身につけましょう。']::text[],
  '感謝変換トレーニング。①今週「すみません」を使った場面を5つ思い出す②それぞれを「ありがとう」表現に変換③実際に声に出して言い直してみる④どちらが心地よいか感じる⑤明日から使える感謝表現を3つ決める。日本人の謙遜文化を保ちながら、よりポジティブなコミュニケーションを身につけましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '縁側タイム（心の縁側）',
  '昭和の縁側文化を現代に活かした「ぼーっと」する時間',
  15,
  '行動的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['縁側', 'ぼんやり', 'スローライフ']::text[],
  ARRAY['窓際や玄関先、ベランダなど、「縁側的」な場所に座ります。', '何も考えず、何もしないで、ただ外を眺めたり空を見上げたりしてください。', 'スマホは見ません。', '昭和のおじいちゃんおばあちゃんのように、時間を忘れて「ぼーっと」する贅沢を味わいましょう。']::text[],
  '窓際や玄関先、ベランダなど、「縁側的」な場所に座ります。何も考えず、何もしないで、ただ外を眺めたり空を見上げたりしてください。スマホは見ません。昭和のおじいちゃんおばあちゃんのように、時間を忘れて「ぼーっと」する贅沢を味わいましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '縁側タイム（心の縁側）',
  '昭和の縁側文化を現代に活かした「ぼーっと」する時間',
  30,
  '行動的',
  ARRAY['home', 'outside']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['縁側', 'ぼんやり', 'スローライフ']::text[],
  ARRAY['完全縁側体験。', '①縁側的空間の設定（座布団、お茶など）②15分間完全に「何もしない」③近所の音、季節の変化を感じる④「急がない」「競争しない」昭和の時間感覚を体験⑤現代生活のスピードについて考える⑥「たまには立ち止まる」ことの大切さを実感。', 'デジタル時代だからこそ必要な、アナログな時間の過ごし方を再発見しましょう。']::text[],
  '完全縁側体験。①縁側的空間の設定（座布団、お茶など）②15分間完全に「何もしない」③近所の音、季節の変化を感じる④「急がない」「競争しない」昭和の時間感覚を体験⑤現代生活のスピードについて考える⑥「たまには立ち止まる」ことの大切さを実感。デジタル時代だからこそ必要な、アナログな時間の過ごし方を再発見しましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '「察する」文化でセルフケア',
  '日本の「察する」文化を自分の心のケアに活用',
  5,
  '認知的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['察する', '自己察知', '心のケア']::text[],
  ARRAY['他人の気持ちを察するのと同じように、自分の心の状態を察してみましょう。', '「今、私の心は何を求めているかな？」「疲れているかな？悲しいかな？安心したいかな？」言葉にならない心の声に耳を傾け、そのニーズに応えてあげてください。']::text[],
  '他人の気持ちを察するのと同じように、自分の心の状態を察してみましょう。「今、私の心は何を求めているかな？」「疲れているかな？悲しいかな？安心したいかな？」言葉にならない心の声に耳を傾け、そのニーズに応えてあげてください。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '「察する」文化でセルフケア',
  '日本の「察する」文化を自分の心のケアに活用',
  15,
  '認知的',
  ARRAY['workplace', 'home', 'studying']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['察する', '自己察知', '心のケア']::text[],
  ARRAY['セルフ察知瞑想。', '①体のサインを察する（5分）：肩が凝っている、お腹が空いている、眠いなど②心のサインを察する（5分）：イライラ、不安、寂しさ、嬉しさなど③魂のサインを察する（5分）：生きがい、やりたいこと、価値観など。', '他者への気遣いと同じ繊細さで、自分の心を大切にケアしましょう。']::text[],
  'セルフ察知瞑想。①体のサインを察する（5分）：肩が凝っている、お腹が空いている、眠いなど②心のサインを察する（5分）：イライラ、不安、寂しさ、嬉しさなど③魂のサインを察する（5分）：生きがい、やりたいこと、価値観など。他者への気遣いと同じ繊細さで、自分の心を大切にケアしましょう。',
  'manual',
  true,
  3.0
);

INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (
  '風呂敷包みの心',
  '日本の風呂敷文化から学ぶ「包み込む」セルフケア',
  15,
  '行動的',
  ARRAY['home']::text[],
  ARRAY['office_worker']::text[],
  ARRAY['風呂敷', '包む', '安心感']::text[],
  ARRAY['柔らかいブランケットやタオルで体を包みます。', '風呂敷が大切なものを丁寧に包むように、今日の疲れや心配事もすべて包み込んでもらいましょう。', '「私は大切に守られている」「すべてが包み込まれて安全だ」と感じながら、日本の「包む」文化の温かさを体験してください。', '包まれた状態で5分間の瞑想を行い、安心感を十分に味わいます。']::text[],
  '柔らかいブランケットやタオルで体を包みます。風呂敷が大切なものを丁寧に包むように、今日の疲れや心配事もすべて包み込んでもらいましょう。「私は大切に守られている」「すべてが包み込まれて安全だ」と感じながら、日本の「包む」文化の温かさを体験してください。包まれた状態で5分間の瞑想を行い、安心感を十分に味わいます。',
  'manual',
  true,
  3.0
);

