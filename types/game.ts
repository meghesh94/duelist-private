export type GamePhase = 'draft' | 'duel' | 'gameOver';

export interface Ability {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'damage' | 'heal' | 'block' | 'stun' | 'dodge' | 'drain' | 'buff' | 'poison' | 'freeze';
  power: number;
  cost?: number;
}

export interface Player {
  id: 'player' | 'ai';
  name: string;
  avatar: string;
  hp: number;
  maxHp: number;
  abilities: Ability[];
  statusEffects: StatusEffect[];
}

export interface StatusEffect {
  id: string;
  name: string;
  type: 'stun' | 'block' | 'dodge' | 'poison' | 'freeze';
  duration: number;
  icon: string;
  power?: number;
}

export interface GameState {
  phase: GamePhase;
  currentTurn: number;
  players: {
    player: Player;
    ai: Player;
  };
  draftOptions: Ability[];
  battleLog: BattleLogEntry[];
  winner: 'player' | 'ai' | null;
}

export interface BattleLogEntry {
  id: string;
  turn: number;
  message: string;
  type: 'action' | 'damage' | 'heal' | 'status' | 'system';
  timestamp: number;
}

export interface AIThought {
  analysis: string;
  reasoning: string;
  confidence: number;
}

export interface Character {
  id: 'player' | 'ai';
  name: string;
  title: string;
  avatar: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  flavorText: string;
}

export interface CombatResult {
  playerAction: Ability;
  aiAction: Ability;
  playerDamage: number;
  aiDamage: number;
  statusEffects: StatusEffect[];
  battleLog: BattleLogEntry[];
}