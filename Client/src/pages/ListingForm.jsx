import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getError } from "../api/axios";

const CATEGORIES = ["Rooms", "Trending", "Mountains", "Beach", "City", "Farms", "Camping", "Luxury"];
const EMPTY = { title: "", description: "", location: "", country: "", price: "", maxGuests: 2, category: "Rooms" };

// Ek hi form: /host/new (create) aur /host/:id/edit (update)
export default function ListingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit mode: purana data form me bharo
  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/listings/${id}`)
      .then(({ data }) => {
        const l = data.listing;
        setForm({
          title: l.title, description: l.description, location: l.location, country: l.country,
          price: l.price, maxGuests: l.maxGuests, category: l.category,
        });
        setPreview(l.image?.url || "");
      })
      .catch((err) => setError(getError(err)));
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f)); // upload se pehle preview
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Image file bhejni hai to JSON nahi, FormData (multipart) use hota hai
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, v));
      if (file) body.append("image", file);

      const res = isEdit ? await api.put(`/listings/${id}`, body) : await api.post("/listings", body);
      navigate(`/listings/${res.data.listing._id}`);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto my-8 max-w-2xl space-y-4 rounded-2xl border bg-white p-6">
      <h1 className="text-2xl font-bold">{isEdit ? "Edit listing" : "Add new listing"}</h1>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      <input className="input" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
      <textarea className="input" name="description" rows={4} placeholder="Description" value={form.description} onChange={handleChange} required />

      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input" name="location" placeholder="City / location" value={form.location} onChange={handleChange} required />
        <input className="input" name="country" placeholder="Country" value={form.country} onChange={handleChange} required />
        <input className="input" type="number" min="1" name="price" placeholder="Price per night (₹)" value={form.price} onChange={handleChange} required />
        <input className="input" type="number" min="1" max="20" name="maxGuests" placeholder="Max guests" value={form.maxGuests} onChange={handleChange} required />
      </div>

      <select className="input" name="category" value={form.category} onChange={handleChange}>
        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>

      <div>
        <label className="mb-1 block text-sm text-gray-600">Photo (jpg / png / webp, max 5MB)</label>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} />
        {preview && <img src={preview} alt="preview" className="mt-3 h-44 rounded-xl object-cover" />}
      </div>

      <div className="flex gap-3">
        <button className="btn !w-auto px-8" disabled={loading}>{loading ? "Saving..." : isEdit ? "Save changes" : "Create listing"}</button>
        <Link to="/host" className="py-2 text-sm text-gray-600">Cancel</Link>
      </div>
    </form>
  );
}
