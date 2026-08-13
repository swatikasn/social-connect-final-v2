import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { signInWithPopup } from "firebase/auth";
import { io } from "socket.io-client";
import { auth, firebaseReady, googleProvider } from "./firebase";
import { api } from "./api";
import "./styles.css";

function SignIn({ onSession }) {
  const [error, setError] = useState("");
  async function googleSignIn() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const session = await api("/auth/firebase", { method: "POST", body: JSON.stringify({ idToken }) });
      localStorage.setItem("social-connect-token", session.token); onSession(session.user);
    } catch (e) { setError(e.message); }
  }
  return <main className="gate"><div className="orb" /><section className="sign-in"><p className="eyebrow">SOCIAL / CONNECT</p><h1>Real conversations,<br /><em>in the moment.</em></h1><p className="lede">A focused space for your people — with instant delivery, presence, and rich media.</p><button disabled={!firebaseReady} onClick={googleSignIn}>Continue with Google <span>→</span></button>{!firebaseReady && <p className="warning">Add Firebase values to <code>.env</code> to enable Google sign-in.</p>}{error && <p className="warning">{error}</p>}</section></main>;
}

function App() {
  const [me, setMe] = useState(null); const [users, setUsers] = useState([]); const [active, setActive] = useState(null); const [messages, setMessages] = useState([]); const [draft, setDraft] = useState(""); const [status, setStatus] = useState("");
  const socket = useMemo(() => io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", { autoConnect: false }), []);
  useEffect(() => { if (!localStorage.getItem("social-connect-token")) return; api("/users/me").then(setMe).catch(() => localStorage.removeItem("social-connect-token")); }, []);
  useEffect(() => { if (!me) return; api("/users").then(setUsers).catch(setStatus); socket.connect(); socket.emit("presence:join", me._id); socket.on("message:received", (message) => { if (message.sender === active?._id) setMessages((current) => [...current, message]); }); return () => socket.disconnect(); }, [me, socket, active]);
  useEffect(() => { if (active) api(`/messages/${active._id}`).then(setMessages).catch((e) => setStatus(e.message)); }, [active]);
  async function send(event) { event.preventDefault(); if (!draft.trim() || !active) return; try { const message = await api("/messages", { method: "POST", body: JSON.stringify({ recipientId: active._id, text: draft }) }); setMessages((current) => [...current, message]); socket.emit("message:send", { recipientId: active._id, message }); setDraft(""); } catch (e) { setStatus(e.message); } }
  if (!me) return <SignIn onSession={setMe} />;
  return <main className="shell"><aside><div className="brand">SC<span>•</span></div><div className="me"><img src={me.avatarImage || `https://api.dicebear.com/8.x/initials/svg?seed=${me.username}`} /><div><strong>{me.username}</strong><small>Online now</small></div></div><p className="eyebrow">PEOPLE</p><nav>{users.map((user) => <button className={active?._id === user._id ? "person selected" : "person"} onClick={() => setActive(user)} key={user._id}><img src={user.avatarImage || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`} /><span>{user.username}</span></button>)}</nav><button className="signout" onClick={() => { localStorage.removeItem("social-connect-token"); setMe(null); }}>Sign out</button></aside><section className="conversation">{active ? <><header><img src={active.avatarImage || `https://api.dicebear.com/8.x/initials/svg?seed=${active.username}`} /><div><strong>{active.username}</strong><small>Direct message</small></div></header><div className="messages">{messages.map((message) => <div className={String(message.sender) === String(me._id) ? "bubble mine" : "bubble"} key={message._id}>{message.message.text}</div>)}</div><form onSubmit={send}><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${active.username}`} /><button>Send</button></form></> : <div className="empty"><p className="eyebrow">YOUR SPACE</p><h2>Choose a person<br />to start talking.</h2></div>}{status && <p className="toast">{status}</p>}</section></main>;
}
createRoot(document.getElementById("root")).render(<App />);
