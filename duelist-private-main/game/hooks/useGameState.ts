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
  draftOptions: [],
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

  const selectAbility = useCallback(async (abilityId: string) => {
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
      let updatedPlayer = updateStatusEffects(playerCopy);
      let updatedAI = updateStatusEffects(aiCopy);
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
          winner = null;
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
      const filteredCombatLog = combatResult.battleLog.filter(
        entry => !(entry.turn === gameState.currentTurn && entry.type === 'action' && entry.message.includes(gameState.players.ai.name))
      );
      const finalBattleLog: BattleLogEntry[] = [
        ...gameState.battleLog,
        ...(aiActionEntry ? [aiActionEntry] : []),
        aiThoughtEntry,
        ...filteredCombatLog,
      ];
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
        draftOptions: gameState.draftOptions || [],
        battleLog: finalBattleLog,
        winner,
        lastTurnPlayerAbility: undefined,
        lastTurnAIAbility: aiAbility,
      });
      return;
    }
    const playerAbility = gameState.playerOptions.find(a => a.id === abilityId);
    if (!playerAbility) return;
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
    let updatedPlayer = updateStatusEffects(playerCopy);
    let updatedAI = updateStatusEffects(aiCopy);
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
      draftOptions: gameState.draftOptions || [],
      battleLog: finalBattleLog,
      winner,
      lastTurnPlayerAbility: playerAbility,
      lastTurnAIAbility: aiAbility,
    });
  }, [gameState]);

  const startGame = useCallback(() => {
    // Deep clone initial player and AI to avoid reference issues
    const freshPlayer = JSON.parse(JSON.stringify(initialPlayer));
    const freshAI = JSON.parse(JSON.stringify(initialAI));
    setGameState({
      ...initialGameState,
      phase: 'duel',
      players: {
        player: freshPlayer,
        ai: freshAI,
      },
      playerOptions: getRandomAbilities(3),
      aiOptions: getRandomAbilities(3),
      draftOptions: [],
      battleLog: [{
        id: 'game-start',
        turn: 0,
        message: 'Welcome to Shadow Duelist! Abilities will surface each turn!',
        type: 'system',
        timestamp: Date.now(),
      }],
      winner: null,
    });
  }, []);

  const resetGame = startGame;

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

