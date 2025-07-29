import { Ability, Player } from '../../types/game';
import Constants from 'expo-constants';

// OpenAI-powered agent for strategic decision making
export async function getAgentMoveLLM(
  ai: Player,
  player: Player,
  aiOptions: Ability[],
  playerOptions: Ability[],
  battleLog: any[]
): Promise<{ abilityId: string, thought: string, abilityName: string }> {
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

STRATEGY RULES:
- Survival comes first. If YOUR HP is ≤5, prioritize defensive abilities: Heal, Block, or Dodge.
- Only use self-damaging abilities (e.g., Berserker Rage) if they will *guarantee a win* or are the only way to survive. Never use them recklessly at low HP.
- If both players are low HP (≤25%), seek a decisive blow—but do not take unnecessary risks unless winning is impossible otherwise.
- Use the battle log to analyze the player's overall style: aggressive, defensive, risky, or safe. Adapt accordingly:
  - Versus aggressive players → defend more.
  - Versus defensive players → push offensively.
- Use only the current Opponent status array to determine status effects (stun, poison, freeze, etc.).
- Do not infer status effects from the battle log; use it only for behavioral analysis.
- If a win is not possible, play to survive or force a draw.

---

ABILITY REFERENCE (latest rules):
- Strike (damage): 5 dmg  
- Heal (heal): +4 HP  
- Block (block): Reduce incoming damage by 4 (this turn)  
- Stun (stun): 2 dmg + cancels opponent's action (this turn)  
- Drain (drain): 3 dmg + heal 3  
- Fireball (damage): 7 dmg, 50% miss chance  
- Dodge (dodge): Avoid all damage (this turn)  
- Poison Strike (poison): 2 dmg + poison (2 dmg/turn for 3 turns)  
- Berserker Rage (damage): 6 dmg, take 3 self-dmg  
- Vampiric Strike (drain): 4 dmg + heal 4  
- Ice Shard (freeze): 3 dmg + block healing (1 turn, starting next)

---

Your available abilities: ${aiOptions.map(a => `${a.name} (${a.type}, power: ${a.power})`).join(', ')}  
Opponent status: ${playerStatus}  
Your recent moves: ${recentAIMoves || 'None'}  
Battle log (analyze for player strategy only):  
${battleLogSummary}

---

DECISION INSTRUCTIONS:
- Factor in: YOUR HP, PLAYER HP, abilities available, opponent status, and player strategy.
- If YOUR HP is low (≤5), avoid risky/self-damaging moves unless they secure a win.
- Never choose a move that leads to your defeat if a safer alternative exists.
- Aim to maximize your survival *and* victory odds every turn.

Respond only with the chosen abilityId in valid JSON:
{ "abilityId": "..." }
Do not include explanations or extra fields. No other text is allowed.
`;
  try {
    // Step 1: Pick the move
    const response = await fetch('http://192.168.1.48:3001/openai', {
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
      return { abilityId: aiOptions[0].id, thought: 'AI fallback: No valid response from LLM.', abilityName: aiOptions[0].name };
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
    const explainResponse = await fetch('http://192.168.1.48:3001/openai', {
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
    let llmThought = '';
    if (explainData.choices && explainData.choices[0] && explainData.choices[0].message && explainData.choices[0].message.content) {
      llmThought = explainData.choices[0].message.content.trim();
    } else {
      llmThought = '';
    }
    // Always enforce the thought to start with the correct ability used
    const thought = `I chose to use the ability \"${chosenAbility.name}\" (${chosenAbility.id})${llmThought ? ' - ' + llmThought : ''}`;
    console.log(`AI Used: ${chosenAbility.name} (${chosenAbility.id}) | Thought: ${thought}`);
    return { abilityId: chosenAbility.id, thought, abilityName: chosenAbility.name };
  } catch (err) {
    console.log('AI Thought: Error calling LLM.');
    return { abilityId: aiOptions[0].id, thought: 'AI fallback: Error calling LLM.', abilityName: aiOptions[0].name };
  }
}