import {Collection} from 'discord.js';
import {helpCommand} from './help';
import {gatherCommand} from './gather';
import {pantryCommand} from './pantry';
import {bakeCommand} from './bake';
import {recipeCommand} from './recipe';
const cmdCollection = new Collection<string, Function>();

const cmds = [
  bakeCommand,
  gatherCommand,
  helpCommand,
  pantryCommand,
  recipeCommand,
];

for (const {cmd, action} of cmds) {
  cmdCollection.set(cmd.name, action);
}

export {cmds, cmdCollection};
