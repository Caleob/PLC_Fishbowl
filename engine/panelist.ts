import type { Panelist } from './types';
import type { LLMProvider } from '@/providers/types';

const PANELIST_COLORS = ['#4a9a7a', '#e74c4c', '#4477ee', '#e44a9a', '#eea444', '#9a44ee', '#44aacc', '#cc7744'];
const ALL_SPRITE_INDICES = [0, 1, 2, 3, 4, 5, 6, 7];

// Sprites that read as female (ponytail, long bangs, curly+pink)
const FEMALE_SPRITE_INDICES = [3, 5, 7];
const MALE_SPRITE_INDICES = [0, 1, 2, 4, 6];

/** Pick a random sprite index not already used by existing panelists, respecting gender hint */
export function pickUnusedSpriteIndex(existingPanelists: Panelist[], gender?: 'male' | 'female' | 'neutral'): number {
  const usedIndices = existingPanelists.map(p => p.spriteIndex);

  // Pick from gender-appropriate sprites if specified
  let candidates = ALL_SPRITE_INDICES;
  if (gender === 'female') {
    candidates = FEMALE_SPRITE_INDICES;
  } else if (gender === 'male') {
    candidates = MALE_SPRITE_INDICES;
  }

  const available = candidates.filter(i => !usedIndices.includes(i));
  // Fallback to any unused sprite if gender-matched pool is exhausted
  const pool = available.length > 0
    ? available
    : ALL_SPRITE_INDICES.filter(i => !usedIndices.includes(i));
  // Final fallback: all sprites
  const finalPool = pool.length > 0 ? pool : ALL_SPRITE_INDICES;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function createPanelistFromTemplate(
  data: Omit<Panelist, 'id' | 'systemPrompt' | 'spriteIndex'> & { gender?: 'male' | 'female' | 'neutral' },
  existingPanelists: Panelist[]
): Panelist {
  const spriteIndex = pickUnusedSpriteIndex(existingPanelists, data.gender);
  return {
    ...data,
    id: generateId(),
    spriteIndex,
    color: PANELIST_COLORS[spriteIndex % PANELIST_COLORS.length],
    systemPrompt: buildExpertPrompt(data.name, data.role, data.description),
  };
}

export function buildExpertPrompt(name: string, role: string, description: string): string {
  return `You are ${name}, a world-class ${role}.
Linguistic Persona & Style: ${description}

You are in a roundtable coaching panel giving feedback to a teacher based on a lesson transcript.
Note: Student chat is omitted for privacy. Assume student responses are active and evaluate how the teacher prompts and integrates them.

CRITICAL INSTRUCTIONS:
1. Balance your critique: identify at least one specific thing the teacher did well alongside supportive, actionable suggestions.
2. Keep feedback empathetic, constructive, and respectful. Frame suggestions as growth steps rather than failures.
3. Be role-specific. Name specific pedagogical tools, frameworks, and strategies from your domain.
4. Address other panelists by name. Reference prior turns to build a natural, non-repetitive conversation.
5. Integrate agreement/disagreement organically. AVOID formal transition templates (like "I agree with X, but..."). Vary your vocabulary.
6. Start your response directly. Do not narrate your actions, clear your throat, or use meta-commentary.
7. Banned phrases: "push back", "pushing back", "I want to push back", "let me be honest", "I'll be real", "what nobody's saying", "the elephant in the room".

FORMATTING & STYLE RULES:
- Write in plain conversational text only (100-200 words).
- Use short paragraphs (2-3 sentences max).
- Absolutely NO markdown (**bold**, *italic*, headers, bullet/numbered lists).
- NO em-dashes, hashtags, or section markers.
- Write in a natural, opinionated human voice. Avoid corporate AI presenter cliches.

When giving your final takeaway, distill it into your single most important, actionable insight.`;
}

export const META_PROMPT = `You are a prompt engineer. The user has described an expert panelist for a discussion panel in a few words. Your job is to expand this into a rich, detailed persona description (2-3 sentences) that will make an LLM behave like a genuine world-class expert in that domain.

Include:
- Specific expertise areas and frameworks they'd use
- Their communication style (blunt, diplomatic, data-driven, etc.)
- What makes them distinctive as an expert
- A hint of personality

Do NOT include the panelist's name or role title — just the description paragraph. Keep it to 2-3 sentences.

Example input: "a skeptical CFO"
Example output: "Has managed P&Ls from $10M to $500M and has killed more projects than approved. Speaks in terms of unit economics, payback periods, and burn rate. Data-driven to a fault — if you can't show the numbers, the answer is no. Dry humor, zero patience for hand-waving."`;

export async function expandPanelistDescription(
  shortDescription: string,
  provider: LLMProvider
): Promise<string> {
  const result = await provider.generate([
    { role: 'system', content: META_PROMPT },
    { role: 'user', content: shortDescription },
  ]);
  return result.text.trim();
}

export async function createCustomPanelist(
  name: string,
  role: string,
  shortDescription: string,
  existingPanelists: Panelist[],
  provider: LLMProvider
): Promise<Panelist> {
  const expandedDescription = await expandPanelistDescription(
    `${role}: ${shortDescription}`,
    provider
  );

  const spriteIndex = pickUnusedSpriteIndex(existingPanelists);

  return {
    id: generateId(),
    name,
    role,
    description: expandedDescription,
    systemPrompt: buildExpertPrompt(name, role, expandedDescription),
    color: PANELIST_COLORS[spriteIndex % PANELIST_COLORS.length],
    spriteIndex,
  };
}

/** Create a custom panelist without LLM expansion, using an unused sprite */
export function createCustomPanelistLocal(
  data: Omit<Panelist, 'id' | 'systemPrompt' | 'spriteIndex'>,
  existingPanelists: Panelist[]
): Panelist {
  const spriteIndex = pickUnusedSpriteIndex(existingPanelists);
  return {
    ...data,
    id: generateId(),
    color: PANELIST_COLORS[spriteIndex % PANELIST_COLORS.length],
    spriteIndex,
    systemPrompt: buildExpertPrompt(data.name, data.role, data.description),
  };
}
