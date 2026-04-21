async function listModels() {
    const apiKey = 'AIzaSyDV3SLh_qs8nrgbADayMr6MIdJhx8Y7dKw';
    console.log("Using API Key: FOUND");
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        
        if (data.error) {
            console.error("API ERROR:", data.error.message);
            return;
        }

        console.log("Available models (v1beta):");
        if (data.models) {
            data.models.forEach(m => {
                const id = m.name.split('/').pop();
                console.log(` - ${id} (${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log("No models returned.");
        }
    } catch (e) {
        console.error("List Models FAILED:", e.message);
    }
}

listModels();
