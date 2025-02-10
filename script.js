const apiKey = 'YOUR_API_KEY'; // Replace with your actual OpenWeatherMap API key
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather?units=metric';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast?units=metric';

const searchBox = document.querySelector('#city-input');
const searchBtn = document.querySelector('#search-btn');
const locationBtn = document.querySelector('#location-btn');
const celsiusBtn = document.querySelector('#celsius-btn');
const fahrenheitBtn = document.querySelector('#fahrenheit-btn');
const weatherInfo = document.querySelector('#weather-info');
const forecast = document.querySelector('#forecast');

let isCelsius = true;

// Fetch weather data by city name
async function checkWeather(city) {
  try {
    const response = await fetch(`${apiUrl}&q=${city}&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error('City not found. Please try again.');
    }
    const data = await response.json();
    displayWeather(data);
    checkForecast(city);
    updateBackground(data.weather[0].main);
  } catch (error) {
    weatherInfo.innerHTML = `<p>${error.message}</p>`;
    forecast.innerHTML = '';
  }
}

// Fetch weather data by geolocation
async function checkWeatherByCoords(lat, lon) {
  try {
    const response = await fetch(`${apiUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error('Unable to fetch weather data.');
    }
    const data = await response.json();
    displayWeather(data);
    checkForecastByCoords(lat, lon);
    updateBackground(data.weather[0].main);
  } catch (error) {
    weatherInfo.innerHTML = `<p>${error.message}</p>`;
    forecast.innerHTML = '';
  }
}

// Fetch 5-day forecast by city name
async function checkForecast(city) {
  try {
    const response = await fetch(`${forecastUrl}&q=${city}&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error('Unable to fetch forecast data.');
    }
    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    forecast.innerHTML = `<p>${error.message}</p>`;
  }
}

// Fetch 5-day forecast by geolocation
async function checkForecastByCoords(lat, lon) {
  try {
    const response = await fetch(`${forecastUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
    if (!response.ok) {
      throw new Error('Unable to fetch forecast data.');
    }
    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    forecast.innerHTML = `<p>${error.message}</p>`;
  }
}

// Display current weather
function displayWeather(data) {
  const temp = isCelsius ? data.main.temp : (data.main.temp * 9 / 5 + 32).toFixed(2);
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherInfo.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img src="${iconUrl}" alt="${data.weather[0].description}">
    <p>Temperature: ${temp}°${isCelsius ? 'C' : 'F'}</p>
    <p>Weather: ${data.weather[0].description}</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
  `;
}

// Display 5-day forecast
function displayForecast(data) {
  forecast.innerHTML = data.list
    .filter((item, index) => index % 8 === 0) // Get one forecast per day
    .map(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      const temp = isCelsius ? item.main.temp : (item.main.temp * 9 / 5 + 32).toFixed(2);
      const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
      return `
        <div class="forecast-day">
          <p>${date}</p>
          <img src="${iconUrl}" alt="${item.weather[0].description}">
          <p>${temp}°${isCelsius ? 'C' : 'F'}</p>
          <p>${item.weather[0].description}</p>
        </div>
      `;
    })
    .join('');
}

// Update background based on weather
function updateBackground(weather) {
  const body = document.body;
  switch (weather.toLowerCase()) {
    case 'clear':
      body.style.background = 'linear-gradient(135deg, #ff9a9e, #fad0c4)';
      break;
    case 'clouds':
      body.style.background = 'linear-gradient(135deg, #a1c4fd, #c2e9fb)';
      break;
    case 'rain':
      body.style.background = 'linear-gradient(135deg, #6a11cb, #2575fc)';
      break;
    case 'snow':
      body.style.background = 'linear-gradient(135deg, #e6e9f0, #eef1f5)';
      break;
    default:
      body.style.background = 'linear-gradient(135deg, #6a11cb, #2575fc)';
  }
}

// Geolocation button
locationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      checkWeatherByCoords(latitude, longitude);
    });
  } else {
    alert('Geolocation is not supported by your browser.');
  }
});

// Unit toggle
celsiusBtn.addEventListener('click', () => {
  isCelsius = true;
  celsiusBtn.classList.add('active');
  fahrenheitBtn.classList.remove('active');
  const city = searchBox.value.trim();
  if (city) checkWeather(city);
});

fahrenheitBtn.addEventListener('click', () => {
  isCelsius = false;
  fahrenheitBtn.classList.add('active');
  celsiusBtn.classList.remove('active');
  const city = searchBox.value.trim();
  if (city) checkWeather(city);
});

// Search button
searchBtn.addEventListener('click', () => {
  const city = searchBox.value.trim();
  if (city) {
    checkWeather(city);
  } else {
    alert('Please enter a city name.');
  }
});

// Default to user's location on page load
window.onload = () => {
  locationBtn.click();
};
