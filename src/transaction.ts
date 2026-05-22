import { getFlag, setFlag } from "./flags.js";

export const MODULE_ID = "pf2e-shop-foundry";

const CP_VALUE = { pp: 1000, gp: 100, sp: 10, cp: 1 };
type CoinType = keyof typeof CP_VALUE;
type PF2eCurrency = Record<CoinType, number>;

function totalCopper(currency: PF2eCurrency): number {
  return (Object.keys(CP_VALUE) as CoinType[]).reduce(
    (sum, k) => sum + (currency[k] ?? 0) * CP_VALUE[k],
    0
  );
}

function copperToCurrency(copper: number): PF2eCurrency {
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
  gp: number;
}

export function getItemPrice(shopActor: Actor.Implementation, itemId: string): number | null {
  const overrides = getFlag(shopActor, "priceOverrides") ?? [];
  const override = overrides.find((o) => o.itemId === itemId);
  if (override) return override.gp;

  const item = shopActor.items.get(itemId);
  if (!item) return null;

  // PF2e item price lives at item.system.price.value.gp — cast through unknown.
  const price = (item as unknown as { system?: { price?: { value?: { gp?: number } } } })
    .system?.price?.value?.gp;
  return price ?? 0;
}

export async function setPriceOverride(
  shopActor: Actor.Implementation,
  itemId: string,
  gp: number
): Promise<void> {
  const overrides = [...(getFlag(shopActor, "priceOverrides") ?? [])];
  const idx = overrides.findIndex((o) => o.itemId === itemId);
  if (idx >= 0) overrides[idx].gp = gp;
  else overrides.push({ itemId, gp });
  await setFlag(shopActor, "priceOverrides", overrides);
}

export async function buyItem(
  shopActor: Actor.Implementation,
  itemId: string,
  buyerActor: Actor.Implementation
): Promise<{ success: boolean; reason?: string }> {
  const item = shopActor.items.get(itemId);
  if (!item) return { success: false, reason: "Item not found in shop." };

  const priceGp = getItemPrice(shopActor, itemId) ?? 0;
  const costCp = priceGp * 100;

  // PF2e stores currency at actor.system.currency — cast through unknown.
  const currency = (buyerActor as unknown as { system?: { currency?: PF2eCurrency } })
    .system?.currency ?? { pp: 0, gp: 0, sp: 0, cp: 0 };

  if (totalCopper(currency) < costCp) {
    return { success: false, reason: "Not enough currency." };
  }

  const remaining = copperToCurrency(totalCopper(currency) - costCp);

  // Actor.update with PF2e system data — cast required as LOFD types don't include PF2e schema.
  await (buyerActor as unknown as { update(data: Record<string, unknown>): Promise<unknown> })
    .update({ "system.currency": remaining });

  await buyerActor.createEmbeddedDocuments("Item", [item.toObject()]);
  return { success: true };
}
