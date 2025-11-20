import {bakerTable} from '../db/schema/baker';
import {Ingredients} from '../types';
import {stripUnderS} from './general';

export function hasIngredients(
  blueprint: Partial<Ingredients>,
  currentIngredients: Ingredients,
  amount = 1,
) {
  let isEnough = true;

  const missingIngredients: {name: string; needed: number; current: number}[] =
    [];

  for (const ingredient in blueprint) {
    const bp = blueprint[ingredient as keyof Ingredients];
    const currentIng = currentIngredients[ingredient as keyof Ingredients];

    if (!bp) {
      throw new Error('Somehow the value is not in the object');
    }

    const blueprintAmount = bp * amount;
    if (currentIng < blueprintAmount) {
      isEnough = false;
      missingIngredients.push({
        name: stripUnderS(ingredient),
        needed: blueprintAmount - currentIng,
        current: currentIng,
      });
    }
  }

  return {
    isEnough,
    missingIngredients,
  };
}

export function useIngredients(
  blueprint: Partial<Ingredients>,
  currentIngredients: Ingredients,
  amount = 1,
) {
  const usedIngredients: Record<string, number> = {};

  for (const ingredient in blueprint) {
    const bp = blueprint[ingredient as keyof Ingredients];
    const ci = currentIngredients[ingredient as keyof Ingredients];

    if (!bp || !ci) {
      throw new Error('Somehow the blueprint or ingredients are gone');
    }

    const blueprintIngredient = bp * amount;
    usedIngredients[ingredient] = ci - blueprintIngredient;
  }

  return {...currentIngredients, ...usedIngredients} as Ingredients;
}

export function mergeIngredients(
  bp: typeof bakerTable.$inferSelect.ingredients,
  gathered: Ingredients,
): typeof bakerTable.$inferSelect.ingredients {
  const newIngredients = {} as typeof bakerTable.$inferSelect.ingredients;

  for (const ingredient in gathered) {
    const ing = ingredient as keyof typeof bakerTable.$inferSelect.ingredients;

    newIngredients[ing] = bp[ing] + gathered[ing];
  }

  return newIngredients;
}
