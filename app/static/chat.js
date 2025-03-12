document.addEventListener("DOMContentLoaded", function () {
    const chatInput = document.getElementById("chatInput");
    const chatSubmit = document.getElementById("chatSubmit");
    const chatResponse = document.getElementById("chatResponse");

    chatSubmit.addEventListener("click", async () => {
        const prompt = chatInput.value.trim();
        if (!prompt) return;

        // Retrieve weather data stored globally (convert to JSON string)
        const weather = window.weatherData ? JSON.stringify(window.weatherData) : "";

        try {
            const response = await fetch(`/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    weather: weather
                })
            });
            if (!response.ok) {
                throw new Error("Failed to fetch chat response");
            }
            const data = await response.json();
            // Assuming the response JSON has a 'response' field with the LLM's answer
            chatResponse.innerText = data.response;
        } catch (error) {
            console.error("Chat request error:", error);
            chatResponse.innerText = "Error fetching chat response.";
        }
    });
});
