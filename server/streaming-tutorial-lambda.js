export const handler = awslambda.streamifyResponse(
  async (event, responseStream) => {
    try {
      const paragraph =
        'This is a sample paragraph to demonstrate the process of streaming long data. ';
      const largeText = paragraph.repeat(100);

      const chunkSize = 1000;

      for (let i = 0; i < largeText.length; i += chunkSize) {
        responseStream.write(largeText.substring(i, i + chunkSize));

        await new Promise((resolve) => setTimeout(resolve, 200));
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
