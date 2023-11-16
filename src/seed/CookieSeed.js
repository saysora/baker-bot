const baseIngredients = {
  milk: 1,
  flour: 1,
  sugar: 1,
  eggs: 1,
  butter: 1,
};

export const cookieSeed = [
  {
    id: "sugar_cookie",
    aliases: ["sugar cookie", "sugar", "sc"],
    name: "Sugar Cookie",
    value: 1,
    image: "https://i.imgur.com/axO3TUR.png",
    ingredients: baseIngredients,
  },
  {
    id: "oatmeal_raisin_cookie",
    name: "Oatmeal Raisin Cookie",
    aliases: ["oatmeal raisin cookie", "oatmeal", "orc"],
    value: 3,
    image: "https://i.imgur.com/9IhR8Kt.png",
    ingredients: {
      ...baseIngredients,
      oatmeal: 3,
      raisin: 3,
    },
  },
  {
    id: "chocolate_chip_cookie",
    name: "Chocolate Chip Cookie",
    aliases: ["chocolate chip cookie", "chocolatechip", "ccc"],
    value: 3,
    image: "https://i.imgur.com/Cumfd5A.png",
    ingredients: {
      ...baseIngredients,
      milk: 3,
      chocolate_chip: 3,
    },
  },
  {
    id: "peanut_butter_cookie",
    name: "Peanut Butter Cookie",
    aliases: ["peanut butter cookie", "peanut", "pbc"],
    value: 3,
    image: "https://i.imgur.com/M4klosF.png",
    ingredients: {
      ...baseIngredients,
      butter: 3,
      peanut_butter: 3,
    },
  },
  {
    id: "snickerdoodle_cookie",
    name: "Snickerdoodle Cookie",
    aliases: ["snickerdoodle cookie", "snickerdoodle", "snc"],
    value: 3,
    image: "https://i.imgur.com/CKDwcMY.png",
    ingredients: {
      ...baseIngredients,
      sugar: 3,
      cinnamon: 3,
    },
  },
  {
    id: "macadamia_nut_cookie",
    name: "Macadamia Nut Cookie",
    aliases: ["macadamia nut cookie", "macadamia", "mnc"],
    value: 3,
    image: "https://i.imgur.com/LBEH6qf.png",
    ingredients: {
      ...baseIngredients,
      white_chocolate: 3,
      macadamia_nut: 3,
    },
  },
];
