// TODO:
// + Need to finish importing legacy commands
//   - lb
// + Add in the config db item and set it up
// + And then profit???
import {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  Partials,
  REST,
  Routes,
} from 'discord.js';
import {recipeEmbed} from './helpers/embeds';
import {cmdCollection, cmds} from './commands';
import {cookies} from './helpers/cookies';

const reqVars = ['TOKEN', 'CLIENT_ID'];
const errors = [];

for (const req of reqVars) {
  if (!process.env[req]) {
    errors.push(`Missing ${req} variable`);
  }
}

if (errors.length) {
  throw new Error(`Error: ${errors.join(', ')}`);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
  ],
});

const rest = new REST({version: '10'}).setToken(process.env.TOKEN!);

void (async () => {
  try {
    console.info(`Refreshing ${cmds.length} commands`);
    const data = (await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID!),
      {
        body: cmds.map(c => c.cmd.toJSON()),
      },
    )) as string[];
    console.info(`Successfully reloaded ${data.length} (/) commands`);
  } catch (e) {
    console.error(e);
  }
})();

client.once(Events.ClientReady, async rc => {
  console.log(`${rc.user.username} Online`);
  console.log(`Loaded ${cookies.length} cookies into cache`);
});

client.on(Events.InteractionCreate, async inter => {
  if (!inter.isChatInputCommand()) return;
  if (inter.user.bot) return;
  const cmd = cmdCollection.get(inter.commandName);

  if (!cmd) {
    await inter.reply({
      content: `${inter.commandName} is not a valid comamnd`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await cmd(inter, client);
  } catch (e) {
    console.error(e);
    const err = e as Error;
    if (inter.replied || inter.deferred) {
      await inter.followUp({
        content:
          err?.message ?? 'There was an error while executing this command',
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await inter.reply({
        content:
          err?.message ?? 'There was an error while executing this command',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.on(Events.MessageCreate, async msg => {
  if (msg.author.bot) return;

  if (msg.content.startsWith('/recipe ')) {
    const wantedRecipe = msg.content.split('/recipe ')?.[1];

    if (!wantedRecipe) return;

    const recipeLookup = cookies.find(c => c.aliases?.includes(wantedRecipe));

    if (!recipeLookup) return;

    await msg.reply({
      embeds: [recipeEmbed(recipeLookup)],
    });
  }
});

void client.login(process.env.TOKEN);
