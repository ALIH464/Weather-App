const apiKey = 'a0aca8a89948154a4182dcecc780b513'; // Replace with your OpenWeather API key
const cityInput = document.getElementById('search-city');
const latInput = document.getElementById('search-lat');
const lonInput = document.getElementById('search-lon');
const weatherWidget = document.getElementById('weather-widget');
const weatherDetails = document.getElementById('weather-details');
const loader = document.getElementById('wifi-loader');
const tableBody = document.getElementById('table-body');
const paginationContainer = document.getElementById('pagination');

let barChart, doughnutChart, lineChart;
let forecastData = [];
let currentPage = 1;
const rowsPerPage = 10;

// Event Listeners for Enter key in input fields
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') fetchWeatherData();
});
latInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') fetchWeatherData();
});
lonInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') fetchWeatherData();
});

// Function to Fetch Weather Data
function fetchWeatherData() {
  const city = cityInput.value.trim();
  const lat = latInput.value.trim();
  const lon = lonInput.value.trim();

  if (!city && (!lat || !lon)) {
    alert('Please enter a city name or provide latitude and longitude.');
    loader.style.display = 'none';
    return;
  }

  loader.style.display = 'flex';

  const apiUrl = city
    ? `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    : `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.cod !== "200") {
        alert('City not found. Please check the name.');
        loader.style.display = 'none';
        return;
      }

      const labels = [];
      const temperatures = [];
      const weatherConditions = [];

      for (let i = 0; i < data.list.length; i += 8) {
        const entry = data.list[i];
        const date = entry.dt_txt.split(" ")[0];
        labels.push(date);
        temperatures.push(entry.main.temp);
        weatherConditions.push(entry.weather[0].main);
      }

      const weatherCondition = data.list[0].weather[0].description;
      const temperature = data.list[0].main.temp;
      weatherDetails.innerHTML = `
        <p>Weather: ${weatherCondition}</p>
        <p>Temperature: ${temperature}°C</p>
      `;
      weatherWidget.style.backgroundColor = getBackgroundForCondition(weatherCondition);

      updateCharts(labels, temperatures, weatherConditions);
      updateForecastTable(data.list);

      loader.style.display = 'none';
    })
    .catch(err => {
      console.error(err);
      weatherDetails.innerHTML = "<p>Error fetching weather data. Please try again later.</p>";
      loader.style.display = 'none';
    });
}

function getBackgroundForCondition(condition) {
  if (condition.includes('cloud')) return '#b3c6ff';
  if (condition.includes('rain')) return '#9ecae1';
  return '#ffe57e';
}

function updateCharts(labels, temperatures, weatherConditions) {
  if (barChart) barChart.destroy();
  if (doughnutChart) doughnutChart.destroy();
  if (lineChart) lineChart.destroy();

  // Bar Chart
  const ctxBar = document.getElementById('temp-bar-chart').getContext('2d');
  barChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temperatures,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      },
      scales: {
        x: { ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' } }
      }
    }
  });

  // Doughnut Chart
  const conditionCounts = weatherConditions.reduce((acc, condition) => {
    acc[condition] = acc[condition] ? acc[condition] + 1 : 1;
    return acc;
  }, {});

  const ctxDoughnut = document.getElementById('weather-doughnut-chart').getContext('2d');
  doughnutChart = new Chart(ctxDoughnut, {
    type: 'doughnut',
    data: {
      labels: Object.keys(conditionCounts),
      datasets: [{
        data: Object.values(conditionCounts),
        backgroundColor: ['#f39c12', '#3498db', '#e74c3c', '#1abc9c', '#9b59b6']
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      }
    }
  });

  // Line Chart
  const ctxLine = document.getElementById('temp-line-chart').getContext('2d');
  lineChart = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temperatures,
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        tension: 0.1,
        backgroundColor: 'rgba(153, 102, 255, 0.2)'
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      },
      scales: {
        x: { ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' } }
      }
    }
  });
}

// Function to Render Paginated Data in Table
function renderPaginatedData(page) {
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  tableBody.innerHTML = '';

  const paginatedData = forecastData.slice(startIndex, endIndex);

  paginatedData.forEach((forecast) => {
    const dateTimeParts = forecast.dt_txt.split(" ");
    const date = dateTimeParts[0];
    const time = dateTimeParts[1].slice(0, 5);
    const temp = forecast.main.temp.toFixed(1) + '°C';
    const condition = forecast.weather[0].description;

    const row = `
      <tr>
        <td>${date}</td>
        <td>${time}</td>
        <td>${temp}</td>
        <td>${condition}</td>
      </tr>
    `;
    tableBody.insertAdjacentHTML('beforeend', row);
  });

  updatePagination();
}

// Function to Update Pagination Controls
function updatePagination() {
  const totalPages = Math.ceil(forecastData.length / rowsPerPage);
  paginationContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.classList.add('pagination-btn');
    if (i === currentPage) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      currentPage = i;
      renderPaginatedData(currentPage);
    });

    paginationContainer.appendChild(button);
  }
}

// Function to Update Forecast Table (Called After Fetching Weather Data)
function updateForecastTable(data) {
  forecastData = data;
  currentPage = 1;
  renderPaginatedData(currentPage);
}

// Sorting and Filtering Event Listeners
document.getElementById('sort-asc-btn').addEventListener('click', () => {
  sortForecastData('asc');
  renderPaginatedData(currentPage);
});

document.getElementById('sort-desc-btn').addEventListener('click', () => {
  sortForecastData('desc');
  renderPaginatedData(currentPage);
});

document.getElementById('filter-rain-btn').addEventListener('click', () => {
  filterRainyDays();
  currentPage = 1;
  renderPaginatedData(currentPage);
});

document.getElementById('highest-temp-btn').addEventListener('click', () => {
  showHighestTemperature();
});

// Sorting Forecast Data in Ascending or Descending Order
function sortForecastData(order) {
  forecastData.sort((a, b) => {
    const tempA = a.main.temp;
    const tempB = b.main.temp;
    return order === 'asc' ? tempA - tempB : tempB - tempA;
  });
}

// Filtering Days with Rain
function filterRainyDays() {
  forecastData = forecastData.filter(entry =>
    entry.weather[0].description.toLowerCase().includes('rain')
  );
}

// Showing Day with the Highest Temperature
function showHighestTemperature() {
  const highestTempEntry = forecastData.reduce((highest, current) => {
    return current.main.temp > highest.main.temp ? current : highest;
  }, forecastData[0]);

  forecastData = [highestTempEntry];
  renderPaginatedData(currentPage);
}
