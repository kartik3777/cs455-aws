import { useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { sender: "user", text }]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { sender: "bot", text: data.reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { sender: "bot", text: "⚠️ Server not responding." },
      ]);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter") send();
  };

  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 9999 }}>
      {open && (
        <div
          style={{
            width: 320,
            height: 420,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ background: "#2563eb", color: "#fff", padding: 12, fontWeight: 600 }}>
            AI Assistant
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 12,
              background: "#f8fafc",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 8,
                  textAlign: m.sender === "user" ? "right" : "left",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: m.sender === "user" ? "#dbeafe" : "#e5e7eb",
                    maxWidth: "85%",
                    wordBreak: "break-word",
                  }}
                >
                  {m.text}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", padding: 8, borderTop: "1px solid #e5e7eb" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Type your message…"
              style={{
                flex: 1,
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                padding: "8px 10px",
                outline: "none",
              }}
            />
            <button
              onClick={send}
              style={{
                marginLeft: 8,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        title="Chat"
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
          cursor: "pointer",
          fontSize: 24,
        }}
      >
        💬
      </button>
    </div>
  );
}
