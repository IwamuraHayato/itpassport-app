#!/usr/bin/env python3
"""
PDF問題抽出スクリプト (Python版)
pdf-parseの代わりにPyPDF2を使用
"""

import json
import re
from pathlib import Path
import PyPDF2

def extract_answers(pdf_path):
    """正解PDFから正解を抽出"""
    answer_map = {}

    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        full_text = ""
        for page in pdf_reader.pages:
            full_text += page.extract_text()

    # 正解パターン: 問1→ア
    answer_pattern = r'問(\d+)→([ア-エ])'
    matches = re.findall(answer_pattern, full_text)

    # 日本語の選択肢を英語に変換
    mapping = {'ア': 'A', 'イ': 'B', 'ウ': 'C', 'エ': 'D'}

    for match in matches:
        question_no = int(match[0])
        answer = mapping.get(match[1], 'A')
        answer_map[question_no] = answer

    print(f"✅ 正解データを {len(answer_map)} 問抽出しました")
    return answer_map


def get_category(question_no):
    """問題番号からカテゴリーを判定"""
    if 1 <= question_no <= 34:
        return 'STRATEGY'
    elif 35 <= question_no <= 54:
        return 'MANAGEMENT'
    else:
        return 'TECHNOLOGY'


def extract_questions(questions_pdf_path, answers_pdf_path):
    """問題PDFから問題データを抽出"""
    # 正解データを先に取得
    answer_map = extract_answers(answers_pdf_path)

    # 問題PDFを読み込み
    with open(questions_pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        full_text = ""
        for page in pdf_reader.pages:
            full_text += page.extract_text()

    questions = []

    # 問題を番号で分割
    for i in range(1, 101):
        next_num = i + 1
        # 問iから問i+1の直前まで、または最後まで
        if next_num <= 100:
            pattern = rf'問{i}\s+(.*?)(?=問{next_num})'
        else:
            pattern = rf'問{i}\s+(.*?)$'

        match = re.search(pattern, full_text, re.DOTALL)
        if not match:
            print(f"⚠️ 問{i} が見つかりませんでした")
            continue

        question_block = match.group(1)

        # 問題文を抽出（選択肢の前まで）
        question_text_match = re.search(r'^(.*?)(?=ア\s)', question_block, re.DOTALL)
        question_text = question_text_match.group(1).strip() if question_text_match else ""

        # 選択肢を抽出
        choice_a_match = re.search(r'ア\s+(.*?)(?=イ|$)', question_block, re.DOTALL)
        choice_b_match = re.search(r'イ\s+(.*?)(?=ウ|$)', question_block, re.DOTALL)
        choice_c_match = re.search(r'ウ\s+(.*?)(?=エ|$)', question_block, re.DOTALL)
        choice_d_match = re.search(r'エ\s+(.*?)$', question_block, re.DOTALL)

        choice_a = choice_a_match.group(1).strip().split('\n')[0].strip() if choice_a_match else ""
        choice_b = choice_b_match.group(1).strip().split('\n')[0].strip() if choice_b_match else ""
        choice_c = choice_c_match.group(1).strip().split('\n')[0].strip() if choice_c_match else ""
        choice_d = choice_d_match.group(1).strip().split('\n')[0].strip() if choice_d_match else ""

        # 正解を取得
        correct_answer = answer_map.get(i, 'A')

        questions.append({
            "questionNo": i,
            "category": get_category(i),
            "questionText": question_text,
            "choiceA": choice_a,
            "choiceB": choice_b,
            "choiceC": choice_c,
            "choiceD": choice_d,
            "correctAnswer": correct_answer
        })

    print(f"✅ {len(questions)} 問の問題を抽出しました")

    # カテゴリー別の統計
    strategy_count = sum(1 for q in questions if q['category'] == 'STRATEGY')
    management_count = sum(1 for q in questions if q['category'] == 'MANAGEMENT')
    technology_count = sum(1 for q in questions if q['category'] == 'TECHNOLOGY')

    print(f"📊 ストラテジ系: {strategy_count}問")
    print(f"📊 マネジメント系: {management_count}問")
    print(f"📊 テクノロジ系: {technology_count}問")

    return questions


def main():
    # パス設定
    script_dir = Path(__file__).parent
    parent_dir = script_dir.parent.parent
    questions_pdf_path = parent_dir / '2026r08_ip_qs.pdf'
    answers_pdf_path = parent_dir / '2026r08_ip_ans.pdf'
    output_path = script_dir.parent / 'data' / 'questions.json'

    print('🚀 PDF抽出を開始します...\n')

    # PDFファイルの存在確認
    if not questions_pdf_path.exists():
        print(f"❌ 問題PDFが見つかりません: {questions_pdf_path}")
        return

    if not answers_pdf_path.exists():
        print(f"❌ 解答PDFが見つかりません: {answers_pdf_path}")
        return

    try:
        # 問題を抽出
        questions = extract_questions(questions_pdf_path, answers_pdf_path)

        # data ディレクトリが存在しない場合は作成
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # JSONファイルに保存
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)

        print(f"\n✅ データを保存しました: {output_path}")

        # サンプル表示
        print('\n📝 抽出サンプル（問1）:')
        print(json.dumps(questions[0], ensure_ascii=False, indent=2))

    except Exception as error:
        print(f'❌ エラーが発生しました: {error}')
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
