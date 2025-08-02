import { Player, Ability, StatusEffect, BattleLogEntry, CombatResult } from '../../types/game';

export function resolveCombat(
  player: Player,
  ai: Player,
  playerOptions: Ability[],
  aiOptions: Ability[],
  playerActionId: string,
  aiActionId: string,
  turn: number
): CombatResult {
  const battleLog: BattleLogEntry[] = [];
  let playerDamage = 0;
  let aiDamage = 0;
  const statusEffects: StatusEffect[] = [];

  // Check if players are stunned
  const playerStunned = player.statusEffects.some(effect => effect.type === 'stun');
  const aiStunned = ai.statusEffects.some(effect => effect.type === 'stun');


  // Find selected abilities from surfaced options
  const playerAction = playerOptions.find(a => a.id === playerActionId);
  const aiAction = aiOptions.find(a => a.id === aiActionId);
  if (!playerAction || !aiAction) {
    throw new Error('Selected ability not found in options');
  }

  // Process both actions, collect status effects first
  let playerResult, aiResult;
  // First, process both actions to see if either is a stun
  let playerStunsAI = false;
  let aiStunsPlayer = false;
  if (playerAction.type === 'stun') playerStunsAI = true;
  if (aiAction.type === 'stun') aiStunsPlayer = true;

  // If both stun, both are stunned and do nothing
  if (playerStunsAI && aiStunsPlayer) {
    // Both stunned: add temporary stunned effect to both for this turn
    battleLog.push({
      id: `${turn}-both-stunned`,
      turn,
      message: `Both ${player.name} and ${ai.name} are stunned and cannot act this turn!`,
      type: 'status',
      timestamp: Date.now(),
    });
    player.statusEffects.push({
      id: `stunned-${turn}`,
      name: 'Stunned',
      type: 'stun',
      duration: 1,
      icon: 'zap',
    });
    ai.statusEffects.push({
      id: `stunned-${turn}`,
      name: 'Stunned',
      type: 'stun',
      duration: 1,
      icon: 'zap',
    });
    playerResult = { damage: 0, heal: 0, selfDamage: 0, logs: [], selfStatusEffects: [], targetStatusEffects: [] };
    aiResult = { damage: 0, heal: 0, selfDamage: 0, logs: [], selfStatusEffects: [], targetStatusEffects: [] };
  } else if (playerStunsAI) {
    // Player stuns AI: AI does nothing, player acts
    playerResult = processAction(player, ai, playerAction, 'player', turn, false);
    battleLog.push(...playerResult.logs);
    if (playerResult.selfStatusEffects && playerResult.selfStatusEffects.length > 0) {
      player.statusEffects.push(...playerResult.selfStatusEffects);
    }
    battleLog.push({
      id: `${turn}-ai-stunned-immediate`,
      turn,
      message: `${ai.name} is stunned and cannot act this turn!`,
      type: 'status',
      timestamp: Date.now(),
    });
    ai.statusEffects.push({
      id: `stunned-${turn}`,
      name: 'Stunned',
      type: 'stun',
      duration: 1,
      icon: 'zap',
    });
    aiResult = { damage: 0, heal: 0, selfDamage: 0, logs: [], selfStatusEffects: [], targetStatusEffects: [] };
  } else if (aiStunsPlayer) {
    // AI stuns player: player does nothing, AI acts
    battleLog.push({
      id: `${turn}-player-stunned-immediate`,
      turn,
      message: `${player.name} is stunned and cannot act this turn!`,
      type: 'status',
      timestamp: Date.now(),
    });
    player.statusEffects.push({
      id: `stunned-${turn}`,
      name: 'Stunned',
      type: 'stun',
      duration: 1,
      icon: 'zap',
    });
    playerResult = { damage: 0, heal: 0, selfDamage: 0, logs: [], selfStatusEffects: [], targetStatusEffects: [] };
    // Always log the actual AI action used (fix: ensure this is always present)
    battleLog.push({
      id: `${turn}-ai-action-actual`,
      turn,
      message: `${ai.name} uses ${aiAction.name}!`,
      type: 'action',
      timestamp: Date.now(),
    });
    aiResult = processAction(ai, player, aiAction, 'ai', turn, false);
    battleLog.push(...aiResult.logs);
    if (aiResult.selfStatusEffects && aiResult.selfStatusEffects.length > 0) {
      ai.statusEffects.push(...aiResult.selfStatusEffects);
    }
  } else {
    // Normal case: both act
    playerResult = processAction(player, ai, playerAction, 'player', turn, false);
    battleLog.push(...playerResult.logs);
    if (playerResult.selfStatusEffects && playerResult.selfStatusEffects.length > 0) {
      player.statusEffects.push(...playerResult.selfStatusEffects);
    }
    // Log the AI's action (always, for Game Over screen)
    battleLog.push({
      id: `${turn}-ai-action-actual`,
      turn,
      message: `${ai.name} uses ${aiAction.name}!`,
      type: 'action',
      timestamp: Date.now(),
    });
    aiResult = processAction(ai, player, aiAction, 'ai', turn, false);
    battleLog.push(...aiResult.logs);
    if (aiResult.selfStatusEffects && aiResult.selfStatusEffects.length > 0) {
      ai.statusEffects.push(...aiResult.selfStatusEffects);
    }
  }

  // Save target status effects to apply after end-of-turn effects
  const pendingPlayerTargetStatus = playerResult.targetStatusEffects ?? [];
  const pendingAITargetStatus = aiResult.targetStatusEffects ?? [];

  // Now recalculate damage using updated status effects
  // Player receives damage from AI action, heals/self-damage from own action
  const aiDamageFinal = aiStunned ? 0 : calculateDamage(aiResult.damage ?? 0, player);
  // Block healing if player is frozen (freeze effect active, duration === 1)
  const playerFrozen = player.statusEffects.some(effect => effect.type === 'freeze' && effect.duration === 1);
  if (playerResult.heal) {
    if (playerFrozen) {
      battleLog.push({
        id: `${turn}-player-heal-blocked-freeze`,
        turn,
        message: `${player.name}'s healing is blocked by freeze!`,
        type: 'status',
        timestamp: Date.now(),
      });
    } else {
      player.hp += playerResult.heal;
      battleLog.push({
        id: `${turn}-player-hp-heal`,
        turn,
        message: `${player.name} HP after heal: ${player.hp}`,
        type: 'system',
        timestamp: Date.now(),
      });
    }
  }
  if (playerResult.selfDamage) {
    player.hp -= playerResult.selfDamage;
    battleLog.push({
      id: `${turn}-player-hp-selfdamage`,
      turn,
      message: `${player.name} HP after self-damage: ${player.hp}`,
      type: 'system',
      timestamp: Date.now(),
    });
  }
  if (aiDamageFinal) {
    player.hp -= aiDamageFinal;
    battleLog.push({
      id: `${turn}-player-damage`,
      turn,
      message: `${player.name} takes ${aiDamageFinal} damage!`,
      type: 'damage',
      timestamp: Date.now(),
    });
    battleLog.push({
      id: `${turn}-player-hp-damage`,
      turn,
      message: `${player.name} HP after taking damage: ${player.hp}`,
      type: 'system',
      timestamp: Date.now(),
    });
  }

  // AI receives damage from player action, heals/self-damage from own action
  const playerDamageFinal = playerStunned ? 0 : calculateDamage(playerResult.damage ?? 0, ai);
  // Block healing if AI is frozen (freeze effect active, duration === 1)
  const aiFrozen = ai.statusEffects.some(effect => effect.type === 'freeze' && effect.duration === 1);
  if (aiResult.heal) {
    if (aiFrozen) {
      battleLog.push({
        id: `${turn}-ai-heal-blocked-freeze`,
        turn,
        message: `${ai.name}'s healing is blocked by freeze!`,
        type: 'status',
        timestamp: Date.now(),
      });
    } else {
      ai.hp += aiResult.heal;
      battleLog.push({
        id: `${turn}-ai-hp-heal`,
        turn,
        message: `${ai.name} HP after heal: ${ai.hp}`,
        type: 'system',
        timestamp: Date.now(),
      });
    }
  }
  if (aiResult.selfDamage) {
    ai.hp -= aiResult.selfDamage;
    battleLog.push({
      id: `${turn}-ai-hp-selfdamage`,
      turn,
      message: `${ai.name} HP after self-damage: ${ai.hp}`,
      type: 'system',
      timestamp: Date.now(),
    });
  }
  if (playerDamageFinal) {
    ai.hp -= playerDamageFinal;
    battleLog.push({
      id: `${turn}-ai-damage`,
      turn,
      message: `${ai.name} takes ${playerDamageFinal} damage!`,
      type: 'damage',
      timestamp: Date.now(),
    });
    battleLog.push({
      id: `${turn}-ai-hp-damage`,
      turn,
      message: `${ai.name} HP after taking damage: ${ai.hp}`,
      type: 'system',
      timestamp: Date.now(),
    });
  }

  // For test reporting
  playerDamage = aiDamageFinal; // Damage dealt to player by AI
  aiDamage = playerDamageFinal; // Damage dealt to AI by player


  // Apply poison/freeze effects at end of turn (before adding new status effects)
  [player, ai].forEach(p => {
    p.statusEffects.forEach(effect => {
      if (effect.type === 'poison') {
        // Only apply poison if duration < original duration (i.e., not just applied this turn)
        if (effect.duration < 3) {
          p.hp -= effect.power ?? 2;
          battleLog.push({
            id: `${turn}-${p.name}-poison-tick`,
            turn,
            message: `${p.name} takes ${effect.power ?? 2} poison damage!`,
            type: 'damage',
            timestamp: Date.now(),
          });
        }
      }
      // Log freeze removal when duration will expire next turn
      if (effect.type === 'freeze' && effect.duration === 1) {
        battleLog.push({
          id: `${turn}-${p.name}-freeze-removed`,
          turn,
          message: `${p.name} is no longer frozen!`,
          type: 'status',
          timestamp: Date.now(),
        });
      }
    });
  });

  // Ensure target status effects are always applied to the correct target
  // For player actions, playerResult.targetStatusEffects should go to ai
  // For AI actions, aiResult.targetStatusEffects should go to player
  ai.statusEffects.push(...playerResult.targetStatusEffects);
  player.statusEffects.push(...aiResult.targetStatusEffects);

  // Clamp HP to maxHp after all effects
  player.hp = Math.max(0, Math.min(player.hp, player.maxHp));
  ai.hp = Math.max(0, Math.min(ai.hp, ai.maxHp));

  // Log final HP for both player and AI after all effects
  battleLog.push({
    id: `${turn}-player-hp-final`,
    turn,
    message: `${player.name} HP at end of turn: ${player.hp}`,
    type: 'system',
    timestamp: Date.now(),
  });
  battleLog.push({
    id: `${turn}-ai-hp-final`,
    turn,
    message: `${ai.name} HP at end of turn: ${ai.hp}`,
    type: 'system',
    timestamp: Date.now(),
  });

  // Debug: log the entire battle log
  console.log('Battle Log:', battleLog);

  return {
    playerAction,
    aiAction,
    playerDamage,
    aiDamage,
    statusEffects,
    battleLog,
  };
}

