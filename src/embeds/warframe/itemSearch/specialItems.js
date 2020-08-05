const loginWeapon = 'Arma de login\nAdquirida como opção de recompensa diária\nDe 200 em 200'
  + ' dias a partir do 100\nExemplo:\n[100, 300, 500, 700, 900...]';
const sigmaWeapon = 'Arma de login\nAdquirida como opção de recompensa diária\nDe 200 em 200'
+ ' dias a partir do 300\nExemplo:\n[300, 500, 700, 900...]';
const acquisitionField = (value, inline = false) => (embed) => embed.addField('Aquisição', value, inline);

module.exports = new Map([
  ['Athodai', acquisitionField('TennoCon live 2020')],
  ['Azima', acquisitionField(loginWeapon)],
  ['Zenistar', acquisitionField(loginWeapon)],
  ['Zenith', acquisitionField(loginWeapon)],
  ['Sigma & Octantis', acquisitionField(sigmaWeapon)],
]);
