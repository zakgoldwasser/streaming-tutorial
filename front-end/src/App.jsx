import { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
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

        return { reader, decoder };
      });
    };

    chatCompletion({
      message: message,
    })
      .then(({ reader, decoder }) => {
        return reader.read().then(function processText({ done, value }) {
          if (done || !value) {
            return;
          }

          const decodedValue = decoder.decode(value, { stream: true });
          console.log(decodedValue);

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
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
