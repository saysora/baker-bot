import {EmbedBuilder, User} from 'discord.js';
import {Color} from '../constants';
import {bakerTable} from '../db/schema/baker';
import {stripUnderS} from './general';
import {boldText, canGather, LBRes} from './game';
import {Cookie, Ingredients} from '../types';
import {addSpaces, spaceChar} from './addSpaces';
import {configTable} from '../db/schema/config';

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

export function gatherEmbed(
  user: User,
  newIngredients: Record<string, number>,
) {
  const embed = new EmbedBuilder()
    .setColor(Color.recipe)
    .setThumbnail(user.displayAvatarURL());

  let description = `### 🔎 Gather Results\nFor <@${user.id}>\n\n`;

  for (const ing in newIngredients) {
    const ingredientCount = newIngredients[ing];
    if (ingredientCount > 0) {
      description += `${stripUnderS(ing)} +${boldText(2, ingredientCount, String(ingredientCount))}\n`;
    }
  }

  embed.setDescription(description);
  embed.setFooter({
    text: 'Use `/pantry` to check your ingredients',
  });

  return embed;
}

export function pantryEmbed(
  player: typeof bakerTable.$inferSelect,
  user: User,
  config: typeof configTable.$inferInsert,
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
  const playerGather = canGather(config, player.lastIngredientRoll);

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

export function lbEmbed(board: LBRes) {
  const embed = new EmbedBuilder().setColor(Color.board);

  let description = '### 🍪 Cookie Champions\n';
  const scoreHeader = `🏆 Score${spaceChar.repeat(1)}`;
  const userHeader = `🧑‍🍳 Baker${spaceChar.repeat(3)}`;

  description += `${scoreHeader} | ${userHeader}\n`;

  for (const player of board.players) {
    const playerString = `<@${player.id}>`;
    const playerScore = `${player.score}`;
    description += `${addSpaces(scoreHeader, playerScore)}|${addSpaces(userHeader, playerString)}\n`;
  }

  embed.setDescription(description);
  embed.setFooter({
    text: `Page ${board.page}/${board.pages}`,
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

// Admin Embeds
export function configEmbed(
  config: typeof configTable.$inferInsert,
  msg?: string,
) {
  const embed = new EmbedBuilder().setColor(Color.config);

  let description = '### Config';

  if (msg) {
    description = msg;
  }

  description += '\n';

  for (const k in config) {
    const key = k as keyof typeof config;
    description += `\`${key}\`: ${config[key]}\n`;
  }

  embed.setDescription(description);

  return embed;
}
