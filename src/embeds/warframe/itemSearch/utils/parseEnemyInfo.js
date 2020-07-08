module.exports = (enemy) => {
  const { location, chance } = enemy;
  const [name, dropChance] = location.split(' nce: ', 2);
  const actualChance = Number(dropChance) * chance;
  return [name, actualChance];
};
