export type Ingredient = {
  name: string;
  amount: string;
};

export type Recipe = {
  dish_name: string;
  description: string;
  cooking_time: string;
  servings: string;
  ingredients: Ingredient[];
  steps: string[];
};
