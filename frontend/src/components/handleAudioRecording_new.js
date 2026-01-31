const handleAudioRecording = async (audioBlob, duration) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];

        console.log('[Voice] Sending to backend:', {
            size: (audioBlob.size / 1024).toFixed(2) + ' KB',
            duration: duration + 's'
        });

        // Send to backend for pronunciation analysis
        try {
            setIsLoading(true);

            const token = await user.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    uid: user.uid,
                    audio: base64Audio,
                    audioType: 'audio/webm',
                    agentId: activeAgentId,
                    outputLanguage: chatLanguage,
                    history: messages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }]
                    }))
                })
            });

            const data = await response.json();
            console.log('[Voice] Backend response:', data);

            if (data.text) {
                const assistantMsg = {
                    role: 'assistant',
                    content: data.text,
                    agentId: activeAgentId
                };
                setMessages(prev => [...prev, assistantMsg]);

                // Save to history
                await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/history/${activeAgentId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: user.uid,
                        role: 'assistant',
                        content: data.text
                    })
                });
            } else {
                throw new Error('No response text from server');
            }
        } catch (error) {
            console.error('[Voice] Error:', error);
            const errorMsg = {
                role: 'assistant',
                content: `Sorry, I couldn't analyze your pronunciation right now. Please try again.\n\nError: ${error.message}`,
                agentId: activeAgentId
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };
};
