import { Client } from "gilapi";
import mongoose from "mongoose";
import _ from "lodash";
import { cookie } from "./db/Cookie";
import { cookieSeed } from "./seed/CookieSeed";
import { baker, baker } from "./db/Baker";
import moment from "moment";

const url = process.env.DBURL;
const mongodb = process.env.DBNAME;
const dbString = `mongodb://${url}/${mongodb}`;

/* Constants */

const prefix = `/`;

let botUser = {};

const commands = [
  `\`${prefix}help\` - Lists all commands`,
  `\`${prefix}begin\` - Join the baking game`,
  `\`${prefix}recipes\` - List all cookies that can be baked`,
  `\`${prefix}recipe <cookie alias>\` - List the necessary ingredients for the cookie`,
  `\`${prefix}pantry\` - View all your current ingredients and baked cookies`,
  `\`${prefix}gather\` - Randomly gather ingredients necessary for baking`,
  `\`${prefix}bake <cookie alias>\` - Bakes a cookie provided you have the ingredients`,
  `\`${prefix}lb\` - Shows the current baker leaderboard`,
];

const constants = {
  error: 0xff7675,
  recipe: 0x00b894,
  success: 0xffeaa7,
  bag: 0x74b9ff,
  list: 0xfab1a0,
  board: 0xa29bfe,
  ingredients: [
    "flour",
    "milk",
    "eggs",
    "sugar",
    "butter",
    "oatmeal",
    "raisin",
    "chocolate_chip",
    "peanut_butter",
    "cinnamon",
    "white_chocolate",
    "macadamia_nut",
  ],
  basicIngredients: ["flour", "milk", "eggs", "sugar", "butter"],
  specialIngredients: [
    "oatmeal",
    "raisin",
    "chocolate_chip",
    "peanut_butter",
    "cinnamon",
    "white_chocolate",
    "macadamia_nut",
  ],
  cookies: [
    "sugar_cookie",
    "oatmeal_raisin_cookie",
    "chocolate_chip_cookie",
    "peanut_butter_cookie",
    "snickerdoodle_cookie",
    "macadamia_nut_cookie",
  ],
  time: 15,
  chance: (min, max, under) => {
    min = Math.ceil(min);
    max = Math.ceil(max);
    const number = Math.floor(Math.random() * (max - min + 1)) + min;
    return number <= under;
  },
};

/* Functions */
const hasIngredients = (blueprint, theList) => {
  let isEnough = true;
  const neededIngredients = {
    ...blueprint,
  };

  const missingIngredients = [];

  for (const ingredient in neededIngredients) {
    // Check if the player has more ingredients than the needed amount
    if (theList[ingredient] < neededIngredients[ingredient]) {
      isEnough = false;
      missingIngredients.push({
        name: ingredient.replace("_", " "),
        amount: neededIngredients[ingredient] - theList[ingredient],
      });
    }
  }
  return {
    isEnough,
    missingIngredients,
  };
};

const useIngredients = (blueprint, theList) => {
  // const enoughIngredients = hasIngredients(blueprint, theList);

  const usedIngredients = {};

  for (const ingr in blueprint) {
    usedIngredients[ingr] = theList[ingr] - blueprint[ingr];
  }

  const newIngredients = {
    ...theList,
    ...usedIngredients,
  };

  return newIngredients;
};

const cookieEmbed = (cookie) => {
  const embed = {
    title: `🍪 ${cookie.name} Recipe 🍪`,
    thumbnail: {
      url: cookie.image,
    },
    description: `aliases: \n${cookie.aliases.join(", ")}\n\n**Ingredients:**`,
    color: constants.recipe,
    footer: {
      text: `/bake ${cookie.aliases[0]}`,
    },
  };
  const fields = [];
  for (const [key, value] of cookie.ingredients) {
    fields.push({
      name: key.replaceAll("_", " "),
      value: `**${value}**`,
      inline: true,
    });
  }
  return {
    ...embed,
    fields,
  };
};

const paginate = (array, pagesize, pagenum) => {
  return array.slice((pagenum - 1) * pagesize, pagenum * pagesize);
};

const { client, gilAPI: g } = new Client(process.env.TOKEN);

client.on("open", async () => {
  await mongoose.connect(dbString);

  for (const c of cookieSeed) {
    const theCookie = await cookie.findOne({ id: c.id });
    if (theCookie) continue;
    await cookie.create(c);
    console.log(`${c.name} created`);
  }

  const { member } = await g.getMember(
    process.env.SERVER,
    process.env.BOTUSERID
  );

  botUser = member.user;
});

