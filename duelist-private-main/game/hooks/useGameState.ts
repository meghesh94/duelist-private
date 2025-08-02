import { useState, useCallback } from 'react';
import { GameState, Player, Ability, BattleLogEntry } from '../../types/game';
import { getRandomAbilities } from '../logic/abilities';
import { resolveCombat, updateStatusEffects } from '../logic/combat';
import { getAIDraftChoice } from '../logic/ai';
import { getAgentMoveLLM } from '../logic/aiAgent';
import { getCharacter } from '../logic/characters';

const initialPlayer: Player = {
  id: 'player',
  name: 'Riven the Shadowblade',
  avatar: '🗡️',
  hp: 30,
  maxHp: 30,
  abilities: [],
  statusEffects: [],
};

const initialAI: Player = {
  id: 'ai',
  name: 'Orion the Mind Engine',
  avatar: '🤖',
  hp: 30,
  maxHp: 30,
  abilities: [],
  statusEffects: [],
};

const initialGameState: GameState = {
  phase: 'duel',
  currentTurn: 1,
  players: {
    player: initialPlayer,
    ai: initialAI,
  },
  playerOptions: getRandomAbilities(3),
  aiOptions: getRandomAbilities(3),
  battleLog: [{
    id: 'game-start',
    turn: 0,
    message: 'Welcome to Shadow Duelist! Abilities will surface each turn!',
    type: 'system',
    timestamp: Date.now(),
  }],
  winner: null,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const startGame = useCallback(() => {
    setGameState({
      ...initialGameState,
      phase: 'duel',
      playerOptions: getRandomAbilities(3),
      aiOptions: getRandomAbilities(3),
      battleLog: [{
        id: 'game-start',
        turn: 0,
        message: 'Welcome to Shadow Duelist! Abilities will surface each turn!',
        type: 'system',
        timestamp: Date.now(),
      }],
    });
  }, []);
  const selectAbility = useCallback(async (abilityId: string) => {
    // Optionally show loading in UI via a separate state if needed
    // If player is stunned, skip their move and only let AI act
    const isPlayerStunned = gameState.players.player.statusEffects.some(e => e.type === 'stun');
    let aiMove: { abilityId: string, thought: string };
    if (isPlayerStunned) {
      aiMove = await getAgentMoveLLM(
        gameState.players.ai,
        gameState.players.player,
        gameState.aiOptions,
        gameState.playerOptions,
        gameState.battleLog
      );
      const aiAbility = gameState.aiOptions.find(a => a.id === aiMove.abilityId) || gameState.aiOptions[0];
      // Use fresh copies for combat
      const playerCopy = { ...gameState.players.player };
      const aiCopy = { ...gameState.players.ai };
      const combatResult = resolveCombat(
        playerCopy,
        aiCopy,
        gameState.playerOptions,
        gameState.aiOptions,
        '',
        aiAbility.id,
        gameState.currentTurn
      );
      // Only update status effect durations after combat
      let updatedPlayer = updateStatusEffects(playerCopy);
      let updatedAI = updateStatusEffects(aiCopy);
      // Clamp HP to maxHp after all updates
      updatedPlayer.hp = Math.min(updatedPlayer.hp, updatedPlayer.maxHp);
      updatedAI.hp = Math.min(updatedAI.hp, updatedAI.maxHp);
      let winner: 'player' | 'ai' | null = null;
      let phase = gameState.phase;
      if (updatedPlayer.hp <= 0 && updatedAI.hp <= 0) {
        if (updatedPlayer.hp > updatedAI.hp) {
          winner = 'player';
        } else if (updatedAI.hp > updatedPlayer.hp) {
          winner = 'ai';
        } else {
          winner = null; // Draw
        }
        phase = 'gameOver';
      } else if (updatedPlayer.hp <= 0) {
        winner = 'ai';
        phase = 'gameOver';
      } else if (updatedAI.hp <= 0) {
        winner = 'player';
        phase = 'gameOver';
      }
      const nextPlayerOptions = getRandomAbilities(3);
      const nextAiOptions = getRandomAbilities(3);
      // Always ensure 'AI uses' and 'AI thought' are present as separate lines for this turn
      const aiActionEntry = combatResult.battleLog.find(
        entry => entry.turn === gameState.currentTurn && entry.type === 'action' && entry.message.includes(gameState.players.ai.name)
      );
      const aiThoughtEntry: BattleLogEntry = {
        id: `ai-thought-${gameState.currentTurn}`,
        turn: gameState.currentTurn,
        message: `AI thought: ${aiMove.thought}`,
        type: 'system',
        timestamp: Date.now(),
      };
      // Remove all AI action entries for this turn from combat log to avoid duplicates
      const filteredCombatLog = combatResult.battleLog.filter(
        entry => !(entry.turn === gameState.currentTurn && entry.type === 'action' && entry.message.includes(gameState.players.ai.name))
      );
      const finalBattleLog: BattleLogEntry[] = [
        ...gameState.battleLog,
        ...(aiActionEntry ? [aiActionEntry] : []),
        aiThoughtEntry,
        ...filteredCombatLog,
      ];
      // Debug: print all log entries for this turn
      console.log('Final Battle Log for turn', gameState.currentTurn, finalBattleLog.filter(e => e.turn === gameState.currentTurn));
      if (phase === 'gameOver') {
        let gameOverMsg = '';
        if (winner === 'player') {
          gameOverMsg = 'Game Over! You win!';
        } else if (winner === 'ai') {
          gameOverMsg = 'Game Over! AI wins!';
        } else {
          gameOverMsg = 'Game Over! It\'s a draw!';
        }
        finalBattleLog.push({
          id: `game-over-${gameState.currentTurn}`,
          turn: gameState.currentTurn,
          message: gameOverMsg,
          type: 'system',
          timestamp: Date.now(),
        });
      }
      setGameState({
        ...gameState,
        phase,
        currentTurn: gameState.currentTurn + 1,
        players: {
          player: updatedPlayer,
          ai: updatedAI
        },
        playerOptions: nextPlayerOptions,
        aiOptions: nextAiOptions,
        battleLog: finalBattleLog,
        winner
      });
      return;
    }
    // Normal turn: player acts, AI uses LLM
    const playerAbility = gameState.playerOptions.find(a => a.id === abilityId);
    if (!playerAbility) return;
    // Remove current turn's player action from battleLog for AI move selection
    const battleLogForAI = gameState.battleLog.filter(
      entry => !(entry.turn === gameState.currentTurn && entry.type === 'action' && entry.message.includes(gameState.players.player.name))
    );
    aiMove = await getAgentMoveLLM(
      gameState.players.ai,
      gameState.players.player,
      gameState.aiOptions,
      gameState.playerOptions,
      battleLogForAI
    );
    const aiAbility = gameState.aiOptions.find(a => a.id === aiMove.abilityId) || gameState.aiOptions[0];
    // Use fresh copies for combat
    const playerCopy = { ...gameState.players.player };
    const aiCopy = { ...gameState.players.ai };
    const combatResult = resolveCombat(
      playerCopy,
      aiCopy,
      gameState.playerOptions,
      gameState.aiOptions,
      playerAbility.id,
      aiAbility.id,
      gameState.currentTurn
    );
    // Only update status effect durations after combat
    let updatedPlayer = updateStatusEffects(playerCopy);
    let updatedAI = updateStatusEffects(aiCopy);
    // Clamp HP to maxHp after all updates
    updatedPlayer.hp = Math.min(updatedPlayer.hp, updatedPlayer.maxHp);
    updatedAI.hp = Math.min(updatedAI.hp, updatedAI.maxHp);
    let winner: 'player' | 'ai' | null = null;
    let phase = gameState.phase;
    if (updatedPlayer.hp <= 0 && updatedAI.hp <= 0) {
      winner = 'player';
      phase = 'gameOver';
    } else if (updatedPlayer.hp <= 0) {
      winner = 'ai';
      phase = 'gameOver';
    } else if (updatedAI.hp <= 0) {
      winner = 'player';
      phase = 'gameOver';
    }
    const nextPlayerOptions = getRandomAbilities(3);
    const nextAiOptions = getRandomAbilities(3);
    // Remove any duplicate AI actions from combatResult.battleLog for this turn
    const filteredCombatLog = combatResult.battleLog.filter(
      entry => !(entry.turn === gameState.currentTurn && entry.type === 'action' && entry.message.includes(gameState.players.ai.name))
    );
    const finalBattleLog: BattleLogEntry[] = [
      ...gameState.battleLog,
      {
        id: `ai-thought-${gameState.currentTurn}`,
        turn: gameState.currentTurn,
        message: `AI thought: ${aiMove.thought}`,
        type: 'system',
        timestamp: Date.now(),
      },
      ...filteredCombatLog,
    ];
    if (winner) {
      finalBattleLog.push({
        id: `game-over-${gameState.currentTurn}`,
        turn: gameState.currentTurn,
        message: `Game Over! ${winner === 'player' ? 'You win!' : 'AI wins!'}`,
        type: 'system',
        timestamp: Date.now(),
      });
    }
    setGameState({
      ...gameState,
      phase,
      currentTurn: gameState.currentTurn + 1,
      players: {
        player: updatedPlayer,
        ai: updatedAI
      },
      playerOptions: nextPlayerOptions,
      aiOptions: nextAiOptions,
      battleLog: finalBattleLog,
      winner
    });
  }, [gameState]);

  const resetGame = useCallback(() => {
    setGameState({
      ...initialGameState,
      phase: 'duel',
      playerOptions: getRandomAbilities(3),
      aiOptions: getRandomAbilities(3),
      battleLog: [{
        id: 'game-start',
        turn: 0,
        message: 'Welcome to Shadow Duelist! Abilities will surface each turn!',
        type: 'system',
        timestamp: Date.now(),
      }],
    });
  }, [startGame]);

  // Placeholder draftAbility function
  const draftAbility = () => {
    // TODO: implement draft logic
  };

  return {
    gameState,
    startGame,
    selectAbility,
    resetGame,
    draftAbility,
  };
}

