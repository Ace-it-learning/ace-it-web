// Test script to verify Reading Scaffold API
const API_URL = 'http://localhost:3001';

const testPassage = `The proliferation of misinformation, especially through digital channels, poses a significant threat to societal stability and informed decision-making. Academic research consistently demonstrates a correlation between exposure to false narratives and erosion of trust in institutions, including government, media, and scientific communities.`;

console.log('Testing Reading Scaffold API...');
console.log('Passage:', testPassage);

fetch(`${API_URL}/api/reading/scaffold`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passage: testPassage, level: 3 })
})
    .then(r => {
        console.log('Response status:', r.status);
        return r.json();
    })
    .then(data => {
        console.log('✅ SUCCESS! Scaffold data received:');
        console.log('Vocab words:', data.vocab?.length || 0);
        console.log('Paragraph tags:', data.tags?.length || 0);
        console.log('Connectors:', data.connectors?.length || 0);
        console.log('Full data:', JSON.stringify(data, null, 2));
    })
    .catch(e => {
        console.error('❌ ERROR:', e);
    });
