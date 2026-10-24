const assets = import.meta.glob<string>("./*.webp", {
  eager: true,
  import: "default",
});

function image(filename: string) {
  const value = assets[`./${filename}`];
  if (!value) throw new Error(`Missing indoor plant image: ${filename}`);
  return value;
}

export const indoorImages = {
  moneyPlant: [image("IMG_1087.webp")],
  aglaonemaEllen: [
    image("aglaonema_brown_pot.webp"),
    image("Variegated_Aglaonema_Black_Pot.webp"),
    image("IMG_1107.webp"),
  ],
  aglaonemaLadyValentine: [
    image("Aglonima lady velntine 5” pot 449rs(2).webp"),
    image("Red_Aglaonema_Plant.webp"),
  ],
  aglaonemaPink: [
    image("Aglonima pink 6” brown pot 449rs(2).webp"),
    image("Pink_Aglaonema_Plant.webp"),
  ],
  aglaonemaSilverLine: [image("Aglonima silver line 5” black pot 399rs.webp")],
  aglaonemaSuperWhite: [image("Aglonima super white 5” white pot 499rs.webp")],
  anthuriumJenmanii: [
    image("Anthurium jenmanii 5” brown pot  1099rs(2).webp"),
    image("Tropical_Green_Plant_Brown_Pot.webp"),
  ],
  asparagus: [
    image("Asupargus 5” brown pot 249rs(2).webp"),
    image("Asupargus 5” pot 249rs(2).webp"),
  ],
  birdNestFern: [
    image("Bird Nest fern 6”  black pot  price 299.webp"),
    image("Birds_Nest_Fern_Black_Pot.webp"),
  ],
  calatheaMunjentha: [
    image("Calethiya munjentha 5” black pot 499rs.webp"),
    image("Calathea_Plant.webp"),
  ],
  calatheaRoseopicta: [
    image("Calethiya rospicta 5” brown pot 449rs.webp"),
    image("Calathea_Pink_Silver.webp"),
    image("IMG_1153.webp"),
  ],
  calatheaRufibarba: [image("Calethiya rufibarba 6” pot 499rs.webp"), image("Calathea_Plant.webp")],
  calatheaSilver: [image("Calethiya silver  6” pot 499.webp"), image("Calathea_Silver.webp")],
  calatheaZebrina: [
    image("Calethiya_zebrenia_5inch_black_pot_499.webp"),
    image("Calathea_Zebrina.webp"),
  ],
  dieffenbachiaDumbCane: [image("Daifanbechiya_Dumbcane_349.webp"), image("IMG_1081(1).webp")],
  dracaenaCompacta: [
    image("Dracaena_Compacta_5inch_Brown_Pot_349.webp"),
    image("Green_Dracaena_Terracotta_Pot.webp"),
  ],
  dracaenaLemonLime: [
    image("Drecina lemon 6” black pot 499rs(3).webp"),
    image("Variegated_Dracaena_Plant.webp"),
    image("IMG_1117.webp"),
  ],
  goldenHomalomena: [image("Golden_Homolomina_5inch_Pot_449.webp")],
  philodendronBirkin: [image("Philo birqin 5” white pot 499rs.webp"), image("IMG_1089.webp")],
  pachiraBonsai: [image("Puchira bonsai 5” pot 499rs.webp"), image("Money_Tree.webp")],
  sansevieria: [
    image("Sensveria 5” brown pot  499rs.webp"),
    image("Snake_Plant_Terracotta_Pot.webp"),
  ],
  variegatedPinkRubber: [
    image("variegated_pink_rubber_plant.webp"),
    image("IMG_1121.webp"),
    image("Burgundy_Rubber_Plant.webp"),
  ],
  variegatedWhiteRubber: [
    image("variegated_white_rubber_plant.webp"),
    image("Variegated_Rubber_Plant.webp"),
  ],
} as const;
