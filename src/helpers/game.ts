import {GuildMember} from 'discord.js';
import db from '../db';
import {bakerTable} from '../db/schema/baker';
import {eq} from 'drizzle-orm';
import moment = require('moment');

// Player Specific
export async function getPlayer(id: string) {
  const player = await db
    .select()
    .from(bakerTable)
    .where(eq(bakerTable.id, id));

  return player?.[0];
}

export async function makePlayer(player: GuildMember) {
  const exists = await getPlayer(player.id);

  if (exists) {
    return exists;
  }

  const baker = await db
    .insert(bakerTable)
    .values({
      id: player.id,
      server: player.guild.id,
    })
    .returning();

  return baker?.[0];
}

export function canGather(lastGathered: string) {
  const lastMoment = moment.utc(lastGathered);
  const timeTilNextGather = lastMoment.add(15, 'm');

  return {
    until: timeTilNextGather.fromNow(true),
    can: moment.utc().isAfter(timeTilNextGather),
  };
}
