import { ShopSheet } from "./sheets/shop-sheet.js";
import { MODULE_ID } from "./transaction.js";
import { registerSidebarButton } from "./sidebar.js";
Hooks.once("init", () => {
    console.log(`${MODULE_ID} | Initializing`);
    DocumentSheetConfig.registerSheet(Actor, MODULE_ID, ShopSheet, {
        types: ["loot"],
        makeDefault: false,
        label: "PF2e Shop",
    });
    registerSidebarButton();
});
Hooks.once("ready", () => {
    console.log(`${MODULE_ID} | Ready`);
});
//# sourceMappingURL=main.js.map