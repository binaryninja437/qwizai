const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

console.log("🔑 Groq API Key Status:", {
    isLoaded: !!API_KEY,
    keyStart: API_KEY ? API_KEY.substring(0, 10) + "..." : "❌ MISSING"
});

if (!API_KEY) {
    throw new Error("❌ VITE_GROQ_API_KEY environment variable is not set!");
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function getAnswerFromImage(base64ImageData: string, mimeType: string): Promise<string> {
    console.log("🚀 Starting Groq API request...");

    try {
        const payload = {
            model: "llama-3.2-90b-vision-preview",
            messages: [{
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "You are an expert AI agent specializing in reasoning and solving multiple-choice questions (MCQs). Analyze the provided image and answer any questions within it. Provide a clear and concise explanation for your reasoning. If there are no clear questions, describe what you see and what potential questions could be asked."
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${mimeType};base64,${base64ImageData}`
                        }
                    }
                ]
            }],
            max_tokens: 2048,
            temperature: 0.7
        };

        console.log("📡 Sending request to Groq API...");

        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        console.log("📥 Response status:", response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Error response:", errorText);

            let errorMessage;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error?.message || errorData.message || "Unknown error";
            } catch {
                errorMessage = errorText || response.statusText;
            }

            throw new Error(`Groq API Error (${response.status}): ${errorMessage}`);
        }

        const data = await response.json();
        console.log("✅ Response received successfully");

        if (!data.choices || !data.choices[0]?.message?.content) {
            console.error("❌ Empty response data:", data);
            throw new Error("The API returned an empty response.");
        }

        console.log("✅ Answer generated successfully!");
        return data.choices[0].message.content;

    } catch (error) {
        console.error("❌ Full error:", error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error("Network error: Cannot reach Groq API. Check your internet connection.");
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("An unknown error occurred with Groq API.");
    }
}
