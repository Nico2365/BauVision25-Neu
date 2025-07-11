import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc
} from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [projektname, setProjektname] = useState("");
  const [projekte, setProjekte] = useState([]);
  const [aktuellesProjekt, setAktuellesProjekt] = useState(null);
  const [form, setForm] = useState({
    plz: "",
    strasse: "",
    hausnummer: "",
    stadt: "",
    bauherr: "",
    ansprechpartner: ""
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      if (usr) {
        setUser(usr);
        ladeProjekte(usr.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  const ladeProjekte = async (uid) => {
    const snapshot = await getDocs(collection(db, "nutzer", uid, "projekte"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProjekte(data);
  };

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, passwort);
    } catch (err) {
      alert("Login fehlgeschlagen: " + err.message);
    }
  };

  const erstelleProjekt = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !projektname) return;

    const projektRef = doc(db, "nutzer", uid, "projekte", projektname);
    const existiert = await getDoc(projektRef);

    if (existiert.exists()) {
      alert("Ein Projekt mit diesem Namen existiert bereits.");
      return;
    }

    const projekt = {
      name: projektname,
      ...form,
      bilder: []
    };

    await setDoc(projektRef, projekt);
    setProjektname("");
    setForm({
      plz: "",
      strasse: "",
      hausnummer: "",
      stadt: "",
      bauherr: "",
      ansprechpartner: ""
    });
    ladeProjekte(uid);
  };

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login</h2>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail" />
        <input value={passwort} onChange={(e) => setPasswort(e.target.value)} type="password" placeholder="Passwort" />
        <button onClick={login}>Einloggen</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Willkommen, {user.email}</h2>
      <input value={projektname} onChange={(e) => setProjektname(e.target.value)} placeholder="Projektname" />
      {["plz", "strasse", "hausnummer", "stadt", "bauherr", "ansprechpartner"].map((key) => (
        <input key={key} value={form[key]} placeholder={key} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      ))}
      <button onClick={erstelleProjekt}>Projekt anlegen</button>
      <ul>
        {projekte.map((p) => (
          <li key={p.name}>
            <button
  onClick={async () => {
    const ref = doc(db, "nutzer", user.uid, "projekte", p.name);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      setAktuellesProjekt({ id: p.name, ...snapshot.data() });
    }
  }}
>
  {p.name}
</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
