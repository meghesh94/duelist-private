import { resolveCombat } from './combat';
import { Ability, Player } from '../../types/game';

describe('Combat ability combinations', () => {
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
