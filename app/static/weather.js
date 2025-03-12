async function getUserLocation() {
    try {
        const response = await fetch("/api/location");
        const data = await response.json();

        if (data.error || !data.location) {
            throw new Error("Location not found in database.");
        }

        return data.location; // Example: "San Diego, CA"
    } catch (error) {
        console.error("Error fetching user location:", error);
        return "La Jolla, CA"; // Fallback location
    }
}

async function getWeather() {
    try {
        // Fetch the user's saved location
        const fullLocation = await getUserLocation();
        
        // Extract city and state (assuming "City, ST" format)
        const [city, state] = fullLocation.split(",").map(str => str.trim());

        if (!city || !state) throw new Error("Invalid location format");

        // Fetch location data from OpenStreetMap
        const locationResponse = await fetch(`https://nominatim.openstreetmap.org/search?city=${city}&state=${state}&format=json&limit=1`);
        const locationData = await locationResponse.json();

        if (!locationData.length) throw new Error("Location not found");

        const { lat, lon } = locationData[0];

        // Get forecast grid information from weather.gov
        const gridResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
        const gridData = await gridResponse.json();
        const forecastURL = gridData.properties.forecast;

        // Fetch the forecast data
        const forecastResponse = await fetch(forecastURL);
        const forecastData = await forecastResponse.json();

        // Store forecast globally
        window.weatherData = forecastData;

        const periods = forecastData.properties.periods;
        const weatherDiv = document.getElementById("weather");
        weatherDiv.innerHTML = `<h3>7-Day Forecast: ${fullLocation}</h3>`;

        // Create a co ntainer for a grid layout
        const forecastGrid = document.createElement("div");
        forecastGrid.classList.add("forecast-grid");

        // Add each weather period
        periods.forEach((period, index) => {
            if (index < 14) {
                const weatherItem = document.createElement("div");
                weatherItem.classList.add("weather-item");
                weatherItem.innerHTML = `
                    <p><strong>${period.name}</strong></p>
                    <img src="${period.icon}" alt="${period.shortForecast}" />
                    <p>${period.temperature}°F</p>
                    <p>${period.shortForecast}</p>
                `;
                forecastGrid.appendChild(weatherItem);
            }
        });

        weatherDiv.appendChild(forecastGrid);
    } catch (error) {
        console.error("Error fetching weather:", error);
        document.getElementById("weather").innerHTML = "<p>Unable to fetch weather data.</p>";
    }
}

// Call the function after fetching the user's location
getWeather();
