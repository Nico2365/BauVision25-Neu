import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [projektname, setProjektname] = useState("");
  const [projekte, setProjekte] = useState([]);
  const [aktuellesProjekt, setAktuellesProjekt] = useState(null);
  const [bilder, setBilder] = useState([]);
  const [form, setForm] = useState({ plz: "", strasse: "", hausnummer: "", stadt: "", bauherr: "", ansprechpartner: "" });

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
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProjekte(data);
  };

  const login = async () => {
    await signInWithEmailAndPassword(auth, email, passwort);
  };

  const erstelleProjekt = async () => {
    if (!projektname || projekte.find(p => p.name === projektname)) return;
    const projekt = {
      name: projektname,
      ...form,
      bilder: []
    };
    const ref = doc(db, "nutzer", user.uid, "projekte", projektname);
    await setDoc(ref, projekt);
    setProjektname("");
    setForm({ plz: "", strasse: "", hausnummer: "", stadt: "", bauherr: "", ansprechpartner: "" });
    ladeProjekte(user.uid);
  };

  const bilderHinzufuegen = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map(f => f.name);
    const aktualisiert = { ...aktuellesProjekt, bilder: [...(aktuellesProjekt.bilder || []), ...fileNames] };
    setAktuellesProjekt(aktualisiert);
    setDoc(doc(db, "nutzer", user.uid, "projekte", aktuellesProjekt.name), aktualisiert);
  };

  const pdfErstellen = () => {
    const input = document.getElementById("pdf-content");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10);
      pdf.save(`${aktuellesProjekt.name}.pdf`);
    });
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

  if (!aktuellesProjekt) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Projektübersicht</h2>
        <input value={projektname} onChange={(e) => setProjektname(e.target.value)} placeholder="Projektname" />
        {["plz", "strasse", "hausnummer", "stadt", "bauherr", "ansprechpartner"].map((key) => (
          <input key={key} value={form[key]} placeholder={key} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
        ))}
        <button onClick={erstelleProjekt}>Projekt anlegen</button>
        <ul>
          {projekte.map((p) => (
            <li key={p.name}>
              <button onClick={() => setAktuellesProjekt(p)}>{p.name}</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <div id="pdf-content">
        <h2>{aktuellesProjekt.name}</h2>
        <p>Adresse: {aktuellesProjekt.strasse} {aktuellesProjekt.hausnummer}, {aktuellesProjekt.plz} {aktuellesProjekt.stadt}</p>
        <p>Bauherr: {aktuellesProjekt.bauherr} | Ansprechpartner: {aktuellesProjekt.ansprechpartner}</p>
        <ul>
          {(aktuellesProjekt.bilder || []).map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </div>
      <input type="file" multiple onChange={bilderHinzufuegen} />
      <button onClick={pdfErstellen}>PDF erstellen</button>
      <button onClick={() => setAktuellesProjekt(null)}>Zurück</button>
    </div>
  );
}
