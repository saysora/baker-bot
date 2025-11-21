import {
  ChatInputCommandInteraction,
  GuildMember,
  InteractionContextType,
  SlashCommandBuilder,
} from 'discord.js';
import {canGather, makePlayer} from '../helpers/game';
import {basicIngredients, randomChance, specialIngredients} from '../constants';
import {mergeIngredients} from '../helpers/ingredients';
import {bakerTable} from '../db/schema/baker';
import db from '../db';
import {eq} from 'drizzle-orm';
import moment = require('moment');
import {errorEmbed, gatheredEmbed} from '../helpers/embeds';
import {Ingredients} from '../types';

export const gatherCommand = {
  cmd: new SlashCommandBuilder()
    .setName('gather')
    .setDescription('gather ingredients')
    .setContexts(InteractionContextType.Guild),
  action: async (i: ChatInputCommandInteraction) => {
    await i.deferReply();
    const player = await makePlayer(i.member as GuildMember);

    if (!player) {
      throw new Error('Could not find that player, please contact saysora');
    }

    const playerGather = canGather(player.lastIngredientRoll);
    if (player.gatherCount >= 1 && !playerGather.can) {
      await i.editReply({
        embeds: [
          errorEmbed(
            `### Too Early\n You must wait ${playerGather.until} before you can gather ingredients`,
            `Current 🍪 score: ${player.score}`,
          ),
        ],
      });
      return;
    }

    const gatheredSet: Record<string, number> = {};

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

    await i.editReply({
      embeds: [gatheredEmbed(gatheredSet)],
    });
  },
};
