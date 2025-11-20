import {
  ChatInputCommandInteraction,
  GuildMember,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import {makePlayer} from '../helpers/game';
import {basicIngredients, randomChance, specialIngredients} from '../constants';
import {mergeIngredients} from '../helpers/ingredients';
import {bakerTable} from '../db/schema/baker';
import db from '../db';
import {eq} from 'drizzle-orm';
import moment = require('moment');
import {gatheredEmbed} from '../helpers/embeds';
import {Ingredients} from '../types';

export const gatherCommand = {
  cmd: new SlashCommandBuilder()
    .setName('gather')
    .setDescription('gather ingredients')
    .setContexts(InteractionContextType.Guild),
  action: async (i: ChatInputCommandInteraction) => {
    const player = await makePlayer(i.member as GuildMember);

    if (!player) {
      throw new Error('Could not find that player, please contact saysora');
    }

    // if (player.gatherCount >= 1 && !canGather(player.lastIngredientRoll).can) {
    //   // TODO: Write the embed helper for needing to wait until canGather time is ok
    //   await i.reply('You cannot gather for reasons explained later');
    //   return;
    // }

    const gatheredSet: Record<string, number> = {};

    // Legacy, why not just calculate the new nums here? :thinking:

    basicIngredients.forEach(i => {
      gatheredSet[i] = randomChance(1, 5);
    });
    specialIngredients.forEach(i => {
      gatheredSet[i] = randomChance(0, 2);
    });

    const updatedList = mergeIngredients(
      player.ingredients,
      gatheredSet as unknown as Ingredients,
    );

    await db
      .update(bakerTable)
      .set({
        gatherCount: player.gatherCount + 1,
        ingredients: updatedList,
        lastIngredientRoll: moment().toJSON(),
      })
      .where(eq(bakerTable.id, player.id));

    await i.reply({
      embeds: [gatheredEmbed(gatheredSet)],
      flags: MessageFlags.Ephemeral,
    });
  },
};
