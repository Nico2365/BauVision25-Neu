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
const bilderHinzufuegen = (e) => {
  const files = Array.from(e.target.files);
  const namen = files.map((f) => f.name);
  const aktualisiert = {
    ...aktuellesProjekt,
    bilder: [...(aktuellesProjekt.bilder || []), ...namen]
  };
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
if (aktuellesProjekt) {
  return (
    <div style={{ padding: 20 }}>
      <div id="pdf-content">
        <h2>{aktuellesProjekt.name}</h2>
        <p>
          Adresse: {aktuellesProjekt.strasse} {aktuellesProjekt.hausnummer},{" "}
          {aktuellesProjekt.plz} {aktuellesProjekt.stadt}
        </p>
        <p>
          Bauherr: {aktuellesProjekt.bauherr} | Ansprechpartner:{" "}
          {aktuellesProjekt.ansprechpartner}
        </p>
        <ul>
          {(aktuellesProjekt.bilder || []).map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
     <div
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const namen = files.map((f) => f.name);
    const aktualisiert = {
      ...aktuellesProjekt,
      bilder: [...(aktuellesProjekt.bilder || []), ...namen]
    };
    setAktuellesProjekt(aktualisiert);
    setDoc(doc(db, "nutzer", user.uid, "projekte", aktuellesProjekt.name), aktualisiert);
  }}
  style={{
    border: "2px dashed gray",
    padding: 20,
    marginBottom: 10,
    textAlign: "center"
  }}
>
  <p>📂 Bilder hierher ziehen oder auswählen</p>
  <input
    type="file"
    multiple
    onChange={(e) => {
      const files = Array.from(e.target.files);
      const namen = files.map((f) => f.name);
      const aktualisiert = {
        ...aktuellesProjekt,
        bilder: [...(aktuellesProjekt.bilder || []), ...namen]
      };
      setAktuellesProjekt(aktualisiert);
      setDoc(doc(db, "nutzer", user.uid, "projekte", aktuellesProjekt.name), aktualisiert);
    }}
  />
</div>

      <button onClick={pdfErstellen}>PDF erstellen</button>
      <button onClick={() => setAktuellesProjekt(null)}>
        Zurück zur Übersicht
      </button>
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
    try {
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        console.log("Projekt geöffnet:", snapshot.data());
        setAktuellesProjekt({ id: p.name, ...snapshot.data() });
      } else {
        console.warn("Projekt nicht gefunden in Firestore.");
      }
    } catch (err) {
      console.error("Fehler beim Laden:", err.message);
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
