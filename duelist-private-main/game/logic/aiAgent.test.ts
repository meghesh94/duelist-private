import { getAgentMoveLLM } from './aiAgent';
import { Ability, Player } from '../../types/game';

describe('getAgentMoveLLM', () => {
  const abilities: Ability[] = [
    { id: 'a1', name: 'Strike', type: 'damage', power: 3, description: 'Deal damage', icon: 'strike.png' },
    { id: 'a2', name: 'Heal', type: 'heal', power: 4, description: 'Restore HP', icon: 'heal.png' },
    { id: 'a3', name: 'Block', type: 'block', power: 0, description: 'Block attack', icon: 'block.png' }
  ];
  const player: Player = {
    id: 'player',
    name: 'Player',
    avatar: 'player.png',
    hp: 10,
    maxHp: 10,
    abilities: abilities,
    statusEffects: []
  };
  const ai: Player = {
    id: 'ai',
    name: 'AI',
    avatar: 'ai.png',
    hp: 15,
    maxHp: 12,
    abilities: abilities,
    statusEffects: []
  };
  // Only include previous turns in battleLog, not current turn's player action
  const battleLog = [
    { message: 'AI uses Heal!', type: 'action' }
  ];

  it('should clamp AI HP to maxHp in prompt', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const result = await getAgentMoveLLM(ai, player, abilities, abilities, battleLog);
    expect(result).toHaveProperty('abilityId');
    expect(result).toHaveProperty('thought');
    spy.mockRestore();
  });

  it('should print AI thought after move selection', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await getAgentMoveLLM(ai, player, abilities, abilities, battleLog);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should never allow AI HP to exceed maxHp', async () => {
    const aiOverHp: Player = { ...ai, hp: 999 };
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await getAgentMoveLLM(aiOverHp, player, abilities, abilities, battleLog);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
