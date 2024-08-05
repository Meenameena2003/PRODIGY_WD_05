document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
    const weatherContainer = document.querySelector('.weather-container');
    const dateDayName = document.querySelector('.date-dayname');
    const dateDay = document.querySelector('.date-day');
    const locationElement = document.querySelector('.location');
    const weatherIcon = document.querySelector('.weather-icon');
    const weatherTemp = document.querySelector('.weather-temp');
    const weatherDesc = document.querySelector('.weather-desc');
    const humidityValue = document.querySelector('.humidity .value');
    const windValue = document.querySelector('.wind .value');
    const weekList = document.querySelector('.week-list');

    function getWeatherIcon(iconCode) {
        const iconMapping = {
            '01d': 'sun',
            '01n': 'moon',
            '02d': 'cloud-sun',
            '02n': 'cloud-moon',
            '03d': 'cloud',
            '03n': 'cloud',
            '04d': 'cloud-meatball',
            '04n': 'cloud-meatball',
            '09d': 'cloud-showers-heavy',
            '09n': 'cloud-showers-heavy',
            '10d': 'cloud-showers-day',
            '10n': 'cloud-showers-night',
            '11d': 'bolt',
            '11n': 'bolt',
            '13d': 'snowflake',
            '13n': 'snowflake',
            '50d': 'smog',
            '50n': 'smog',
        };
        return iconMapping[iconCode] || 'sun'; // Default icon
    }

    function fetchWeatherData(city) {
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
            .then(response => {
                const { main, weather, wind, name } = response.data;
                dateDayName.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                dateDay.textContent = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                locationElement.textContent = name;
                weatherIcon.innerHTML = `<i class="fa-solid fa-${getWeatherIcon(weather[0].icon)}"></i>`;
                weatherTemp.textContent = `${Math.round(main.temp)}°C`;
                weatherDesc.textContent = weather[0].description.toUpperCase();
                humidityValue.textContent = `${main.humidity}%`;
                windValue.textContent = `${Math.round(wind.speed)} m/s`;
                fetchWeeklyWeatherData(city);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    }

    function fetchWeeklyWeatherData(city) {
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
            .then(response => {
                const weeklyData = response.data.list.filter(item => item.dt_txt.includes('12:00:00'));
                weekList.innerHTML = '';
                weeklyData.forEach(item => {
                    const dayName = new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'short' });
                    const dayTemp = `${Math.round(item.main.temp)}°C`;
                    const dayIcon = getWeatherIcon(item.weather[0].icon);
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span class="day-name">${dayName}</span>
                        <span class="day-temp">${dayTemp}</span>
                        <span class="day-icon"><i class="fa-solid fa-${dayIcon}"></i></span>
                    `;
                    weekList.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error fetching weekly weather data:', error);
            });
    }

    function getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`)
                    .then(response => {
                        const city = response.data.name;
                        fetchWeatherData(city);
                    })
                    .catch(error => {
                        console.error('Error fetching current location data:', error);
                    });
            }, error => {
                console.error('Error getting location:', error);
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    // Fetch weather data for a default city on page load
    fetchWeatherData('London'); // Replace 'London' with your default city

    document.querySelector('.location-input').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const city = event.target.value;
            fetchWeatherData(city);
        }
    });

    document.querySelector('.current-location-btn').addEventListener('click', getCurrentLocation);
});
