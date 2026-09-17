const mapElement = document.getElementById("map");

if (mapElement && typeof L !== "undefined") {
    let coordinates = [77.2090, 28.6139]; // Default: New Delhi
    try {
        const data = mapElement.getAttribute("data-coordinates");
        if (data) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length >= 2 && !Number.isNaN(Number(parsed[0])) && !Number.isNaN(Number(parsed[1]))) {
                coordinates = [Number(parsed[0]), Number(parsed[1])];
            }
        }
    } catch (err) {
        console.warn("Invalid map coordinates data:", err);
    }

    const lon = coordinates[0];
    const lat = coordinates[1];

    try {
        const map = L.map("map").setView([lat, lon], 12);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19
        }).addTo(map);

        L.marker([lat, lon])
            .addTo(map)
            .bindPopup("Exact location will be provided after booking")
            .openPopup();
    } catch (e) {
        console.warn("Map initialization error:", e);
    }
}