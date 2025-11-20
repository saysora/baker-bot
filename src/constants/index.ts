export enum Color {
  error = '#ff7675',
  recipe = '#00b894',
  success = '#ffeaa7',
  bag = '#74b9ff',
  list = '#fab1a0',
  board = '#a29bfe',
}

export const basicIngredients = ['flour', 'milk', 'eggs', 'sugar', 'butter'];

export const specialIngredients = [
  'oatmeal',
  'raisin',
  'chocolate_chip',
  'peanut_butter',
  'cinnamon',
  'white_chocolate',
  'macadamia_nut',
];

export const ingredientList = [...basicIngredients, ...specialIngredients];

export const cookieList = [
  'sugar_cookie',
  'oatmeal_raisin_cookie',
  'chocolate_chip_cookie',
  'peanut_butter_cookie',
  'snickerdoodle_cookie',
  'macadamia_nut_cookie',
];

export const commands = [
  '`/help` - Lists all commands',
  '`/recipes` - List all cookies that can be baked',
  '`/recipe <cookie alias>` - List the necessary ingredients for the cookie',
  '`/pantry` - View all your current ingredients and baked cookies',
  '`/gather` - Randomly gather ingredients necessary for baking (can only be used at least 15 minutes after the last gather command)',
  '`/bake <cookie alias>` - Bakes a cookie provided you have the ingredients',
  '`/lb` - Shows the current baker leaderboard',
];

export function randomChance(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function underChance(min: number, max: number, under: number) {
  return randomChance(min, max) <= under;
}
