// document.addEventListener("DOMContentLoaded", function() {
//   console.log("DOM fully loaded. Initializing dashboard...");
//
//   function formatDateTimeLocal(value) {
//       if (!value) return "";
//       return value.includes(":") && value.split(":").length < 3 ? value.replace("T", " ") + ":00" : value.replace("T", " ");
//   }
//
//   async function fetchSensorData(sensorType, startDate = "", endDate = "") {
//       try {
//           let url = `/api/${sensorType}`;
//           const queryParams = [];
//           if (startDate) queryParams.push(`start-date=${encodeURIComponent(startDate)}`);
//           if (endDate) queryParams.push(`end-date=${encodeURIComponent(endDate)}`);
//           if (queryParams.length > 0) {
//               url += "?" + queryParams.join("&");
//           }
//           console.log(`Fetching data from: ${url}`);
//           const response = await fetch(url);
//           if (!response.ok) {
//               throw new Error(`Failed to fetch data for ${sensorType}: ${response.statusText}`);
//           }
//           const data = await response.json();
//           console.log(`Data for ${sensorType}:`, data);
//           return data;
//       } catch (error) {
//           console.error(error);
//           return [];
//       }
//   }
//
//   function renderChart(canvasId, title, sensorData) {
//       console.log(`Rendering chart "${title}" on canvas "${canvasId}" with data:`, sensorData);
//       sensorData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
//
//       const canvas = document.getElementById(canvasId);
//       if (!canvas) {
//           console.error(`Canvas element with id "${canvasId}" not found.`);
//           return;
//       }
//       const labels = sensorData.map(item => item.timestamp);
//       const dataValues = sensorData.map(item => item.value);
//       const ctx = canvas.getContext('2d');
//       new Chart(ctx, {
//           type: 'line',
//           data: {
//               labels: labels,
//               datasets: [{
//                   label: title,
//                   data: dataValues,
//                   fill: false,
//                   borderColor: 'rgba(75, 192, 192, 1)',
//                   tension: 0.1
//               }]
//           },
//           options: {
//               plugins: {
//                   legend: { display: true, position: 'top' },
//                   title: { display: true, text: title }
//               },
//               scales: {
//                   x: {
//                       title: { display: true, text: 'Timestamp' }
//                   },
//                   y: {
//                       title: { display: true, text: 'Value' }
//                   }
//               }
//           }
//       });
//   }
//
//   async function initDashboard(startDate, endDate) {
//       const temperatureData = await fetchSensorData('temperature', startDate, endDate);
//       const humidityData = await fetchSensorData('humidity', startDate, endDate);
//       const lightData = await fetchSensorData('light', startDate, endDate);
//
//       renderChart('temperatureChart', 'Temperature Data', temperatureData);
//       renderChart('humidityChart', 'Humidity Data', humidityData);
//       renderChart('lightChart', 'Light Data', lightData);
//   }
//
//   initDashboard();
// });
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded. Initializing sensors dashboard...");

    // Helper to format Date objects to "YYYY-MM-DD HH:mm:ss"
    function formatDate(date) {
        const pad = (n) => n < 10 ? '0' + n : n;
        return (
            date.getFullYear() +
            '-' +
            pad(date.getMonth() + 1) +
            '-' +
            pad(date.getDate()) +
            ' ' +
            pad(date.getHours()) +
            ':' +
            pad(date.getMinutes()) +
            ':' +
            pad(date.getSeconds())
        );
    }

    // Calculate date range for the last week
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startDate = formatDate(oneWeekAgo);
    const endDate = formatDate(now);

    // Fetch sensor data from the given endpoint with date filters
    async function fetchSensorData(sensorType, startDate, endDate) {
        try {
            let url = `/api/sensors/${sensorType}`;
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

    // Group sensor data by device_id so that each device appears as a separate dataset.
    function groupByDevice(data) {
        const groups = {};
        data.forEach(item => {
            const deviceId = item.device_id;
            if (!groups[deviceId]) {
                groups[deviceId] = [];
            }
            groups[deviceId].push(item);
        });
        return groups;
    }

    // Predefined color palette
    const predefinedColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];
    // Mapping to ensure consistent colors per device across graphs.
    const deviceColors = {};
    function getDeviceColor(deviceId, index) {
        if (!deviceColors[deviceId]) {
            deviceColors[deviceId] = predefinedColors[index % predefinedColors.length];
        }
        return deviceColors[deviceId];
    }

    // Render a line chart using Chart.js.
    // Each dataset corresponds to a device.
    function renderGraph(canvasId, title, sensorData) {
        const groups = groupByDevice(sensorData);
        const datasets = [];
        let index = 0;
        for (const deviceId in groups) {
            const groupData = groups[deviceId];
            // Sort readings by timestamp
            groupData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            // Map each reading using the "reading" field (not "value")
            const dataPoints = groupData.map(item => ({
                x: item.timestamp,
                y: item.reading
            }));
            datasets.push({
                label: `Device ${deviceId}`,
                data: dataPoints,
                borderColor: getDeviceColor(deviceId, index),
                backgroundColor: getDeviceColor(deviceId, index),
                fill: false,
                tension: 0.1
            });
            index++;
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas element with id "${canvasId}" not found.`);
            return;
        }
        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: title
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            tooltipFormat: 'yyyy-MM-dd HH:mm:ss',
                            displayFormats: {
                                hour: 'MMM d, h a'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Timestamp'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Value'
                        }
                    }
                }
            }
        });
    }

    async function initDashboard() {
        // Fetch temperature and pressure data for the last week.
        const temperatureData = await fetchSensorData('temperature', startDate, endDate);
        const pressureData = await fetchSensorData('pressure', startDate, endDate);

        // Render the graphs. Each device gets a unique, consistent color.
        renderGraph('temperatureChart', 'Temperature Data (Last Week)', temperatureData);
        renderGraph('pressureChart', 'Pressure Data (Last Week)', pressureData);
    }

    initDashboard();
});
