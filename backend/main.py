from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from lib.recipe import generate_recipe_from_text
from lib.recipe import generate_recipe_from_image
import os

app = FastAPI()
#CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.get("/recipe-test")
# def get_test_recipe():
#     # 食材は一旦固定！
#     fixed_ingredients = "トマト、卵、玉ねぎ"
#     recipe = generate_recipe_from_text(fixed_ingredients)
#     return {"status": "success", "recipe": recipe}

@app.get("/recipe-vision-test")
def get_vision_recipe():
    image_path = "test_ingredients.jpg"

    if not os.path.exists(image_path):
        return {"error": "画像が見つかりません。"}
    
    with open(image_path, "rb") as f:
        image_bytes = f.read()
    
    recipe = generate_recipe_from_image(image_bytes)
    return {"recipe": recipe}