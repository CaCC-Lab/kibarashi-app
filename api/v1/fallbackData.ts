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
  },
  // 学生向けフォールバックデータ - Phase A-1で追加
  studying: {
    5: [
      {
        id: 'st_5_brain_reset',
        title: '集中力リセット法 ✨',
        description: '勉強疲れでぼーっとした頭をスッキリさせる、学生向けリフレッシュ法',
        category: '認知的' as const,
        duration: 5,
        steps: [
          '目を閉じて、今日頑張った自分を3つ褒める',
          '深呼吸を3回して、肩の力を抜く',
          '次にやることを1つだけ決める',
          '「よし、やるぞ！」と心の中で言ってから目を開ける'
        ]
      },
      {
        id: 'st_5_desk_stretch',
        title: '椅子de筋トレ 💪',
        description: '座ったまま血行促進！勉強疲れの体をほぐして、脳に酸素を送り込む',
        category: '行動的' as const,
        duration: 5,
        steps: [
          '椅子に座ったまま両手を天井に向けて伸ばす',
          '左右に体をゆっくりねじる（各5回）',
          '足首をくるくる回す（各方向10回）',
          '最後に首を左右にゆっくり傾ける'
        ]
      },
      {
        id: 'st_5_memory_palace',
        title: '記憶の宮殿づくり',
        description: '今勉強した内容を頭の中の「お気に入りの場所」に保存する記憶術',
        category: '認知的' as const,
        duration: 5,
        steps: [
          'よく知っている場所（自分の部屋など）を思い浮かべる',
          '勉強した内容をその場所の特定の位置に「置く」',
          'その場所を歩き回りながら内容を復習する',
          '明日その場所を思い出して内容を確認する'
        ]
      }
    ],
    15: [
      {
        id: 'st_15_pomodoro_break',
        title: 'ポモドーロ完璧休憩',
        description: '25分勉強＋5分休憩の残り10分を使った、効率的な脳リフレッシュ',
        category: '行動的' as const,
        duration: 15,
        steps: [
          '軽く体を動かす（ジャンプや屈伸）',
          'お気に入りの音楽を1-2曲聴く',
          '好きな飲み物を用意してゆっくり飲む',
          '次の勉強セッションの目標を決める',
          '深呼吸を5回して集中モードに切り替える'
        ]
      },
      {
        id: 'st_15_future_visualization',
        title: '未来の成功した自分と対話',
        description: '将来の不安を和らげ、モチベーションを回復する想像力トレーニング',
        category: '認知的' as const,
        duration: 15,
        steps: [
          '目を閉じて5年後の理想の自分を詳しく想像する',
          'その自分が今の君に温かく微笑みかけているのを感じる',
          '未来の自分から「大丈夫、よく頑張ってるね」という声を聞く',
          '今抱えている悩みに対するアドバイスを受け取る',
          '感謝の気持ちで未来の自分とお別れして目を開ける'
        ]
      },
      {
        id: 'st_15_study_environment',
        title: '勉強空間リセット術',
        description: '環境を整えて心もスッキリ！集中できる空間作り',
        category: '行動的' as const,
        duration: 15,
        steps: [
          'デスクの上を完全にクリアにする',
          '必要な文具だけを綺麗に配置',
          '照明や椅子の高さを調整',
          'お気に入りのアイテムを1つ飾る',
          '「今日もよろしく！」と勉強空間に挨拶'
        ]
      }
    ],
    30: [
      {
        id: 'st_30_learning_reflection',
        title: '学習振り返りジャーナル',
        description: '今日学んだことを整理して、知識を定着させる30分間',
        category: '認知的' as const,
        duration: 30,
        steps: [
          'ノートを開いて今日学んだことを書き出す',
          '理解できた部分と難しかった部分を分ける',
          '友達に説明するつもりで要点をまとめる',
          '明日のための質問や調べたいことをリストアップ',
          '今日の頑張りを認めて明日への目標を立てる'
        ]
      },
      {
        id: 'st_30_creative_break',
        title: 'クリエイティブ・リチャージ',
        description: '右脳を刺激して創造性を高める、アート系リフレッシュタイム',
        category: '行動的' as const,
        duration: 30,
        steps: [
          '好きな画材（ペン、色鉛筆など）を用意',
          '今の気分を色や形で自由に表現',
          '音楽を聴きながら手を動かし続ける',
          '完成度は気にせず、プロセスを楽しむ',
          '作品に今日の日付とコメントを書く'
        ]
      },
      {
        id: 'st_30_power_walk',
        title: 'パワーウォーク＆思考整理',
        description: '歩きながら頭の中を整理し、新しいアイデアを生み出す散歩術',
        category: '行動的' as const,
        duration: 30,
        steps: [
          'お気に入りのプレイリストを準備',
          'ゆっくりペースで歩き始める',
          '最初の10分は何も考えずに歩く',
          '中間の10分で今日の勉強を振り返る',
          '最後の10分で明日のアイデアを考える'
        ]
      }
    ]
  },
  school: {
    5: [
      {
        id: 'sc_5_class_energy',
        title: '授業間エネルギーチャージ',
        description: '次の授業に向けて集中力とやる気をアップする5分間',
        category: '認知的' as const,
        duration: 5,
        steps: [
          '前の授業でよく頑張った自分を褒める',
          '3回深呼吸して心をリセット',
          '次の授業で学びたいことを1つ決める',
          '「楽しみ！」という気持ちを作る'
        ]
      },
      {
        id: 'sc_5_friend_connection',
        title: 'プチ友達タイム 👫',
        description: '友達との短い会話で心をほっこりさせる、人間関係リフレッシュ',
        category: '行動的' as const,
        duration: 5,
        steps: [
          '近くにいる友達に軽く声をかける',
          '今日の面白かったことを1つ話す',
          '相手の話も興味を持って聞く',
          '笑顔で「また後で！」と言って別れる'
        ]
      },
      {
        id: 'sc_5_desk_meditation',
        title: '机でミニ瞑想',
        description: '教室の席で周りを気にせずできる、こっそりリラックス法',
        category: '認知的' as const,
        duration: 5,
        steps: [
          '背筋を伸ばして椅子に座る',
          '手をひざの上に置いて目を閉じる',
          '呼吸だけに意識を向ける',
          '雑念が浮かんでも呼吸に戻る',
          'ゆっくり目を開けて軽く微笑む'
        ]
      }
    ],
    15: [
      {
        id: 'sc_15_library_zen',
        title: '図書館禅タイム',
        description: '静かな図書館で心を落ち着ける、読書＆瞑想コンボ',
        category: '認知的' as const,
        duration: 15,
        steps: [
          '好きなジャンルの本を1冊選ぶ',
          '静かな席を見つけて座る',
          '最初の5分は本をパラパラめくる',
          '気になったページをじっくり読む',
          '本の内容について少し考える時間を取る'
        ]
      },
      {
        id: 'sc_15_campus_explore',
        title: 'キャンパス探検',
        description: '学校の知らない場所を探索して、新しい発見を楽しむ',
        category: '行動的' as const,
        duration: 15,
        steps: [
          '普段行かない校舎や階を選ぶ',
          'ゆっくり歩きながら周りを観察',
          '新しく見つけたものを3つメモ',
          '素敵な景色があったら写真を撮る',
          'お気に入りの場所を1つ決める'
        ]
      },
      {
        id: 'sc_15_creative_note',
        title: 'アートノート作成',
        description: '授業ノートをアート作品に変身させる創造的な時間',
        category: '行動的' as const,
        duration: 15,
        steps: [
          'カラーペンや付箋を用意',
          '今日のノートを開く',
          '重要なポイントをイラストで装飾',
          'マインドマップで関連性を描く',
          '自分だけの記号やアイコンを作る'
        ]
      }
    ],
    30: [
      {
        id: 'sc_30_study_group',
        title: 'プチ勉強会企画',
        description: '友達と一緒に学び合う、協力学習セッション',
        category: '行動的' as const,
        duration: 30,
        steps: [
          '2-3人の友達に声をかける',
          '今日習った内容を互いに説明し合う',
          '分からないところを一緒に考える',
          'お互いの得意分野を教え合う',
          '次回の予定を決めて解散'
        ]
      },
      {
        id: 'sc_30_goal_planning',
        title: '目標設定＆計画会議',
        description: '将来の夢に向けて具体的な計画を立てる、自分会議の時間',
        category: '認知的' as const,
        duration: 30,
        steps: [
          '今の自分の状況を客観的に把握',
          '1年後の理想の自分を具体的に描く',
          'そのために必要なステップを書き出す',
          '今週できることを3つ決める',
          '計画を見返せるようにファイルしておく'
        ]
      },
      {
        id: 'sc_30_presentation_prep',
        title: 'プレゼン準備＆練習',
        description: '発表スキルを磨く練習時間で、自信をつける',
        category: '行動的' as const,
        duration: 30,
        steps: [
          '発表したいトピックを1つ選ぶ',
          '5分間のミニプレゼンを構成',
          '鏡の前で実際に話してみる',
          '身振り手振りも含めて練習',
          '友達や先生にフィードバックをもらう'
        ]
      }
    ]
  },
  commuting: {
    5: [
      {
        id: 'cm_5_train_meditation',
        title: '電車でマインドフルネス 🚃',
        description: '通学電車の中でできる、短時間集中リラックス法',
        category: '認知的' as const,
        duration: 5,
        steps: [
          '座席に座るか、安全な場所に立つ',
          '電車の揺れを感じながら深呼吸',
          '窓の外の景色をぼんやり眺める',
          '今この瞬間の感覚に意識を向ける'
        ]
      },
      {
        id: 'cm_5_podcast_learning',
        title: 'ポッドキャスト学習タイム',
        description: '移動時間を有効活用！好奇心を刺激する音声学習',
        category: '認知的' as const,
        duration: 5,
        steps: [
          'イヤホンを装着して音量を調整',
          '興味のあるトピックのポッドキャストを選択',
          '集中して聞きながらメモを取る',
          '気になった点を後で調べるリストに追加'
        ]
      },
      {
        id: 'cm_5_gratitude_count',
        title: '感謝カウンティング',
        description: '今日あった良いことを数えて、ポジティブな気持ちで一日を終える',
        category: '認知的' as const,
        duration: 5,
        steps: [
          '今日起きた良いことを思い出す',
          '感謝したい人や出来事を3つ数える',
          '心の中で「ありがとう」と言う',
          '明日も素敵な一日になることを想像'
        ]
      }
    ],
    15: [
      {
        id: 'cm_15_mobile_study',
        title: 'スマホ学習セッション',
        description: '通学時間を勉強タイムに変える、効率的モバイル学習',
        category: '認知的' as const,
        duration: 15,
        steps: [
          '学習アプリや電子書籍アプリを開く',
          '短時間で区切れる内容を選ぶ',
          '集中できる音楽や環境音を流す',
          '理解した内容をメモアプリに記録',
          '学習した時間と内容を記録'
        ]
      },
      {
        id: 'cm_15_people_watching',
        title: 'ピープルウォッチング観察術',
        description: '周りの人を観察して人間心理を学ぶ、社会勉強タイム',
        category: '認知的' as const,
        duration: 15,
        steps: [
          '電車内の人々を失礼にならない程度に観察',
          '服装や持ち物から職業を想像',
          '表情や仕草から感情を読み取る',
          '観察したことをスマホにメモ',
          '人間関係や心理学について考える'
        ]
      },
      {
        id: 'cm_15_music_journey',
        title: 'ミュージック・ジャーニー 🎵',
        description: '音楽と一緒に心の旅をする、感情デトックス時間',
        category: '行動的' as const,
        duration: 15,
        steps: [
          'その日の気分に合うプレイリストを選択',
          '目を閉じて音楽に完全に集中',
          '曲に合わせて心の中で踊る',
          '音楽が作り出すストーリーを想像',
          'お気に入りの曲を新しく1つ見つける'
        ]
      }
    ],
    30: [
      {
        id: 'cm_30_language_practice',
        title: '語学力アップチャレンジ',
        description: '通学時間で国際的なスキルを身につける、語学学習セッション',
        category: '認知的' as const,
        duration: 30,
        steps: [
          '語学学習アプリを開いて今日の目標を設定',
          '新しい単語やフレーズを10個覚える',
          '音声を聞いて発音練習（小声で）',
          '習った表現を使って短い文を作る',
          '今日の学習内容をノートにまとめる'
        ]
      },
      {
        id: 'cm_30_creative_writing',
        title: 'モバイル創作タイム',
        description: '移動中にインスピレーションを文章に変える、創作活動',
        category: '行動的' as const,
        duration: 30,
        steps: [
          'スマホのメモアプリやノートアプリを開く',
          '車窓の景色からインスピレーションを得る',
          '短い物語や詩を書き始める',
          '登場人物や設定を詳しく描写',
          '完成した作品に日付を入れて保存'
        ]
      },
      {
        id: 'cm_30_future_planning',
        title: '将来設計タイム',
        description: '人生の目標を具体化する、キャリアプランニングセッション',
        category: '認知的' as const,
        duration: 30,
        steps: [
          '5年後、10年後の理想の自分を詳しく想像',
          'そのために必要なスキルや知識をリストアップ',
          '今年中に達成したい目標を3つ設定',
          '目標達成のための具体的なステップを計画',
          '計画をスマホの予定表に組み込む'
        ]
      }
    ]
  }
};