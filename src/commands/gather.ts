import {
  ChatInputCommandInteraction,
  GuildMember,
  InteractionContextType,
  SlashCommandBuilder,
} from 'discord.js';
import {
  canGather,
  findOrMakeConfig,
  getCooldown,
  inGameTimeline,
  makePlayer,
} from '../helpers/game';
import {basicIngredients, randomChance, specialIngredients} from '../constants';
import {mergeIngredients} from '../helpers/ingredients';
import {bakerTable} from '../db/schema/baker';
import db from '../db';
import {eq} from 'drizzle-orm';
import moment = require('moment');
import {errorEmbed, gatherEmbed} from '../helpers/embeds';
import {Ingredients} from '../types';

export const gatherCommand = {
  cmd: new SlashCommandBuilder()
    .setName('gather')
    .setDescription('gather ingredients')
    .setContexts(InteractionContextType.Guild),
  action: async (i: ChatInputCommandInteraction) => {
    await i.deferReply();

    const config = await findOrMakeConfig();
    const inTimeline = inGameTimeline(config);

    if (!inTimeline.allowed) {
      let reason = 'The game has not begun yet!';
      if (inTimeline.time === 'after') {
        reason = 'The game is over';
      }
      await i.editReply({
        embeds: [errorEmbed(`### Uh oh\n${reason}`)],
      });
      return;
    }

    const player = await makePlayer(i.member as GuildMember);

    if (!player) {
      throw new Error('Could not find that player, please contact saysora');
    }

    const {cooldownActive} = getCooldown(config);
    const playerGather = canGather(config, player.lastIngredientRoll);

    if (cooldownActive && player.gatherCount >= 1 && !playerGather.can) {
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
      embeds: [gatherEmbed(gatheredSet, updatedList)],
    });
  },
};
