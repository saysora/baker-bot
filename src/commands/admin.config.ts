import {
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import {Command} from '../types';
import {findOrMakeConfig, updateConfig} from '../helpers/game';
import {configEmbed} from '../helpers/embeds';
import {configTable, CooldownUnit} from '../db/schema/config';
import moment = require('moment');

function returnNull(
  value: string | undefined,
  additionalFn?: Function,
  prop?: string,
) {
  if (value === 'null') return null;

  if (additionalFn) {
    if (prop) {
      return additionalFn(value)?.[prop]?.();
    }
    return additionalFn(value);
  }
  return value;
}

export const adminConfigCommand: Command = {
  cmd: new SlashCommandBuilder()
    .setName('config')
    .setDescription('baking game config')
    .addSubcommand(subC =>
      subC.setName('view').setDescription('view baking config'),
    )
    .addSubcommand(subC =>
      subC
        .setName('update')
        .setDescription('update config')
        .addStringOption(strOpt =>
          strOpt.setName('game-channel').setDescription('channel for the game'),
        )
        .addStringOption(strOpt =>
          strOpt
            .setName('start-date')
            .setDescription('start date for game, use null to disable'),
        )
        .addStringOption(strOpt =>
          strOpt
            .setName('end-date')
            .setDescription('start date for game, use null to disable'),
        )
        .addBooleanOption(bOpt =>
          bOpt
            .setName('dates-enabled')
            .setDescription('whether to honor the date settings'),
        )
        .addNumberOption(numOpt =>
          numOpt
            .setName('cooldown-time')
            .setDescription('set the cooldown for gathering'),
        )
        .addStringOption(strOpt =>
          strOpt
            .setName('cooldown-unit')
            .setDescription('the unit of time')
            .addChoices([
              {name: 'hours', value: 'h'},
              {name: 'minutes', value: 'm'},
              {name: 'seconds', value: 's'},
            ]),
        )
        .addBooleanOption(boolOpt =>
          boolOpt
            .setName('cooldown-active')
            .setDescription('whether to honor the cooldown'),
        ),
    )
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  action: async i => {
    const subCommand = i.options.getSubcommand();

    await i.deferReply({
      flags: MessageFlags.Ephemeral,
    });
    switch (subCommand) {
      case 'view': {
        const config = await findOrMakeConfig();

        await i.editReply({
          embeds: [configEmbed(config)],
        });

        break;
      }
      case 'update': {
        const gameChannel = i.options.getString('game-channel') ?? undefined;
        const startDate = i.options.getString('start-date') ?? undefined;
        const endDate = i.options.getString('end-date') ?? undefined;

        const cooldownTime = i.options.getNumber('cooldown-time') ?? undefined;
        const cooldownUnit = i.options.getString('cooldown-unit') ?? undefined;
        const cooldownActive =
          i.options.getBoolean('cooldown-active') ?? undefined;

        let values = {} as typeof configTable.$inferInsert;

        if (gameChannel !== undefined) {
          values = {
            ...values,
            gameChannel: returnNull(gameChannel),
          };
        }

        if (startDate !== undefined) {
          values = {
            ...values,
            startDate: returnNull(startDate, moment.utc, 'toDate'),
          };
        }

        if (endDate !== undefined) {
          values = {
            ...values,
            endDate: returnNull(endDate, moment.utc, 'toDate'),
          };
        }

        if (cooldownTime !== undefined) {
          values = {
            ...values,
            cooldownTime: cooldownTime ?? undefined,
          };
        }

        if (cooldownUnit !== undefined) {
          values = {
            ...values,
            cooldownUnit: (cooldownUnit ?? 'm') as CooldownUnit,
          };
        }

        if (cooldownActive !== undefined) {
          values = {
            ...values,
            cooldownActive: cooldownActive,
          };
        }

        const updatedConfig = await updateConfig(1, values);

        await i.editReply({
          embeds: [configEmbed(updatedConfig?.[0], '### Config Updated')],
        });

        break;
      }
      default: {
        await i.editReply({
          content: 'Invalid command given',
        });
      }
    }
  },
};
