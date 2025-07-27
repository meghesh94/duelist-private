import { resolveCombat } from './combat';
import { Ability, Player } from '../../types/game';

describe('Stun logic', () => {
  it('Drain vs Dodge: AI dodges drain, no damage or healing', () => {
    const player = { ...basePlayer, hp: 20 };
    const ai = { ...baseAI, hp: 20 };
    const drain = { id: 'drain', name: 'Drain', type: 'drain' as const, power: 3, description: 'Drain 3 HP', icon: 'droplet' };
    const dodge = { id: 'dodge', name: 'Dodge', type: 'dodge' as const, power: 0, description: 'Dodge attack', icon: 'wind' };
    const result = resolveCombat(
      player,
      ai,
      [drain],
      [dodge],
      'drain',
      'dodge',
      1
    );
    expect(ai.hp).toBe(20);
    expect(player.hp).toBe(20);
    expect(result.battleLog.some(e => e.message.includes('Orion the Mind Engine prepares to dodge'))).toBe(true);
    expect(result.battleLog.some(e => e.message.includes('Orion the Mind Engine blocks the attack')) || result.battleLog.some(e => e.message.includes('Orion the Mind Engine dodges'))).toBe(true);
  });

  it('Strike vs Block: AI blocks player strike, damage reduced', () => {
    const player = { ...basePlayer, hp: 20 };
    const ai = { ...baseAI, hp: 20 };
    const strike = { id: 'strike', name: 'Strike', type: 'damage' as const, power: 5, description: 'Deal 5 damage', icon: 'sword' };
    const block = { id: 'block', name: 'Block', type: 'block' as const, power: 3, description: 'Block 3 damage', icon: 'shield' };
    const result = resolveCombat(
      player,
      ai,
      [strike],
      [block],
      'strike',
      'block',
      1
    );
    expect(ai.hp).toBe(18);
    expect(result.battleLog.some(e => e.message.includes('Orion the Mind Engine prepares to block'))).toBe(true);
    expect(result.battleLog.some(e => e.message.includes('Orion the Mind Engine takes 2 damage'))).toBe(true);
  });

  it('Heal vs Strike: Net effect applied after both actions', () => {
    const player = { ...basePlayer, hp: 20 };
    const ai = { ...baseAI, hp: 15 };
    const heal = { id: 'heal', name: 'Heal', type: 'heal' as const, power: 5, description: 'Heal 5 HP', icon: 'heart' };
    const strike = { id: 'strike', name: 'Strike', type: 'damage' as const, power: 5, description: 'Deal 5 damage', icon: 'sword' };
    const result = resolveCombat(
      player,
      ai,
      [strike],
      [heal],
      'strike',
      'heal',
      1
    );
    expect(ai.hp).toBe(15);
    expect(result.battleLog.some(e => e.message.includes('Orion the Mind Engine heals for 5 HP'))).toBe(true);
    expect(result.battleLog.some(e => e.message.includes('Orion the Mind Engine takes 5 damage'))).toBe(true);
  });

  it('Drain vs Strike: Player drains, AI strikes, net effect', () => {
    const player = { ...basePlayer, hp: 15 };
    const ai = { ...baseAI, hp: 15 };
    const drain = { id: 'drain', name: 'Drain', type: 'drain' as const, power: 3, description: 'Drain 3 HP', icon: 'droplet' };
    const strike = { id: 'strike', name: 'Strike', type: 'damage' as const, power: 5, description: 'Deal 5 damage', icon: 'sword' };
    const result = resolveCombat(
      player,
      ai,
      [drain],
      [strike],
      'drain',
      'strike',
      1
    );
    expect(ai.hp).toBe(12);
    expect(player.hp).toBe(13);
    expect(result.battleLog.some(e => e.message.includes('Orion the Mind Engine takes 3 damage'))).toBe(true);
    expect(result.battleLog.some(e => e.message.includes('Riven the Shadowblade heals for 3 HP'))).toBe(true);
    expect(result.battleLog.some(e => e.message.includes('Riven the Shadowblade takes 5 damage'))).toBe(true);
  });
  const basePlayer: Player = {
    id: 'player',
    name: 'Player',
    avatar: 'player.png',
    hp: 20,
    maxHp: 20,
    statusEffects: [],
    abilities: [],
  };
  const baseAI: Player = {
    id: 'ai',
    name: 'AI',
    avatar: 'ai.png',
    hp: 20,
    maxHp: 20,
    statusEffects: [],
    abilities: [],
  };
  const strike: Ability = { id: 'strike', name: 'Strike', type: 'damage', power: 5, description: 'Deal 5 damage', icon: 'sword' };
  const heal: Ability = { id: 'heal', name: 'Heal', type: 'heal', power: 5, description: 'Heal 5 HP', icon: 'heart' };
  const stun: Ability = { id: 'stun', name: 'Stun', type: 'stun', power: 3, description: 'Stun for 1 turn', icon: 'zap' };

  it('AI cannot act when stunned', () => {
    const ai = { ...baseAI, hp: 20, statusEffects: [{ id: 'stun1', name: 'Stunned', type: 'stun' as const, duration: 1, icon: 'zap' }] };
    const player = { ...basePlayer, hp: 20 };
    const heal = { id: 'heal', name: 'Heal', type: 'heal' as const, power: 5, description: 'Heal 5 HP', icon: 'heart' };
    const result = resolveCombat(
      player,
      ai,
      [heal],
      [heal],
      'heal',
      'heal',
      1
    );
    expect(ai.hp).toBe(20);
    expect(result.battleLog.some(e => e.message.includes('AI is stunned and cannot act'))).toBe(true);
  });

  it('Player cannot act when stunned', () => {
    const player = { ...basePlayer, hp: 20, statusEffects: [{ id: 'stun1', name: 'Stunned', type: 'stun' as const, duration: 1, icon: 'zap' }] };
    const ai = { ...baseAI, hp: 20 };
    const heal = { id: 'heal', name: 'Heal', type: 'heal' as const, power: 5, description: 'Heal 5 HP', icon: 'heart' };
    const result = resolveCombat(
      player,
      ai,
      [heal],
      [heal],
      'heal',
      'heal',
      1
    );
    expect(player.hp).toBe(20);
    expect(result.battleLog.some(e => e.message.includes('Player is stunned and cannot act'))).toBe(true);
  });

  it('Both cannot act when both are stunned', () => {
    const player = { ...basePlayer, statusEffects: [{ id: 'stun1', name: 'Stunned', type: 'stun' as const, duration: 1, icon: 'zap' }] };
    const ai = { ...baseAI, statusEffects: [{ id: 'stun2', name: 'Stunned', type: 'stun' as const, duration: 1, icon: 'zap' }] };
    const result = resolveCombat(
      player,
      ai,
      [heal],
      [heal],
      'heal',
      'heal',
      1
    );
    expect(player.hp).toBe(20);
    expect(ai.hp).toBe(20);
    expect(result.battleLog.some(e => e.message.includes('Player is stunned and cannot act'))).toBe(true);
    expect(result.battleLog.some(e => e.message.includes('AI is stunned and cannot act'))).toBe(true);
  });

  it('Stun effect only lasts one turn', () => {
    let player = { ...basePlayer, hp: 20, statusEffects: [{ id: 'stun1', name: 'Stunned', type: 'stun' as const, duration: 1, icon: 'zap' }] };
    let ai = { ...baseAI, hp: 20 };
    const heal = { id: 'heal', name: 'Heal', type: 'heal' as const, power: 5, description: 'Heal 5 HP', icon: 'heart' };
    // First turn: player is stunned
    let result = resolveCombat(
      player,
      ai,
      [heal],
      [heal],
      'heal',
      'heal',
      1
    );
    expect(player.hp).toBe(20);
    expect(result.battleLog.some(e => e.message.includes('Player is stunned and cannot act'))).toBe(true);
    // Remove stun for next turn
    player.statusEffects = [];
    result = resolveCombat(
      player,
      ai,
      [heal],
      [heal],
      'heal',
      'heal',
      2
    );
    expect(result.battleLog.some(e => e.message.includes('Player uses Heal'))).toBe(true);
  });
});
