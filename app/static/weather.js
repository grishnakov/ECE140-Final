// async function getWeather(city, state) {
//   try {
//       const locationResponse = await fetch(`https://nominatim.openstreetmap.org/search?city=${city}&state=${state}&format=json&limit=1`);
//       const locationData = await locationResponse.json();
//
//       if (!locationData.length) {
//           throw new Error("Location not found");
//       }
//
//       const { lat, lon } = locationData[0];
//
//       const gridResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
//       const gridData = await gridResponse.json();
//       const forecastURL = gridData.properties.forecast;
//
//       const forecastResponse = await fetch(forecastURL);
//       const forecastData = await forecastResponse.json();
//       const periods = forecastData.properties.periods;
//
//       const weatherDiv = document.getElementById("weather");
//       weatherDiv.innerHTML = "<h3>7-Day Forecast</h3>";
//
//       periods.forEach((period, index) => {
//           if (index < 14) { // Ensuring we get 7 full days (day + night)
//               const weatherItem = document.createElement("div");
//               weatherItem.classList.add("weather-item");
//               weatherItem.innerHTML = `
//                   <p><strong>${period.name}</strong></p>
//                   <p>Temperature: ${period.temperature}°F</p>
//                   <p>Conditions: ${period.shortForecast}</p>
//                   <img src="${period.icon}" alt="${period.shortForecast}" />
//               `;
//               weatherDiv.appendChild(weatherItem);
//           }
//       });
//   } catch (error) {
//       console.error("Error fetching weather:", error);
//       document.getElementById("weather").innerHTML = "<p>Unable to fetch weather data.</p>";
//   }
// }
//
// // Call the function with a default city and state
// getWeather("La Jolla", "CA");
async function getWeather(city, state) {
  try {
      // Fetch location data from OpenStreetMap
      const locationResponse = await fetch(`https://nominatim.openstreetmap.org/search?city=${city}&state=${state}&format=json&limit=1`);
      const locationData = await locationResponse.json();

      if (!locationData.length) {
          throw new Error("Location not found");
      }
      const { lat, lon } = locationData[0];

      // Get forecast grid information from weather.gov
      const gridResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
      const gridData = await gridResponse.json();
      const forecastURL = gridData.properties.forecast;

      // Fetch the forecast data
      const forecastResponse = await fetch(forecastURL);
      const forecastData = await forecastResponse.json();
      
      // Store the forecast data globally so that chat.js can include it in requests
      window.weatherData = forecastData;

      const periods = forecastData.properties.periods;
      const weatherDiv = document.getElementById("weather");
      weatherDiv.innerHTML = "<h3>7-Day Forecast</h3>";

      // Create a container for a grid layout
      const forecastGrid = document.createElement("div");
      forecastGrid.classList.add("forecast-grid");

      // Add each weather period as a grid item
      periods.forEach((period, index) => {
          if (index < 14) { // 7 days (day + night)
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

// Call the function with a default city and state
getWeather("La Jolla", "CA");

