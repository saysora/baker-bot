import {InteractionContextType, SlashCommandBuilder} from 'discord.js';
import {Command} from '../types';
import {cookies} from '../helpers/cookies';
import {recipeEmbed, errorEmbed} from '../helpers/embeds';

export const recipeCommand: Command = {
  cmd: new SlashCommandBuilder()
    .setName('recipe')
    .setDescription('view recipe')
    .addStringOption(strOpt =>
      strOpt
        .setName('name')
        .setDescription('name or alias of recipe')
        .addChoices(
          cookies.map(c => ({
            name: c.name,
            value: c.id,
          })),
        )
        .setRequired(true),
    )
    .setContexts(InteractionContextType.Guild),
  action: async i => {
    const recipeName = i.options.getString('name', true);

    const theRecipe = cookies.find(c => c.id === recipeName);

    if (!theRecipe) {
      await i.reply({
        embeds: [
          errorEmbed(
            '### Could not find matching recipe\nAre you sure you typed it right?',
          ),
        ],
      });
      return;
    }

    await i.reply({
      embeds: [recipeEmbed(theRecipe)],
    });
  },
};
