"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopSheet = void 0;
const transaction_js_1 = require("../transaction.js");
const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;
class ShopSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
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
        body: { template: "" }, // resolved dynamically
    };
    get isGM() {
        return game.user?.isGM ?? false;
    }
    get title() {
        return this.actor.name ?? "Shop";
    }
    async _prepareContext(options) {
        const base = await super._prepareContext(options);
        const actor = this.actor;
        const items = actor.items.map((item) => {
            const priceGp = (0, transaction_js_1.getItemPrice)(actor, item.id) ?? 0;
            return {
                id: item.id,
                name: item.name,
                img: item.img,
                priceGp,
                priceDisplay: priceGp === 1 ? "1 gp" : `${priceGp} gp`,
            };
        });
        const buyer = game.user?.character ?? null;
        const buyerCurrency = buyer
            ?.system?.currency;
        return {
            ...base,
            actor,
            items,
            isGM: this.isGM,
            shopkeeperName: actor.system.shopkeeperName ?? "",
            buyer,
            buyerGold: buyerCurrency
                ? buyerCurrency.pp * 10 + buyerCurrency.gp + buyerCurrency.sp / 10 + buyerCurrency.cp / 100
                : null,
        };
    }
    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        // Swap the body template depending on viewer.
        this.constructor.PARTS.body = {
            template: this.isGM
                ? "modules/pf2e-shop-foundry/templates/shop-gm.hbs"
                : "modules/pf2e-shop-foundry/templates/shop-player.hbs",
        };
    }
    static async #onBuyItem(_event, target) {
        const itemId = target.dataset.itemId;
        if (!itemId)
            return;
        const buyer = game.user?.character;
        if (!buyer) {
            ui.notifications.warn("You have no active character assigned.");
            return;
        }
        const result = await (0, transaction_js_1.buyItem)(this.actor, itemId, buyer);
        if (result.success) {
            const item = this.actor.items.get(itemId);
            ui.notifications.info(`Purchased ${item?.name ?? "item"}.`);
        }
        else {
            ui.notifications.warn(result.reason ?? "Purchase failed.");
        }
    }
    static async #onRemoveItem(_event, target) {
        const itemId = target.dataset.itemId;
        if (!itemId)
            return;
        await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    }
    static async #onSetPrice(_event, target) {
        const itemId = target.closest("[data-item-id]")?.dataset.itemId;
        const input = target.closest("[data-item-id]")
            ?.querySelector("input[name='price']");
        if (!itemId || !input)
            return;
        const gp = parseFloat(input.value);
        if (!isNaN(gp) && gp >= 0) {
            await (0, transaction_js_1.setPriceOverride)(this.actor, itemId, gp);
        }
    }
}
exports.ShopSheet = ShopSheet;
//# sourceMappingURL=shop-sheet.js.map