function calculateDamage(baseDamage: number, target: Player): number {
  // Check if target is dodging
  const isDodging = target.statusEffects.some(effect => effect.type === 'dodge');
  if (isDodging) return 0;

  // Apply all block effects (stacking)
  const blockEffects = target.statusEffects.filter(effect => effect.type === 'block');
  const totalBlocked = blockEffects.reduce((sum, effect) => sum + (effect.power ?? 2), 0);
  return Math.max(0, baseDamage - totalBlocked);
}

function processAction(
  actor: Player,
  target: Player,
  action: Ability,
  actorType: 'player' | 'ai',
  turn: number,
  isStunned: boolean = false
): { damage: number; logs: BattleLogEntry[]; selfStatusEffects: StatusEffect[]; targetStatusEffects: StatusEffect[]; heal?: number; selfDamage?: number } {
  const logs: BattleLogEntry[] = [];
  const selfStatusEffects: StatusEffect[] = [];
  const targetStatusEffects: StatusEffect[] = [];
  let damage = 0;
  let heal = 0;
  let selfDamage = 0;

  // If stunned, show message and reduce effectiveness
  if (isStunned) {
    logs.push({
      id: `${turn}-${actorType}-stunned`,
      turn,
      message: `${actor.name} is stunned but struggles to act!`,
      type: 'status',
      timestamp: Date.now(),
    });
  }

  logs.push({
    id: `${turn}-${actorType}-action`,
    turn,
    message: `${actor.name} uses ${action.name}!`,
    type: 'action',
    timestamp: Date.now(),
  });

  switch (action.type) {
    case 'damage': {
      const baseDamage = isStunned ? Math.ceil(action.power / 2) : action.power;
      damage = calculateDamage(baseDamage, target);
      if (damage <= 0) {
        logs.push({
          id: `${turn}-${actorType}-blocked`,
          turn,
          message: `${target.name} blocks the attack!`,
          type: 'status',
          timestamp: Date.now(),
        });
      }
      break;
    }
    case 'heal': {
      const healAmount = isStunned ? Math.ceil(action.power / 2) : action.power;
      logs.push({
        id: `${turn}-${actorType}-heal`,
        turn,
        message: `${actor.name} heals for ${healAmount} HP!`,
        type: 'heal',
        timestamp: Date.now(),
      });
      heal += healAmount;
      break;
    }
    case 'block': {
      const blockPower = isStunned ? Math.ceil(action.power / 2) : action.power;
      const blockDuration = 1;
      selfStatusEffects.push({
        id: `block-${turn}`,
        name: 'Block',
        type: 'block',
        duration: blockDuration,
        icon: 'shield',
        power: blockPower,
      });
      logs.push({
        id: `${turn}-${actorType}-block`,
        turn,
        message: `${actor.name} prepares to block ${blockPower === 999 ? 'all' : blockPower} damage for ${blockDuration} turn${blockDuration > 1 ? 's' : ''}!`,
        type: 'status',
        timestamp: Date.now(),
      });
      break;
    }
    case 'stun': {
      // Stun now cancels the opponent's action this turn, not next turn
      // Only apply damage if stun has power
      if (action.power && action.power > 0) {
        damage = calculateDamage(isStunned ? Math.ceil(action.power / 2) : action.power, target);
        if (damage > 0) {
          logs.push({
            id: `${turn}-${actorType}-stun-damage`,
            turn,
            message: `${target.name} takes ${damage} damage from the stun attack!`,
            type: 'damage',
            timestamp: Date.now(),
          });
        }
      }
      // No longer apply a stun status effect for next turn
      break;
    }
    case 'drain': {
      damage = calculateDamage(isStunned ? Math.ceil(action.power / 2) : action.power, target);
      if (damage > 0) {
        logs.push({
          id: `${turn}-${actorType}-drain-damage`,
          turn,
          message: `${target.name} takes ${damage} damage from drain!`,
          type: 'damage',
          timestamp: Date.now(),
        });
        heal += damage;
        logs.push({
          id: `${turn}-${actorType}-drain-heal`,
          turn,
          message: `${actor.name} heals for ${damage} HP from drain!`,
          type: 'heal',
          timestamp: Date.now(),
        });
      } else {
        logs.push({
          id: `${turn}-${actorType}-drain-blocked`,
          turn,
          message: `${actor.name}'s drain was blocked and no healing occurred!`,
          type: 'status',
          timestamp: Date.now(),
        });
        heal = 0; // Explicitly set heal to 0 if drain is dodged or blocked
      }
      break;
    }
    case 'dodge': {
      selfStatusEffects.push({
        id: `dodge-${turn}`,
        name: 'Dodge',
        type: 'dodge',
        duration: 1,
        icon: 'wind',
      });
      logs.push({
        id: `${turn}-${actorType}-dodge`,
        turn,
        message: `${actor.name} prepares to dodge!`,
        type: 'status',
        timestamp: Date.now(),
      });
      break;
    }
    case 'poison': {
      damage = calculateDamage(isStunned ? Math.ceil(action.power / 2) : action.power, target);
      if (damage > 0) {
        logs.push({
          id: `${turn}-${actorType}-poison-damage`,
          turn,
          message: `${target.name} takes ${damage} damage from ${action.name}!`,
          type: 'damage',
          timestamp: Date.now(),
        });
      }
      // Prevent stacking: refresh poison if already present, else add new
      const existingPoison = target.statusEffects.find(e => e.type === 'poison');
      if (existingPoison) {
        existingPoison.duration = 3;
        logs.push({
          id: `${turn}-${actorType}-poison-refresh`,
          turn,
          message: `${target.name}'s poison is refreshed to 3 turns!`,
          type: 'status',
          timestamp: Date.now(),
        });
      } else {
        targetStatusEffects.push({
          id: `poison-${turn}`,
          name: 'Poisoned',
          type: 'poison',
          duration: 3,
          icon: 'droplets',
          power: 2,
        });
        logs.push({
          id: `${turn}-${actorType}-poison-effect`,
          turn,
          message: `${target.name} is poisoned for 3 turns (2 damage/turn)!`,
          type: 'status',
          timestamp: Date.now(),
        });
      }
      break;
    }
    case 'freeze': {
      damage = calculateDamage(isStunned ? Math.ceil(action.power / 2) : action.power, target);
      if (damage > 0) {
        logs.push({
          id: `${turn}-${actorType}-freeze-damage`,
          turn,
          message: `${target.name} takes ${damage} damage from ice shard!`,
          type: 'damage',
          timestamp: Date.now(),
        });
      }
      targetStatusEffects.push({
        id: `freeze-${turn}`,
        name: 'Frozen',
        type: 'freeze',
        duration: 2, // so after end-of-turn decrement, 1 turn remains
        icon: 'snowflake',
        power: 0,
      });
      logs.push({
        id: `${turn}-${actorType}-freeze-effect`,
        turn,
        message: `${target.name} is frozen and cannot heal next turn!`,
        type: 'status',
        timestamp: Date.now(),
      });
      break;
    }
  }

  // Handle special ability effects after main logic
  if (action.id === 'fireball') {
    const targetStunned = target.statusEffects.some(effect => effect.type === 'stun');
    const missChance = targetStunned ? 0 : 0.5;
    if (Math.random() < missChance) {
      logs.push({
        id: `${turn}-${actorType}-fireball-miss`,
        turn,
        message: `${actor.name}'s fireball misses!`,
        type: 'status',
        timestamp: Date.now(),
      });
      damage = 0;
    }
  }

  if (action.id === 'rage') {
    logs.push({
      id: `${turn}-${actorType}-rage-self`,
      turn,
      message: `${actor.name} takes 2 damage from rage!`,
      type: 'damage',
      timestamp: Date.now(),
    });
    selfDamage += 2;
  }

  return { damage, logs, selfStatusEffects, targetStatusEffects, heal, selfDamage };
}

export function updateStatusEffects(player: Player): Player {
  return {
    ...player,
    statusEffects: player.statusEffects
      .map(effect => ({ ...effect, duration: effect.duration - 1 }))
      .filter(effect => effect.duration > 0),
  };
}