import React, { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function App() {
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState("");
  const [eingeloggt, setEingeloggt] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, passwort);
      setEingeloggt(true);
    } catch (err) {
      setFehler(err.message);
    }
  };

  if (!eingeloggt) {
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

  return <h1>✅ Eingeloggt! Start der BauVision25</h1>;
}
