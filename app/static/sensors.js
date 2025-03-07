document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM fully loaded. Initializing dashboard...");

  function formatDateTimeLocal(value) {
      if (!value) return "";
      return value.includes(":") && value.split(":").length < 3 ? value.replace("T", " ") + ":00" : value.replace("T", " ");
  }

  async function fetchSensorData(sensorType, startDate = "", endDate = "") {
      try {
          let url = `/api/${sensorType}`;
          const queryParams = [];
          if (startDate) queryParams.push(`start-date=${encodeURIComponent(startDate)}`);
          if (endDate) queryParams.push(`end-date=${encodeURIComponent(endDate)}`);
          if (queryParams.length > 0) {
              url += "?" + queryParams.join("&");
          }
          console.log(`Fetching data from: ${url}`);
          const response = await fetch(url);
          if (!response.ok) {
              throw new Error(`Failed to fetch data for ${sensorType}: ${response.statusText}`);
          }
          const data = await response.json();
          console.log(`Data for ${sensorType}:`, data);
          return data;
      } catch (error) {
          console.error(error);
          return [];
      }
  }

  function renderChart(canvasId, title, sensorData) {
      console.log(`Rendering chart "${title}" on canvas "${canvasId}" with data:`, sensorData);
      sensorData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const canvas = document.getElementById(canvasId);
      if (!canvas) {
          console.error(`Canvas element with id "${canvasId}" not found.`);
          return;
      }
      const labels = sensorData.map(item => item.timestamp);
      const dataValues = sensorData.map(item => item.value);
      const ctx = canvas.getContext('2d');
      new Chart(ctx, {
          type: 'line',
          data: {
              labels: labels,
              datasets: [{
                  label: title,
                  data: dataValues,
                  fill: false,
                  borderColor: 'rgba(75, 192, 192, 1)',
                  tension: 0.1
              }]
          },
          options: {
              plugins: {
                  legend: { display: true, position: 'top' },
                  title: { display: true, text: title }
              },
              scales: {
                  x: {
                      title: { display: true, text: 'Timestamp' }
                  },
                  y: {
                      title: { display: true, text: 'Value' }
                  }
              }
          }
      });
  }

  async function initDashboard(startDate, endDate) {
      const temperatureData = await fetchSensorData('temperature', startDate, endDate);
      const humidityData = await fetchSensorData('humidity', startDate, endDate);
      const lightData = await fetchSensorData('light', startDate, endDate);

      renderChart('temperatureChart', 'Temperature Data', temperatureData);
      renderChart('humidityChart', 'Humidity Data', humidityData);
      renderChart('lightChart', 'Light Data', lightData);
  }

  initDashboard();
});
