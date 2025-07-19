import { Character } from '../../types/game';

export const CHARACTERS: Record<'player' | 'ai', Character> = {
  player: {
    id: 'player',
    name: 'Riven',
    title: 'the Shadowblade',
    avatar: '🗡️',
    description: 'A master assassin who strikes from the shadows with deadly precision.',
    primaryColor: '#6B46C1',
    secondaryColor: '#8B5CF6',
    flavorText: 'The shadows whisper your name...',
  },
  ai: {
    id: 'ai',
    name: 'Orion',
    title: 'the Mind Engine',
    avatar: '🤖',
    description: 'An arcane AI strategist with computational mastery over battle tactics.',
    primaryColor: '#EF4444',
    secondaryColor: '#F87171',
    flavorText: 'Welcome, mortal. Let\'s see your mind unravel.',
  },
};

export function getCharacter(id: 'player' | 'ai'): Character {
  return CHARACTERS[id];
}