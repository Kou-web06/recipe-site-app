import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  KitchenUtensilsIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import type { Recipe } from "../../../types/recipe";

type RecipeResultProps = {
  recipe: Recipe;
};

export default function RecipeResult({ recipe }: RecipeResultProps) {
  return (
    <div className="recipe-result">
      <div className="recipe-result-header">
        <div className="recipe-title-bar">
          <div className="recipe-category-tag">AI 提案レシピ</div>
          <h2 className="recipe-name">{recipe.dish_name}</h2>
          {recipe.description && <p className="recipe-desc">{recipe.description}</p>}
        </div>
        {(recipe.cooking_time || recipe.servings) && (
          <div className="recipe-meta">
            {recipe.cooking_time && (
              <div className="recipe-meta-item">
                <span className="recipe-meta-icon">
                  <HugeiconsIcon icon={Clock01Icon} size={20} color="currentColor" strokeWidth={2} />
                </span>
                <span className="recipe-meta-value">{recipe.cooking_time}</span>
                <span className="recipe-meta-label">調理時間</span>
              </div>
            )}
            {recipe.servings && (
              <div className="recipe-meta-item">
                <span className="recipe-meta-icon">
                  <HugeiconsIcon icon={UserGroupIcon} size={20} color="currentColor" strokeWidth={2} />
                </span>
                <span className="recipe-meta-value">{recipe.servings}</span>
                <span className="recipe-meta-label">分量</span>
              </div>
            )}
          </div>
        )}
      </div>

      {recipe.ingredients.length > 0 && (
        <div className="ingredients-card">
          <div className="card-heading">
            <span className="card-heading-icon">
              <HugeiconsIcon icon={KitchenUtensilsIcon} size={16} color="currentColor" strokeWidth={2} />
            </span>
            材料
          </div>
          <div className="ing-table">
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="ing-row">
                <span className="ing-name">{ing.name}</span>
                <span className="ing-amount">{ing.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recipe.steps.length > 0 && (
        <div className="steps-card">
          <div className="card-heading">
            <span className="card-heading-icon">
              <HugeiconsIcon icon={Clock01Icon} size={16} color="currentColor" strokeWidth={2} />
            </span>
            作り方
          </div>
          {recipe.steps.map((step, i) => (
            <div key={i} className="step-row">
              <div className="step-num">{i + 1}</div>
              <div className="step-content">{step}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
