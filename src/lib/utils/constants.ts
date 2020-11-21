export namespace Warframe {
  export const factionsStyle = new Map([
    ['Grineer', { tumb: 'https://i.imgur.com/Yh9Ncdv.png', color: '#6c0607' }],
    ['Corpus', { tumb: 'https://i.imgur.com/Aa4BfIH.png', color: '#0000de' }],
    ['Infested', { tumb: 'https://i.imgur.com/n9THxDE.png', color: '#1a931e' }],
  ]);
}

const itemNames: { [key: string]: string[] } = {
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
itemNames.all = Object.values(itemNames).flat();
export { itemNames };

export const masteryRankImgs = [
  'https://vignette.wikia.nocookie.net/warframe/images/4/4e/Initiate.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/4/4e/Initiate.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/8/8f/Gold-initiate.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/9/91/Novice.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/9/99/Silver-novice.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/6/69/Gold-novice.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/9/92/Disciple.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/f/f8/Silver-disciple.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/8/84/Gold-disciple.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/4/4b/Seeker.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/0/0e/Silver-seeker.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/b/b9/Gold-seeker.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/2/2a/Hunter.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/1/19/Silver-hunter.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/7/75/Gold-hunter.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/0/0b/Eagle.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/c/c3/Silver-eagle.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/a/af/Gold-eagle.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/0/05/Tiger.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/d/d2/Silver-tiger.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/7/7e/Gold-tiger.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/b/bb/Dragon.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/3/3c/Silver-dragon.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/8/83/Gold-dragon.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/7/70/Sage.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/b/b0/Silver-sage.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/2/29/Gold-sage.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/7/7d/Master.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/f/f8/Middle-master.jpg',
  'https://vignette.wikia.nocookie.net/warframe/images/4/4d/Grand-master.jpg',
];

export const rivenDisposition = [
  '●○○○○',
  '●●○○○',
  '●●●○○',
  '●●●●○',
  '●●●●●',
];

export const numberEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
