const API_KEY = import.meta.env.VITE_NVIDIA_API_KEY;

if (!API_KEY) {
    throw new Error("VITE_NVIDIA_API_KEY environment variable is not set.");
}

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function getAnswerFromImage(base64ImageData: string, mimeType: string): Promise<string> {
    try {
        console.log("Calling NVIDIA API...");

        const payload = {
            model: "meta/llama-3.2-90b-vision-instruct",
            messages: [
                {
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
                }
            ],
            max_tokens: 1024,
            temperature: 0.7,
            stream: false
        };

        console.log("Request payload prepared");

        const response = await fetch(NVIDIA_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload),
            mode: 'cors'
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText };
            }
            throw new Error(`NVIDIA API Error (${response.status}): ${errorData.error?.message || errorData.detail || errorData.message || response.statusText}`);
        }

        const data = await response.json();
        console.log("Response data:", data);

        if (!data.choices || !data.choices[0]?.message?.content) {
            throw new Error("The API returned an empty response.");
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error("Full error details:", error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error(`Network error: Unable to reach NVIDIA API. This might be a CORS issue or network connectivity problem. Please check your internet connection.`);
        }
        if (error instanceof Error) {
            throw new Error(`${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with NVIDIA API.");
    }
}
