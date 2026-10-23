const assets = import.meta.glob<string>("./*.webp", {
  eager: true,
  import: "default",
});

function image(name: string) {
  const value = assets[`./${name}.webp`];
  if (!value) throw new Error(`Missing indoor plant image: ${name}`);
  return value;
}

export const indoorImages = {
  aglaonemaEllen: [
    image("aglaonema-ellen-main"),
    image("aglaonema-ellen-alt-1"),
    image("aglaonema-ellen-alt-2"),
  ],
  aglaonemaLadyValentine: [
    image("aglaonema-lady-valentine-main"),
    image("aglaonema-lady-valentine-alt"),
  ],
  aglaonemaPink: [image("aglaonema-pink-main"), image("aglaonema-pink-alt")],
  aglaonemaSilverLine: [
    image("aglaonema-silver-line-main"),
    image("aglaonema-silver-line-alt"),
  ],
  aglaonemaSuperWhite: [image("aglaonema-super-white-main")],
  anthuriumJenmanii: [image("anthurium-jenmanii-main"), image("anthurium-jenmanii-alt")],
  asparagus: [image("asparagus-main"), image("asparagus-alt")],
  birdNestFern: [image("bird-nest-fern-main"), image("bird-nest-fern-alt")],
  calatheaMunjentha: [image("calathea-munjentha-main"), image("calathea-munjentha-alt")],
  calatheaRoseopicta: [
    image("calathea-roseopicta-main"),
    image("calathea-roseopicta-alt"),
  ],
  calatheaRufibarba: [image("calathea-rufibarba-main"), image("calathea-rufibarba-alt")],
  calatheaSilver: [image("calathea-silver-main"), image("calathea-silver-alt")],
  calatheaZebrina: [image("calathea-zebrina-main"), image("calathea-zebrina-alt")],
  dieffenbachiaDumbCane: [
    image("dieffenbachia-dumb-cane-main"),
    image("dieffenbachia-dumb-cane-alt"),
  ],
  dracaenaCompacta: [image("dracaena-compacta-main"), image("dracaena-compacta-alt")],
  dracaenaLemonLime: [
    image("dracaena-lemon-lime-main"),
    image("dracaena-lemon-lime-alt"),
  ],
  goldenHomalomena: [image("golden-homalomena-main"), image("golden-homalomena-alt")],
  philodendronBirkin: [
    image("philodendron-birkin-main"),
    image("philodendron-birkin-alt"),
  ],
  pachiraBonsai: [image("pachira-bonsai-main"), image("pachira-bonsai-alt")],
  sansevieria: [image("sansevieria-main"), image("sansevieria-alt")],
  variegatedPinkRubber: [
    image("variegated-pink-rubber-main"),
    image("variegated-pink-rubber-alt-1"),
    image("variegated-pink-rubber-alt-2"),
  ],
  variegatedWhiteRubber: [
    image("variegated-white-rubber-main"),
    image("variegated-white-rubber-alt"),
  ],
} as const;
