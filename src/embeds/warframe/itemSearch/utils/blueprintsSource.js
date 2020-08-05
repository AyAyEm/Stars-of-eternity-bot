const blueprintsSource = new Map([
  ['Recipes', { location: 'Mercado', id: 0 }],
  ['ClanTech', { location: 'Dojo', id: 1 }],
  ['Ostron', { location: 'Cetus', id: 2 }],
  ['VoidTrader', { location: 'Baro', id: 3 }],
  ['Syndicates', { location: 'Sindicato', id: 4 }],
  ['SolarisUnited', { location: 'Fortuna', id: 5 }],
  ['Drop', { location: 'Drop', id: 6 }],
]);

const parseSource = (item) => {
  const { components } = item;
  const { uniqueName, drops } = components
    ? components.filter((componentItem) => componentItem.name === 'Blueprint')[0]
    : item;
  const uniqueNameArr = uniqueName.split('/').slice(3);
  const lab = uniqueNameArr[1];
  const sourceIdentifier = drops ? 'Drop' : uniqueNameArr[0];
  return { ...blueprintsSource.get(sourceIdentifier), lab: (sourceIdentifier === 'ClanTech' ? lab : null) };
};

module.exports = parseSource;
