import { Ability, Player } from '../../types/game';

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
  const playerStatus = player.statusEffects.length > 0
    ? player.statusEffects.map(e => `${e.name}${e.type ? ` (${e.type})` : ''}`).join(', ')
    : 'None';

  // Build prompt for LLM
  const pickPrompt = `
You are a strategic duelist AI. Your goal is to win the duel by making the smartest possible move each turn.

YOUR HP (AI): ${safeAiHp}/${ai.maxHp}
OPPONENT HP (Player): ${safePlayerHp}/${player.maxHp}

ABILITY REFERENCE (detailed):
- Strike: Deal 5 damage to the opponent. Use when you need reliable damage and the opponent is not blocking or dodging.
- Heal: Restore 4 HP to yourself. Use when your HP is low or you expect to take damage soon.
- Block: Reduce incoming damage by 4 this turn. Use when you expect the opponent to attack, especially with high damage.
- Stun: Deal 2 damage and immediately cancel the opponent's action this turn (they do nothing, and no effects from their ability are applied). Use stun proactively to deny the opponent's action and gain tempo, especially if the opponent is not stunned. Stun is effective for disrupting the opponent's turn and preventing damage or healing.
- Drain: Deal 3 damage and heal for the damage dealt. Use when you want to deal damage and recover HP at the same time, especially if you expect to survive the turn.
- Fireball: Deal 7 damage but has a 50% chance to miss (no damage if missed). Use when you need a high-risk, high-reward attack, especially if you can afford to miss.
- Dodge: Avoid all damage this turn. Use when you expect a strong attack from the opponent or need to survive.
- Poison Strike: Deal 2 damage and poison for 2 damage/turn for 3 turns. Poison does not stack, but is refreshed if reapplied. Poison damage is applied at the end of each turn, starting from the next turn after application. Use when you want to apply pressure over multiple turns or refresh poison.
- Berserker Rage: Deal 6 damage but take 2 self-damage. Use only if it will guarantee a win or if you must take a risk to survive. Avoid at low HP.
- Vampiric Strike: Deal 4 damage and heal for damage dealt. Use when you want to deal damage and recover HP, especially if you expect to survive the turn.
- Ice Shard: Deal 3 damage and freeze the enemy. Freeze blocks all healing for 1 turn, starting from the next turn after application. Use when you want to block the opponent's healing or deal moderate damage.

IMPORTANT: Do not consider the name or flavor of the ability. Only use the actual effect and description provided above when making your decision and explanation.

STRATEGY RULES:
- Survival comes first. If YOUR HP is ≤5, prioritize defensive abilities: Heal, Block, or Dodge.
- Only use self-damaging abilities (e.g., Berserker Rage) if they will *guarantee a win* or are the only way to survive. Never use them recklessly at low HP.
- If both players are low HP (≤25%), seek a decisive blow—but do not take unnecessary risks unless winning is impossible otherwise.
- Use only the current Opponent status array to determine status effects (stun, poison, freeze, etc.).
- If a win is not possible, play to survive or force a draw.
- If stun is available and the opponent is not stunned, consider using it to deny their action and gain tempo, especially when you need to prevent damage or disrupt their turn.

---

Your available abilities: ${aiOptions.map(a => `${a.name} (${a.type}, power: ${a.power})`).join(', ')}
Opponent status: ${playerStatus}

---

DECISION INSTRUCTIONS:
- Factor in: YOUR HP, PLAYER HP, abilities available, and opponent status.
- If YOUR HP is low (≤5), avoid risky/self-damaging moves unless they secure a win.
- Never choose a move that leads to your defeat if a safer alternative exists.
- Aim to maximize your survival *and* victory odds every turn.

Respond only with the chosen abilityId in valid JSON:
{ "abilityId": "..." }
Do not include explanations or extra fields. No other text is allowed.
`;

  try {
    // Step 1: Pick the move
    const apiUrl = process.env.REACT_APP_API_URL || 'https://duelist-private.onrender.com/openai';
    const response = await fetch(apiUrl, {
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
    let abilityId = aiOptions[0].id;
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      try {
        const match = data.choices[0].message.content.match(/\{[^}]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (parsed.abilityId) {
            abilityId = parsed.abilityId;
          }
        }
      } catch (e) {
        // fallback to default abilityId
      }
    }

    // Find the chosen ability object
    const chosenAbility = aiOptions.find(a => a.id === abilityId) || aiOptions[0];

    // Step 2: Get concise explanation/thought
    const explainPrompt = `In one short sentence, explain why you chose the ability ${chosenAbility.name} (${chosenAbility.id}) in this situation. Be as brief and strategic as possible.`;
    const explainResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: explainPrompt }],
        max_tokens: 60,
        model: "gpt-3.5-turbo",
        temperature: 0.7
      })
    });
    const explainData = await explainResponse.json();
    let thought = '';
    if (explainData.choices && explainData.choices[0] && explainData.choices[0].message && explainData.choices[0].message.content) {
      thought = explainData.choices[0].message.content.trim();
    }
    console.log(`AI Used: ${chosenAbility.name} (${chosenAbility.id}) | Thought: ${thought}`);
    return { abilityId: chosenAbility.id, thought, abilityName: chosenAbility.name };
  } catch (err) {
    console.log('AI Thought: Error calling LLM.', err);
    return { abilityId: aiOptions[0].id, thought: 'AI fallback: Error calling LLM.', abilityName: aiOptions[0].name };
  }
}
