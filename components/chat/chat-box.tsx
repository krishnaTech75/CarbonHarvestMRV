"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

type Message = { role: "user" | "assistant"; content: string }

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I can help with carbon and farmer profit calculations. How can I help?" },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const aliveRef = useRef(true)
  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
    }
  }, [])

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setInput("")
    setLoading(true)
    try {
      const payload = { messages: [...messages, { role: "user", content: text }] }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        throw new Error(`Chat API failed: ${res.status}`)
      }
      const data = await res.json()
      if (!aliveRef.current) return
      setMessages((prev) => [...prev, { role: "assistant", content: data.text }])
    } catch (_err) {
      if (!aliveRef.current) return
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }])
    } finally {
      if (!aliveRef.current) return
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="w-full rounded-md border">
      <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`text-sm ${m.role === "user" ? "text-foreground" : "text-muted-foreground"}`}>
            <span className="font-medium">{m.role === "user" ? "You" : "Assistant"}: </span>
            <span>{m.content}</span>
          </div>
        ))}
        {loading && <div className="text-xs text-muted-foreground">Thinking…</div>}
      </div>
      <form onSubmit={sendMessage} className="border-t p-2 flex items-center gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question…"
          className="flex-1 px-3 py-2 text-sm rounded-md border"
          aria-label="Chat message"
        />
        <button type="submit" className="px-3 py-2 text-sm rounded-md border hover:bg-muted" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  )
}
