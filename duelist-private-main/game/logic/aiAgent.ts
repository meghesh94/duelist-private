
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
  // Also clamp actual HP values for both AI and player
  ai.hp = safeAiHp;
  player.hp = safePlayerHp;
  // Summarize previous ability usage
  const recentPlayerMoves = battleLog.filter(e => e.type === 'action' && e.message.includes(player.name)).map(e => e.message).join(' | ');
  const recentAIMoves = battleLog.filter(e => e.type === 'action' && e.message.includes(ai.name)).map(e => e.message).join(' | ');
  // Player status effects
  const playerStatus = player.statusEffects.length > 0
    ? player.statusEffects.map(e => `${e.name}${e.type ? ` (${e.type})` : ''}`).join(', ')
    : 'None';
  // Full battle log summary
  const battleLogSummary = battleLog.map(e => `[Turn ${e.turn || '?'}] ${e.message}`).join('\n');
  const prompt = `
You are a strategic duelist AI. Your current HP: ${safeAiHp}/${ai.maxHp}. Opponent HP: ${safePlayerHp}/${player.maxHp}.
Your available abilities: ${aiOptions.map(a => `${a.name} (${a.type}, power: ${a.power})`).join(', ')}.
Opponent's current status: ${playerStatus}
Your previous moves: ${recentAIMoves || 'None'}
Opponent's previous moves: ${recentPlayerMoves || 'None'}
Battle log so far:\n${battleLogSummary}
Describe your reasoning and choose the best ability to win. Respond ONLY in valid JSON, with this format: { "abilityId": "...", "thought": "..." }
If you cannot decide, pick the first ability and explain why. Do not include any text outside the JSON object.
`;

  try {
    // Call backend proxy instead of OpenAI directly
    const response = await fetch('http://localhost:3001/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7
      })
    });
    const data = await response.json();
    console.log('Raw LLM response:', JSON.stringify(data));
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.log('AI Thought: No valid response from LLM.');
      return { abilityId: aiOptions[0].id, thought: 'AI fallback: No valid response from LLM.' };
    }
    const match = data.choices[0].message.content.match(/{.*}/s);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed.abilityId && parsed.thought) {
          console.log('AI Thought:', parsed.thought);
          return { abilityId: parsed.abilityId, thought: parsed.thought };
        }
      } catch (e) {
        console.log('AI Thought: Invalid JSON from LLM.');
        return { abilityId: aiOptions[0].id, thought: 'AI fallback: Invalid JSON from LLM.' };
      }
    }
    console.log('AI Thought: No valid move from LLM.');
    return { abilityId: aiOptions[0].id, thought: 'AI fallback: No valid move from LLM.' };
  } catch (err) {
    console.log('AI Thought: Error calling LLM.');
    return { abilityId: aiOptions[0].id, thought: 'AI fallback: Error calling LLM.' };
  }
}