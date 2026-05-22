/**
 * LOFD types use FlagConfig keyed by document-type name ("Actor", "Item", etc.),
 * not by module ID. Augmenting it correctly for every document type is complex,
 * so we centralise all flag access here and isolate the casts to one file.
 */
const MODULE_SCOPE = "pf2e-shop-foundry";
export function getFlag(doc, key) {
    return doc.getFlag(MODULE_SCOPE, key);
}
export async function setFlag(doc, key, value) {
    await doc.setFlag(MODULE_SCOPE, key, value);
}
//# sourceMappingURL=flags.js.map