import { Player, Ability, AIThought } from '../../types/game';
import { ABILITIES } from './abilities';

// Simulate GPT AI decision making
export function getAIDecision(
  aiPlayer: Player,
  playerHP: number,
  playerStatusEffects: any[],
  availableAbilities: Ability[],
  turn: number
): { ability: Ability; thought: AIThought } {
  // Analyze game state
  const playerStunned = playerStatusEffects.some(effect => effect.type === 'stun');
  const aiStunned = aiPlayer.statusEffects.some(effect => effect.type === 'stun');
  const aiLowHP = aiPlayer.hp <= 3;
  const playerLowHP = playerHP <= 3;

  let selectedAbility: Ability;
  let analysis: string;
  let reasoning: string;
  let confidence: number;

  // AI decision logic
  if (aiLowHP && availableAbilities.some(a => a.type === 'heal')) {
    // Heal when low on HP
    selectedAbility = availableAbilities.find(a => a.type === 'heal')!;
    analysis = "I'm at critically low HP and need to heal immediately.";
    reasoning = "Survival is priority when HP is below 4. Healing gives me more turns to win.";
    confidence = 0.9;
  } else if (playerLowHP && availableAbilities.some(a => a.type === 'damage')) {
    // Go for the kill
    const damageAbilities = availableAbilities.filter(a => a.type === 'damage');
    selectedAbility = damageAbilities.reduce((max, curr) => curr.power > max.power ? curr : max);
    analysis = "Player is at low HP - going for the finishing blow.";
    reasoning = "When opponent is vulnerable, aggressive play maximizes win probability.";
    confidence = 0.85;
  } else if (!playerStunned && availableAbilities.some(a => a.type === 'stun')) {
    // Stun to control the game
    selectedAbility = availableAbilities.find(a => a.type === 'stun')!;
    analysis = "Stunning the player will give me tempo advantage next turn.";
    reasoning = "Stun denies opponent's turn while I can freely act, creating significant advantage.";
    confidence = 0.75;
  } else if (availableAbilities.some(a => a.type === 'block')) {
    // Block if expecting damage
    selectedAbility = availableAbilities.find(a => a.type === 'block')!;
    analysis = "Defensive play to mitigate incoming damage.";
    reasoning = "Block reduces damage and forces opponent to use stronger abilities.";
    confidence = 0.6;
  } else {
    // Default to damage
    const damageAbilities = availableAbilities.filter(a => a.type === 'damage' || a.type === 'drain');
    selectedAbility = damageAbilities.length > 0 
      ? damageAbilities[Math.floor(Math.random() * damageAbilities.length)]
      : availableAbilities[0];
    analysis = "Standard aggressive play to pressure the opponent.";
    reasoning = "Consistent damage pressure forces opponent into defensive positions.";
    confidence = 0.7;
  }

  return {
    ability: selectedAbility,
    thought: {
      analysis,
      reasoning,
      confidence,
    },
  };
}

export function getAIDraftChoice(
  currentAbilities: Ability[],
  availableOptions: Ability[]
): { ability: Ability; thought: AIThought } {
  // Analyze what we need
  const hasHealing = currentAbilities.some(a => a.type === 'heal');
  const hasControl = currentAbilities.some(a => a.type === 'stun' || a.type === 'block');
  const hasDamage = currentAbilities.some(a => a.type === 'damage');

  let selectedAbility: Ability;
  let analysis: string;
  let reasoning: string;

  if (!hasHealing && availableOptions.some(a => a.type === 'heal')) {
    selectedAbility = availableOptions.find(a => a.type === 'heal')!;
    analysis = "Need healing for sustainability in longer games.";
    reasoning = "Healing provides crucial survivability and extends game duration in my favor.";
  } else if (!hasControl && availableOptions.some(a => a.type === 'stun')) {
    selectedAbility = availableOptions.find(a => a.type === 'stun')!;
    analysis = "Stun provides valuable tempo control.";
    reasoning = "Control abilities like stun create opportunities and deny opponent actions.";
  } else if (!hasDamage && availableOptions.some(a => a.type === 'damage')) {
    const damageOptions = availableOptions.filter(a => a.type === 'damage');
    selectedAbility = damageOptions.reduce((max, curr) => curr.power > max.power ? curr : max);
    analysis = "Need reliable damage to close out games.";
    reasoning = "High damage abilities are essential for applying pressure and securing wins.";
  } else {
    // Pick the most powerful available option
    selectedAbility = availableOptions.reduce((best, curr) => {
      if (curr.type === 'damage' && best.type === 'damage') return curr.power > best.power ? curr : best;
      if (curr.type === 'heal' && best.type === 'heal') return curr.power > best.power ? curr : best;
      return curr.type === 'damage' ? curr : best;
    });
    analysis = "Selecting the strongest available option to round out my deck.";
    reasoning = "Maximizing power level when deck synergy is already established.";
  }

  return {
    ability: selectedAbility,
    thought: {
      analysis,
      reasoning,
      confidence: 0.8,
    },
  };
}