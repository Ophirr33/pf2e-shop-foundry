import { MODULE_ID } from "./transaction.js";
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
                        const root = html[0] ?? html;
                        const val = root.querySelector('[name="shop-name"]')?.value;
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
export function registerSidebarButton() {
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
                type: `${MODULE_ID}.shop`,
                img: "icons/environment/settlement/market.webp",
            });
            actor?.sheet?.render(true);
        });
        footer.appendChild(btn);
    });
}
//# sourceMappingURL=sidebar.js.map