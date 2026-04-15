#!/usr/bin/env python3
"""
Google Gemini API 相談スクリプト
学生向けプロンプト最適化と年齢層別コンテンツ戦略の検証
"""

import os
import json
import time
from typing import Dict, List, Any
import google.generativeai as genai

# Gemini API設定
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("警告: GEMINI_API_KEY環境変数が設定されていません")
    GEMINI_API_KEY = input("Gemini API キーを入力してください: ")

genai.configure(api_key=GEMINI_API_KEY)

class GeminiConsultationTool:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.results = {}
        
    def test_student_prompt(self) -> Dict[str, Any]:
        """学生向けプロンプトの検証テスト"""
        print("\n=== 学生向けプロンプト最適化の検証 ===")
        
        # 現行プロンプト（職場向け）
        current_prompt = """
        あなたは職場のストレス解消をサポートするAIアシスタントです。
        
        【状況】: 職場で
        【利用可能時間】: 5分
        
        以下の方針で3つの気晴らし方法を提案してください：
        - 実践的で短時間で実行可能
        - 職場環境に適している
        - 科学的根拠がある
        """
        
        # 学生向け最適化プロンプト
        student_prompt = """
        あなたは高校生・大学生（16-22歳）の気持ちに寄り添うAIカウンセラーです。
        勉強、友人関係、将来への不安など、学生特有のストレスを理解し、
        親しみやすく実践的なアドバイスを提供してください。

        【状況】: 勉強中・勉強の合間
        【利用可能時間】: 5分
        【特別な配慮】: 集中力低下、レポート締切のプレッシャー

        以下の方針で3つの気晴らし方法を提案してください：
        - 親しみやすく、でも軽薄すぎない言葉遣い
        - 絵文字を適度に使用
        - 科学的根拠を1-2行で簡潔に説明
        - 図書館、電車内、自室で実践可能
        - 将来不安、学業プレッシャー、人間関係の悩みに配慮
        
        以下のJSON形式で回答してください：
        {
          "suggestions": [
            {
              "title": "提案タイトル",
              "description": "詳細説明",
              "steps": ["ステップ1", "ステップ2", "ステップ3"],
              "category": "認知的 or 行動的",
              "benefit": "効果・メリット（学生向け説明）",
              "scientificBasis": "科学的根拠の簡潔な説明"
            }
          ]
        }
        """
        
        # 現行版と学生版の比較テスト
        results = {}
        
        try:
            # 現行版テスト
            print("現行プロンプト（職場向け）をテスト中...")
            current_response = self.model.generate_content(current_prompt)
            results['current'] = {
                'prompt': current_prompt,
                'response': current_response.text
            }
            
            time.sleep(2)  # API制限対策
            
            # 学生版テスト
            print("学生向け最適化プロンプトをテスト中...")
            student_response = self.model.generate_content(student_prompt)
            results['student'] = {
                'prompt': student_prompt,
                'response': student_response.text
            }
            
            # 比較分析
            analysis_prompt = f"""
            以下の2つのAI応答を比較分析してください：
            
            【現行版（職場向け）】:
            {current_response.text}
            
            【学生向け最適化版】:
            {student_response.text}
            
            以下の観点で分析してください：
            1. 差別化の十分性（職場向けとの違いの明確さ）
            2. 学生らしい親しみやすさの表現度
            3. 科学的根拠の説明の適切性
            4. 実践性と安全性のバランス
            5. 全体的な改善点と推奨事項
            
            JSON形式で結果を返してください：
            {
              "differentiation_score": 1-10,
              "friendliness_score": 1-10, 
              "scientific_explanation_score": 1-10,
              "practicality_safety_balance": 1-10,
              "overall_improvement": "具体的な改善提案",
              "recommendations": ["推奨事項1", "推奨事項2", "推奨事項3"]
            }
            """
            
            time.sleep(2)
            analysis_response = self.model.generate_content(analysis_prompt)
            results['analysis'] = analysis_response.text
            
            print("✅ 学生向けプロンプト検証完了")
            
        except Exception as e:
            print(f"❌ エラー: {e}")
            results['error'] = str(e)
            
        return results
    
    def optimize_age_group_prompts(self) -> Dict[str, Any]:
        """年齢層別プロンプト最適化戦略の相談"""
        print("\n=== 年齢層別コンテンツ品質向上戦略 ===")
        
        optimization_prompt = """
        気晴らしレシピアプリの年齢層別展開について相談です。
        現在は20-40代の職場向けMVPから、以下の年齢層への最適化を検討しています：
        
        1. 中学生（13-15歳）：より慎重な表現、安全性重視
        2. 主婦（25-45歳）：育児制約、共感的アプローチ  
        3. 高齢者（65歳以上）：丁寧な敬語、馴染みのある表現
        
        各年齢層について、以下を提案してください：
        - 最適なプロンプト調整方法
        - 言葉遣いや表現のガイドライン
        - 特別に配慮すべき心理的・環境的制約
        - 効果的な科学的根拠の説明方法
        - 推奨する気晴らし活動の方向性
        
        JSON形式で詳細な戦略を返してください：
        {
          "age_groups": {
            "middle_school": {
              "prompt_adjustments": "調整方法",
              "language_guidelines": "言葉遣いガイドライン",
              "constraints": ["制約1", "制約2"],
              "scientific_explanation_style": "科学的説明スタイル",
              "recommended_activities": ["活動1", "活動2", "活動3"],
              "sample_prompt": "サンプルプロンプト"
            },
            "housewives": { ... },
            "elderly": { ... }
          }
        }
        """
        
        try:
            response = self.model.generate_content(optimization_prompt)
            print("✅ 年齢層別最適化戦略の生成完了")
            return {'optimization_strategy': response.text}
        except Exception as e:
            print(f"❌ エラー: {e}")
            return {'error': str(e)}
    
    def design_safety_check_system(self) -> Dict[str, Any]:
        """安全性チェック機能の実装方法の相談"""
        print("\n=== 安全性チェック機能の実装方法 ===")
        
        safety_prompt = """
        年齢層別気晴らしアプリで実装すべき安全性チェック機能について相談です。
        Gemini APIを使用して以下を実現する方法を提案してください：
        
        1. 年齢不適切コンテンツの自動検出
        2. 危機介入が必要な内容の判定
        3. ポジティブな代替提案の生成
        
        具体的に以下を含む実装案を提案してください：
        - 安全性チェックのプロンプト設計
        - 判定基準とスコアリング方法
        - フィルタリングロジック
        - 代替提案生成のアルゴリズム
        - エラーハンドリングとフォールバック
        - Node.js + Expressでの実装例
        
        JSON形式で詳細な実装案を返してください：
        {
          "safety_check_system": {
            "content_filter": {
              "prompt_design": "安全性チェック用プロンプト",
              "scoring_criteria": "判定基準",
              "implementation_code": "実装コード例"
            },
            "crisis_intervention": {
              "detection_prompt": "危機検出プロンプト",
              "response_strategy": "対応戦略"
            },
            "alternative_generation": {
              "generation_logic": "代替案生成ロジック",
              "fallback_system": "フォールバック仕組み"
            }
          }
        }
        """
        
        try:
            response = self.model.generate_content(safety_prompt)
            print("✅ 安全性チェックシステム設計完了")
            return {'safety_system': response.text}
        except Exception as e:
            print(f"❌ エラー: {e}")
            return {'error': str(e)}
    
    def analyze_cost_optimization(self) -> Dict[str, Any]:
        """API利用コスト最適化戦略の分析"""
        print("\n=== API利用コスト最適化戦略 ===")
        
        cost_prompt = """
        Gemini APIを使用した気晴らしアプリのコスト最適化について相談です。
        現在の想定：
        - DAU: 1,000人（成長目標）
        - 1日平均提案生成: 5回/ユーザー
        - 月間API呼び出し: 150,000回
        
        以下について具体的な戦略を提案してください：
        
        1. プロンプトの長さと品質のバランス最適化
        2. キャッシュ戦略（類似リクエストの効率化）
        3. バッチ処理による処理効率化
        4. フォールバックデータとAI生成のハイブリッド戦略
        5. 月額予算とAPI使用量の目安
        
        JSON形式で詳細な最適化プランを返してください：
        {
          "cost_optimization": {
            "prompt_optimization": {
              "current_token_estimate": 数値,
              "optimized_token_target": 数値,
              "quality_vs_cost_balance": "バランス戦略"
            },
            "caching_strategy": {
              "cache_key_design": "キャッシュキー設計",
              "cache_duration": "キャッシュ期間",
              "hit_rate_target": "目標ヒット率"
            },
            "hybrid_strategy": {
              "ai_vs_fallback_ratio": "AI対フォールバック比率",
              "trigger_conditions": "AI使用トリガー条件"
            },
            "budget_estimate": {
              "monthly_cost_estimate": "月額コスト見積もり",
              "cost_per_user": "ユーザー単価",
              "scaling_projections": "スケーリング予測"
            }
          }
        }
        """
        
        try:
            response = self.model.generate_content(cost_prompt)
            print("✅ コスト最適化戦略の分析完了")
            return {'cost_optimization': response.text}
        except Exception as e:
            print(f"❌ エラー: {e}")
            return {'error': str(e)}
    
    def create_implementation_roadmap(self) -> Dict[str, Any]:
        """技術実装ロードマップの作成"""
        print("\n=== 技術実装ロードマップ（3週間計画） ===")
        
        roadmap_prompt = """
        年齢層別気晴らしアプリの技術実装について、3週間の詳細なロードマップを作成してください。
        
        現在の技術基盤：
        - フロントエンド: React 18 + TypeScript + Tailwind CSS
        - バックエンド: Node.js + Express + Vercel Functions
        - AI: Gemini API統合済み
        - デプロイ: Vercel (設定済み)
        
        実装必要項目：
        1. 年齢層選択機能
        2. 年齢別プロンプト最適化
        3. 安全性チェックシステム
        4. A/Bテスト機能
        5. 統計・分析機能
        
        以下を含む詳細計画を作成してください：
        - 週次タスク分解（Week 1-3）
        - 日次作業項目
        - 技術的実装詳細
        - テスト戦略
        - リスク評価と対策
        - 成功指標とKPI
        
        JSON形式で構造化されたロードマップを返してください：
        {
          "implementation_roadmap": {
            "overview": "プロジェクト概要",
            "week_1": {
              "theme": "週のテーマ",
              "daily_tasks": {
                "day_1": ["タスク1", "タスク2"],
                "day_2": ["タスク1", "タスク2"],
                ...
              },
              "deliverables": ["成果物1", "成果物2"],
              "risks": ["リスク1", "リスク2"]
            },
            "week_2": { ... },
            "week_3": { ... },
            "success_metrics": {
              "technical_kpis": ["KPI1", "KPI2"],
              "user_experience_kpis": ["KPI1", "KPI2"]
            }
          }
        }
        """
        
        try:
            response = self.model.generate_content(roadmap_prompt)
            print("✅ 技術実装ロードマップの作成完了")
            return {'implementation_roadmap': response.text}
        except Exception as e:
            print(f"❌ エラー: {e}")
            return {'error': str(e)}
    
    def run_full_consultation(self):
        """全体相談の実行"""
        print("🚀 Google Gemini API との学生向けプロンプト最適化・年齢層別戦略相談を開始します")
        
        # 各検証・分析の実行
        self.results['student_prompt_test'] = self.test_student_prompt()
        time.sleep(3)  # API制限対策
        
        self.results['age_group_optimization'] = self.optimize_age_group_prompts()
        time.sleep(3)
        
        self.results['safety_check_design'] = self.design_safety_check_system()
        time.sleep(3)
        
        self.results['cost_optimization'] = self.analyze_cost_optimization()
        time.sleep(3)
        
        self.results['implementation_roadmap'] = self.create_implementation_roadmap()
        
        # 結果の保存
        with open('/home/ryu/projects/kibarashi-app/gemini_consultation_results.json', 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        print("\n✅ 全体相談完了！結果をgemini_consultation_results.jsonに保存しました")
        
        # 簡潔なサマリーの表示
        self.display_summary()
    
    def display_summary(self):
        """結果サマリーの表示"""
        print("\n" + "="*60)
        print("📊 Google Gemini API 相談結果サマリー")
        print("="*60)
        
        for key, result in self.results.items():
            print(f"\n🔍 {key.replace('_', ' ').title()}:")
            if 'error' in result:
                print(f"   ❌ エラー: {result['error']}")
            else:
                print(f"   ✅ 正常に完了 ({len(str(result))} 文字の詳細回答)")
        
        print(f"\n📝 詳細な結果は gemini_consultation_results.json を参照してください")

if __name__ == "__main__":
    try:
        consultation = GeminiConsultationTool()
        consultation.run_full_consultation()
    except KeyboardInterrupt:
        print("\n\n⚠️ ユーザーによって中断されました")
    except Exception as e:
        print(f"\n\n❌ 予期しないエラーが発生しました: {e}")