import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import {Color, commands} from '../constants';

export const helpCommand = {
  cmd: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List commands')
    .setContexts(InteractionContextType.Guild),
  action: async (i: ChatInputCommandInteraction) => {
    const embed = new EmbedBuilder()
      .setTitle('Baking Commands')
      .setDescription(commands.join('\n'))
      .setColor(Color.list);

    await i.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
};
