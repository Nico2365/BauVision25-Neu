import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("projects");
    return saved ? JSON.parse(saved) : [];
  });
  const [newProject, setNewProject] = useState({
    name: "", plz: "", strasse: "", nr: "", stadt: "", bauherr: "", kontakt: ""
  });
  const [selected, setSelected] = useState(null);
  const [bilder, setBilder] = useState([]);

  const login = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
    } catch (e) {
      setError(e.message);
    }
  };

  const createProject = () => {
    if (projects.some(p => p.name === newProject.name)) return;
    const updated = [...projects, { ...newProject, bilder: [] }];
    setProjects(updated);
    localStorage.setItem("projects", JSON.stringify(updated));
    setNewProject({ name: "", plz: "", strasse: "", nr: "", stadt: "", bauherr: "", kontakt: "" });
  };

  const selectProject = (name) => {
    const proj = projects.find(p => p.name === name);
    setSelected(proj);
    setBilder(proj.bilder || []);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const updated = projects.map(p => 
      p.name === selected.name ? { ...p, bilder: [...p.bilder, ...files.map(f => f.name)] } : p
    );
    setProjects(updated);
    setBilder(prev => [...prev, ...files.map(f => f.name)]);
    localStorage.setItem("projects", JSON.stringify(updated));
  };

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Login</h2>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" /><br />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Passwort" /><br />
        <button onClick={login}>Login</button>
        {error && <p>{error}</p>}
      </div>
    );
  }

  if (selected) {
    return (
      <div style={{ padding: 40 }}>
        <h2>{selected.name}</h2>
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          style={{ border: "2px dashed gray", padding: 20, marginBottom: 20 }}
        >
          Bilder hier reinziehen
        </div>
        <ul>{bilder.map((b, i) => <li key={i}>{b}</li>)}</ul>
        <button onClick={() => setSelected(null)}>Zurück</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Projektübersicht</h2>
      <input placeholder="Projektname" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} /><br />
      <input placeholder="PLZ" value={newProject.plz} onChange={e => setNewProject({ ...newProject, plz: e.target.value })} /><br />
      <input placeholder="Straße" value={newProject.strasse} onChange={e => setNewProject({ ...newProject, strasse: e.target.value })} /><br />
      <input placeholder="Nr." value={newProject.nr} onChange={e => setNewProject({ ...newProject, nr: e.target.value })} /><br />
      <input placeholder="Stadt" value={newProject.stadt} onChange={e => setNewProject({ ...newProject, stadt: e.target.value })} /><br />
      <input placeholder="Bauherr" value={newProject.bauherr} onChange={e => setNewProject({ ...newProject, bauherr: e.target.value })} /><br />
      <input placeholder="Ansprechpartner" value={newProject.kontakt} onChange={e => setNewProject({ ...newProject, kontakt: e.target.value })} /><br />
      <button onClick={createProject}>Projekt anlegen</button>
      <ul>
        {projects.map((p, i) => (
          <li key={i}><button onClick={() => selectProject(p.name)}>{p.name}</button></li>
        ))}
      </ul>
    </div>
  );
}
