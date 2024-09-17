import { OpenAI } from 'openai';

export const handler = awslambda.streamifyResponse(
  async (event, responseStream) => {
    try {
      responseStream.setContentType('text/plain');

      const eventBody = JSON.parse(event.body);

      // Check for OpenAI API key in environment variables
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not found in environment variables.');
      }

      const openaiClient = new OpenAI({ apiKey: openaiApiKey });

      const stream = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: eventBody.message }],
        stream: true,
      });

      for await (const chunk of stream) {
        // Ensure the chunk has the structure you expect before accessing properties
        if (chunk.choices && chunk.choices[0]?.delta?.content) {
          responseStream.write(chunk.choices[0].delta.content);
        }
      }

      responseStream.end();
    } catch (error) {
      console.log(`Error: ${error.message}`);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error.message,
        }),
      };
    }
  }
);
