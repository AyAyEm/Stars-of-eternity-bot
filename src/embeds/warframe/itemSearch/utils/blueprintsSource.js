const blueprintsSource = new Map([
  ['Recipes', { location: 'Mercado', id: 0 }],
  ['ClanTech', { location: 'Dojo', id: 1 }],
  ['Ostron', { location: 'Cetus', id: 2 }],
  ['VoidTrader', { location: 'Baro', id: 3 }],
  ['Syndicates', { location: 'Sindicato', id: 4 }],
  ['SolarisUnited', { location: 'Fortuna', id: 5 }],
]);

const parseSource = (item) => {
  const { components } = item;
  const { uniqueName } = components
    ? components.filter((componentItem) => componentItem.name === 'Blueprint')[0]
    : item;
  const uniqueNameArr = uniqueName.split('/').slice(3);
  const [sourceIdentifier, lab] = uniqueNameArr;
  return { ...blueprintsSource.get(sourceIdentifier), lab: (sourceIdentifier === 'ClanTech' ? lab : null) };
};

module.exports = { blueprintsSource, parseSource };