client.on("ChatMessageCreated", async (data) => {
  const { serverId, message } = data;

  if (message.createdBy == process.env.BOTUSERID) return;

  if (message.channelId !== process.env.GAMECHANNEL) return;

  if (message.content.startsWith("/lb")) {
    const players = await baker.find().sort([["score", "desc"]]);

    let args = message.content.split(" ");

    args.shift();

    if (args.length > 0 && isNaN(parseInt(args[0]))) {
      return await g.sendMsg(message.channelId, {
        content: "The page must be a number",
        isPrivate: true,
        replyMessageIds: [message.id],
      });
    }

    let page = args.length !== 0 ? parseInt(args[0]) : 1;

    let boardpage = paginate(players, 10, page);

    let pages = players.length > 10 ? Math.ceil(players.length / 10) : 1;

    if (page > pages || page < 1) {
      page = 1;
      boardpage = paginate(players, 10, page);
    }

    if (players.length % 10) {
      pages = Math.ceil(pages);
    }

    const index = players.findIndex((player) => player.id == message.createdBy);

    let askerIndex = index >= 0 ? "#" + (index + 1) + "." : "";

    const embed = {
      title: `🍪 Champions`,
      color: constants.board,
      description: `\n`,
      footer: {
        text: `${page}/${pages} • You are ${askerIndex}`,
      },
    };

    boardpage.forEach((player, index) => {
      var betterIndex = page > 1 ? index + 10 * (page - 1) + 1 : index + 1;
      embed.description += `**${betterIndex}.** <@${player.id}> - ${player.score} 🍪\n`;
    });

    return await g.sendMsg(message.channelId, {
      embeds: [embed],
      isSilent: true,
    });
  }

  if (
    moment(new Date()).isSameOrAfter(process.env.ENDDATE) &&
    message.content.startsWith(prefix)
  ) {
    return g.sendMsg(message.channelId, {
      embeds: [
        {
          title: "The baking is done, Kupo",
          description:
            "That's all the baking for this season. I'll definitely be bake again though!",
          color: constants.error,
          thumbnail: {
            url: botUser.avatar,
          },
        },
      ],
    });
  }

  if (message.content == "/begin") {
    let theBaker = await baker.findOne({ id: message.createdBy });

    if (theBaker) {
      return;
    }

    theBaker = await baker.create({
      id: message.createdBy,
      server: serverId,
    });

    return await g.sendMsg(message.channelId, {
      embeds: [
        {
          title: `Welcome to the kitchen!`,
          description:
            "Get ready to start baking! Don't forget to `/gather` your ingredients",
          color: constants.recipe,
          thumbnail: {
            url: botUser.avatar,
          },
          footer: {
            text: "You can use /help to see all commands",
          },
        },
      ],
    });
  }

  if (message.content == "/help") {
    const player = await baker.findOne({ id: message.createdBy });

    if (!player) {
      return await g.sendMsg(message.channelId, {
        embeds: [
          {
            title: `You are not baking yet`,
            description: "Use the `/begin` command to start baking",
            color: constants.error,
          },
        ],
      });
    }

    const embed = {
      title: "Baking Commands",
      description: `${commands.join("\n\n")}`,
      thumbnail: {
        url: botUser.avatar,
      },
    };

    return await g.sendMsg(message.channelId, {
      embeds: [embed],
    });
  }

  if (message.content == "/gather") {
    const player = await baker.findOne({ id: message.createdBy });

    if (!player) {
      return await g.sendMsg(message.channelId, {
        embeds: [
          {
            title: `You are not baking yet`,
            description: "Use the `/begin` command to start baking",
            color: constants.error,
          },
        ],
      });
    }

    const timeDiff = moment(
      player.lastIngredientRoll ?? moment().subtract(15, "minutes")
    )
      .add(15, "minutes")
      .diff(moment(), "minutes");

    if (timeDiff > 0) {
      const timeUntil = moment(player.lastIngredientRoll)
        .add(constants.time, "minutes")
        .fromNow();

      const embed = {
        title: "Too early!",
        description: "You must wait to gather more ingredients.",
        color: constants.error,
        footer: {
          text: `You can gather again ${timeUntil}`,
        },
      };
      return await g.sendMsg(message.channelId, {
        embeds: [embed],
      });
    }

    const basics = Object.fromEntries(
      constants.basicIngredients.map((bi) => [bi, 0])
    );
    const specials = Object.fromEntries(
      constants.specialIngredients.map((si) => [si, 0])
    );

    const gathered = [];
    for (const basic in basics) {
      const didGather = constants.chance(0, 100, 80);
      if (didGather) {
        basics[basic] += 1;
        gathered.push({
          name: basic,
          amount: 1,
        });
      }
    }

    for (const special in specials) {
      const didGather = constants.chance(0, 100, 20);
      if (didGather) {
        specials[special] += 1;
        gathered.push({
          name: special,
          amount: 1,
        });
      }
    }

    const totalGather = {
      ...basics,
      ...specials,
    };

    for (const item in totalGather) {
      player.ingredients[item] += totalGather[item];
    }

    player.lastIngredientRoll = moment().toJSON();

    await player.save();

    const embed = {
      title: `<@${player.id}> gathered `,
      color: constants.recipe,
      description: `${gathered
        .map((item) => `${item.name.replace("_", " ")} - ${item.amount}`)
        .join("\n")}`,
    };

    return g.sendMsg(message.channelId, {
      embeds: [embed],
    });
  }

  if (message.content == "/recipes") {
    const player = await baker.findOne({ id: message.createdBy });
    if (!player) {
      return await g.sendMsg(message.channelId, {
        embeds: [
          {
            title: `You are not baking yet`,
            description: "Use the `/begin` command to start baking",
            color: constants.error,
          },
        ],
      });
    }

    const cookies = await cookie.find();
    if (!cookies) return;

    let cookieString = "";

    for (const c of cookies) {
      cookieString += `**${c.name}**\n- aliases: ${c.aliases.join(", ")}\n\n`;
    }

    const embed = {
      title: "List of 🍪",
      description: cookieString,
      color: constants.list,
      footer: {
        text: "Use /bake <cookie alias>",
      },
    };
    return await g.sendMsg(message.channelId, {
      embeds: [embed],
    });
  }

  if (message.content.startsWith("/recipe ")) {
    const player = await baker.findOne({ id: message.createdBy });
    if (!player) {
      return await g.sendMsg(message.channelId, {
        embeds: [
          {
            title: `You are not baking yet`,
            description: "Use the `/begin` command to start baking",
            color: constants.error,
          },
        ],
      });
    }

    const args = message.content.split("/recipe ");
    args.shift();
    const wantedCookie = args[0];

    let desCookie = await cookie.findOne({
      aliases: { $in: [wantedCookie.trim()] },
    });

    if (!desCookie) {
      return await g.sendMsg(message.channelId, {
        content: "There are no recipes for that cookie",
      });
    }

    return await g.sendMsg(message.channelId, {
      embeds: [cookieEmbed(desCookie)],
    });
  }

  if (message.content.startsWith("/bake ")) {
    const player = await baker.findOne({ id: message.createdBy });
    if (!player) {
      return await g.sendMsg(message.channelId, {
        embeds: [
          {
            title: `You are not baking yet`,
            description: "Use the `/begin` command to start baking",
            color: constants.error,
          },
        ],
      });
    }
    const args = message.content.split("/bake ");
    args.shift();
    const wantedCookie = args[0];

    let desCookie = await cookie.findOne({
      aliases: { $in: [wantedCookie.trim()] },
    });

    if (!desCookie) {
      return await g.sendMsg(message.channelId, {
        content: "There are no recipes for that cookie",
      });
    }

    const canBake = hasIngredients(
      Object.fromEntries(desCookie.ingredients),
      player.ingredients
    );

    if (!canBake.isEnough) {
      const cannotEmbed = {
        title: "Uh oh!",
        description: `You are missing ingredients for the ${desCookie.name}.\n\nMissing ingredients: \n`,
        color: constants.error,
        fields: [
          ...canBake.missingIngredients.map((mi) => ({
            name: mi.name,
            value: mi.amount,
            inline: true,
          })),
        ],
      };

      return await g.sendMsg(message.channelId, {
        embeds: [cannotEmbed],
      });
    }

    const newIngredients = useIngredients(
      Object.fromEntries(desCookie.ingredients),
      player.ingredients
    );

    player.cookies[desCookie.id] += 1;
    player.ingredients = {
      ...newIngredients,
    };
    player.score += desCookie.value;

    await player.save();

    return await g.sendMsg(message.channelId, {
      embeds: [
        {
          title: `<@${player.id}> baked a ${desCookie.name}`,
          description: "\nSmells delicious!",
          color: constants.success,
          thumbnail: {
            url: desCookie.image,
          },
          footer: {
            text: `Your 🍪 score is now ${player.score}`,
          },
        },
      ],
    });
  }

  if (message.content == "/pantry") {
    const { member } = await g.getMember(serverId, message.createdBy);
    const player = await baker.findOne({ id: message.createdBy });
    if (!player) {
      return await g.sendMsg(message.channelId, {
        embeds: [
          {
            title: `You are not baking yet`,
            description: "Use the `/begin` command to start baking",
            color: constants.error,
          },
        ],
      });
    }

    const embed = {
      title: `<@${player.id}>'s Pantry`,
      description: "",
      color: constants.bag,
      thumbnail: {
        url: member.user.avatar ?? null,
      },
      fields: [],
    };

    embed.description += "**Baked 🍪:**\n";

    const playerCookies = _.pick(player.cookies, constants.cookies);
    for (const c in playerCookies) {
      embed.description += `${c.replaceAll("_", " ")}: **${
        playerCookies[c]
      }**\n`;
    }

    embed.description += `\nTotal 🍪 Value: **${player.score}**\n\n`;

    embed.description += "\n**Ingredients:**\n";

    const playerIngredients = _.pick(player.ingredients, constants.ingredients);
    for (const ingredient in playerIngredients) {
      embed.fields.push({
        name: `${ingredient.replaceAll("_", " ").toLowerCase()}`,
        value: `${playerIngredients[ingredient]}`,
        inline: true,
      });
    }
    return await g.sendMsg(message.channelId, {
      embeds: [embed],
    });
  }

  if (message.content == "/fill") {
    const player = await baker.findOne({ id: message.createdBy });
    if (!player) return;

    const playerIngredients = _.pick(player.ingredients, constants.ingredients);

    for (const ingredient in playerIngredients) {
      playerIngredients[ingredient] += 10;
    }

    player.ingredients = {
      ...player.ingredients,
      ...playerIngredients,
    };

    await player.save();
  }
});
