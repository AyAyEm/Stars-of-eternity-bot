import type { Item } from 'warframe-items';

export interface Fissure {
  node: string;
  expired: boolean;
  eta: string;
  missionType: string;
  tier: string;
  tierNum: number;
  enemy: string;
  id: string;
  expiry: string;
  activation: string;
  active: boolean;
}

export interface InvasionData {
  defenderReward: Reward;
  attackingFaction: string;
  completion: number;
  attackerReward: Reward;
  count: number;
  completed: boolean;
  requiredRuns: number;
  vsInfestation: boolean;
  node: string;
  eta: string;
  defendingFaction: string;
  id: string;
  activation: Date;
  rewardTypes: string[];
  desc: string;
}

export interface Reward {
  countedItems: CountedItem[];
  thumbnail: string;
  color: number;
  credits: number;
  asString: string;
  items: Item[];
  itemString: string;
}

export interface CountedItem {
  count: number;
  type: string;
}
