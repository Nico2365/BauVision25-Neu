
import React, { useState, useEffect } from "react";

export default function App() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    plz: "",
    strasse: "",
    hausnummer: "",
    stadt: "",
    bauherr: "",
    ansprechpartner: ""
  });
  const [projekte, setProjekte] = useState([]);
  const [selected, setSelected] = useState(null);
  const [bilder, setBilder] = useState([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const gespeicherte = JSON.parse(localStorage.getItem("projekte")) || [];
    setProjekte(gespeicherte);
  }, []);

  useEffect(() => {
    localStorage.setItem("projekte", JSON.stringify(projekte));
  }, [projekte]);

  const handleLogin = () => setUser("demo@bauvision.de");

  const projektAnlegen = () => {
    if (!form.name || projekte.find(p => p.name === form.name)) return;
    const neues = { ...form, bilder: [] };
    setProjekte([...projekte, neues]);
    setForm({ name: "", plz: "", strasse: "", hausnummer: "", stadt: "", bauherr: "", ansprechpartner: "" });
  };

  const projektOeffnen = (name) => {
    const proj = projekte.find(p => p.name === name);
    setSelected(proj);
    setBilder(proj?.bilder || []);
  };

  const bilderHinzufuegen = (files) => {
    const neue = [...bilder, ...files];
    setBilder(neue);
    const aktualisiert = projekte.map(p =>
      p.name === selected.name ? { ...p, bilder: neue } : p
    );
    setProjekte(aktualisiert);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    bilderHinzufuegen(files);
  };

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Login zur BauVision25</h2>
        <button onClick={handleLogin}>Einloggen</button>
      </div>
    );
  }

  if (!selected) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Projektübersicht</h2>
        {["name", "plz", "strasse", "hausnummer", "stadt", "bauherr", "ansprechpartner"].map((feld) => (
          <input
            key={feld}
            placeholder={feld}
            value={form[feld]}
            onChange={(e) => setForm({ ...form, [feld]: e.target.value })}
            style={{ display: "block", marginBottom: 8 }}
          />
        ))}
        <button onClick={projektAnlegen}>Projekt anlegen</button>
        <ul>
          {projekte.map((p, i) => (
            <li key={i}>
              <button onClick={() => projektOeffnen(p.name)}>{p.name}</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Projekt: {selected.name}</h2>
      <p>{selected.strasse} {selected.hausnummer}, {selected.plz} {selected.stadt}</p>
      <p>Bauherr: {selected.bauherr}, Ansprechpartner: {selected.ansprechpartner}</p>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        style={{
          border: "2px dashed gray",
          padding: 40,
          textAlign: "center",
          backgroundColor: dragging ? "#e0ffe0" : "#f8f8f8",
          marginBottom: 20
        }}
      >
        Bilder hier hineinziehen
      </div>

      <ul>
        {bilder.map((b, i) => <li key={i}>{b.name || "Bild"}</li>)}
      </ul>
      <button onClick={() => setSelected(null)}>Zurück</button>
    </div>
  );
}
