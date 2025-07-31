
import { ABILITIES, getRandomAbilities } from './abilities';
import { resolveCombat } from './combat';
import { Player, Ability } from '../../types/game';
import { getAgentMoveLLM } from './aiAgent';

// Helper: create a fresh player
function createPlayer(id: 'player' | 'ai', name: string): Player {
  return {
    id,
    name,
    avatar: '',
    hp: 30,
    maxHp: 30,
    abilities: [],
    statusEffects: [],
  };
}

// Helper: pick highest damage ability from a set
function pickHighestDamageAbility(abilities: Ability[]): Ability {
  // Only consider abilities with type 'damage', 'drain', 'poison', 'freeze', 'stun'
  const damageAbilities = abilities.filter(a => ['damage','drain','poison','freeze','stun'].includes(a.type));
  if (damageAbilities.length === 0) return abilities[0];
  return damageAbilities.reduce((max, curr) => (curr.power > max.power ? curr : max));
}

// Simulate a single game (async for LLM)
async function simulateGameAsync(): Promise<string> {
  const player = createPlayer('player', 'Player');
  const ai = createPlayer('ai', 'AI');
  let turn = 0;
  while (player.hp > 0 && ai.hp > 0 && turn < 50) {
    // Each turn, generate random abilities for both
    const playerOptions = getRandomAbilities(3);
    const aiOptions = getRandomAbilities(3);
    player.abilities = playerOptions;
    ai.abilities = aiOptions;

    // Player picks highest damage ability
    const playerAbility = pickHighestDamageAbility(playerOptions);

    // AI uses LLM to pick move
    let aiAbilityId = aiOptions[0].id;
    try {
      const aiMove = await getAgentMoveLLM(ai, player, aiOptions, playerOptions, []);
      aiAbilityId = aiMove.abilityId;
    } catch (e) {
      // fallback: pick highest damage
      aiAbilityId = pickHighestDamageAbility(aiOptions).id;
    }
    const aiAbility = aiOptions.find(a => a.id === aiAbilityId) || aiOptions[0];

    // Run combat
    resolveCombat(
      player,
      ai,
      playerOptions,
      aiOptions,
      playerAbility.id,
      aiAbility.id,
      turn
    );
    turn++;
  }
  if (player.hp <= 0 && ai.hp <= 0) return 'Draw';
  if (player.hp <= 0) return 'AI';
  if (ai.hp <= 0) return 'Player';
  return 'Timeout';
}

// Run multiple simulations and collect results
async function runSimulations(n: number = 100) {
  const results: Record<string, number> = { Player: 0, AI: 0, Draw: 0, Timeout: 0 };
  for (let i = 0; i < 1; i++) {
    const winner = await simulateGameAsync();
    results[winner]++;
    console.log(`Game ${i+1}: Winner = ${winner}`);
  }
  console.log('Simulation results:', results);
  return results;
}

runSimulations(1);
