import { ITEMS as FALLBACK_ITEMS, RARITY_COLORS } from '../data/items.js';

export { RARITY_COLORS, FALLBACK_ITEMS };

export function getItemsCatalogMap(itemsCatalog) {
  if (itemsCatalog && Object.keys(itemsCatalog).length > 0) {
    return itemsCatalog;
  }

  return FALLBACK_ITEMS;
}

export function getAllItems(itemsCatalog) {
  return Object.values(getItemsCatalogMap(itemsCatalog));
}

export function getItemById(itemsCatalog, itemId) {
  if (!itemId) return null;
  return getItemsCatalogMap(itemsCatalog)[itemId] ?? null;
}

export function findItemByEffect(itemsCatalog, effect) {
  if (!effect) return null;

  return getAllItems(itemsCatalog).find(item => (
    item.effectKey === effect.key
    || item.name === effect.itemName
    || `${item.effectKey}_target` === effect.key
    || (item.effectKey === 'phoenix_restore' && effect.key === 'phoenix_bonus')
  )) ?? null;
}
