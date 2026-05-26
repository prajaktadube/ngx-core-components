export interface AgentStep {
  id: string;
  name: string;
  status: 'running' | 'success' | 'error';
  duration?: string;
  input?: string;
  output?: string;
  collapsed?: boolean;
}

export interface AICardAction {
  label: string;
  value: string;
  variant?: 'primary' | 'secondary';
}

export interface AICard {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  description?: string;
  actions?: AICardAction[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  senderName?: string;
  avatarUrl?: string;
  steps?: AgentStep[];
  cards?: AICard[];
}

export interface QuickReply {
  label: string;
  value: string;
  icon?: string;
}
