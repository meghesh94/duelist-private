import { GameState, Ability, Player } from '../../types/game';

export interface AgentMove {
  moveId: string;
  thought: string;
  confidence: number;
  reasoning: string;
}

// Mock GPT-powered agent for strategic decision making
export async function getAgentMove(gameState: GameState): Promise<AgentMove> {
  const { players, currentTurn, battleLog } = gameState;
  const aiPlayer = players.ai;
  const playerData = players.player;
  
  // Analyze game state
  const gameAnalysis = analyzeGameState(gameState);
  
  // Generate strategic prompt
  const prompt = generateStrategicPrompt(gameAnalysis);
  
  // Mock GPT response (replace with real API call later)
  const response = await mockGPTAgent(prompt, gameAnalysis);
  
  return response;
}

interface GameAnalysis {
  playerHP: number;
  aiHP: number;
  playerAbilities: string[];
  aiAbilities: Ability[];
  recentPlayerMoves: string[];
  playerTendencies: string;
  gamePhase: 'early' | 'mid' | 'late';
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  statusEffects: {
    player: string[];
    ai: string[];
  };
}

function analyzeGameState(gameState: GameState): GameAnalysis {
  const { players, battleLog, currentTurn } = gameState;
  
  // Analyze recent player moves
  const recentMoves = battleLog
    .filter(entry => entry.type === 'action' && entry.message.includes(players.player.name))
    .slice(-3)
    .map(entry => {
      const match = entry.message.match(/uses (.+)!/);
      return match ? match[1] : '';
    })
    .filter(Boolean);

  // Determine player tendencies
  let playerTendencies = 'balanced';
  const moveTypes = recentMoves.map(move => {
    const ability = players.player.abilities.find(a => a.name === move);
    return ability?.type || 'unknown';
  });
  
  const aggressiveMoves = moveTypes.filter(type => type === 'damage').length;
  const defensiveMoves = moveTypes.filter(type => ['heal', 'block', 'dodge'].includes(type)).length;
  
  if (aggressiveMoves > defensiveMoves) playerTendencies = 'aggressive';
  else if (defensiveMoves > aggressiveMoves) playerTendencies = 'defensive';

  // Determine game phase
  let gamePhase: 'early' | 'mid' | 'late' = 'early';
  if (currentTurn > 8) gamePhase = 'late';
  else if (currentTurn > 4) gamePhase = 'mid';

  // Assess threat level
  let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  const aiHPPercent = (players.ai.hp / players.ai.maxHp) * 100;
  const playerHPPercent = (players.player.hp / players.player.maxHp) * 100;
  
  if (aiHPPercent <= 25) threatLevel = 'critical';
  else if (aiHPPercent <= 50) threatLevel = 'high';
  else if (playerHPPercent > aiHPPercent + 30) threatLevel = 'medium';

  return {
    playerHP: players.player.hp,
    aiHP: players.ai.hp,
    playerAbilities: players.player.abilities.map(a => a.name),
    aiAbilities: players.ai.abilities,
    recentPlayerMoves: recentMoves,
    playerTendencies,
    gamePhase,
    threatLevel,
    statusEffects: {
      player: players.player.statusEffects.map(e => e.name),
      ai: players.ai.statusEffects.map(e => e.name),
    },
  };
}

function generateStrategicPrompt(analysis: GameAnalysis): string {
  return `You are Orion the Mind Engine, a strategic AI duelist with arcane intelligence.

GAME STATE:
- Your HP: ${analysis.aiHP}/20 (${Math.round((analysis.aiHP/20)*100)}%)
- Enemy HP: ${analysis.playerHP}/20 (${Math.round((analysis.playerHP/20)*100)}%)
- Game Phase: ${analysis.gamePhase}
- Threat Level: ${analysis.threatLevel}

ENEMY ANALYSIS:
- Abilities: ${analysis.playerAbilities.join(', ')}
- Recent moves: ${analysis.recentPlayerMoves.join(' → ') || 'None yet'}
- Fighting style: ${analysis.playerTendencies}
- Status effects: ${analysis.statusEffects.player.join(', ') || 'None'}

YOUR ARSENAL:
${analysis.aiAbilities.map(a => `- ${a.name}: ${a.description} (Power: ${a.power})`).join('\n')}

YOUR STATUS: ${analysis.statusEffects.ai.join(', ') || 'Clear'}

Choose your next move strategically. Consider:
1. Immediate survival vs long-term advantage
2. Counter-playing enemy tendencies
3. Status effect timing
4. Resource management

Respond with your chosen ability and tactical reasoning.`;
}

