const MathsLabService = require('./services/maths/MathsLabService');

async function test() {
    try {
        console.log('Testing MathsLabService.generateLesson...');
        const result = await MathsLabService.generateLesson({
            uid: 'test-user',
            topic: 'quadratic_equations',
            level: 3,
            language: 'en'
        });
        console.log('Success! Generated', result.interactive_tasks?.length, 'questions');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('ERROR:', error.message);
        console.error('Stack:', error.stack);
    }
}

test();
