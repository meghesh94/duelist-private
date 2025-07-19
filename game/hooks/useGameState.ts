import { useState, useCallback } from 'react';
import { GameState, Player, Ability, BattleLogEntry } from '../../types/game';
import { getRandomAbilities } from '../logic/abilities';
import { resolveCombat, updateStatusEffects } from '../logic/combat';
import { getAIDraftChoice } from '../logic/ai';
import { getAgentMove } from '../logic/aiAgent';
import { getCharacter } from '../logic/characters';

const initialPlayer: Player = {
  id: 'player',
  name: 'Riven the Shadowblade',
  avatar: '🗡️',
  hp: 20,
  maxHp: 20,
  abilities: [],
  statusEffects: [],
};

const initialAI: Player = {
  id: 'ai',
  name: 'Orion the Mind Engine',
  avatar: '🤖',
  hp: 20,
  maxHp: 20,
  abilities: [],
  statusEffects: [],
};

const initialGameState: GameState = {
  phase: 'draft',
  currentTurn: 1,
  players: {
    player: initialPlayer,
    ai: initialAI,
  },
  draftOptions: [],
  battleLog: [],
  winner: null,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const startGame = useCallback(() => {
    const draftOptions = getRandomAbilities(3);
    setGameState({
      ...initialGameState,
      draftOptions,
      battleLog: [{
        id: 'game-start',
        turn: 0,
        message: 'Welcome to Shadow Duelist! Choose your abilities wisely...',
        type: 'system',
        timestamp: Date.now(),
      }],
    });
  }, []);

  const draftAbility = useCallback((abilityId: string) => {
    setGameState(prevState => {
      const selectedAbility = prevState.draftOptions.find(a => a.id === abilityId);
      if (!selectedAbility) return prevState;

      const updatedPlayer = {
        ...prevState.players.player,
        abilities: [...prevState.players.player.abilities, selectedAbility],
      };

      // Check if player has 3 abilities
      if (updatedPlayer.abilities.length === 3) {
        return {
          ...prevState,
          phase: 'duel' as const,
          players: {
            ...prevState.players,
            player: updatedPlayer,
          },
          battleLog: [
            ...prevState.battleLog,
            {
              id: 'draft-complete',
              turn: 0,
              message: 'Draft complete! Prepare for battle!',
              type: 'system',
              timestamp: Date.now(),
            },
          ],
        };
      }

      // AI makes its choice
      const aiChoice = getAIDraftChoice(
        prevState.players.ai.abilities,
        prevState.draftOptions.filter(a => a.id !== abilityId)
      );

      const updatedAI = {
        ...prevState.players.ai,
        abilities: [...prevState.players.ai.abilities, aiChoice.ability],
      };

      // Generate new draft options
      const usedAbilities = [
        ...updatedPlayer.abilities.map(a => a.id),
        ...updatedAI.abilities.map(a => a.id),
      ];
      const newDraftOptions = getRandomAbilities(3, usedAbilities);

      return {
        ...prevState,
        players: {
          player: updatedPlayer,
          ai: updatedAI,
        },
        draftOptions: newDraftOptions,
        battleLog: [
          ...prevState.battleLog,
          {
            id: `ai-draft-${updatedAI.abilities.length}`,
            turn: 0,
            message: `AI picks ${aiChoice.ability.name}. AI thinks: "${aiChoice.thought.analysis}"`,
            type: 'system',
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  const selectAbility = useCallback((abilityId: string) => {
    setGameState(prevState => {
      const playerAbility = prevState.players.player.abilities.find(a => a.id === abilityId);
      if (!playerAbility) return prevState;

      // Handle AI decision and combat resolution immediately
      (async () => {
        try {
          // Use the current state for AI decision
          const currentState = prevState;
          
          // AI selects ability using advanced agent
          const aiDecision = await getAgentMove(currentState);
          const aiAbility = currentState.players.ai.abilities.find(a => a.id === aiDecision.moveId);
          if (!aiAbility) return;

          // Resolve combat
          const combatResult = resolveCombat(
            currentState.players.player,
            currentState.players.ai,
            playerAbility,
            aiAbility,
            currentState.currentTurn
          );

          // Update player HP and status effects
          let updatedPlayer = { ...currentState.players.player };
          let updatedAI = { ...currentState.players.ai };
          
          setGameState(prevState => {
            const newBattleLog: BattleLogEntry[] = [];
            
            // Update player HP and status effects
            let updatedPlayer = { ...prevState.players.player };
            let updatedAI = { ...prevState.players.ai };
            
            updatedPlayer.hp = Math.max(0, updatedPlayer.hp - combatResult.playerDamage);
            // Apply damage
            updatedPlayer.hp = Math.max(0, updatedPlayer.hp - combatResult.playerDamage);
            updatedAI.hp = Math.max(0, updatedAI.hp - combatResult.aiDamage);
            
            // Apply healing for player abilities
            if (playerAbility.type === 'heal') {
              const healAmount = prevState.players.player.statusEffects.some(e => e.type === 'stun') 
                ? Math.ceil(playerAbility.power / 2)
                : playerAbility.power;
              updatedPlayer.hp = Math.min(updatedPlayer.maxHp, updatedPlayer.hp + healAmount);
            }
            if (playerAbility.type === 'drain' && combatResult.aiDamage > 0) {
              const healAmountDrain = playerAbility.id === 'lifesteal' ? 2 : 1;
              updatedPlayer.hp = Math.min(updatedPlayer.maxHp, updatedPlayer.hp + healAmountDrain);
            }
            
            // Apply healing for AI abilities
            if (aiAbility.type === 'heal') {
              const healAmount = prevState.players.ai.statusEffects.some(e => e.type === 'stun') 
                ? Math.ceil(aiAbility.power / 2)
                : aiAbility.power;
              updatedAI.hp = Math.min(updatedAI.maxHp, updatedAI.hp + healAmount);
            }
            if (aiAbility.type === 'drain' && combatResult.playerDamage > 0) {
              const healAmountDrain = aiAbility.id === 'lifesteal' ? 2 : 1;
              updatedAI.hp = Math.min(updatedAI.maxHp, updatedAI.hp + healAmountDrain);
            }
            
            // Apply self-damage for Berserker Rage
            if (playerAbility.id === 'rage') {
              updatedPlayer.hp = Math.max(0, updatedPlayer.hp - 3);
            }
            if (aiAbility.id === 'rage') {
              updatedAI.hp = Math.max(0, updatedAI.hp - 3);
            }

            // Process poison damage from existing effects
            const playerPoisonDamage = updatedPlayer.statusEffects
              .filter(effect => effect.type === 'poison')
              .reduce((total, effect) => total + (effect.power || 0), 0);
            
            const aiPoisonDamage = updatedAI.statusEffects
              .filter(effect => effect.type === 'poison')
              .reduce((total, effect) => total + (effect.power || 0), 0);
            
            if (playerPoisonDamage > 0) {
              updatedPlayer.hp = Math.max(0, updatedPlayer.hp - playerPoisonDamage);
              newBattleLog.push({
                id: `poison-damage-player-${prevState.currentTurn}`,
                turn: prevState.currentTurn,
                message: `${updatedPlayer.name} takes ${playerPoisonDamage} poison damage!`,
                type: 'damage',
                timestamp: Date.now(),
              });
            }
            
            if (aiPoisonDamage > 0) {
              updatedAI.hp = Math.max(0, updatedAI.hp - aiPoisonDamage);
              newBattleLog.push({
                id: `poison-damage-ai-${prevState.currentTurn}`,
                turn: prevState.currentTurn,
                message: `${updatedAI.name} takes ${aiPoisonDamage} poison damage!`,
                type: 'damage',
                timestamp: Date.now(),
              });
            }
            
            // Apply status effects
            combatResult.statusEffects.forEach(effect => {
              if (effect.name === 'Block' || effect.name === 'Dodge') {
                if (playerAbility.type === 'block' || playerAbility.type === 'dodge') {
                  updatedPlayer.statusEffects.push(effect);
                } else {
                  updatedAI.statusEffects.push(effect);
                }
              } else if (effect.name === 'Stunned' || effect.name === 'Poisoned' || effect.name === 'Slowed') {
                if (playerAbility.type === 'stun' || playerAbility.type === 'poison' || playerAbility.type === 'freeze') {
                  updatedAI.statusEffects.push(effect);
                } else {
                  updatedPlayer.statusEffects.push(effect);
                }
              }
            });
            
            updatedPlayer = updateStatusEffects(updatedPlayer);
            // Update status effect durations
            updatedPlayer = updateStatusEffects(updatedPlayer);
            updatedAI = updateStatusEffects(updatedAI);
            
            // Check for winner
            let winner: 'player' | 'ai' | null = null;
            let phase = prevState.phase;
            
            if (updatedPlayer.hp <= 0 && updatedAI.hp <= 0) {
              winner = 'player'; // Player wins ties
              phase = 'gameOver';
            } else if (updatedPlayer.hp <= 0) {
              winner = 'ai';
              phase = 'gameOver';
            } else if (updatedAI.hp <= 0) {
              winner = 'player';
              phase = 'gameOver';
            }
            
            newBattleLog.unshift({
              id: `ai-thought-${prevState.currentTurn}`,
              turn: prevState.currentTurn,
              message: `Orion thinks: "${aiDecision.thought}"`,
              type: 'system',
              timestamp: Date.now(),
            });
            
            newBattleLog.push(...combatResult.battleLog);
            
            const finalBattleLog: BattleLogEntry[] = [
              ...prevState.battleLog,
              ...newBattleLog,
            ];
            
            if (winner) {
              finalBattleLog.push({
                id: `game-over-${prevState.currentTurn}`,
                turn: prevState.currentTurn,
                message: `Game Over! ${winner === 'player' ? 'You win!' : 'AI wins!'}`,
                type: 'system',
                timestamp: Date.now(),
              });
            }
            
            return {
              ...prevState,
              phase,
              currentTurn: prevState.currentTurn + 1,
              players: {
                player: updatedPlayer,
                ai: updatedAI,
              },
              battleLog: finalBattleLog,
              winner,
            };
          });
        } catch (error) {
          console.error('Error in AI decision:', error);
          setGameState(prevState => ({
            ...prevState,
            battleLog: [
              ...prevState.battleLog,
              {
                id: `error-${prevState.currentTurn}`,
                turn: prevState.currentTurn,
                message: 'An error occurred during combat.',
                type: 'system',
                timestamp: Date.now(),
              }
            ]
          }));
        }
      })();

      return prevState;
    });
  }, [gameState]);

  const resetGame = useCallback(() => {
    setGameState({
      ...initialGameState,
      draftOptions: getRandomAbilities(3),
      battleLog: [{
        id: 'game-start',
        turn: 0,
        message: 'Welcome to Shadow Duelist! Choose your abilities wisely...',
        type: 'system',
        timestamp: Date.now(),
      }],
    });
  }, [startGame]);

  return {
    gameState,
    startGame,
    draftAbility,
    selectAbility,
    resetGame,
  };
}

export { useGameState }