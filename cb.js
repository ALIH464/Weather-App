alert('hi');
function Send_chat() {
  let question = document.getElementById('chatbar').value;
  if (!question) {
    alert('ohoo');
    return; // Exit function if no question is entered
  }
  
  let chatbox = document.getElementById('chat-answer');

  let userMessageDiv = document.createElement('div');
  userMessageDiv.style.textAlign = 'right';
  userMessageDiv.style.margin = '10px 0';
  userMessageDiv.style.backgroundColor = '#87CEEB'; // Light blue background for user message
  userMessageDiv.style.padding = '10px';
  userMessageDiv.style.borderRadius = '10px';
  userMessageDiv.style.width = 'auto';
  userMessageDiv.style.marginLeft = 'auto';
  userMessageDiv.style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.2)';

  let userMessage = document.createElement('p');
  userMessage.textContent = "User: " + question;
  userMessage.style.color = '#000080'; // Navy color for user text

  userMessageDiv.appendChild(userMessage);
  chatbox.appendChild(userMessageDiv);

  // Check if the question is related to weather
  if (question.toLowerCase().includes('weather')) {
    let city_name = question.split(' ').pop(); // Assuming the city name is the last word
    let api_key = '6235f3a1d357b365fc3db88b6dd6caa2';
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${city_name}&appid=${api_key}`;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          alert('City not found g');
          throw new Error("City not found");
        }
        return response.json();
      })
      .then(data => {
        let weatherMessageDiv = document.createElement('div');
        weatherMessageDiv.style.textAlign = 'left';
        weatherMessageDiv.style.margin = '10px 0';
        weatherMessageDiv.style.backgroundColor = '#FFD700'; // Gold background for bot message
        weatherMessageDiv.style.padding = '10px';
        weatherMessageDiv.style.borderRadius = '10px';
        weatherMessageDiv.style.width = 'fit-content';
        weatherMessageDiv.style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.2)';

        let weatherMessage = document.createElement('p');
        let temp_in_celsius = data.main.temp - 273.15;

        weatherMessage.textContent = `Bot: The weather in ${city_name} is ${data.weather[0].description} with a temperature of ${temp_in_celsius.toFixed(2)} °C.`;
        weatherMessage.style.color = '#8B0000'; // Dark red color for bot text
        weatherMessageDiv.appendChild(weatherMessage);
        chatbox.appendChild(weatherMessageDiv);
      })
      .catch(error => {
        let errorMessage = document.createElement('p');
        errorMessage.textContent = 'City not found';
        errorMessage.style.color = '#FF0000'; // Red color for error messages
        chatbox.appendChild(errorMessage);
      });
  } else {
    const api_key = 'AIzaSyAWEM5eJ9ubBEmWyJR7q3RtiXGApdCjvr4';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${api_key}`;

    const re_body = {
      contents: [
        {
          parts: [
            {
              text: question 
            }
          ]
        }
      ]
    };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(re_body)
    })
    .then(response => response.json())
    .then(data => {
      let botMessageDiv = document.createElement('div');
      botMessageDiv.style.textAlign = 'left';
      botMessageDiv.style.margin = '10px 0';
      botMessageDiv.style.backgroundColor = '#FFD700'; // Gold background for bot message
      botMessageDiv.style.padding = '10px';
      botMessageDiv.style.borderRadius = '10px';
      botMessageDiv.style.width = 'fit-content';
      botMessageDiv.style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.2)';

      let botMessage = document.createElement('p');

      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        botMessage.textContent = "Bot: " + data.candidates[0].content.parts[0].text;
      } else {
        botMessage.textContent = "Bot: Response not valid.";
      }
      botMessage.style.color = '#8B0000'; // Dark red color for bot text

      botMessageDiv.appendChild(botMessage);
      chatbox.appendChild(botMessageDiv);
    })
    .catch(error => {
      let errorMessage = document.createElement('p');
      alert(error);
      errorMessage.textContent = 'Error fetching response: ' + error;
      errorMessage.style.color = '#FF0000'; // Red color for error messages
      chatbox.appendChild(errorMessage);
    });
  }
}

// Add event listener for enter key
document.getElementById('chatbar').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent default action like form submission
    Send_chat(); // Call the Send_chat function
  }
});
