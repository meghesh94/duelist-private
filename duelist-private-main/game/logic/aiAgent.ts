
import { Ability, Player } from '../../types/game';

// Cache the static part of the prompt
const STATIC_PROMPT = `
You are a strategic duelist AI. Your goal is to win the duel by making the smartest possible move each turn.

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
- Lifesteal: Deal 4 damage and heal for damage dealt. Use when you want to deal damage and recover HP, especially if you expect to survive the turn.
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

DECISION INSTRUCTIONS:
- Factor in: YOUR HP, PLAYER HP, abilities available, and opponent status.
- If YOUR HP is low (≤5), avoid risky/self-damaging moves unless they secure a win.
- Never choose a move that leads to your defeat if a safer alternative exists.
- Aim to maximize your survival *and* victory odds every turn.

IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{
  "abilityId": "<the id of the chosen ability>",
  "thought": "<a concise, strategic explanation (1-2 sentences) for why you chose the ability in abilityId, based on the current game state above. The explanation MUST be specific to the chosen ability and situation, referencing your HP, the opponent's HP, available abilities, and status effects as relevant. Do not use generic or repetitive phrases like 'chipping away at HP'—explain your reasoning as a player would, showing your thought process for this specific turn. Make the explanation sound like a real player: use casual, expressive, or emotional language, and show some personality or confidence.>"
}
CRITICAL: The value for "abilityId" MUST be the exact id string from your available abilities list above (e.g., "fireball", "strike", etc.), NOT the name or any other value. If you do not use the exact id, you will lose the game.
Do NOT add any other fields, text, or explanation. If you do not follow this format, you will lose the game.
`;

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
  // ...existing code...

  try {
    // Debug: log the API URL being used (Expo web uses EXPO_PUBLIC_ prefix)
    console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
    // Step 1: Pick the move and get explanation in one call
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || '/api/openrouter/chat';
  // Build the dynamic part of the prompt
  const dynamicPrompt = `\nYOUR HP (AI): ${safeAiHp}/${ai.maxHp}\nOPPONENT HP (Player): ${safePlayerHp}/${player.maxHp}\n\nYour available abilities: ${aiOptions.map(a => `${a.name} (${a.type}, power: ${a.power})`).join(', ')}\nOpponent status: ${playerStatus}\n`;
  // Combine static and dynamic parts
  const combinedPrompt = STATIC_PROMPT + dynamicPrompt;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: combinedPrompt }],
        model: 'deepseek/deepseek-chat-v3-0324:free'
      })
    });
    const data = await response.json();
    let abilityId = aiOptions[0].id;
    let llmThought = '';
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      try {
        const match = data.choices[0].message.content.match(/\{[^}]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (parsed.abilityId) {
            abilityId = parsed.abilityId;
          }
          if (parsed.thought) {
            llmThought = parsed.thought;
          }
        }
      } catch (e) {
        // fallback to default abilityId
      }
    }
    const chosenAbility = aiOptions.find(a => a.id === abilityId) || aiOptions[0];
    const thought = llmThought || `AI fallback: No explanation returned.`;
    console.log(`AI Used: ${chosenAbility.name} (${chosenAbility.id}) | Thought: ${thought}`);
    return { abilityId: chosenAbility.id, thought, abilityName: chosenAbility.name };
  } catch (err) {
    console.log('AI Thought: Error calling LLM.', err);
    return { abilityId: aiOptions[0].id, thought: 'AI fallback: Error calling LLM.', abilityName: aiOptions[0].name };
  }
}
