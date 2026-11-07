import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";
import type { Product } from "@/data/catalog";

type Row = any;

function jsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export const getRetailCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const [rows, imageRows, categories, offers, offerProducts] = await Promise.all([
    db
      .prepare(
        `SELECT p.*,c.name category,c.slug category_slug
         FROM products p JOIN product_categories c ON c.id=p.category_id
         WHERE p.active=1 AND p.deleted_at IS NULL AND c.active=1 ORDER BY c.sort_order,p.featured DESC,p.id DESC`,
      )
      .all<Row>(),
    db
      .prepare("SELECT product_id,path,sort_order FROM product_images ORDER BY sort_order,id")
      .all<Row>(),
    db
      .prepare(
        "SELECT id,name,slug,description,image,sort_order FROM product_categories WHERE active=1 ORDER BY sort_order,name",
      )
      .all<Row>(),
    db
      .prepare(
        `SELECT * FROM offers WHERE active=1
         AND (starts_at IS NULL OR starts_at<=CURRENT_TIMESTAMP)
         AND (ends_at IS NULL OR ends_at>=CURRENT_TIMESTAMP) ORDER BY id DESC`,
      )
      .all<Row>(),
    db.prepare("SELECT offer_id,product_id FROM offer_products").all<Row>(),
  ]);
  const imageMap = new Map<number, string[]>();
  for (const image of imageRows) {
    const list = imageMap.get(Number(image.product_id)) ?? [];
    list.push(String(image.path));
    imageMap.set(Number(image.product_id), list);
  }
  const offerProductMap = new Map<number, Set<number>>();
  for (const item of offerProducts) {
    const set = offerProductMap.get(Number(item.offer_id)) ?? new Set<number>();
    set.add(Number(item.product_id));
    offerProductMap.set(Number(item.offer_id), set);
  }
  const products: Product[] = rows.map((row) => {
    const gallery = imageMap.get(Number(row.id)) ?? [];
    if (!gallery.length && row.image) gallery.push(String(row.image));
    const groups = jsonArray(row.product_groups);
    if (row.featured && !groups.includes("bestsellers")) groups.push("bestsellers");
    if (row.is_new && !groups.includes("new")) groups.push("new");
    const offer = offers.find((candidate) => {
      const selected = offerProductMap.get(Number(candidate.id));
      if (selected?.size) return selected.has(Number(row.id));
      return !candidate.category_id || Number(candidate.category_id) === Number(row.category_id);
    });
    return {
      id: String(row.source_id || `DB-${row.id}`),
      slug: String(row.slug),
      name: String(row.name),
      category: String(row.category),
      categorySlug: String(row.category_slug),
      groups,
      price: Number(row.retail_price),
      mrp: Math.max(Number(row.mrp || 0), Number(row.retail_price)),
      wholesalePrice: Number(row.wholesale_price),
      moq: Number(row.minimum_quantity),
      rating: Number(row.rating || 0),
      reviews: Number(row.review_count || 0),
      image: gallery[0] || String(row.image || ""),
      hoverImage: gallery[1] || gallery[0] || String(row.image || ""),
      gallery,
      isClientProduct: gallery.length > 1,
      inStock: Number(row.stock) > 0,
      isNew: Boolean(row.is_new),
      wholesale: Boolean(row.wholesale_enabled),
      botanical: String(row.botanical || "Plantae sp."),
      sunlight: row.sunlight || "Bright Indirect",
      water: row.water_requirement || "Medium",
      size: row.size_label || "Medium",
      potSize: String(row.pot_size || "6 inch"),
      potType: String(row.pot_type || "Nursery Pot"),
      placement: row.placement || "Indoor",
      petSafe: Boolean(row.pet_safe),
      difficulty: row.difficulty || "Easy",
      description: String(row.description || ""),
      care: jsonArray(row.care_instructions),
      offerId: offer ? Number(offer.id) : undefined,
      offerName: offer ? String(offer.name) : undefined,
      offerType: offer?.offer_type,
      offerValue: offer ? Number(offer.discount_value) : undefined,
      offerBuyQuantity: offer ? Number(offer.buy_quantity) : undefined,
      offerRewardQuantity: offer ? Number(offer.reward_quantity) : undefined,
    } as Product;
  });
  return {
    products,
    categories: categories.map((category) => ({
      id: Number(category.id),
      name: String(category.name),
      slug: String(category.slug),
      description: category.description ? String(category.description) : null,
      image: category.image ? String(category.image) : null,
      sortOrder: Number(category.sort_order),
    })),
  };
});
