import { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [displayedMessage, setDisplayedMessage] = useState('');
  const LAMBDA_URL =
    'https://kppd5dp5pcum5kv55oicvhiwfy0gqmdr.lambda-url.us-east-1.on.aws/';

  const handleSubmit = (e) => {
    e.preventDefault();

    const chatCompletion = async function (data) {
      return fetch(LAMBDA_URL, {
        method: 'POST',
        body: JSON.stringify(data),
      }).then((response) => {
        if (!response.body) {
          throw new Error('Readable stream not supported in this browser');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        return new ReadableStream({
          async start(controller) {
            try {
              while (true) {
                const { done, value } = await reader.read();

                if (done) {
                  controller.close();
                  break;
                }

                const decodedValue = decoder.decode(value, {
                  stream: true,
                });

                controller.enqueue(decodedValue);
              }
            } catch (error) {
              console.error('Error reading stream:', error);
              controller.error(error);
            }
          },
        });
      });
    };

    chatCompletion({
      message: message,
    })
      .then((stream) => {
        const reader = stream.getReader();
        reader.read().then(function processText({ done, value }) {
          if (done || !value) {
            return;
          }
          setDisplayedMessage((prevMessage) => prevMessage + value);
          return reader.read().then(processText);
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
        />
        <button type="submit">Submit</button>
      </form>
      <div>
        <h3>Chat Response:</h3>
        <p>{displayedMessage}</p>
      </div>
    </div>
  );
}

export default App;
