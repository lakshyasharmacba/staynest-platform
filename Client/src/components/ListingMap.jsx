import { MapContainer, TileLayer, Circle } from "react-leaflet";

// coordinates = [lng, lat] (MongoDB format). Leaflet ko [lat, lng] chahiye -> reverse
// Circle (marker nahi): exact address booking ke baad hi share hota hai
export default function ListingMap({ coordinates }) {
  const [lng, lat] = coordinates;
  return (
    <MapContainer center={[lat, lng]} zoom={12} scrollWheelZoom={false} className="h-72 w-full rounded-2xl">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Circle center={[lat, lng]} radius={1500} pathOptions={{ color: "#fe424d" }} />
    </MapContainer>
  );
}
