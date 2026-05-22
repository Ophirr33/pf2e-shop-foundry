"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODULE_ID = void 0;
exports.getItemPrice = getItemPrice;
exports.setPriceOverride = setPriceOverride;
exports.buyItem = buyItem;
exports.MODULE_ID = "pf2e-shop-foundry";
/** PF2e coin values in copper pieces. */
const CP_VALUE = { pp: 1000, gp: 100, sp: 10, cp: 1 };
function totalCopper(currency) {
    return Object.keys(CP_VALUE).reduce((sum, k) => sum + (currency[k] ?? 0) * CP_VALUE[k], 0);
}
function copperToCurrency(copper) {
    const pp = Math.floor(copper / 1000);
    copper -= pp * 1000;
    const gp = Math.floor(copper / 100);
    copper -= gp * 100;
    const sp = Math.floor(copper / 10);
    copper -= sp * 10;
    return { pp, gp, sp, cp: copper };
}
function getItemPrice(shopActor, itemId) {
    const overrides = (shopActor.getFlag(exports.MODULE_ID, "priceOverrides") ?? []);
    const override = overrides.find((o) => o.itemId === itemId);
    if (override)
        return override.gp;
    const item = shopActor.items.get(itemId);
    if (!item)
        return null;
    // Fall back to the PF2e item price field.
    const price = item
        .system?.price?.value?.gp;
    return price ?? 0;
}
async function setPriceOverride(shopActor, itemId, gp) {
    const overrides = (shopActor.getFlag(exports.MODULE_ID, "priceOverrides") ?? []);
    const idx = overrides.findIndex((o) => o.itemId === itemId);
    if (idx >= 0)
        overrides[idx].gp = gp;
    else
        overrides.push({ itemId, gp });
    await shopActor.setFlag(exports.MODULE_ID, "priceOverrides", overrides);
}
async function buyItem(shopActor, itemId, buyerActor) {
    const item = shopActor.items.get(itemId);
    if (!item)
        return { success: false, reason: "Item not found in shop." };
    const priceGp = getItemPrice(shopActor, itemId) ?? 0;
    const costCp = priceGp * 100;
    const currency = buyerActor.system?.currency ?? { pp: 0, gp: 0, sp: 0, cp: 0 };
    const availableCp = totalCopper(currency);
    if (availableCp < costCp) {
        return { success: false, reason: "Not enough currency." };
    }
    const remaining = copperToCurrency(availableCp - costCp);
    await buyerActor.update({ "system.currency": remaining });
    // Grant a copy of the item to the buyer.
    await buyerActor.createEmbeddedDocuments("Item", [item.toObject()]);
    return { success: true };
}
//# sourceMappingURL=transaction.js.map