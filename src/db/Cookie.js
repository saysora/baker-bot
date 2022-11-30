import mongoose from "mongoose";

const Cookie = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    aliases: [{ type: String }],
    value: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: "",
    },
    ingredients: {
      type: Map,
      of: Number,
    },
  }
  // {
  //   virtuals: {
  //     ingrs: {
  //       get() {
  //         const ingredients = {};
  //         for (const ingr of this.ingredients) {
  //           ingredients[ingr.name] = ingr.amount;
  //         }
  //         return ingredients;
  //       },
  //     },
  //   },
  // }
);

export const cookie = mongoose.model("Cookie", Cookie);
