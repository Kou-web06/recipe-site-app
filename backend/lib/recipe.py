# backend/lib/recipe.py
import vertexai
from vertexai.generative_models import GenerativeModel

# プロジェクトID
PROJECT_ID = "recipe-site-491307" 
LOCATION = "us-central1"

vertexai.init(project=PROJECT_ID, location=LOCATION)

def generate_recipe_from_text(ingredients: str):
    # Gemini 1.5 Flash を使用（高速で安い！）
    model = GenerativeModel("gemini-1.5-flash-001")
    
    prompt = f"以下の食材を使って、美味しい料理のレシピを1つ提案してください。出力は日本語でお願いします。\n食材: {ingredients}"
    
    response = model.generate_content(prompt)
    return response.text