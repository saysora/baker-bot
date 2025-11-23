import {InteractionContextType, SlashCommandBuilder} from 'discord.js';
import {Command} from '../types';
import {getLb} from '../helpers/game';
import {lbEmbed} from '../helpers/embeds';

export const leaderboardCommand: Command = {
  cmd: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('view the top bakers')
    .addNumberOption(numOpt =>
      numOpt
        .setName('page')
        .setDescription('page number to view')
        .setMinValue(1),
    )
    .setContexts(InteractionContextType.Guild),
  action: async i => {
    const page = i.options.getNumber('page') ?? 1;

    await i.deferReply();

    const board = await getLb({page});

    await i.editReply({
      embeds: [lbEmbed(board)],
    });
  },
};
