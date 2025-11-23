import {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  Partials,
  REST,
  Routes,
} from 'discord.js';
import {cmdCollection, cmds} from './commands';
import {cookies} from './helpers/cookies';
import {initGame} from './helpers/game';

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
  await initGame();
});

client.on(Events.InteractionCreate, async inter => {
  if (process.env.SERVER_ID && inter.guildId !== process.env.SERVER_ID) return;
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

void client.login(process.env.TOKEN);
