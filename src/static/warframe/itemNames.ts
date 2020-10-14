export const items: { [key: string]: string[] } = {
  commonItems: [
    'nanoSpores', 'rubedo', 'salvage', 'plastids', 'polymerBundle',
    'cryotic', 'circuits', 'ferrite', 'alloyPlate',
  ],

  uncommonItems: ['oxium', 'gallium', 'morphics', 'controlModule'],

  rareItems: [
    'neuralSensors', 'orokinCell', 'argonCrystal', 'tellurium', 'neurodes', 'nitain',
  ],

  weapons: ['vandal', 'wraith', 'weapon'],
  goodOnes: ['reactor', 'catalyst', 'forma', 'aura', 'exilus', 'riven'],
  faction: ['fieldron', 'detonite', 'mutagen'],

  others: [
    'mutalist', 'forma', 'synthula', 'kavatGene',
    'kubrowEgg', 'traces', 'other', 'credits', 'skin',
    'helmet', 'nightmare', 'endo',
  ],
};
items.all = Object.values(items).flat();
