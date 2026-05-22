import { buyItem, getItemPrice, setPriceOverride } from "../transaction.js";
import { getFlag } from "../flags.js";

// Extracting the mixin result to a const prevents TypeScript from hitting its
// recursive type-depth limit when checking the ShopSheet class definition.
const ShopSheetBase = foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
);

// @ts-expect-error - TS2415: the mixin produces types too deep for tsc to verify;
// the inheritance is correct at runtime.
export class ShopSheet extends ShopSheetBase {
  static override DEFAULT_OPTIONS = {
    classes: ["pf2e-shop", "sheet", "actor"],
    position: { width: 600, height: 500 },
    window: { resizable: true },
    actions: {
      buyItem: ShopSheet.#onBuyItem,
      removeItem: ShopSheet.#onRemoveItem,
      setPrice: ShopSheet.#onSetPrice,
    },
  };

  static override PARTS = {
    header: { template: "modules/pf2e-shop-foundry/templates/shop-header.hbs" },
    body: { template: "" }, // set dynamically in _configureRenderOptions
  };

  get isGM(): boolean {
    return game.user?.isGM ?? false;
  }

  override get title(): string {
    return this.document.name ?? "Shop";
  }

  override _configureRenderOptions(options: object): void {
    super._configureRenderOptions(options);
    ShopSheet.PARTS.body = {
      template: this.isGM
        ? "modules/pf2e-shop-foundry/templates/shop-gm.hbs"
        : "modules/pf2e-shop-foundry/templates/shop-player.hbs",
    };
  }

  override async _prepareContext(options: object & { isFirstRender: boolean }) {
    const base = await super._prepareContext(options as never);
    const actor = this.document;

    const items = actor.items.map((item) => {
      const id = item.id!; // embedded documents always have ids
      const priceGp = getItemPrice(actor, id) ?? 0;
      return {
        id,
        name: item.name,
        img: item.img,
        priceGp,
        priceDisplay: `${priceGp} gp`,
      };
    });

    // game.user.character is PF2e-specific — cast through unknown.
    const buyer = (game.user?.character ?? null) as Actor.Implementation | null;
    const pf2eCurrency = (buyer as unknown as {
      system?: { currency?: { pp: number; gp: number; sp: number; cp: number } };
    })?.system?.currency;

    const buyerGold = pf2eCurrency
      ? pf2eCurrency.pp * 10 + pf2eCurrency.gp + pf2eCurrency.sp / 10 + pf2eCurrency.cp / 100
      : null;

    return {
      ...base,
      actor,
      items,
      isGM: this.isGM,
      shopkeeperName: getFlag(actor, "shopkeeperName") ?? "",
      buyer,
      buyerGold,
    };
  }

  static async #onBuyItem(this: ShopSheet, _event: PointerEvent, target: HTMLElement): Promise<void> {
    const itemId = target.dataset.itemId;
    if (!itemId) return;

    const buyer = (game.user?.character ?? null) as Actor.Implementation | null;
    if (!buyer) {
      ui.notifications?.warn("You have no active character assigned.");
      return;
    }

    const result = await buyItem(this.document, itemId, buyer);
    if (result.success) {
      const item = this.document.items.get(itemId);
      ui.notifications?.info(`Purchased ${item?.name ?? "item"}.`);
    } else {
      ui.notifications?.warn(result.reason ?? "Purchase failed.");
    }
  }

  static async #onRemoveItem(this: ShopSheet, _event: PointerEvent, target: HTMLElement): Promise<void> {
    const itemId = target.dataset.itemId;
    if (!itemId) return;
    await this.document.deleteEmbeddedDocuments("Item", [itemId]);
  }

  static async #onSetPrice(this: ShopSheet, _event: PointerEvent, target: HTMLElement): Promise<void> {
    const row = target.closest<HTMLElement>("[data-item-id]");
    const itemId = row?.dataset.itemId;
    const input = row?.querySelector<HTMLInputElement>("input[name='price']");
    if (!itemId || !input) return;
    const gp = parseFloat(input.value);
    if (!isNaN(gp) && gp >= 0) {
      await setPriceOverride(this.document, itemId, gp);
    }
  }
}
