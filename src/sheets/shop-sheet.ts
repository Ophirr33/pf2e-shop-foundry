import { MODULE_ID, buyItem, getItemPrice, setPriceOverride } from "../transaction.js";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class ShopSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
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
    body: { template: "" }, // resolved dynamically
  };

  get isGM(): boolean {
    return game.user?.isGM ?? false;
  }

  override get title(): string {
    return this.actor.name ?? "Shop";
  }

  override async _prepareContext(options: unknown) {
    const base = await super._prepareContext(options);
    const actor = this.actor;
    const items = actor.items.map((item) => {
      const priceGp = getItemPrice(actor, item.id) ?? 0;
      return {
        id: item.id,
        name: item.name,
        img: item.img,
        priceGp,
        priceDisplay: priceGp === 1 ? "1 gp" : `${priceGp} gp`,
      };
    });

    const buyer = game.user?.character ?? null;
    const buyerCurrency = (buyer as unknown as { system?: { currency?: { pp: number; gp: number; sp: number; cp: number } } } | null)
      ?.system?.currency;

    return {
      ...base,
      actor,
      items,
      isGM: this.isGM,
      shopkeeperName: (actor.system as unknown as { shopkeeperName?: string }).shopkeeperName ?? "",
      buyer,
      buyerGold: buyerCurrency
        ? buyerCurrency.pp * 10 + buyerCurrency.gp + buyerCurrency.sp / 10 + buyerCurrency.cp / 100
        : null,
    };
  }

  override _configureRenderOptions(options: Record<string, unknown>) {
    super._configureRenderOptions(options);
    // Swap the body template depending on viewer.
    (this.constructor as typeof ShopSheet).PARTS.body = {
      template: this.isGM
        ? "modules/pf2e-shop-foundry/templates/shop-gm.hbs"
        : "modules/pf2e-shop-foundry/templates/shop-player.hbs",
    };
  }

  static async #onBuyItem(
    this: ShopSheet,
    _event: PointerEvent,
    target: HTMLElement
  ): Promise<void> {
    const itemId = target.dataset.itemId;
    if (!itemId) return;

    const buyer = game.user?.character as Actor | null;
    if (!buyer) {
      ui.notifications.warn("You have no active character assigned.");
      return;
    }

    const result = await buyItem(this.actor, itemId, buyer);
    if (result.success) {
      const item = this.actor.items.get(itemId);
      ui.notifications.info(`Purchased ${item?.name ?? "item"}.`);
    } else {
      ui.notifications.warn(result.reason ?? "Purchase failed.");
    }
  }

  static async #onRemoveItem(
    this: ShopSheet,
    _event: PointerEvent,
    target: HTMLElement
  ): Promise<void> {
    const itemId = target.dataset.itemId;
    if (!itemId) return;
    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  static async #onSetPrice(
    this: ShopSheet,
    _event: PointerEvent,
    target: HTMLElement
  ): Promise<void> {
    const itemId = target.closest<HTMLElement>("[data-item-id]")?.dataset.itemId;
    const input = target.closest<HTMLElement>("[data-item-id]")
      ?.querySelector<HTMLInputElement>("input[name='price']");
    if (!itemId || !input) return;
    const gp = parseFloat(input.value);
    if (!isNaN(gp) && gp >= 0) {
      await setPriceOverride(this.actor, itemId, gp);
    }
  }
}
