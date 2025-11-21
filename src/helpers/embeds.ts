import {EmbedBuilder, User} from 'discord.js';
import {Color} from '../constants';
import {bakerTable} from '../db/schema/baker';
import {stripUnderS} from './general';
import {canGather} from './game';
import {Cookie, Ingredients} from '../types';

export function recipeEmbed(recipe: Cookie) {
  const embed = new EmbedBuilder()
    .setThumbnail(recipe.image)
    .setColor(Color.recipe)
    .setFooter({
      text: `/bake ${recipe.aliases?.[0]}`,
    });

  let description = `## 📒 ${recipe.name}\n`;
  description += `### Aliases: \n${recipe.aliases?.join(', ')}\n### 🏆 Score : **${recipe.value}**\n### 📝 Ingredients: `;

  embed.setDescription(description);
  const fields = [];

  for (const ingr in recipe.ingredients) {
    fields.push({
      name: `${stripUnderS(ingr)}`,
      value: `**${recipe.ingredients[ingr as keyof Ingredients]}**`,
      inline: true,
    });
  }

  embed.addFields(fields);

  return embed;
}

export function gatheredEmbed(newIngredients: Record<string, number>) {
  const embed = new EmbedBuilder()
    .setTitle('Gathering Results')
    .setColor(Color.recipe);

  let description = '';

  for (const ing in newIngredients) {
    description += `${stripUnderS(ing)} - **${newIngredients[ing]}**\n`;
  }

  embed.setDescription(description);

  return embed;
}

export function pantryEmbed(
  player: typeof bakerTable.$inferSelect,
  user?: User,
) {
  const embed = new EmbedBuilder().setColor(Color.bag);

  let description = `## <@${player.id}>'s Pantry\n\n`;

  description += `### 🏆 Score: ${player.score}\n`;

  description += '### 🍪 Baked:\n';
  for (const c in player.cookies) {
    description += `${stripUnderS(c)}: **${player.cookies[c as keyof typeof player.cookies]}**\n`;
  }

  description += '### 📒 Ingredients:\n';
  embed.setDescription(description);

  const fields = [];
  for (const i in player.ingredients) {
    fields.push({
      name: `${stripUnderS(i)}:`,
      value: `${player.ingredients[i as keyof typeof player.ingredients]}`,
      inline: true,
    });
  }

  embed.setFields(fields);

  if (user) {
    embed.setThumbnail(user.displayAvatarURL());
  }

  let footerMessage = 'You can gather';
  const playerGather = canGather(player.lastIngredientRoll);

  if (!playerGather.can) {
    footerMessage = `Cannot gather for ${playerGather.until}`;
  }

  embed.setFooter({
    text: footerMessage,
  });

  return embed;
}

export function missingEmbed(
  name: string,
  amount: number,
  missingIng: {name: string; needed: number; current: number}[],
) {
  const embed = new EmbedBuilder()
    .setDescription(
      `### Uh oh!\nYou are missing ingredients for ${amount} ${name}${amount > 1 ? 's' : ''}\n### 📒 Needed Ingredients:\n`,
    )
    .setColor(Color.error);

  const fields = [];

  for (const ing of missingIng) {
    fields.push({
      name: `${stripUnderS(ing.name)}`,
      value: `${ing.needed}`,
      inline: true,
    });
  }

  embed.setFields(fields);

  return embed;
}

export function bakedResult(recipe: Cookie, score: number, amount: number) {
  const embed = new EmbedBuilder()
    .setDescription(
      `### Baked ${amount} ${recipe.name}${amount > 1 ? 's' : ''}\n\n Smells delicious!`,
    )
    .setThumbnail(recipe.image)
    .setColor(Color.success)
    .setFooter({
      text: `Your 🍪 score is now ${score}`,
    });

  return embed;
}

export function errorEmbed(message: string, footer?: string) {
  const embed = new EmbedBuilder()
    .setDescription(message)
    .setColor(Color.error);

  if (footer) {
    embed.setFooter({
      text: footer,
    });
  }

  return embed;
}
