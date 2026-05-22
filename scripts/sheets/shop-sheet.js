import { buyItem, getItemPrice, setPriceOverride } from "../transaction.js";
import { getFlag } from "../flags.js";
// Extracting the mixin result to a const prevents TypeScript from hitting its
// recursive type-depth limit when checking the ShopSheet class definition.
const ShopSheetBase = foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2);
// @ts-expect-error - TS2415: the mixin produces types too deep for tsc to verify;
// the inheritance is correct at runtime.
export class ShopSheet extends ShopSheetBase {
    static DEFAULT_OPTIONS = {
        classes: ["pf2e-shop", "sheet", "actor"],
        position: { width: 600, height: 500 },
        window: { resizable: true },
        actions: {
            buyItem: ShopSheet.#onBuyItem,
            removeItem: ShopSheet.#onRemoveItem,
            setPrice: ShopSheet.#onSetPrice,
        },
    };
    static PARTS = {
        header: { template: "modules/pf2e-shop-foundry/templates/shop-header.hbs" },
        body: { template: "" }, // set dynamically in _configureRenderOptions
    };
    get isGM() {
        return game.user?.isGM ?? false;
    }
    get title() {
        return this.document.name ?? "Shop";
    }
    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        ShopSheet.PARTS.body = {
            template: this.isGM
                ? "modules/pf2e-shop-foundry/templates/shop-gm.hbs"
                : "modules/pf2e-shop-foundry/templates/shop-player.hbs",
        };
    }
    async _prepareContext(options) {
        const base = await super._prepareContext(options);
        const actor = this.document;
        const items = actor.items.map((item) => {
            const id = item.id; // embedded documents always have ids
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
        const buyer = (game.user?.character ?? null);
        const pf2eCurrency = buyer?.system?.currency;
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
    static async #onBuyItem(_event, target) {
        const itemId = target.dataset.itemId;
        if (!itemId)
            return;
        const buyer = (game.user?.character ?? null);
        if (!buyer) {
            ui.notifications?.warn("You have no active character assigned.");
            return;
        }
        const result = await buyItem(this.document, itemId, buyer);
        if (result.success) {
            const item = this.document.items.get(itemId);
            ui.notifications?.info(`Purchased ${item?.name ?? "item"}.`);
        }
        else {
            ui.notifications?.warn(result.reason ?? "Purchase failed.");
        }
    }
    static async #onRemoveItem(_event, target) {
        const itemId = target.dataset.itemId;
        if (!itemId)
            return;
        await this.document.deleteEmbeddedDocuments("Item", [itemId]);
    }
    static async #onSetPrice(_event, target) {
        const row = target.closest("[data-item-id]");
        const itemId = row?.dataset.itemId;
        const input = row?.querySelector("input[name='price']");
        if (!itemId || !input)
            return;
        const gp = parseFloat(input.value);
        if (!isNaN(gp) && gp >= 0) {
            await setPriceOverride(this.document, itemId, gp);
        }
    }
}
//# sourceMappingURL=shop-sheet.js.map