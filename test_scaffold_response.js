// Quick test to see what the scaffold API returns
const passage = `The pervasive influence of digital technology on adolescent development in Hong Kong has become a subject of intense scrutiny. While offering unprecedented access to information and fostering global connectivity, excessive screen time is increasingly linked to a range of psychological and social challenges. A recent study conducted by the Hong Kong Institute for Educational Research (HKIER) surveyed over 2,000 secondary school students, revealing that on average, they spend approximately 6.3 hours per day engaged with digital devices, excluding school-related activities.`;

fetch('http://localhost:3001/api/reading/scaffold', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passage, level: 3 })
})
    .then(r => r.json())
    .then(data => {
        console.log('✅ Scaffold API Response:');
        console.log('Vocab count:', data.vocab?.length || 0);
        console.log('Tags count:', data.tags?.length || 0);
        console.log('Connectors count:', data.connectors?.length || 0);
        console.log('\nFull response:', JSON.stringify(data, null, 2));
    })
    .catch(e => console.error('❌ Error:', e));
