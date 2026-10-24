const assets = import.meta.glob<string>("./*.webp", {
  eager: true,
  import: "default",
});

function image(filename: string) {
  const value = assets[`./${filename}`];
  if (!value) throw new Error(`Missing indoor product image: ${filename}`);
  return value;
}

export const replacementIndoorImages = {
  pinstripeAglaonema: [image("01-striped-green-plant.webp"), image("01_pinstripe_aglaonema.webp")],
  redAglaonema: [image("02-red-aglaonema.webp"), image("02_red_aglaonema.webp")],
  pinkAglaonema: [
    image("03-pink-green-aglaonema.webp"),
    image("03_pink_variegated_aglaonema.webp"),
  ],
  asparagusFern: [
    image("04-asparagus-fern.webp"),
    image("04_asparagus_fern.webp"),
    image("05-asparagus-fern-variant.webp"),
  ],
  stripedDracaena: [image("05_striped_dracaena.webp")],
  neonPothos: [image("06-neon-pothos.webp")],
  pachiraMoneyTree: [image("06_pachira_money_tree.webp")],
} as const;
