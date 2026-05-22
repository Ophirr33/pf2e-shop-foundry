import { ShopDataModel } from "./data/shop-model.js";
import { ShopSheet } from "./sheets/shop-sheet.js";
import { MODULE_ID } from "./transaction.js";
import { registerSidebarButton } from "./sidebar.js";

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initializing`);

  CONFIG.Actor.dataModels[`${MODULE_ID}.shop`] = ShopDataModel;

  DocumentSheetConfig.registerSheet(Actor, MODULE_ID, ShopSheet, {
    types: [`${MODULE_ID}.shop`],
    makeDefault: true,
    label: "PF2e Shop",
  });

  registerSidebarButton();
});

Hooks.once("ready", () => {
  console.log(`${MODULE_ID} | Ready`);
});