async function mockGPTAgent(prompt: string, analysis: GameAnalysis): Promise<AgentMove> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const { aiAbilities, threatLevel, gamePhase, playerTendencies, aiHP, playerHP } = analysis;
  
  // Strategic decision tree
  let chosenAbility: Ability;
  let thought: string;
  let reasoning: string;
  let confidence: number;

  // Critical HP - prioritize survival
  if (aiHP <= 4 && aiAbilities.some(a => a.type === 'heal')) {
    chosenAbility = aiAbilities.find(a => a.type === 'heal')!;
    thought = "Critical HP detected. Immediate healing required to survive another exchange.";
    reasoning = "With HP this low, any damage could be fatal. Healing takes absolute priority over offense.";
    confidence = 0.95;
  }
  // Player at low HP - go for kill
  else if (playerHP <= 5 && aiAbilities.some(a => a.type === 'damage')) {
    const damageAbilities = aiAbilities.filter(a => a.type === 'damage' || a.type === 'drain');
    chosenAbility = damageAbilities.reduce((max, curr) => curr.power > max.power ? curr : max);
    thought = "Enemy is vulnerable. Executing finishing strategy with maximum damage output.";
    reasoning = "When opponent is at critical HP, aggressive play maximizes win probability. Any hesitation gives them recovery time.";
    confidence = 0.9;
  }
  // Counter aggressive players with control
  else if (playerTendencies === 'aggressive' && aiAbilities.some(a => a.type === 'stun')) {
    chosenAbility = aiAbilities.find(a => a.type === 'stun')!;
    thought = "Enemy shows aggressive patterns. Disrupting their tempo with crowd control.";
    reasoning = "Aggressive players rely on momentum. Stun breaks their rhythm and forces defensive positioning.";
    confidence = 0.8;
  }
  // Counter defensive players with pressure
  else if (playerTendencies === 'defensive' && aiAbilities.some(a => a.type === 'damage')) {
    const damageAbilities = aiAbilities.filter(a => a.type === 'damage' || a.type === 'drain');
    chosenAbility = damageAbilities[Math.floor(Math.random() * damageAbilities.length)];
    thought = "Enemy playing defensively. Applying consistent pressure to force mistakes.";
    reasoning = "Defensive players wait for opportunities. Constant pressure forces them into unfavorable trades.";
    confidence = 0.75;
  }
  // Late game - high value plays
  else if (gamePhase === 'late' && aiAbilities.some(a => a.power >= 4)) {
    const highValueAbilities = aiAbilities.filter(a => a.power >= 4);
    chosenAbility = highValueAbilities[Math.floor(Math.random() * highValueAbilities.length)];
    thought = "Late game detected. Maximizing value with high-impact abilities.";
    reasoning = "In extended games, efficiency matters. High-power abilities provide better resource conversion.";
    confidence = 0.85;
  }
  // Default strategic choice
  else {
    // Balanced approach based on game state
    if (aiHP < playerHP && aiAbilities.some(a => a.type === 'heal')) {
      chosenAbility = aiAbilities.find(a => a.type === 'heal')!;
      thought = "Behind on HP. Stabilizing health pool before engaging.";
      reasoning = "Health advantage is crucial in duels. Equalizing HP creates better trading opportunities.";
      confidence = 0.7;
    } else if (aiAbilities.some(a => a.type === 'damage')) {
      const damageAbilities = aiAbilities.filter(a => a.type === 'damage' || a.type === 'drain');
      chosenAbility = damageAbilities[Math.floor(Math.random() * damageAbilities.length)];
      thought = "Standard pressure application. Maintaining offensive initiative.";
      reasoning = "Consistent damage forces opponent into reactive plays, giving us strategic control.";
      confidence = 0.65;
    } else {
      chosenAbility = aiAbilities[Math.floor(Math.random() * aiAbilities.length)];
      thought = "Adapting to available options. Maintaining tactical flexibility.";
      reasoning = "When optimal plays aren't available, maintaining board presence is key.";
      confidence = 0.6;
    }
  }

  return {
    moveId: chosenAbility.id,
    thought,
    reasoning,
    confidence,
  };
}