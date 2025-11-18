const API_KEY = import.meta.env.VITE_NVIDIA_API_KEY;

console.log("🔑 NVIDIA API Key Status:", {
    isLoaded: !!API_KEY,
    keyStart: API_KEY ? API_KEY.substring(0, 15) + "..." : "❌ MISSING"
});

if (!API_KEY) {
    throw new Error("❌ VITE_NVIDIA_API_KEY environment variable is not set!");
}

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function getAnswerFromImage(base64ImageData: string, mimeType: string): Promise<string> {
    console.log("📤 Starting NVIDIA API request...");

    try {
        const payload = {
            model: "meta/llama-3.2-90b-vision-instruct",
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
            temperature: 0.7,
            top_p: 1,
            stream: false
        };

        console.log("📡 Sending request to NVIDIA API...");

        const response = await fetch(NVIDIA_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
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
                errorMessage = errorData.error?.message || errorData.detail || errorData.message || "Unknown error";
            } catch {
                errorMessage = errorText || response.statusText;
            }

            throw new Error(`NVIDIA API Error (${response.status}): ${errorMessage}`);
        }

        const data = await response.json();
        console.log("✅ Response received successfully");

        if (!data.choices || !data.choices[0]?.message?.content) {
            console.error("❌ Empty response data:", data);
            throw new Error("The API returned an empty response.");
        }

        console.log("✅ Answer generated successfully");
        return data.choices[0].message.content;

    } catch (error) {
        console.error("❌ Full error:", error);

        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error("Network error: Cannot reach NVIDIA API. Check your internet connection.");
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("An unknown error occurred with NVIDIA API.");
    }
}
