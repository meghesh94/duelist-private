// Utility to extract the calculation/result message from a turn's battle log entries

import { BattleLogEntry } from '../../types/game';

export interface TurnCalculationSummary {
  summary: string;
  playerFinalHp?: number;
  aiFinalHp?: number;
}

// Extracts summary lines and final HP for both player and AI from the turn's battle log
export function getCalculationMessage(entries: BattleLogEntry[]): TurnCalculationSummary {
  let lines: string[] = [];
  let playerFinalHp: number | undefined = undefined;
  let aiFinalHp: number | undefined = undefined;

  // Collect and deduplicate damage/heal/status lines for clarity
  const seen = new Set();
  const addLine = (msg: string) => {
    // Remove trailing ! and extra spaces for deduplication
    const norm = msg.replace(/!+$/, '').trim();
    if (!seen.has(norm)) {
      seen.add(norm);
      lines.push(msg);
    }
  };

  // Prefer lines that mention both the actor and the effect, and avoid double-reporting
  entries.forEach(e => {
    if (e.type === 'damage' || e.type === 'heal') {
      addLine(e.message);
    }
  });
  // Add block/miss/hit status lines if not already present
  entries.forEach(e => {
    if (e.type === 'status' && /block|miss|hit/i.test(e.message)) {
      addLine(e.message);
    }
  });

  // Try to extract final HP from any system/status message like "Riven is at 24 HP" or "Orion is at 18 HP"
  entries.forEach(e => {
    const playerHpMatch = e.message.match(/Riven[^\d]*(\d+) HP/);
    if (playerHpMatch) playerFinalHp = parseInt(playerHpMatch[1], 10);
    const aiHpMatch = e.message.match(/Orion[^\d]*(\d+) HP/);
    if (aiHpMatch) aiFinalHp = parseInt(aiHpMatch[1], 10);
  });

  // If nothing found, fallback to first status or system message
  if (lines.length === 0) {
    const fallback = entries.find(e => e.type === 'status' || e.type === 'system');
    if (fallback) lines.push(fallback.message);
  }


  // Post-process: for each actor/effect, only keep the most detailed line (ignoring punctuation and trailing phrases)
  function normalize(line: string) {
    // Remove trailing !, ., and extra spaces, and lowercase
    return line.replace(/[!\.]+$/, '').replace(/\s+/g, ' ').toLowerCase();
  }
  // Group by actor/effect
  const byActor: Record<string, string[]> = {};
  lines.forEach(line => {
    // Try to extract actor (first word(s) before 'takes' or 'heals' or 'blocks' etc)
    const match = line.match(/^([A-Za-z\s]+?)( takes| heals| blocks| misses| hits| is )/i);
    const actor = match ? match[1].trim().toLowerCase() : 'other';
    if (!byActor[actor]) byActor[actor] = [];
    byActor[actor].push(line);
  });
  // For each actor, keep only the most detailed (longest) line for each effect type
  const finalLines: string[] = [];
  Object.values(byActor).forEach(linesArr => {
    // For each effect type (damage, heal, etc), keep the longest line
    const byEffect: Record<string, string> = {};
    linesArr.forEach(line => {
      // Effect type: e.g. 'takes damage', 'heals', etc
      const effectMatch = line.match(/(takes|heals|blocks|misses|hits|is)\b[^!\.]*/i);
      const effect = effectMatch ? effectMatch[0].toLowerCase().replace(/[!\.]+$/, '').trim() : 'other';
      if (!byEffect[effect] || normalize(line).length > normalize(byEffect[effect]).length) {
        byEffect[effect] = line;
      }
    });
    Object.values(byEffect).forEach(l => finalLines.push(l));
  });
  lines = finalLines;

  return {
    summary: lines.join('\n'),
    playerFinalHp,
    aiFinalHp,
  };
}
