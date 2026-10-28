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

export const newIndoorImages = {
  anthuriumBrown: [image("Anthurium brown 5” pot 329rs.webp")],
  anthuriumOrange: [image("Anthurium orange 5” pot 329rs.webp")],
  anthuriumPink: [image("Anthurium pink 5” pot 329rs.webp")],
  anthuriumPinkVariegated: [image("Anthurium Pink verigated 5” pot 329rs.webp")],
  anthuriumRed: [image("Anthurium Red 5” pot 329rs(1).webp"), image("20261024_125256.webp")],
  anthuriumRedVine: [image("Anthurium red vine 5” pot 329rs.webp")],
  anthuriumWhite: [image("Anthurium White 5” pot 329rs.webp")],
  calatheaPeacock: [
    image("Calethiya peacock 6” pot 699rs.webp"),
    image("20261024_131938_edited.webp"),
  ],
  chamaedoreaElegans: [
    image("Chamundra elegance 5” pot 299rs.webp"),
    image("edited_palm_plant.webp"),
  ],
  chrysanthemumBrownie: [
    image("Chrysanthemum brownie 5” pot 199rs.webp"),
    image("20261024_124834.webp"),
  ],
  chrysanthemumYellow: [image("20261024_124908.webp")],
  dracaenaDaraSingh: [image("Drecina Dara Singh 5” pot 299rs.webp")],
  greenUmbrellaPlant: [image("Green umbrella plant 5” pot 349rs.webp")],
  philodendronGreenXanadu: [
    image("Philodendron Green Xandu 5” pot 249rs.webp"),
    image("20261024_130342.webp"),
    image("20261024_130730_edited.webp"),
  ],
  syngoniumAiroGreen: [image("Singonium airo green 5” pot 249rs.webp")],
  syngoniumAlboWhite: [image("Singonium albo white 5” pot 249rs.webp")],
  syngoniumBrownie: [image("Singonium brownie 5” pot 249rs.webp")],
  syngoniumPinkPerfection: [image("Singonium pink perfection 5” pot 249rs.webp")],
  variegatedAlpinia: [
    image("Verigated alpenia 5” pot 549rs.webp"),
    image("20261024_130941_edited.webp"),
  ],
} as const;
