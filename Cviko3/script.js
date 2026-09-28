// ========================================
// 1. WEATHER API
// ========================================

const weatherUrl =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=50.075539" +
    "&longitude=14.437800" +
    "&current=temperature_2m,wind_speed_10m,relative_humidity_2m,precipitation" +
    "&timezone=auto";

fetch(weatherUrl)
    .then(response => response.json())
    .then(data => {

        const temperature = data.current.temperature_2m;
        const wind = data.current.wind_speed_10m;
        const humidity = data.current.relative_humidity_2m;
        const precipitation = data.current.precipitation;

        document.getElementById("weather").innerHTML =
            "Teplota: " + temperature + " °C<br>" +
            "Vietor: " + wind + " km/h<br>" +
            "Vlhkosť vzduchu: " + humidity + "%<br>" +
            "Zrážky: " + precipitation + "mm";
    })
    .catch(error => {

        document.getElementById("weather").innerHTML =
            "Nepodarilo sa načítať počasie.";

        console.error(error);

    });


// ========================================
// 2. LEAFLET MAP
// ========================================

const map = L.map("map").setView(
    [50.075539, 14.437800],
    15
);

L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
).addTo(map);


// ========================================
// 3. MARKER
// ========================================

L.marker([50.075539, 14.437800])
    .addTo(map)
    .bindPopup("Praha")
    .openPopup();