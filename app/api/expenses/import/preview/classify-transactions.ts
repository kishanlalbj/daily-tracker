import openAiClient from "@/lib/openai/client";

export const classifyTransactions = async (
  categories: unknown,
  transactions: unknown
) => {
  const prompt = `
        You are a classification engine. Choose and return only one category

        Allowed categories:
        ${JSON.stringify(categories)}

        Rules:
            - Return valid JSON ONLY
            - You MUST return ONLY valid JSON.
            - Do not include markdown.
            - Do not include backticks.
            - Do not include explanations.
            - Output must be an array
            - Each item must match input order
            - Each item: { 
                    "id": number (transactionId), 
                    "expense_title": string (transaction), 
                    "categoryId": number,
                    "category": string

                }
            - Category must be exactly one of the allowed categories
            - If unclear, use "Unknown"

        Transactions:
            ${JSON.stringify(transactions, null, 2)}
    `;

  try {
    const response = await openAiClient.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0
    });

    const result = JSON.parse(response?.choices[0]?.message?.content || "[]");

    return result;
  } catch (error) {
    throw new Error("LLM Error");
  }
};
