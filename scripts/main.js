"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shop_model_js_1 = require("./data/shop-model.js");
const shop_sheet_js_1 = require("./sheets/shop-sheet.js");
const transaction_js_1 = require("./transaction.js");
const sidebar_js_1 = require("./sidebar.js");
Hooks.once("init", () => {
    console.log(`${transaction_js_1.MODULE_ID} | Initializing`);
    CONFIG.Actor.dataModels[`${transaction_js_1.MODULE_ID}.shop`] = shop_model_js_1.ShopDataModel;
    DocumentSheetConfig.registerSheet(Actor, transaction_js_1.MODULE_ID, shop_sheet_js_1.ShopSheet, {
        types: [`${transaction_js_1.MODULE_ID}.shop`],
        makeDefault: true,
        label: "PF2e Shop",
    });
    (0, sidebar_js_1.registerSidebarButton)();
});
Hooks.once("ready", () => {
    console.log(`${transaction_js_1.MODULE_ID} | Ready`);
});
//# sourceMappingURL=main.js.map