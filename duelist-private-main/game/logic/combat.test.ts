import { resolveCombat } from './combat';
import { Ability, Player } from '../../types/game';

describe('Combat ability combinations', () => {
describe('Poison effect behavior', () => {
  const poisonAbility: Ability = { id: 'poison', name: 'Poison', type: 'poison', power: 2, description: 'Poison enemy', icon: 'poison.png' };
  const strikeAbility: Ability = { id: 'strike', name: 'Strike', type: 'damage', power: 5, description: 'Deal damage', icon: 'strike.png' };
  const abilities = [poisonAbility, strikeAbility];
  let player: Player;
  let ai: Player;

  beforeEach(() => {
    player = {
      id: 'player',
      name: 'Player',
      avatar: 'player.png',
      hp: 20,
      maxHp: 20,
      abilities,
      statusEffects: []
    };
    ai = {
      id: 'ai',
      name: 'AI',
      avatar: 'ai.png',
      hp: 20,
      maxHp: 20,
      abilities,
      statusEffects: []
    };
  });

  it('applies poison and only starts damage next turn', () => {
    // Turn 1: Player poisons AI
    let result = resolveCombat(player, ai, abilities, abilities, 'poison', 'strike', 1);
    // No poison damage at end of turn 1
    expect(ai.hp).toBe(15); // 20 - 5 from strike, no poison yet
    expect(result.battleLog.some(e => e.message.includes('poison damage'))).toBe(false);

    // Turn 2: Player does nothing, AI does nothing
    result = resolveCombat(player, ai, abilities, abilities, 'strike', 'strike', 2);
    // Poison tick should apply now
    expect(ai.hp).toBe(8); // 15 - 5 (strike) - 2 (poison)
    expect(result.battleLog.some(e => e.message.includes('poison damage'))).toBe(true);
  });

  it('refreshes poison duration instead of stacking', () => {
    // Turn 1: Poison
    resolveCombat(player, ai, abilities, abilities, 'poison', 'strike', 1);
    // Turn 2: Poison again
    resolveCombat(player, ai, abilities, abilities, 'poison', 'strike', 2);
    // AI should only have one poison effect
    expect(ai.statusEffects.filter(e => e.type === 'poison').length).toBe(1);
    // Duration should be refreshed to 3
    expect(ai.statusEffects.find(e => e.type === 'poison')?.duration).toBe(3);
  });

  it('poison does not stack damage', () => {
    // Turn 1: Poison
    resolveCombat(player, ai, abilities, abilities, 'poison', 'strike', 1);
    // Turn 2: Poison again
    resolveCombat(player, ai, abilities, abilities, 'poison', 'strike', 2);
    // Turn 3: Strike
    const result = resolveCombat(player, ai, abilities, abilities, 'strike', 'strike', 3);
    // Only 2 poison damage should be applied, not 4
    const poisonTicks = result.battleLog.filter(e => e.message.includes('poison damage'));
    expect(poisonTicks.length).toBe(1);
    expect(poisonTicks[0].message).toContain('2 poison damage');
  });
});
  const abilities: Ability[] = [
    { id: 'strike', name: 'Strike', type: 'damage', power: 5, description: 'Deal damage', icon: 'strike.png' },
    { id: 'heal', name: 'Heal', type: 'heal', power: 4, description: 'Restore HP', icon: 'heal.png' },
    { id: 'block', name: 'Block', type: 'block', power: 4, description: 'Block attack', icon: 'block.png' },
    { id: 'rage', name: 'Berserker Rage', type: 'damage', power: 6, description: 'High damage, self-harm', icon: 'rage.png' },
    { id: 'stun', name: 'Stun', type: 'stun', power: 2, description: 'Stun enemy', icon: 'stun.png' },
    { id: 'drain', name: 'Drain', type: 'drain', power: 3, description: 'Drain HP', icon: 'drain.png' },
    { id: 'dodge', name: 'Dodge', type: 'dodge', power: 0, description: 'Dodge attack', icon: 'dodge.png' },
    { id: 'poison', name: 'Poison', type: 'poison', power: 2, description: 'Poison enemy', icon: 'poison.png' },
    { id: 'freeze', name: 'Freeze', type: 'freeze', power: 2, description: 'Slow enemy', icon: 'freeze.png' }
  ];

  const basePlayer: Player = {
    id: 'player',
    name: 'Player',
    avatar: 'player.png',
    hp: 20,
    maxHp: 20,
    abilities: abilities,
    statusEffects: []
  };
  const baseAI: Player = {
    id: 'ai',
    name: 'AI',
    avatar: 'ai.png',
    hp: 20,
    maxHp: 20,
    abilities: abilities,
    statusEffects: []
  };

  abilities.forEach(playerAbility => {
    abilities.forEach(aiAbility => {
      it(`Player: ${playerAbility.name} vs AI: ${aiAbility.name}`, () => {
        const player = { ...basePlayer, hp: 20, statusEffects: [] };
        const ai = { ...baseAI, hp: 20, statusEffects: [] };
        const result = resolveCombat(
          player,
          ai,
          abilities,
          abilities,
          playerAbility.id,
          aiAbility.id,
          1
        );
        // HP should never exceed max or go below zero
        expect(player.hp).toBeGreaterThanOrEqual(0);
        expect(player.hp).toBeLessThanOrEqual(player.maxHp);
        expect(ai.hp).toBeGreaterThanOrEqual(0);
        expect(ai.hp).toBeLessThanOrEqual(ai.maxHp);
        // Battle log should contain both actions
        expect(result.battleLog.some(e => e.message.includes(player.name))).toBe(true);
        expect(result.battleLog.some(e => e.message.includes(ai.name))).toBe(true);
      });
    });
  });
});
