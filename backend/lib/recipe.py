# backend/lib/recipe.py
import json
import vertexai
from vertexai.generative_models import GenerativeModel, Part, Image

# プロジェクトID
PROJECT_ID = "recipe-site-491307"
LOCATION = "us-central1"

vertexai.init(project=PROJECT_ID, location=LOCATION)

JSON_FORMAT_RULE = """
# 出力形式のルール:
- 必ずJSON形式のみで返してください。マークダウンやコードブロックは不要です。
- 以下のJSON構造に厳密に従ってください:
{
  "dish_name": "料理名",
  "description": "料理の簡単な説明（1〜2文）",
  "cooking_time": "調理時間（例: 20分）",
  "servings": "何人分（例: 2人分）",
  "ingredients": [
    {"name": "食材名", "amount": "量"},
    ...
  ],
  "steps": [
    "手順1",
    "手順2",
    ...
  ]
}
- 出力はすべて日本語で行ってください。
- JSONのみ出力し、前置きや説明は一切不要です。
"""

def _parse_json_response(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())

def generate_recipe_from_text(ingredients: str):
    model = GenerativeModel("gemini-3.1-flash-lite-preview")

    prompt = f"""
        以下の食材を使って、美味しい料理のレシピを1つ提案してください。

        # 食材:
        {ingredients}

        {JSON_FORMAT_RULE}
    """

    response = model.generate_content(prompt)
    print(response.text)
    return _parse_json_response(response.text)

def generate_recipe_from_image(image_bytes: bytes, mime_type: str = "image/jpeg"):
    model = GenerativeModel("gemini-2.5-flash")

    # 画像データの作成
    image_part = Part.from_data(data=image_bytes, mime_type=mime_type)

    prompt = f"""
        以下の画像に写っている食材を使って、美味しい料理のレシピを1つ提案してください。

        {JSON_FORMAT_RULE}
    """

    response = model.generate_content(
        contents=[image_part, prompt]
    )
    print(response.text)
    return _parse_json_response(response.text)