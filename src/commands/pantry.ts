import {
  ChatInputCommandInteraction,
  GuildMember,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import {findOrMakeConfig, getPlayer, makePlayer} from '../helpers/game';
import {pantryEmbed} from '../helpers/embeds';

export const pantryCommand = {
  cmd: new SlashCommandBuilder()
    .setName('pantry')
    .setDescription('view your pantry')
    .addBooleanOption(bOpt =>
      bOpt.setName('public').setDescription('show pantry publicly'),
    )
    .setContexts(InteractionContextType.Guild),
  action: async (i: ChatInputCommandInteraction) => {
    const publicOpt = i.options.getBoolean('public') ?? false;

    await i.deferReply({
      flags: !publicOpt ? MessageFlags.Ephemeral : undefined,
    });

    let player = await getPlayer(i.user.id);

    if (!player) {
      player = await makePlayer(i.member as GuildMember);
    }

    const config = await findOrMakeConfig();

    await i.editReply({
      embeds: [pantryEmbed(player, i.user, config)],
    });
  },
};
