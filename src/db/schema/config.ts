import {int, sqliteTable, text} from 'drizzle-orm/sqlite-core';

export type CooldownUnit = 's' | 'm' | 'h';

export const configTable = sqliteTable('config', {
  id: int().primaryKey({autoIncrement: true}),
  gameChannel: text(),

  startDate: int({mode: 'timestamp'}),
  endDate: int({mode: 'timestamp'}),
  datesEnabled: int({mode: 'boolean'}).default(false).notNull(),

  cooldownTime: int().default(15).notNull(),
  cooldownUnit: text().default('m').$type<CooldownUnit>().notNull(),
  cooldownActive: int({mode: 'boolean'}).default(false).notNull(),
});
