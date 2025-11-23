import {GuildMember} from 'discord.js';
import db from '../db';
import {bakerTable} from '../db/schema/baker';
import {desc, eq} from 'drizzle-orm';
import moment = require('moment');
import {configTable} from '../db/schema/config';

export enum TimePeriod {
  before = 'before',
  after = 'after',
}

async function makeConfig() {
  return (await db.insert(configTable).values({}).returning())?.[0];
}

export async function fetchConfig() {
  return db.query.configTable.findFirst();
}

export async function findOrMakeConfig() {
  let config = await fetchConfig();

  if (!config) {
    console.info('No config found, creating with defaults');
    config = await makeConfig();
  }
  return config;
}

export async function initGame() {
  console.info('Checking for config');
  const config = await findOrMakeConfig();

  await inGameTimeline(config);
}

export async function updateConfig(
  id: number,
  values: typeof configTable.$inferInsert,
) {
  return db
    .update(configTable)
    .set(values)
    .where(eq(configTable.id, id))
    .returning();
}

export function getCooldown({
  cooldownActive,
  cooldownTime,
  cooldownUnit,
}: typeof configTable.$inferInsert) {
  return {
    cooldownActive,
    cooldownTime,
    cooldownUnit,
  };
}

export function inGameTimeline(config: typeof configTable.$inferInsert) {
  if (!config.datesEnabled) {
    return {
      allowed: true,
      time: null,
    };
  }

  const startDate = config.startDate ? moment.utc(config.startDate) : null;
  const endDate = config.endDate ? moment.utc(config.endDate) : null;

  if (startDate && startDate.isAfter(moment.utc())) {
    console.log('We are before the start date');
    return {
      allowed: false,
      time: TimePeriod.before,
    };
  }

  if (endDate && endDate.isBefore(moment.utc())) {
    console.log('We are after the end date');
    return {
      allowed: false,
      time: TimePeriod.after,
    };
  }

  return {
    allowed: true,
    time: null,
  };
}

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

export function canGather(
  config: typeof configTable.$inferInsert,
  lastGathered: string,
) {
  if (!config.cooldownActive) {
    return {
      until: '00',
      can: true,
    };
  }

  const lastMoment = moment.utc(lastGathered);
  const timeTilNextGather = lastMoment.add(
    config.cooldownTime,
    config.cooldownUnit ?? 'm',
  );

  return {
    until: timeTilNextGather.fromNow(true),
    can: moment.utc().isAfter(timeTilNextGather),
  };
}

export interface LBRes {
  offset: number;
  page: number;
  pages: number;
  total: number;
  players: {id: string; score: number}[];
}

export async function getLb({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}): Promise<LBRes> {
  const total = await db.$count(bakerTable);
  const pages = Math.ceil(total / limit);
  const offset = page <= 1 ? 0 : (page - 1) * limit;

  const players = await db
    .select({id: bakerTable.id, score: bakerTable.score})
    .from(bakerTable)
    .orderBy(desc(bakerTable.score))
    .limit(10)
    .offset(offset);

  // Just return all the stuff in case we wanna get real fancy
  return {
    offset,
    page,
    total,
    pages,
    players,
  };
}

// Other helpers
export function boldText(min: number, current: number, text: string) {
  if (current > min) {
    return `**${text}**`;
  }
  return text;
}
