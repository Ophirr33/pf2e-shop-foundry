export const MODULE_ID = "pf2e-shop-foundry";

/** PF2e coin values in copper pieces. */
const CP_VALUE = { pp: 1000, gp: 100, sp: 10, cp: 1 };
type CoinType = keyof typeof CP_VALUE;

function totalCopper(currency: Record<CoinType, number>): number {
  return (Object.keys(CP_VALUE) as CoinType[]).reduce(
    (sum, k) => sum + (currency[k] ?? 0) * CP_VALUE[k],
    0
  );
}

function copperToCurrency(copper: number): Record<CoinType, number> {
  const pp = Math.floor(copper / 1000);
  copper -= pp * 1000;
  const gp = Math.floor(copper / 100);
  copper -= gp * 100;
  const sp = Math.floor(copper / 10);
  copper -= sp * 10;
  return { pp, gp, sp, cp: copper };
}

export interface PriceOverride {
  itemId: string;
  /** Price in gold pieces. */
  gp: number;
}

export function getItemPrice(shopActor: Actor, itemId: string): number | null {
  const overrides = (shopActor.getFlag(MODULE_ID, "priceOverrides") ?? []) as PriceOverride[];
  const override = overrides.find((o) => o.itemId === itemId);
  if (override) return override.gp;

  const item = shopActor.items.get(itemId);
  if (!item) return null;

  // Fall back to the PF2e item price field.
  const price = (item as unknown as { system?: { price?: { value?: { gp?: number } } } })
    .system?.price?.value?.gp;
  return price ?? 0;
}

export async function setPriceOverride(
  shopActor: Actor,
  itemId: string,
  gp: number
): Promise<void> {
  const overrides = (shopActor.getFlag(MODULE_ID, "priceOverrides") ?? []) as PriceOverride[];
  const idx = overrides.findIndex((o) => o.itemId === itemId);
  if (idx >= 0) overrides[idx].gp = gp;
  else overrides.push({ itemId, gp });
  await shopActor.setFlag(MODULE_ID, "priceOverrides", overrides);
}

export async function buyItem(
  shopActor: Actor,
  itemId: string,
  buyerActor: Actor
): Promise<{ success: boolean; reason?: string }> {
  const item = shopActor.items.get(itemId);
  if (!item) return { success: false, reason: "Item not found in shop." };

  const priceGp = getItemPrice(shopActor, itemId) ?? 0;
  const costCp = priceGp * 100;

  const currency = (
    buyerActor as unknown as { system?: { currency?: Record<CoinType, number> } }
  ).system?.currency ?? { pp: 0, gp: 0, sp: 0, cp: 0 };

  const availableCp = totalCopper(currency as Record<CoinType, number>);
  if (availableCp < costCp) {
    return { success: false, reason: "Not enough currency." };
  }

  const remaining = copperToCurrency(availableCp - costCp);
  await buyerActor.update({ "system.currency": remaining });

  // Grant a copy of the item to the buyer.
  await buyerActor.createEmbeddedDocuments("Item", [item.toObject()]);

  return { success: true };
}
