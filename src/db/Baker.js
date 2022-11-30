import mongoose from "mongoose";

const Baker = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  server: {
    type: String,
    required: true,
  },
  lastIngredientRoll: {
    type: Date,
    default: null,
  },
  score: {
    type: Number,
    default: 0,
  },
  cookies: {
    sugar_cookie: {
      type: Number,
      default: 0,
    },
    oatmeal_raisin_cookie: {
      type: Number,
      default: 0,
    },
    chocolate_chip_cookie: {
      type: Number,
      default: 0,
    },
    peanut_butter_cookie: {
      type: Number,
      default: 0,
    },
    snickerdoodle_cookie: {
      type: Number,
      default: 0,
    },
    macadamia_nut_cookie: {
      type: Number,
      default: 0,
    },
  },
  ingredients: {
    flour: {
      type: Number,
      default: 0,
    },
    milk: {
      type: Number,
      default: 0,
    },
    eggs: {
      type: Number,
      default: 0,
    },
    sugar: {
      type: Number,
      default: 0,
    },
    butter: {
      type: Number,
      default: 0,
    },
    oatmeal: {
      type: Number,
      default: 0,
    },
    raisin: {
      type: Number,
      default: 0,
    },
    chocolate_chip: {
      type: Number,
      default: 0,
    },
    peanut_butter: {
      type: Number,
      default: 0,
    },
    cinnamon: {
      type: Number,
      default: 0,
    },
    white_chocolate: {
      type: Number,
      default: 0,
    },
    macadamia_nut: {
      type: Number,
      default: 0,
    },
  },
});

export const baker = mongoose.model("Baker", Baker);
