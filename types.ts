
export enum PaymentStatus {
  PAID = 'PAGO',
  PENDING = 'PENDENTE',
  OVERDUE = 'ATRASADO'
}

export enum PlanType {
  STARTER = 'STARTER',
  PRO = 'PRO',
  ADVANCED = 'ADVANCED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  pixKey: string;
  paymentLink?: string;
  messageTemplate: string;
  plan: PlanType;
  subscriptionActive: boolean;
  subscriptionExpiresAt?: string; // Data de expiração da assinatura paga ou do trial
  createdAt: string; 
  // Novos campos para automação
  gatewayUrl?: string; // URL da API (ex: Evolution API / Z-API)
  gatewayApiKey?: string; // Token da API
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  whatsapp: string;
  monthlyValue: number;
  dueDay: number;
  status: PaymentStatus;
  lastPaymentDate?: string;
  customMessage?: string;
  autoSend?: boolean; // Novo campo: Enviar automaticamente?
  createdAt?: string;
}

export interface MessageLog {
  id: string;
  clientId: string;
  clientName: string;
  type: 'LEMBRETE' | 'COBRANÇA' | 'ATRASO' | 'AUTO_LEMBRETE';
  sentAt: string;
  status: 'SENT' | 'FAILED';
}

export type View = 'DASHBOARD' | 'CLIENTS' | 'SETTINGS' | 'BILLING' | 'AUTH';
