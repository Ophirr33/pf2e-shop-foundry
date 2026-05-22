/**
 * LOFD types use FlagConfig keyed by document-type name ("Actor", "Item", etc.),
 * not by module ID. Augmenting it correctly for every document type is complex,
 * so we centralise all flag access here and isolate the casts to one file.
 */

export interface ShopFlags {
  isShop: boolean;
  priceOverrides: Array<{ itemId: string; gp: number }>;
  shopkeeperName: string;
}

const MODULE_SCOPE = "pf2e-shop-foundry" as never;

export function getFlag<K extends keyof ShopFlags>(
  doc: foundry.abstract.Document.Any,
  key: K
): ShopFlags[K] | undefined {
  return doc.getFlag(MODULE_SCOPE, key as never) as ShopFlags[K] | undefined;
}

export async function setFlag<K extends keyof ShopFlags>(
  doc: foundry.abstract.Document.Any,
  key: K,
  value: ShopFlags[K]
): Promise<void> {
  await doc.setFlag(MODULE_SCOPE, key as never, value as never);
}
