import { Ability } from '../../types/game';

export const ABILITIES: Ability[] = [
  {
    id: 'strike',
    name: 'Strike',
    description: 'Deal 5 damage to opponent.',
    icon: 'sword',
    type: 'damage',
    power: 5,
  },
  {
    id: 'heal',
    name: 'Heal',
    description: 'Restore 4 HP.',
    icon: 'heart',
    type: 'heal',
    power: 4,
  },
  {
    id: 'block',
    name: 'Block',
    description: 'Reduce incoming damage by 4 this turn. Block is applied immediately and protects against all attacks this turn.',
    icon: 'shield',
    type: 'block',
    power: 4,
  },
  {
    id: 'stun',
    name: 'Stun',
    description: 'Deal 2 damage and immediately cancel the opponent\'s action this turn (they do nothing, and no effects from their ability are applied).',
    icon: 'zap',
    type: 'stun',
    power: 2,
  },
  {
    id: 'drain',
    name: 'Drain',
    description: 'Deal 3 damage and heal for the damage dealt.',
    icon: 'droplets',
    type: 'drain',
    power: 3,
  },
  {
    id: 'fireball',
    name: 'Fireball',
    description: 'Deal 7 damage but 50% chance to miss.',
    icon: 'flame',
    type: 'damage',
    power: 7,
  },
  {
    id: 'dodge',
    name: 'Dodge',
    description: 'Avoid all damage this turn.',
    icon: 'wind',
    type: 'dodge',
    power: 0,
  },
  {
    id: 'poison',
    name: 'Poison Strike',
    description: 'Deal 2 damage and poison for 2 damage/turn for 3 turns. Poison does not stack, but is refreshed if reapplied. Poison damage is applied at the end of each turn, starting from the next turn after application.',
    icon: 'droplets',
    type: 'poison',
    power: 2,
  },
  {
    id: 'rage',
    name: 'Berserker Rage',
    description: 'Deal 6 damage but take 1 self-damage.',
    icon: 'sword',
    type: 'damage',
    power: 6,
  },
  {
    id: 'lifesteal',
    name: 'Vampiric Strike',
    description: 'Deal 4 damage and heal for damage dealt.',
    icon: 'heart',
    type: 'drain',
    power: 4,
  },
  {
    id: 'freeze',
    name: 'Ice Shard',
    description: 'Deal 3 damage and freeze the enemy. Freeze blocks all healing for 1 turn, starting from the next turn after application.',
    icon: 'snowflake',
    type: 'freeze',
    power: 3,
  },
];

export function getRandomAbilities(count: number, exclude: string[] = []): Ability[] {
  const available = ABILITIES.filter(ability => !exclude.includes(ability.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getAbilityById(id: string): Ability | undefined {
  return ABILITIES.find(ability => ability.id === id);
}