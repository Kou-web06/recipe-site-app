# backend/lib/recipe.py
import vertexai
from vertexai.generative_models import GenerativeModel, Part, Image

# プロジェクトID
PROJECT_ID = "recipe-site-491307" 
LOCATION = "us-central1"

vertexai.init(project=PROJECT_ID, location=LOCATION)

def generate_recipe_from_text(ingredients: str):
    # Gemini 2.5 Flash を使用（高速で安い！）
    model = GenerativeModel("gemini-2.5-flash")
    
    prompt = f"""
        以下の食材を使って、美味しい料理のレシピを1つ提案してください。

        # 食材:
        {ingredients}

        # 出力形式のルール:
        1. 挨拶や「承知いたしました」などの前置きは一切不要です。
        2. 構成は以下の順序で、各セクションを明確に分けてください。
        【料理名】（1行）
        【材料】（箇条書き、適宜改行）
        【手順】（番号付きリスト、ステップごとに改行）
        3. ブラウザで表示した際に見やすいよう、適宜空行を入れてください。
        4. 出力はすべて日本語で行ってください。
    """
    
    response = model.generate_content(prompt)
    print(response.text)
    return response.text

def generate_recipe_from_image(image_bytes: bytes, mime_type: str = "image/jpeg"):
    model = GenerativeModel("gemini-2.5-flash")

    # 画像データの作成
    image_part = Part.from_data(data=image_bytes, mime_type=mime_type)
    
    prompt = f"""
        以下の画像に写っている食材を使って、美味しい料理のレシピを1つ提案してください。

        # 出力形式のルール:
        1. 挨拶や「承知いたしました」などの前置きは一切不要です。
        2. 構成は以下の順序で、各セクションを明確に分けてください。
        【料理名】（1行）
        【材料】（箇条書き、適宜改行）
        【手順】（番号付きリスト、ステップごとに改行）
        3. ブラウザで表示した際に見やすいよう、適宜空行を入れてください。
        4. 出力はすべて日本語で行ってください。
    """
    
    response = model.generate_content(
        contents=[image_part, prompt]
    )
    print(response.text)
    return response.text