import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";

const API = "http://localhost:5000/api/places";

// Fix default marker icons in Vite/Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function App() {
  const [places, setPlaces] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  const load = async () => {
    const res = await axios.get(API, { params: { q, category } });
    setPlaces(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container">
      <h1>Hanoi Tourism</h1>
      <div className="filters">
        <input
          placeholder="Search place..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          placeholder="Category..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <button onClick={load}>Search</button>
      </div>

      <div className="grid">
        <div>
          {places.map((p) => (
            <div key={p.id} className="card">
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <small>
                {p.category} • {p.address}
              </small>
            </div>
          ))}
        </div>

        <MapContainer
          center={[21.0285, 105.8542]}
          zoom={13}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {places.map((p) => (
            <Marker key={p.id} position={[p.latitude, p.longitude]}>
              <Popup>{p.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
