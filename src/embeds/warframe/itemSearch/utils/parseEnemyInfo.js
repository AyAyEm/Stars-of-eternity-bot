module.exports = (enemy) => {
  const { location, chance } = enemy;
  const [name, dropChance] = location.split(' nce: ', 2);
  const actualChance = dropChance ? Number(dropChance) * chance : chance * 100;
  return [name, actualChance];
};
