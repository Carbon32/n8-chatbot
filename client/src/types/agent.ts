export interface Avatar {
  id: number
  emoji: string
  name: string
  color: string
}

export interface Sound {
  id: number
  name: string
  url: string
  icon: string
}

export interface AgentConfig {
  name: string
  avatar: Avatar
}

export interface Message {
  id: string
  role: "user" | "agent"
  content: string
  timestamp: Date
}
