import {
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import {Command} from '../types';
import {Color} from '../constants';

enum cmds {
  g = '`/gather`',
  p = '`/pantry`',
  r = '`/recipe`',
  b = '`/bake`',
  lb = '`/leaderboard`',
  h = '`/help`',
}

const startMsg = `## Holiday Bakery\n
Oh welcome to the Black Cat Bakery! You must have been drawn in from the smell of cookies, right?\n
It's actually wonderful that you are here. Unfortunately we have so many orders for cookies and not enough employees
to fill all the orders! You'll help us right?
### Great!

It's easy to get started. All you have to do is ${cmds.g} the ingredients for the cookies!
You can always view ${cmds.r} to see what ingredients you need for different cookies.
If you need to see what ingredients you have you can check ${cmds.p}.
And it's as easy as ${cmds.b} to bake cookies!

Oh also, some cookies are worth more than others because of how popular they are! So it may be better to save ingredients for the more valuable cookies.

We're not asking you to this for free either. The employee of the month will be handsomely rewarded! You can see
who is doing the best with ${cmds.lb}.

Oh and don't forget you can always use ${cmds.h} if you are confused.

Happy baking!
`;

export const adminStartCommand: Command = {
  cmd: new SlashCommandBuilder()
    .setName('start-game')
    .setDescription('send the game beginning message')
    .addChannelOption(chanOpt =>
      chanOpt
        .setName('channel')
        .setDescription('channel to send start message to')
        .setRequired(true),
    )
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  action: async i => {
    const channel = i.options.getChannel('channel', true) as TextChannel;

    await i.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    const embed = new EmbedBuilder()
      .setDescription(startMsg)
      .setColor(Color.success)
      .setFooter({text: `Use ${cmds.g} to start!`});

    await channel.send({
      embeds: [embed],
    });

    await i.editReply('Message sent');
  },
};
