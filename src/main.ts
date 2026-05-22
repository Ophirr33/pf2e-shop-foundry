import { ShopDataModel } from "./data/shop-model.js";
import { ShopSheet } from "./sheets/shop-sheet.js";
import { MODULE_ID } from "./transaction.js";

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initializing`);

  // Register the shop data model so Foundry knows the shape of shop actor data.
  CONFIG.Actor.dataModels[`${MODULE_ID}.shop`] = ShopDataModel;

  // Register the custom sheet for shop actors.
  DocumentSheetConfig.registerSheet(Actor, MODULE_ID, ShopSheet, {
    types: [`${MODULE_ID}.shop`],
    makeDefault: true,
    label: "PF2e Shop",
  });
});

Hooks.once("ready", () => {
  console.log(`${MODULE_ID} | Ready`);
});
