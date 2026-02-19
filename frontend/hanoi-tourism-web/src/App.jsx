import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "./App.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const API_BASE = import.meta.env.VITE_API_URL || "";

const api = axios.create({ baseURL: API_BASE });

export default function App() {
  const [places, setPlaces] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [auth, setAuth] = useState(() => JSON.parse(localStorage.getItem("auth") || "null"));

  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [visitDate, setVisitDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [myBookings, setMyBookings] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

  const headers = useMemo(
    () => (auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    [auth]
  );

  const loadPlaces = async () => {
    const res = await api.get("/api/places", { params: { q, category } });
    setPlaces(res.data);
  };

  const loadReviews = async (placeId) => {
    const res = await api.get("/api/reviews", { params: { placeId } });
    setReviews(res.data);
    setSelectedPlaceId(placeId);
  };

  const loadMyBookings = async () => {
    if (!auth?.token) return;
    const res = await api.get("/api/bookings/my", { headers });
    setMyBookings(res.data);
  };

  const loadMyReviews = async () => {
    if (!auth?.token) return;
    const res = await api.get("/api/reviews/my", { headers });
    setMyReviews(res.data);
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  useEffect(() => {
    loadMyBookings();
    loadMyReviews();
  }, [auth?.token]);

  const register = async () => {
    await api.post("/api/auth/register", { username, password, fullName });
    alert("Register thành công. Giờ bạn login nhé.");
  };

  const login = async () => {
    const res = await api.post("/api/auth/login", { username, password });
    setAuth(res.data);
    localStorage.setItem("auth", JSON.stringify(res.data));
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
    setMyBookings([]);
    setMyReviews([]);
  };

  const submitReview = async () => {
    if (!selectedPlaceId) return;
    await api.post(
      "/api/reviews",
      { placeId: selectedPlaceId, rating: Number(rating), comment },
      { headers }
    );
    setComment("");
    await loadReviews(selectedPlaceId);
  };

  const createBooking = async (placeId) => {
    if (!visitDate) {
      alert("Chọn ngày tham quan trước nhé.");
      return;
    }

    await api.post(
      "/api/bookings",
      { placeId, quantity: Number(quantity), visitDate, visitorName: auth?.fullName || auth?.username || "Guest" },
      { headers }
    );
    await loadMyBookings();
    alert("Đặt vé thành công!");
  };

  const cancelBooking = async (id) => {
    await api.delete(`/api/bookings/${id}`, { headers });
    await loadMyBookings();
  };

  const deleteMyReview = async (id) => {
    await api.delete(`/api/reviews/${id}`, { headers });
    await loadMyReviews();
    if (selectedPlaceId) await loadReviews(selectedPlaceId);
  };

  return (
    <div className="container">
      <header className="hero panel">
        <h1>Hanoi Tourism</h1>
        <p className="subtitle">Khám phá địa điểm • đánh giá • đặt vé</p>
      </header>

      <section className="panel auth">
        {auth ? (
          <div className="row between">
            <div>
              Xin chào <b>{auth.fullName}</b> (@{auth.username})
            </div>
            <button className="btn-secondary" onClick={logout}>Logout</button>
          </div>
        ) : (
          <>
            <div className="row">
              <input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <input placeholder="full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="row">
              <button onClick={register}>Register</button>
              <button onClick={login}>Login</button>
            </div>
          </>
        )}
      </section>

      <section className="panel filters">
        <input placeholder="Search place..." value={q} onChange={(e) => setQ(e.target.value)} />
        <input placeholder="Category..." value={category} onChange={(e) => setCategory(e.target.value)} />
        <button onClick={loadPlaces}>Search</button>
      </section>

      <div className="grid">
        <section className="panel">
          <h2>Places</h2>
          {places.map((p) => (
            <div key={p.id} className="card">
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <small>
                {p.category} • {p.address} • {Number(p.ticketPrice).toLocaleString()} VND
              </small>

              <div className="row mt8">
                <button onClick={() => loadReviews(p.id)}>Reviews</button>
                {auth && <button onClick={() => createBooking(p.id)}>Book</button>}
              </div>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Map</h2>
          <MapContainer center={[21.0285, 105.8542]} zoom={13} style={{ height: "340px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {places.map((p) => (
              <Marker key={p.id} position={[p.latitude, p.longitude]}>
                <Popup>{p.name}</Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="booking-box mt16">
            <h3>Booking options</h3>
            <div className="row">
              <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
          </div>

          <div className="reviews mt16">
            <h3>Reviews {selectedPlaceId ? `(place #${selectedPlaceId})` : ""}</h3>
            {selectedPlaceId && (
              <>
                {reviews.length === 0 && <p>No reviews yet.</p>}
                {reviews.map((r) => (
                  <div key={r.id} className="review-item">
                    <b>{r.username}</b> • {"⭐".repeat(r.rating)}
                    <p>{r.comment}</p>
                  </div>
                ))}
                {auth && (
                  <div className="row mt8">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    />
                    <input
                      placeholder="Your comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button onClick={submitReview}>Submit</button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {auth && (
        <>
          <section className="panel mt16">
            <h2>My bookings</h2>
            {myBookings.length === 0 ? (
              <p>Chưa có booking.</p>
            ) : (
              myBookings.map((b) => (
                <div key={b.id} className="card">
                  <b>{b.placeName || `Place #${b.placeId}`}</b> • Qty {b.quantity} • Visit {b.visitDate}
                  <div>Total: {Number(b.totalAmount).toLocaleString()} VND</div>
                  <div className="mt8">
                    <button className="btn-danger" onClick={() => cancelBooking(b.id)}>Cancel booking</button>
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="panel mt16">
            <h2>My reviews</h2>
            {myReviews.length === 0 ? (
              <p>Bạn chưa có review nào.</p>
            ) : (
              myReviews.map((r) => (
                <div key={r.id} className="card">
                  <b>Place #{r.placeId}</b> • {"⭐".repeat(r.rating)}
                  <p>{r.comment}</p>
                  <button className="btn-danger" onClick={() => deleteMyReview(r.id)}>Delete review</button>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
