"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shop_model_js_1 = require("./data/shop-model.js");
const shop_sheet_js_1 = require("./sheets/shop-sheet.js");
const transaction_js_1 = require("./transaction.js");
Hooks.once("init", () => {
    console.log(`${transaction_js_1.MODULE_ID} | Initializing`);
    // Register the shop data model so Foundry knows the shape of shop actor data.
    CONFIG.Actor.dataModels[`${transaction_js_1.MODULE_ID}.shop`] = shop_model_js_1.ShopDataModel;
    // Register the custom sheet for shop actors.
    DocumentSheetConfig.registerSheet(Actor, transaction_js_1.MODULE_ID, shop_sheet_js_1.ShopSheet, {
        types: [`${transaction_js_1.MODULE_ID}.shop`],
        makeDefault: true,
        label: "PF2e Shop",
    });
});
Hooks.once("ready", () => {
    console.log(`${transaction_js_1.MODULE_ID} | Ready`);
});
//# sourceMappingURL=main.js.map