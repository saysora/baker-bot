import {
  ChatInputCommandInteraction,
  Client,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

export interface Command {
  cmd: SlashCommandOptionsOnlyBuilder;
  action: (i: ChatInputCommandInteraction, c: Client) => Promise<void>;
}

export interface Ingredients {
  flour: number;
  milk: number;
  eggs: number;
  sugar: number;
  butter: number;
  oatmeal: number;
  raisin: number;
  chocolate_chip: number;
  peanut_butter: number;
  cinnamon: number;
  white_chocolate: number;
  macadamia_nut: number;
}

export interface Cookie {
  id: string;
  aliases: string[];
  name: string;
  value: number;
  image: string;
  ingredients: Partial<Ingredients>;
}

export interface Cookies {
  sugar_cookie: number;
  oatmeal_raisin_cookie: number;
  chocolate_chip_cookie: number;
  peanut_butter_cookie: number;
  snickerdoodle_cookie: number;
  macadamia_nut_cookie: number;
}
