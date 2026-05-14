/**
 * Unit tests: equipped tutor id resolution for chat vs collection slots.
 * Run: node backend/tests/userProfilePersona.test.js
 */
const assert = require('assert');
const UserProfileService = require('../services/UserProfileService');

function run() {
    const r = (profile, agentId) => UserProfileService.resolveEquippedTutorIdForAgent(profile, agentId);

    assert.strictEqual(
        r({ equipped_tutor_english: 't_elara', equipped_tutor: 'default_janie' }, 'english'),
        't_elara',
        'english prefers equipped_tutor_english'
    );
    assert.strictEqual(
        r({ equipped_tutor: 'default_janie' }, 'english'),
        'default_janie',
        'english falls back to equipped_tutor then default'
    );
    assert.strictEqual(
        r({ equipped_tutor_maths: 'default_matt', equipped_tutor: 't_elara' }, 'math'),
        'default_matt',
        'math prefers equipped_tutor_maths'
    );
    assert.strictEqual(
        r({ equipped_tutor_maths: 'default_matt', equipped_tutor: 't_elara' }, 'maths'),
        'default_matt',
        'maths alias maps to math slot'
    );
    assert.strictEqual(
        r({ equipped_tutor_ace: 'default_ace' }, 'ace'),
        'default_ace',
        'ace prefers equipped_tutor_ace'
    );
    assert.strictEqual(
        r({ equipped_tutor: 't_ben' }, 'chinese'),
        't_ben',
        'chinese uses legacy equipped_tutor only'
    );
    assert.strictEqual(
        r({}, 'english'),
        'default_janie',
        'english default when empty'
    );

    console.log('userProfilePersona.test.js: all assertions passed');
}

run();
