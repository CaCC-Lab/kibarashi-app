# TypeScript any型修正の相談

## 現状
フロントエンドプロジェクトで141個のany型エラーを修正する必要があります。

### 主な使用箇所
1. **Chart.jsのtooltipコールバック関数**
   ```typescript
   label: (context: any) => `${context.parsed.y}回`
   ```

2. **テストファイルのモック**
   ```typescript
   let consoleSpy: any;
   ```

3. **A/Bテストの汎用データ型**
   ```typescript
   trackMetric: (metric: string, data?: any) => void
   ```

4. **エラーハンドリング**
   ```typescript
   } catch (error: any) {
   ```

5. **Web Vitalsのメトリクス型**
   ```typescript
   onPerfEntry?: (metric: any) => void
   ```

## 質問
1. Chart.jsのtooltipコンテキスト型はどのように定義すべきでしょうか？
2. A/BテストのtrackMetricで使う汎用データ型は、どのようなアプローチが良いでしょうか？
3. 大量のany型を効率的に修正する戦略はありますか？

## 検討中のアプローチ
- ジェネリック型の活用
- unknown型への一時的な置き換え
- 段階的な型定義の導入