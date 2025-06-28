const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY 
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function run(prompt, imageDescription = null) {
    const chatSession = model.startChat({
        generationConfig,
        // safetySettings: Adjust safety settings
        // See https://ai.google.dev/gemini-api/docs/safety-settings
        history: [], // You may want to maintain history for context
    });

    try {
        const result = await chatSession.sendMessage(prompt);
        const textResponse = result.response.text(); // Get text from response
       // console.log(textResponse); // Log the text response for debugging

        // If there's an image description, you can include it in your response
        if (imageDescription) {
            const combinedResponse = `${textResponse}\n\nImage Description: ${imageDescription}`;
            return combinedResponse; // Return combined response if an image description is provided
        }

        return textResponse; // Return the text response
    } catch (error) {
        console.error("Error sending message:", error); // Add error handling
        throw error; // Re-throw error to be caught by caller
    }
}

// Image-processing model (gemini-pro-vision)
const visionModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

// Image-processing function
async function processImage(prompt, imageBase64, mimeType) {
    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType,
        },
    };

    try {
        const result = await visionModel.generateContent([prompt || "Describe this image", imagePart]);
        return result.response.text();
    } catch (error) {
        console.error("Error processing image:", error);
        throw error;
    }
}

module.exports = { run, processImage };
