import {sql} from 'drizzle-orm';
import {int, sqliteTable, text} from 'drizzle-orm/sqlite-core';
import {Cookies, Ingredients} from '../../types';

export const bakerTable = sqliteTable('baker', {
  id: text().primaryKey(),
  server: text().notNull(),
  lastIngredientRoll: text()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  gatherCount: int().default(0).notNull(),
  score: int().default(0).notNull(),
  cookies: text('', {mode: 'json'})
    .$type<Cookies>()
    .default({
      sugar_cookie: 0,
      oatmeal_raisin_cookie: 0,
      chocolate_chip_cookie: 0,
      peanut_butter_cookie: 0,
      snickerdoodle_cookie: 0,
      macadamia_nut_cookie: 0,
    })
    .notNull(),
  ingredients: text('', {mode: 'json'})
    .$type<Ingredients>()
    .default({
      flour: 0,
      milk: 0,
      eggs: 0,
      sugar: 0,
      butter: 0,
      oatmeal: 0,
      raisin: 0,
      chocolate_chip: 0,
      peanut_butter: 0,
      cinnamon: 0,
      white_chocolate: 0,
      macadamia_nut: 0,
    })
    .notNull(),
});
