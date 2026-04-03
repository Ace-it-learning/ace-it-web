/**
 * HKDSE English Paper 2 (Writing) Syllabus Framework
 * Mapped to common genres and "Elite" level requirements.
 */

const ENGLISH_WRITING_GENRES = {
    'arg_essay': {
        id: 'arg_essay',
        name: 'Argumentative Essay',
        description: 'Persuasive writing on controversial social or school issues.',
        subgenres: ['Problem-Solution', 'Pros and Cons', 'One-sided Argument'],
        elite_criteria: 'Strong counter-argument and rebuttal, varied sentence structures (inversion, subjunctive).'
    },
    'proposal': {
        id: 'proposal',
        name: 'Proposal',
        description: 'Formal document suggesting a course of action to a specific authority.',
        subgenres: ['School Event Proposal', 'Community Improvement', 'Budget Request'],
        elite_criteria: 'Strict formal tone, professional vocabulary (feasibility, logistical, budgetary), clear headings.'
    },
    'speech': {
        id: 'speech',
        name: 'Speech / Presentation',
        description: 'Oral delivery meant to persuade, inspire, or inform an audience.',
        subgenres: ['Graduation Speech', 'Campaign Speech', 'Awareness Presentation'],
        elite_criteria: 'Rhetorical devices (rule of three, rhetorical questions), direct audience engagement, emotional resonance.'
    },
    'letter_editor': {
        id: 'letter_editor',
        name: 'Letter to the Editor',
        description: 'Public opinion piece for a newspaper/magazine.',
        subgenres: ['Complaint', 'Suggestion', 'Reaction to Current Event'],
        elite_criteria: 'Strong persona, sharp critical tone, logical flow of grievances and suggestions.'
    },
    'feature_article': {
        id: 'feature_article',
        name: 'Feature Article',
        description: 'In-depth exploration of a lifestyle, cultural, or human-interest story.',
        subgenres: ['Travelogue', 'Cultural Heritage', 'Life of an Influencer'],
        elite_criteria: 'Descriptive language (imagery, metaphors), engaging hook, personal reflections.'
    },
    'report': {
        id: 'report',
        name: 'Formal Report',
        description: 'Objective summary of facts and findings.',
        subgenres: ['Incident Report', 'Statistical Summary', 'Survey Findings'],
        elite_criteria: 'Neutral, objective voice, precise data representation, actionable recommendations.'
    }
};

module.exports = {
    ENGLISH_WRITING_GENRES
};
