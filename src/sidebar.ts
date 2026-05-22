import { MODULE_ID } from "./transaction.js";

const SHEET_CLASS_KEY = `${MODULE_ID}.ShopSheet`;

async function promptShopName(): Promise<string | null> {
  return new Promise((resolve) => {
    new foundry.applications.api.DialogV2({
      window: { title: "Create Shop" },
      content: `<div class="form-group">
        <label>Shop Name</label>
        <input type="text" name="shop-name" value="New Shop" autofocus />
      </div>`,
      buttons: [
        {
          action: "create",
          icon: "fas fa-check",
          label: "Create",
          default: true,
          callback: (_event: Event, _button: HTMLElement, dialog: HTMLElement) => {
            const val = dialog.querySelector<HTMLInputElement>('[name="shop-name"]')?.value;
            resolve(val || "New Shop");
          },
        },
        {
          action: "cancel",
          icon: "fas fa-times",
          label: "Cancel",
          callback: () => resolve(null),
        },
      ],
    }).render(true);
  });
}

export function registerSidebarButton(): void {
  Hooks.on("renderActorDirectory", (_app: unknown, html: HTMLElement) => {
    if (!game.user?.isGM) return;
    if (html.querySelector(".create-shop-btn")) return;

    const footer = html.querySelector("footer");
    if (!footer) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "create-shop-btn";
    btn.innerHTML = '<i class="fa-solid fa-store"></i> Create Shop';
    btn.addEventListener("click", async () => {
      const name = await promptShopName();
      if (!name) return;

      const actor = await Actor.create({
        name,
        type: "loot",
        img: "icons/environment/settlement/market.webp",
        flags: {
          [MODULE_ID]: { isShop: true },
          core: { sheetClass: SHEET_CLASS_KEY },
        },
      });
      actor?.sheet?.render(true);
    });

    footer.appendChild(btn);
  });
}
