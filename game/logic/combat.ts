import { Player, Ability, StatusEffect, BattleLogEntry, CombatResult } from '../../types/game';

export function resolveCombat(
  player: Player,
  ai: Player,
  playerAction: Ability,
  aiAction: Ability,
  turn: number
): CombatResult {
  const battleLog: BattleLogEntry[] = [];
  let playerDamage = 0;
  let aiDamage = 0;
  const statusEffects: StatusEffect[] = [];

  // Check if players are stunned
  const playerStunned = player.statusEffects.some(effect => effect.type === 'stun');
  const aiStunned = ai.statusEffects.some(effect => effect.type === 'stun');

  // Process player action (stunned players still act but with reduced effect)
  const playerResult = processAction(player, ai, playerAction, 'player', turn, playerStunned);
  aiDamage += playerResult.damage;
  battleLog.push(...playerResult.logs);
  statusEffects.push(...playerResult.statusEffects);

  // Process AI action
  const aiResult = processAction(ai, player, aiAction, 'ai', turn, aiStunned);
  playerDamage += aiResult.damage;
  battleLog.push(...aiResult.logs);
  statusEffects.push(...aiResult.statusEffects);

  return {
    playerAction,
    aiAction,
    playerDamage,
    aiDamage,
    statusEffects,
    battleLog,
  };
}

function processAction(
  actor: Player,
  target: Player,
  action: Ability,
  actorType: 'player' | 'ai',
  turn: number,
  isStunned: boolean = false
): { damage: number; logs: BattleLogEntry[]; statusEffects: StatusEffect[] } {
  const logs: BattleLogEntry[] = [];
  const statusEffects: StatusEffect[] = [];
  let damage = 0;

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
    case 'damage':
      let baseDamage = isStunned ? Math.ceil(action.power / 2) : action.power;
      
      // Special case for Berserker Rage - self damage
      if (action.id === 'rage') {
        logs.push({
          id: `${turn}-${actorType}-rage-self`,
          turn,
          message: `${actor.name} takes 2 damage from rage!`,
          type: 'damage',
          timestamp: Date.now(),
        });
      }
      
      damage = calculateDamage(baseDamage, target);
      if (damage > 0) {
        logs.push({
          id: `${turn}-${actorType}-damage`,
          turn,
          message: `${target.name} takes ${damage} damage!`,
          type: 'damage',
          timestamp: Date.now(),
        });
      } else {
        logs.push({
          id: `${turn}-${actorType}-blocked`,
          turn,
          message: `${target.name} blocks the attack!`,
          type: 'status',
          timestamp: Date.now(),
        });
      }
      break;

    case 'heal':
      const healAmount = isStunned ? Math.ceil(action.power / 2) : action.power;
      logs.push({
        id: `${turn}-${actorType}-heal`,
        turn,
        message: `${actor.name} heals for ${healAmount} HP!`,
        type: 'heal',
        timestamp: Date.now(),
      });
      break;

    case 'block':
      const blockPower = isStunned ? Math.ceil(action.power / 2) : action.power;
      const blockDuration = action.id === 'shield' ? 2 : 1;
      statusEffects.push({
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

    case 'stun':
      // Stun deals damage first
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
      
      // Then apply stun for next turn (only if not stunned)
      if (!isStunned) {
        statusEffects.push({
          id: `stun-${turn}`,
          name: 'Stunned',
          type: 'stun',
          duration: 1,
          icon: 'zap',
        });
        logs.push({
          id: `${turn}-${actorType}-stun-effect`,
          turn,
          message: `${target.name} will be stunned next turn!`,
          type: 'status',
          timestamp: Date.now(),
        });
      }
      break;

    case 'drain':
      damage = calculateDamage(isStunned ? Math.ceil(action.power / 2) : action.power, target);
      const healAmountDrain = action.id === 'lifesteal' 
        ? 2 
        : (isStunned ? 1 : 1);
      
      if (damage > 0) {
        logs.push({
          id: `${turn}-${actorType}-drain-damage`,
          turn,
          message: `${target.name} takes ${damage} damage from drain!`,
          type: 'damage',
          timestamp: Date.now(),
        });
      }
      
      logs.push({
        id: `${turn}-${actorType}-drain-heal`,
        turn,
        message: `${actor.name} heals for ${healAmountDrain} HP!`,
        type: 'heal',
        timestamp: Date.now(),
      });
      break;

    case 'dodge':
      statusEffects.push({
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

    case 'poison':
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
      
      // Apply poison effect
      statusEffects.push({
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
      break;

    case 'freeze':
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
      
      statusEffects.push({
        id: `freeze-${turn}`,
        name: 'Slowed',
        type: 'freeze',
        duration: 6, // 6 turns total, skip every 3rd
        icon: 'snowflake',
        power: 3, // Skip every 3rd turn
      });
      logs.push({
        id: `${turn}-${actorType}-freeze-effect`,
        turn,
        message: `${target.name} is slowed (will skip 1/3 turns)!`,
        type: 'status',
        timestamp: Date.now(),
      });
      break;
  }

  // Handle special ability effects after main logic
  if (action.id === 'fireball') {
    // Fireball special case - 50% miss chance unless target is stunned
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
      damage = 0; // Override damage to 0 on miss
    }
  }

  if (action.id === 'rage') {
    // Berserker Rage self-damage
    logs.push({
      id: `${turn}-${actorType}-rage-self`,
      turn,
      message: `${actor.name} takes 3 damage from rage!`,
      type: 'damage',
      timestamp: Date.now(),
    });
  }

  return { damage, logs, statusEffects };
}

function calculateDamage(baseDamage: number, target: Player): number {
  // Check if target is dodging
  const isDodging = target.statusEffects.some(effect => effect.type === 'dodge');
  if (isDodging) return 0;

  // Apply block reduction
  const blockEffect = target.statusEffects.find(effect => effect.type === 'block');
  if (blockEffect) {
    const blockedAmount = blockEffect.power || 2;
    return Math.max(0, baseDamage - blockedAmount);
  }

  return baseDamage;
}

export function updateStatusEffects(player: Player): Player {
  return {
    ...player,
    statusEffects: player.statusEffects
      .map(effect => ({ ...effect, duration: effect.duration - 1 }))
      .filter(effect => effect.duration > 0),
  };
}