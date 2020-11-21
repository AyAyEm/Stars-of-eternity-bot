import type { Item } from 'warframe-items';

type Component = Item['components'][0];
export function filterForPrimeComponents(components: Component[]) {
  return components
    .filter(({ drops = [] }: Component) => drops[0]?.location?.toLowerCase().includes('relic'));
}
