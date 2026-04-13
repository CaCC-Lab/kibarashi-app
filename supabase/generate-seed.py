#!/usr/bin/env python3
"""
JSON提案データからSupabase用のシードSQLを生成する。
5つのJSONファイルから全提案を読み込み、suggestions_master にINSERTするSQLを出力する。
"""
import json
import os
from pathlib import Path

ROOT = Path(__file__).parent.parent

DATA_FILES = [
    ("backend/src/data/suggestions.json", "manual", []),
    ("backend/src/data/jobHuntingSuggestions.json", "manual", []),
    ("packages/core-logic/src/data/enhancedSuggestions.json", "manual", []),
    ("packages/core-logic/src/data/quickStressRelief.json", "manual", []),
    ("packages/core-logic/src/data/culturalStressSolutions.json", "manual", []),
]

CATEGORY_MAP = {
    "cognitive": "認知的",
    "behavioral": "行動的",
    "認知的": "認知的",
    "行動的": "行動的",
}


def escape_sql(s: str) -> str:
    return s.replace("'", "''") if s else ""


def to_pg_array(items: list) -> str:
    if not items:
        return "'{}'::text[]"
    escaped = ", ".join(f"'{escape_sql(str(i))}'" for i in items)
    return f"ARRAY[{escaped}]::text[]"


def extract_steps(guide: dict, durations: list) -> list:
    """guide の中から最初の duration のテキストを分割してステップにする"""
    if not guide:
        return []
    for d in durations:
        text = guide.get(str(d), "")
        if text:
            # 句点で分割してステップ化
            steps = [s.strip() for s in text.replace("。", "。\n").split("\n") if s.strip()]
            return steps[:5]  # 最大5ステップ
    return []


def extract_guide_text(guide: dict, durations: list) -> str:
    """音声ガイド用テキストを取得（最も長い duration のものを使用）"""
    if not guide:
        return ""
    for d in sorted(durations, reverse=True):
        text = guide.get(str(d), "")
        if text:
            return text
    return ""


def process_file(filepath: str, source: str, extra_age_groups: list) -> list:
    full_path = ROOT / filepath
    if not full_path.exists():
        print(f"  SKIP: {filepath} (not found)")
        return []

    with open(full_path, encoding="utf-8") as f:
        data = json.load(f)

    suggestions = data.get("suggestions", [])
    results = []

    for s in suggestions:
        category = CATEGORY_MAP.get(s.get("category", ""), "行動的")
        situations = s.get("situations", [])
        durations = s.get("durations", [])
        age_groups = s.get("ageGroups", extra_age_groups) or ["office_worker"]
        tags = s.get("tags", [])
        steps = extract_steps(s.get("guide", {}), durations)
        guide = extract_guide_text(s.get("guide", {}), durations)

        # 各 duration ごとに1レコード作成
        for dur in durations:
            dur_steps = extract_steps(s.get("guide", {}), [dur])
            dur_guide = s.get("guide", {}).get(str(dur), guide)

            results.append({
                "title": s["title"],
                "description": s.get("description", ""),
                "duration": dur,
                "category": category,
                "situation": situations,
                "age_groups": age_groups,
                "tags": tags,
                "steps": dur_steps or steps,
                "guide": dur_guide,
                "source": source,
            })

    return results


def main():
    all_rows = []
    for filepath, source, extra_ages in DATA_FILES:
        rows = process_file(filepath, source, extra_ages)
        print(f"  {filepath}: {len(rows)} rows")
        all_rows.extend(rows)

    # 重複排除（title + duration で判定）
    seen = set()
    unique_rows = []
    for row in all_rows:
        key = (row["title"], row["duration"])
        if key not in seen:
            seen.add(key)
            unique_rows.append(row)

    print(f"\nTotal: {len(all_rows)} rows, unique: {len(unique_rows)} rows")

    # SQL 生成
    output_path = ROOT / "supabase" / "seed.sql"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("-- 自動生成: generate-seed.py\n")
        f.write("-- 提案マスタのシードデータ\n")
        f.write(f"-- {len(unique_rows)} 件\n\n")
        f.write("DELETE FROM suggestions_master;\n\n")

        for row in unique_rows:
            title = escape_sql(row["title"])
            desc = escape_sql(row["description"])
            guide = escape_sql(row["guide"]) if row["guide"] else ""
            situations = to_pg_array(row["situation"])
            age_groups = to_pg_array(row["age_groups"])
            tags = to_pg_array(row["tags"])
            steps = to_pg_array(row["steps"])
            guide_val = f"'{guide}'" if guide else "NULL"

            f.write(f"INSERT INTO suggestions_master (title, description, duration, category, situation, age_groups, tags, steps, guide, source, is_public, quality_score) VALUES (\n")
            f.write(f"  '{title}',\n")
            f.write(f"  '{desc}',\n")
            f.write(f"  {row['duration']},\n")
            f.write(f"  '{row['category']}',\n")
            f.write(f"  {situations},\n")
            f.write(f"  {age_groups},\n")
            f.write(f"  {tags},\n")
            f.write(f"  {steps},\n")
            f.write(f"  {guide_val},\n")
            f.write(f"  '{row['source']}',\n")
            f.write(f"  true,\n")
            f.write(f"  3.0\n")
            f.write(f");\n\n")

    print(f"Generated: {output_path}")


if __name__ == "__main__":
    main()
