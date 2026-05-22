"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSidebarButton = registerSidebarButton;
const transaction_js_1 = require("./transaction.js");
async function promptShopName() {
    return new Promise((resolve) => {
        new Dialog({
            title: "Create Shop",
            content: `<div class="form-group">
        <label>Shop Name</label>
        <input type="text" name="shop-name" value="New Shop" autofocus />
      </div>`,
            buttons: {
                create: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Create",
                    callback: (html) => {
                        const val = html.querySelector('[name="shop-name"]')?.value;
                        resolve(val || "New Shop");
                    },
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => resolve(null),
                },
            },
            default: "create",
        }).render(true);
    });
}
function registerSidebarButton() {
    Hooks.on("renderActorDirectory", (_app, html) => {
        if (!game.user?.isGM)
            return;
        if (html.querySelector(".create-shop-btn"))
            return; // already injected
        const footer = html.querySelector("footer");
        if (!footer)
            return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "create-shop-btn";
        btn.innerHTML = '<i class="fa-solid fa-store"></i> Create Shop';
        btn.addEventListener("click", async () => {
            const name = await promptShopName();
            if (!name)
                return;
            const actor = await Actor.create({
                name,
                type: `${transaction_js_1.MODULE_ID}.shop`,
                img: "icons/environment/settlement/market.webp",
            });
            actor?.sheet?.render(true);
        });
        footer.appendChild(btn);
    });
}
//# sourceMappingURL=sidebar.js.map