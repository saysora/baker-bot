import {
  GuildMember,
  InteractionContextType,
  SlashCommandBuilder,
} from 'discord.js';
import db from '../db';
import {Command, Cookies} from '../types';
import {makePlayer} from '../helpers/game';
import {hasIngredients, useIngredients} from '../helpers/ingredients';
import {eq} from 'drizzle-orm';
import {bakerTable} from '../db/schema/baker';
import {cookies} from '../helpers/cookies';
import {bakedResult} from '../helpers/embeds';

export const bakeCommand: Command = {
  cmd: new SlashCommandBuilder()
    .setName('bake')
    .setDescription('bake a cookie')
    .addStringOption(stOpt =>
      stOpt
        .setName('recipe')
        .setDescription('select cookie to bake')
        .setChoices(
          cookies.map(c => ({
            name: c.name,
            value: c.id,
          })),
        )
        .setRequired(true),
    )
    .addNumberOption(numOpt =>
      numOpt
        .setName('number')
        .setDescription('how many cookies')
        .setMinValue(1)
        .setRequired(true),
    )
    .setContexts(InteractionContextType.Guild),
  action: async i => {
    const recipe = i.options.getString('recipe', true);
    const amount = i.options.getNumber('number', true);

    await i.deferReply();

    const player = await makePlayer(i.member as GuildMember);

    const theRecipe = cookies.find(c => c.id === recipe);

    if (!theRecipe) {
      // TODO: Update to embed
      await i.editReply({
        content: 'No recipe',
      });
      return;
    }

    const ingredientCheck = hasIngredients(
      theRecipe.ingredients,
      player.ingredients,
      amount,
    );

    if (!ingredientCheck.isEnough) {
      await i.editReply({
        content: 'Not enough ingredients, bitch',
      });
      return;
    }

    const bakedResults = useIngredients(
      theRecipe.ingredients,
      player.ingredients,
      amount,
    );

    const newScore = player.score + theRecipe.value * amount;

    await db
      .update(bakerTable)
      .set({
        cookies: {
          ...player.cookies,
          [theRecipe.id]:
            player.cookies[theRecipe.id as keyof Cookies] + amount,
        },
        // NOTE:
        // Future me- We use this so that we can easily sort the leaderboard :)
        score: newScore,
        ingredients: bakedResults,
      })
      .where(eq(bakerTable.id, player.id));

    await i.editReply({
      embeds: [bakedResult(theRecipe, newScore, amount)],
    });
  },
};
