"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, Send, RotateCcw } from "lucide-react"
import type { AgentConfig, Message } from "../types/agent"

const HANDLE_MESSAGE = "https://n8-chatbot.onrender.com/handle_message"

const AVATAR_OPTIONS = [
  { id: 1, emoji: "🤖", name: "Stupid", color: "from-blue-400 to-blue-600" },
  { id: 2, emoji: "🧠", name: "Sarcastic", color: "from-purple-400 to-purple-600" },
]

export function AgentApp() {
  const [step, setStep] = useState<"name" | "avatar" | "chat">("name")
  const [name, setName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => { scrollToBottom() }, [messages])

  const handleCompleteSetup = () => {
    const agentConfig: AgentConfig = {
      name: name || "Default",
      avatar: selectedAvatar,
    }

    setMessages([
      {
        id: "1",
        role: "agent",
        content: `Hey there! I'm ${agentConfig.name}, and I'm here to help! Feel free to ask me anything. ${agentConfig.avatar.emoji}`,
        timestamp: new Date(),
      },
    ])
    setStep("chat")
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch(HANDLE_MESSAGE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pers: selectedAvatar.name.toLowerCase(), message: userMessage.content }),
      })
      const data = await response.json()
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: data.return_message || "No response from server",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, agentMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "agent", content: "Oops, something went wrong connecting to the server.", timestamp: new Date() },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const getAvatarGradient = (avatarId: number) => {
    const avatars: { [key: number]: string } = {
      1: "from-blue-400 to-blue-600",
      2: "from-purple-400 to-purple-600",
    }
    return avatars[avatarId] || "from-blue-400 to-blue-600"
  }

  const handleReset = () => {
    setStep("name")
    setName("")
    setSelectedAvatar(AVATAR_OPTIONS[0])
    setMessages([])
    setInput("")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">

      <div className="relative flex items-center justify-center gap-8 p-8 md:p-12 border border-r-0 border-l-0 shadow-[0_0_60px_rgba(188,19,254,0.3)] bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden mb-8">
        <div className="absolute w-full h-[1px] bg-cyan-400 opacity-50 animate-[scan_3s_linear_infinite]"></div>

        <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0 animate-bounce-slow">
          <div className="absolute w-full h-full border-4 border-purple-600 rounded-xl shadow-purple shadow-[0_0_20px_rgba(188,19,254,0.5)] animate-[pulse-border_2s_infinite_alternate]"></div>
          <div className="absolute w-[85%] h-[85%] border-2 border-cyan-400 rounded-lg animate-spin-slow"></div>
          <div className="text-cyan-400 text-5xl font-extrabold z-10 drop-shadow-lg">&gt;_</div>
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="font-orbitron text-5xl md:text-7xl font-extrabold uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-400 drop-shadow-[0_0_15px_rgba(0,243,255,0.8)] animate-text-glow">
            PS CODERS
          </h1>
          <div className="font-jetbrains-mono text-sm md:text-base text-purple-500 font-bold mt-2 flex flex-wrap gap-2 animate-text-flicker">
            Nuit d'info <span className="mx-1 text-cyan-400">|</span>
            Nird challenge <span className="mx-1 text-cyan-400">|</span>
            Chamilo <span className="mx-1 text-cyan-400">|</span>
            Horizon School
          </div>
        </div>
      </div>

      {step === "chat" ? (
        <div className="flex flex-col flex-1 h-[calc(100vh-300px)] bg-gray-900">
          <div className="flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur border-b border-purple-200/20">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-linear-to-br ${getAvatarGradient(selectedAvatar.id)} flex items-center justify-center text-2xl shadow-lg`}>
                {selectedAvatar.emoji}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{name}</h1>
                <p className="text-sm text-gray-300">Ready to chat</p>
              </div>
            </div>
            <button onClick={handleReset} className="border-2 border-purple-500 text-gray-100 hover:bg-purple-700/30 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${message.role === "user" ? "bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-br-none" : "bg-white text-gray-900 shadow-md border border-purple-200/20 rounded-bl-none"}`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.role === "user" ? "text-purple-100" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 shadow-md border border-purple-200/20 rounded-lg rounded-bl-none px-4 py-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white/10 backdrop-blur border-t border-purple-200/20 px-6 py-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
                className="flex-1 border-2 border-purple-200 focus:border-purple-500 rounded-lg py-3 px-4 focus:outline-none disabled:opacity-60 bg-gray-900 text-white"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-60 flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-150px)] px-4">
          <div className="w-full max-w-2xl">
            {step === "name" && (
              <div className="p-8 bg-white/10 backdrop-blur border-2 border-purple-500 rounded-lg">
                <div className="text-center mb-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                  <h2 className="text-3xl font-bold mb-2">Give Your Agent a Name</h2>
                  <p className="text-gray-300">What would you like to call your AI companion?</p>
                </div>
                <input
                  type="text"
                  placeholder="e.g., Alex, Nova, Sage..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mb-6 px-4 py-3 text-lg border-2 border-purple-500 rounded-lg focus:border-purple-600 focus:outline-none bg-gray-900 text-white"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep("avatar")}
                />
                <button
                  onClick={() => name.trim() && setStep("avatar")}
                  className="w-full py-6 text-lg font-semibold rounded-lg bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all"
                >
                  Continue to Avatar
                </button>
              </div>
            )}

            {step === "avatar" && (
              <div className="p-8 bg-white/10 backdrop-blur border-2 border-purple-500 rounded-lg">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Choose an Avatar for {name}</h2>
                  <p className="text-gray-300">Pick the personality that matches your agent</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 sm:grid-cols-2">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`p-4 rounded-lg transition-all transform hover:scale-105 ${selectedAvatar.id === avatar.id ? `bg-gradient-to-br ${avatar.color} shadow-lg scale-105` : "bg-gray-800 hover:bg-gray-700"}`}
                    >
                      <div className="text-4xl mb-2">{avatar.emoji}</div>
                      <p className={`text-sm font-medium ${selectedAvatar.id === avatar.id ? "text-white" : "text-gray-200"}`}>{avatar.name}</p>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep("name")} className="flex-1 border-2 border-purple-500 text-gray-200 py-6 text-lg font-semibold bg-transparent rounded-lg hover:bg-gray-700 transition-all">
                    Back
                  </button>
                  <button onClick={handleCompleteSetup} className="flex-1 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg font-semibold rounded-lg transition-all">
                    Start Chatting
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
