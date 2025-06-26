// フォールバックデータ（Gemini API利用不可時に使用）
export const fallbackSuggestions = {
  workplace: {
    5: [
      {
        id: 'wp_5_deep_breath',
        title: '深呼吸とポジティブ思考',
        description: '5回深呼吸して、今日の良かったことを3つ思い浮かべる',
        category: '認知的' as const,
        duration: 5,
        steps: ['椅子に座って背筋を伸ばす', '鼻から4秒吸って8秒で吐く', '良かったことを3つ思い浮かべる']
      },
      {
        id: 'wp_5_desk_clean',
        title: 'デスク周りの整理',
        description: 'デスクの上を片付けて、気持ちもスッキリさせる',
        category: '行動的' as const,
        duration: 5,
        steps: ['不要な書類を片付ける', 'PC周りを拭く', 'お気に入りのアイテムを飾る']
      },
      {
        id: 'wp_5_warm_drink',
        title: '温かい飲み物を味わう',
        description: 'コーヒーやお茶を丁寧に味わって、心を落ち着かせる',
        category: '行動的' as const,
        duration: 5,
        steps: ['お気に入りの飲み物を用意', '香りを楽しむ', '一口ずつゆっくり味わう']
      },
      {
        id: 'wp_5_self_praise',
        title: '自分への優しい言葉',
        description: '「頑張っているね」と自分に優しい言葉をかける',
        category: '認知的' as const,
        duration: 5,
        steps: ['手を胸に当てる', '「よく頑張っているね」と言う', '今日頑張ったことを3つ思い出す']
      },
      {
        id: 'wp_5_window_gaze',
        title: '窓の外を眺める',
        description: '窓から外の景色を眺めて、視線と心をリフレッシュ',
        category: '行動的' as const,
        duration: 5,
        steps: ['窓に近づく', '遠くの景色に焦点を合わせる', '空や雲の動きを観察する']
      }
    ],
    15: [
      {
        id: 'wp_15_mini_walk',
        title: 'オフィス内散歩',
        description: '建物内を歩いて、軽い運動と気分転換を図る',
        category: '行動的' as const,
        duration: 15,
        steps: ['デスクから立ち上がる', '違う階や廊下を歩く', '歩きながら深呼吸する']
      },
      {
        id: 'wp_15_memory_trip',
        title: '楽しい思い出の旅',
        description: '最近の楽しかった出来事をじっくり思い返す',
        category: '認知的' as const,
        duration: 15,
        steps: ['静かな場所を見つける', '目を閉じて思い出に浸る', 'その時の感情を味わう']
      },
      {
        id: 'wp_15_stretch_session',
        title: '全身ストレッチタイム',
        description: '肩、首、背中をじっくりほぐして体をリフレッシュ',
        category: '行動的' as const,
        duration: 15,
        steps: ['立ち上がって準備運動', '首・肩・腰を順番にストレッチ', '最後に深呼吸で締める']
      },
      {
        id: 'wp_15_mindful_tea',
        title: 'マインドフルティータイム',
        description: 'お茶を淹れる過程から味わうまでを瞑想的に楽しむ',
        category: '行動的' as const,
        duration: 15,
        steps: ['お湯を沸かす音に集中', 'お茶の香りを楽しむ', '一口ずつ味と温度を感じる']
      }
    ],
    30: [
      {
        id: 'wp_30_lunch_walk',
        title: 'ランチタイム散歩',
        description: '外に出て新鮮な空気を吸いながら、ゆっくり散歩する',
        category: '行動的' as const,
        duration: 30,
        steps: ['外出の準備をする', '近くの公園や静かな道を選ぶ', '自然や街の様子を観察しながら歩く']
      },
      {
        id: 'wp_30_creative_doodle',
        title: '創造的な落書きタイム',
        description: '紙とペンで自由に絵や模様を描いて、創造性を解放する',
        category: '行動的' as const,
        duration: 30,
        steps: ['紙とペンを用意', '考えずに手を動かし始める', '色や形を自由に楽しむ']
      },
      {
        id: 'wp_30_guided_meditation',
        title: 'ガイド付き瞑想',
        description: '呼吸に意識を向けて、心と体をリセットする瞑想タイム',
        category: '認知的' as const,
        duration: 30,
        steps: ['静かな場所で座る', '呼吸に意識を集中', '雑念が浮かんでも呼吸に戻る']
      },
      {
        id: 'wp_30_journal_writing',
        title: 'ジャーナリング',
        description: '今の気持ちや考えを紙に書き出して、心を整理する',
        category: '認知的' as const,
        duration: 30,
        steps: ['ノートとペンを用意', '思いつくままに書き始める', '判断せずに感情を表現する']
      }
    ]
  },
  home: {
    5: [
      {
        id: 'hm_5_gratitude',
        title: '感謝の気持ちを思い返す',
        description: '今日感謝したいことを3つ心の中で唱える',
        category: '認知的' as const,
        duration: 5,
        steps: ['静かな場所に座る', '感謝したいことを思い浮かべる', '心の中で「ありがとう」と唱える']
      },
      {
        id: 'hm_5_light_stretch',
        title: '軽いストレッチ',
        description: '肩や首のコリをほぐして、体の緊張を和らげる',
        category: '行動的' as const,
        duration: 5,
        steps: ['首をゆっくり回す', '肩を上下に動かす', '腕を大きく回す']
      },
      {
        id: 'hm_5_favorite_music',
        title: '好きな音楽を聴く',
        description: 'お気に入りの曲を聴いて、心を癒す',
        category: '行動的' as const,
        duration: 5,
        steps: ['リラックスできる曲を選ぶ', '目を閉じて聴く', '歌詞や音に集中する']
      },
      {
        id: 'hm_5_pet_time',
        title: 'ペットと触れ合う',
        description: 'ペットを撫でたり、話しかけたりして癒される',
        category: '行動的' as const,
        duration: 5,
        steps: ['ペットのそばに行く', '優しく撫でる', '反応を楽しむ']
      },
      {
        id: 'hm_5_aroma_therapy',
        title: 'アロマを楽しむ',
        description: '好きな香りを嗅いで、気分をリフレッシュ',
        category: '行動的' as const,
        duration: 5,
        steps: ['アロマオイルや香りものを用意', '深く香りを吸い込む', '心地よさを味わう']
      }
    ],
    15: [
      {
        id: 'hm_15_shower_refresh',
        title: 'シャワーでリフレッシュ',
        description: '温かいシャワーを浴びて、心身をリセット',
        category: '行動的' as const,
        duration: 15,
        steps: ['シャワーの温度を調整', '全身にお湯を当てる', '終わったら深呼吸']
      },
      {
        id: 'hm_15_plant_care',
        title: '植物の世話',
        description: '観葉植物に水をやったり、葉を拭いたりして癒される',
        category: '行動的' as const,
        duration: 15,
        steps: ['植物の状態をチェック', '必要に応じて水やり', '葉を優しく拭く']
      },
      {
        id: 'hm_15_cooking_prep',
        title: '簡単な料理の下ごしらえ',
        description: '野菜を切ったり、簡単な料理を作って気分転換',
        category: '行動的' as const,
        duration: 15,
        steps: ['材料を準備', 'リズムよく切る', '完成をイメージする']
      },
      {
        id: 'hm_15_photo_browse',
        title: '思い出の写真を見る',
        description: 'スマホやアルバムの写真を見返して、幸せな気持ちになる',
        category: '認知的' as const,
        duration: 15,
        steps: ['写真フォルダを開く', '楽しかった思い出を選ぶ', 'その時の気持ちを思い出す']
      }
    ],
    30: [
      {
        id: 'hm_30_bath_time',
        title: 'ゆっくりお風呂タイム',
        description: '温かいお風呂にゆっくり浸かって、疲れを癒す',
        category: '行動的' as const,
        duration: 30,
        steps: ['お湯を適温に調整', 'ゆっくり湯船に浸かる', '目を閉じてリラックス']
      },
      {
        id: 'hm_30_yoga_session',
        title: 'ヨガセッション',
        description: '簡単なヨガポーズで心身のバランスを整える',
        category: '行動的' as const,
        duration: 30,
        steps: ['ヨガマットを敷く', '呼吸を整える', '無理のないポーズを取る']
      },
      {
        id: 'hm_30_creative_hobby',
        title: '創作活動',
        description: '絵を描いたり、手芸をしたり、創造的な活動に没頭',
        category: '行動的' as const,
        duration: 30,
        steps: ['道具を準備', '気軽に始める', '過程を楽しむ']
      },
      {
        id: 'hm_30_reading_escape',
        title: '読書でエスケープ',
        description: '好きな本を読んで、別の世界に浸る',
        category: '認知的' as const,
        duration: 30,
        steps: ['快適な場所を作る', '本を開く', 'じっくり読み進める']
      },
      {
        id: 'hm_30_video_call',
        title: '大切な人とビデオ通話',
        description: '家族や友人とビデオ通話で繋がって、心を温める',
        category: '行動的' as const,
        duration: 30,
        steps: ['連絡を取る', 'ビデオ通話を開始', '近況を分かち合う']
      }
    ]
  },
  outside: {
    5: [
      {
        id: 'out_5_nature_sounds',
        title: '自然の音に耳を傾ける',
        description: '鳥の声や風の音など、自然の音に集中する',
        category: '認知的' as const,
        duration: 5,
        steps: ['静かな場所を見つける', '目を閉じる', '自然の音に集中する']
      },
      {
        id: 'out_5_slow_walk',
        title: 'ゆっくり歩く',
        description: '急がずに周りの景色を眺めながら歩く',
        category: '行動的' as const,
        duration: 5,
        steps: ['歩くペースを落とす', '周りの景色を観察', '足の感覚に意識を向ける']
      },
      {
        id: 'out_5_sky_gazing',
        title: '空を見上げる',
        description: '空の雲や色の変化を眺めて、心を広げる',
        category: '認知的' as const,
        duration: 5,
        steps: ['空を見上げる', '雲の形や動きを観察', '大きな空間を感じる']
      },
      {
        id: 'out_5_bench_rest',
        title: 'ベンチで一休み',
        description: '近くのベンチに座って、周りの様子を眺める',
        category: '行動的' as const,
        duration: 5,
        steps: ['ベンチを見つける', 'ゆったり座る', '通り過ぎる人や景色を観察']
      },
      {
        id: 'out_5_deep_fresh_air',
        title: '新鮮な空気を深呼吸',
        description: '外の新鮮な空気を深く吸い込んで、体内をリフレッシュ',
        category: '行動的' as const,
        duration: 5,
        steps: ['立ち止まる', '胸を開いて深呼吸', '空気の違いを感じる']
      }
    ],
    15: [
      {
        id: 'out_15_park_explore',
        title: '公園探索',
        description: '近くの公園を歩いて、自然と触れ合う',
        category: '行動的' as const,
        duration: 15,
        steps: ['公園に向かう', '違う道を選んで歩く', '植物や生き物を観察']
      },
      {
        id: 'out_15_window_shopping',
        title: 'ウィンドウショッピング',
        description: 'お店のディスプレイを眺めながら、ゆっくり歩く',
        category: '行動的' as const,
        duration: 15,
        steps: ['商店街やモールへ', '気になる店を見つける', '買わずに眺めて楽しむ']
      },
      {
        id: 'out_15_people_watching',
        title: '人間観察',
        description: 'カフェや公園で、行き交う人々を眺めて想像を膨らませる',
        category: '認知的' as const,
        duration: 15,
        steps: ['落ち着ける場所を見つける', '人々の様子を観察', 'それぞれの物語を想像']
      },
      {
        id: 'out_15_photo_walk',
        title: '写真散歩',
        description: 'スマホで気になるものを撮影しながら歩く',
        category: '行動的' as const,
        duration: 15,
        steps: ['カメラアプリを起動', '面白いものを探す', '違う角度から撮影']
      }
    ],
    30: [
      {
        id: 'out_30_nature_immersion',
        title: '自然浴',
        description: '公園や緑地でゆっくり時間を過ごし、自然のエネルギーを感じる',
        category: '行動的' as const,
        duration: 30,
        steps: ['緑の多い場所へ移動', '木陰でリラックス', '五感で自然を感じる']
      },
      {
        id: 'out_30_cafe_retreat',
        title: 'カフェでまったり',
        description: 'お気に入りのカフェで、飲み物を楽しみながらリラックス',
        category: '行動的' as const,
        duration: 30,
        steps: ['カフェを選ぶ', '好きな飲み物を注文', 'ゆっくり味わいながら過ごす']
      },
      {
        id: 'out_30_sketching',
        title: 'スケッチ散歩',
        description: '景色や建物をスケッチしながら、観察力を高める',
        category: '行動的' as const,
        duration: 30,
        steps: ['スケッチブックを用意', '描きたい場所を見つける', 'じっくり観察しながら描く']
      },
      {
        id: 'out_30_mindful_journey',
        title: 'マインドフル散歩',
        description: '歩くことに完全に集中して、今この瞬間を味わう',
        category: '認知的' as const,
        duration: 30,
        steps: ['ゆっくり歩き始める', '呼吸と歩調を合わせる', '五感すべてで周りを感じる']
      }
    ]
  }
};