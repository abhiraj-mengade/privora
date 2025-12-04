/**
 * NEAR AI Cloud API utilities
 * Handles PII stripping and intelligent matching
 */

const NEAR_AI_API_URL = 'https://cloud-api.near.ai/v1/chat/completions';
const NEAR_AI_MODEL = 'deepseek-ai/DeepSeek-V3.1';

export interface PIIStrippedProfile {
    pseudonym: string;
    category: string;
    skills: string[];
    bio: string;
    location: string; // Coarse location only
    verificationFlags: {
        humanness: boolean;
        nsResident: boolean;
        location: boolean;
    };
}

/**
 * Data Incinerator: Strips PII from recipient profile using NEAR AI Cloud TEE
 */
export async function stripPII(rawProfile: {
    pseudonym: string;
    category: string;
    skills: string[];
    bio: string;
    location: string;
    verificationFlags: {
        humanness: boolean;
        nsResident: boolean;
        location: boolean;
    };
}): Promise<PIIStrippedProfile> {
    const apiKey = process.env.NEXT_PUBLIC_NEAR_AI_API_KEY;
    if (!apiKey) {
        throw new Error('NEAR AI API key not configured. Please set NEXT_PUBLIC_NEAR_AI_API_KEY');
    }

    const prompt = `You are a privacy-preserving data processor. Your task is to strip all Personally Identifiable Information (PII) from a user profile while preserving the essential information needed for matching donors.

Input profile:
- Pseudonym: ${rawProfile.pseudonym}
- Category: ${rawProfile.category}
- Skills: ${rawProfile.skills.join(', ')}
- Bio: ${rawProfile.bio}
- Location: ${rawProfile.location}
- Verifications: Humanness=${rawProfile.verificationFlags.humanness}, NS Resident=${rawProfile.verificationFlags.nsResident}, Location=${rawProfile.verificationFlags.location}

Your task:
1. Remove any PII from the bio (names, specific addresses, phone numbers, emails, etc.)
2. Generalize location to coarse categories only (e.g., "High-Risk Region", "Academic Institution", "Global")
3. If GitHub/Portfolio links contain identifying info, anonymize or remove them
4. Keep skills, category, and verification flags intact
5. Ensure the pseudonym is safe (no real names)

Return ONLY a valid JSON object with this exact structure:
{
    "pseudonym": "string (sanitized if needed)",
    "category": "string",
    "skills": ["string"],
    "bio": "string (PII-free)",
    "location": "string (coarse only)",
    "verificationFlags": {
        "humanness": boolean,
        "nsResident": boolean,
        "location": boolean
    }
}

Do not include any explanation, only the JSON object.`;

    try {
        const response = await fetch(NEAR_AI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: NEAR_AI_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.3, // Lower temperature for more deterministic output
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`NEAR AI API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No response from NEAR AI');
        }

        // Extract JSON from response (handle markdown code blocks if present)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format from NEAR AI');
        }

        const stripped = JSON.parse(jsonMatch[0]) as PIIStrippedProfile;
        return stripped;
    } catch (error) {
        console.error('Error stripping PII:', error);
        throw error;
    }
}

export interface DonorIntent {
    topics: string[];
    geography: string;
    amount: string;
    recurring: boolean;
    // Optional free-form prompt from the donor describing what they want to fund
    intentText?: string;
}

export interface MatchedPersona {
    ipfsHash: string;
    pseudonym: string;
    category: string;
    skills: string[];
    bio: string;
    location: string;
    fundingNeed?: string;
    matchScore: number;
    matchReason: string;
    verificationFlags: {
        humanness: boolean;
        nsResident: boolean;
        location: boolean;
    };
}

/**
 * Agentic Wallet: Uses AI to find matching personas based on donor intent
 */
export async function findMatchingPersonas(
    intent: DonorIntent,
    availablePersonas: Array<{ ipfsHash: string; profile: PIIStrippedProfile }>
): Promise<MatchedPersona[]> {
    const apiKey = process.env.NEXT_PUBLIC_NEAR_AI_API_KEY;
    if (!apiKey) {
        throw new Error('NEAR AI API key not configured');
    }

    if (availablePersonas.length === 0) {
        return [];
    }

    const personasSummary = availablePersonas.map((p, idx) => ({
        index: idx,
        pseudonym: p.profile.pseudonym,
        category: p.profile.category,
        skills: p.profile.skills,
        bio: p.profile.bio,
        location: p.profile.location,
        // Funding need may or may not be present; treated as optional
        fundingNeed: (p as any).fundingNeed,
        verifications: p.profile.verificationFlags,
    }));

    const prompt = `You are an intelligent matching agent for a privacy-preserving philanthropy platform. Your task is to match donor intents with recipient personas.

Donor Intent:
- Topics of interest: ${intent.topics.join(', ')}
- Geographic focus: ${intent.geography}
- Funding amount: ${intent.amount} ZEC
- Recurring: ${intent.recurring}
${intent.intentText ? `- Donor natural-language prompt: ${intent.intentText}` : ""}

Available Personas:
${JSON.stringify(personasSummary, null, 2)}

Your task:
1. Score each persona (0-100) based on how well they match the donor's intent
2. Consider topic alignment, geographic preferences, and verification status
3. Return personas with score >= 50, sorted by match score (highest first)
4. Provide a brief reason for each match

Return ONLY a valid JSON array with this exact structure:
[
    {
        "index": number,
        "matchScore": number (0-100),
        "matchReason": "string (brief explanation)"
    }
]

Include only personas with matchScore >= 50, sorted by matchScore descending.`;

    try {
        const response = await fetch(NEAR_AI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: NEAR_AI_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.4,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`NEAR AI API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No response from NEAR AI');
        }

        // Extract JSON array from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Invalid response format from NEAR AI');
        }

        const matches = JSON.parse(jsonMatch[0]) as Array<{
            index: number;
            matchScore: number;
            matchReason: string;
        }>;

        // Map matches back to full persona data
        const matchedPersonas: MatchedPersona[] = matches.map((match) => {
            const persona = availablePersonas[match.index];
            return {
                ipfsHash: persona.ipfsHash,
                pseudonym: persona.profile.pseudonym,
                category: persona.profile.category,
                skills: persona.profile.skills,
                bio: persona.profile.bio,
                location: persona.profile.location,
                // Best-effort: propagate fundingNeed if present (optional).
                fundingNeed: (persona as any).fundingNeed,
                matchScore: match.matchScore,
                matchReason: match.matchReason,
                verificationFlags: persona.profile.verificationFlags,
            };
        });

        return matchedPersonas;
    } catch (error) {
        console.error('Error finding matches:', error);
        throw error;
    }
}

