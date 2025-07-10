import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState("");
  const [projekte, setProjekte] = useState([]);
  const [projektName, setProjektName] = useState("");
  const [projektDetails, setProjektDetails] = useState({
    plz: "",
    strasse: "",
    hausnummer: "",
    stadt: "",
    bauherr: "",
    ansprechpartner: "",
  });
  const [selectedProjekt, setSelectedProjekt] = useState(null);
  const [bilder, setBilder] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        const q = query(collection(db, "projekte"), where("uid", "==", user.uid));
        const unsub = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProjekte(data);
        });
        return unsub;
      }
    });
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, passwort);
      setFehler("");
    } catch (err) {
      setFehler("❌ " + err.message);
    }
  };

  const logout = () => signOut(auth);

  const projektAnlegen = async () => {
    const exists = projekte.some((p) => p.name === projektName);
    if (!projektName || exists) return;
    await addDoc(collection(db, "projekte"), {
      uid: user.uid,
      name: projektName,
      ...projektDetails,
    });
    setProjektName("");
    setProjektDetails({
      plz: "",
      strasse: "",
      hausnummer: "",
      stadt: "",
      bauherr: "",
      ansprechpartner: "",
    });
  };

  const bilderHinzufuegen = (e) => {
    const files = Array.from(e.target.files);
    setBilder([...bilder, ...files]);
  };

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Login – BauVision25</h2>
        <input
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          placeholder="Passwort"
          type="password"
          value={passwort}
          onChange={(e) => setPasswort(e.target.value)}
        /><br />
        <button onClick={handleLogin}>Einloggen</button>
        {fehler && <p style={{ color: "red" }}>{fehler}</p>}
      </div>
    );
  }

  if (selectedProjekt) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Projekt: {selectedProjekt.name}</h2>
        <input type="file" multiple onChange={bilderHinzufuegen} />
        <ul>
          {bilder.map((b, i) => <li key={i}>{b.name}</li>)}
        </ul>
        <button onClick={() => setSelectedProjekt(null)}>Zurück</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Hallo {user.email}</h2>
      <button onClick={logout}>Abmelden</button>
      <h3>Neues Projekt anlegen</h3>
      <input placeholder="Projektname" value={projektName} onChange={(e) => setProjektName(e.target.value)} /><br />
      <input placeholder="PLZ" value={projektDetails.plz} onChange={(e) => setProjektDetails({ ...projektDetails, plz: e.target.value })} /><br />
      <input placeholder="Straße" value={projektDetails.strasse} onChange={(e) => setProjektDetails({ ...projektDetails, strasse: e.target.value })} /><br />
      <input placeholder="Hausnummer" value={projektDetails.hausnummer} onChange={(e) => setProjektDetails({ ...projektDetails, hausnummer: e.target.value })} /><br />
      <input placeholder="Stadt" value={projektDetails.stadt} onChange={(e) => setProjektDetails({ ...projektDetails, stadt: e.target.value })} /><br />
      <input placeholder="Bauherr" value={projektDetails.bauherr} onChange={(e) => setProjektDetails({ ...projektDetails, bauherr: e.target.value })} /><br />
      <input placeholder="Ansprechpartner" value={projektDetails.ansprechpartner} onChange={(e) => setProjektDetails({ ...projektDetails, ansprechpartner: e.target.value })} /><br />
      <button onClick={projektAnlegen}>Projekt anlegen</button>

      <h3>Projekte</h3>
      <ul>
        {projekte.map((p) => (
          <li key={p.id}>
            <button onClick={() => setSelectedProjekt(p)}>{p.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
