
import { Ability, Player } from '../../types/game';
import Constants from 'expo-constants';

// OpenAI-powered agent for strategic decision making
export async function getAgentMoveLLM(
  ai: Player,
  player: Player,
  aiOptions: Ability[],
  playerOptions: Ability[],
  battleLog: any[]
): Promise<{ abilityId: string, thought: string }> {
  // Clamp HP values to max
  const safeAiHp = Math.min(ai.hp, ai.maxHp);
  const safePlayerHp = Math.min(player.hp, player.maxHp);
  ai.hp = safeAiHp;
  player.hp = safePlayerHp;
  const recentPlayerMoves = battleLog.filter(e => e.type === 'action' && e.message.includes(player.name)).map(e => e.message).join(' | ');
  const recentAIMoves = battleLog.filter(e => e.type === 'action' && e.message.includes(ai.name)).map(e => e.message).join(' | ');
  const playerStatus = player.statusEffects.length > 0
    ? player.statusEffects.map(e => `${e.name}${e.type ? ` (${e.type})` : ''}`).join(', ')
    : 'None';
  const battleLogSummary = battleLog.map(e => `[Turn ${e.turn || '?'}] ${e.message}`).join('\n');

  // Step 1: Ask LLM to pick the best ability
  const pickPrompt = `
You are a strategic duelist AI. Your goal is to win the duel by making the smartest possible move each turn.

YOUR HP (AI): ${safeAiHp}/${ai.maxHp}
OPPONENT HP (Player): ${safePlayerHp}/${player.maxHp}

IMPORTANT: Always prioritize your own survival. If your HP is low, you must avoid risky or self-damaging moves unless it will guarantee a win. Only use self-damaging moves (like Berserker Rage) if it will immediately defeat the opponent or is the best possible option for survival. Do not use self-damaging moves if your HP is low and it could cause you to lose.

---
ABILITY REFERENCE (latest rules):
- Strike (damage): Deal 5 damage to opponent.
- Heal (heal): Restore 4 HP.
- Block (block): Reduce incoming damage by 4 this turn. Block is applied immediately and protects against all attacks this turn.
- Stun (stun): Deal 2 damage and immediately cancel the opponent's action this turn (they do nothing, and no effects from their ability are applied).
- Drain (drain): Deal 3 damage and heal for the damage dealt.
- Fireball (damage): Deal 7 damage but 50% chance to miss.
- Dodge (dodge): Avoid all damage this turn.
- Poison Strike (poison): Deal 2 damage and poison for 2 damage/turn for 3 turns. Poison does not stack, but is refreshed if reapplied. Poison damage is applied at the end of each turn, starting from the next turn after application.
- Berserker Rage (damage): Deal 6 damage but take 3 self-damage.
- Magic Shield (block): Block all damage for 1 turn (2-turn cooldown).
- Vampiric Strike (drain): Deal 4 damage and heal for damage dealt.
- Ice Shard (freeze): Deal 3 damage and freeze the enemy. Freeze blocks all healing for 1 turn, starting from the next turn after application.
---

Your available abilities: ${aiOptions.map(a => `${a.name} (${a.type}, power: ${a.power})`).join(', ')}.
Opponent's current status: ${playerStatus}
Your previous moves: ${recentAIMoves || 'None'}
Battle log so far:\n${battleLogSummary}

INSTRUCTIONS:
- Always consider YOUR HP (AI), OPPONENT HP (Player), and the available abilities.
- If YOUR HP (AI) is low (e.g., 5 or less), avoid risky or self-damaging moves (like Berserker Rage) unless it will guarantee a win.
- Prioritize healing, blocking, or dodging when YOUR HP (AI) is low.
- Only use self-damaging or risky moves if you are sure it will defeat the opponent or is the best strategic option.
- Pick the move that maximizes your chance to win and survive. Never use a move that would cause you to lose if you could survive by playing safer.

Choose the best ability to win. Respond ONLY in valid JSON, with this format: { "abilityId": "..." }
IMPORTANT: Respond with only the abilityId you select. Do not include any explanation or extra fields. Do not include any text outside the JSON object.
`;

  try {
    // Step 1: Pick the move
    const response = await fetch('http://192.168.1.28:3001/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: pickPrompt }],
        max_tokens: 100,
        model: "gpt-3.5-turbo",
        temperature: 0.7
      })
    });
    const data = await response.json();
    console.log('Raw LLM response (pick):', JSON.stringify(data));
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.log('AI Thought: No valid response from LLM.');
      return { abilityId: aiOptions[0].id, thought: 'AI fallback: No valid response from LLM.' };
    }
    const match = data.choices[0].message.content.match(/{.*}/s);
    let chosenAbilityId = aiOptions[0].id;
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed.abilityId) {
          chosenAbilityId = parsed.abilityId;
        }
      } catch (e) {
        console.log('AI Thought: Invalid JSON from LLM.');
      }
    }
    const chosenAbility = aiOptions.find(a => a.id === chosenAbilityId) || aiOptions[0];

    // Step 2: Ask LLM to explain the move
    const explainPrompt = `
You are a strategic duelist AI. You have just chosen to use the ability "${chosenAbility.name}" (${chosenAbility.type}).
Game state:
- Your HP: ${safeAiHp}/${ai.maxHp}
- Opponent HP: ${safePlayerHp}/${player.maxHp}
- Your available abilities: ${aiOptions.map(a => a.name).join(', ')}
- Opponent's current status: ${playerStatus}
- Your previous moves: ${recentAIMoves || 'None'}
- Battle log so far:\n${battleLogSummary}

IMPORTANT: You do NOT know what ability the opponent will use this turn. Do not reference or speculate about the opponent's next move. Only explain your own reasoning based on the current state.
Explain in 1-2 sentences, in natural language, why you chose this move. Be concise and strategic.
`;
    const explainResponse = await fetch('http://192.168.1.28:3001/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: explainPrompt }],
        max_tokens: 1500,
        temperature: 0.7
      })
    });
    const explainData = await explainResponse.json();
    let thought = '';
    if (explainData.choices && explainData.choices[0] && explainData.choices[0].message && explainData.choices[0].message.content) {
      thought = explainData.choices[0].message.content.trim();
    } else {
      thought = `AI chose ${chosenAbility.name}.`;
    }
    console.log('AI Thought:', thought);
    return { abilityId: chosenAbility.id, thought };
  } catch (err) {
    console.log('AI Thought: Error calling LLM.');
    return { abilityId: aiOptions[0].id, thought: 'AI fallback: Error calling LLM.' };
  }
}