
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
  subscriptionExpiresAt?: string;
  createdAt: string; 
  gatewayUrl?: string;
  gatewayApiKey?: string;
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
  autoSend?: boolean;
  createdAt?: string;
  notes?: string;
  reminderDaysBefore?: number;
}

export interface MessageLog {
  id: string;
  clientId: string;
  clientName: string;
  type: 'LEMBRETE' | 'COBRANÇA' | 'ATRASO' | 'AUTO_LEMBRETE';
  sentAt: string;
  status: 'SENT' | 'FAILED';
  details?: string;
}

export type View = 'LANDING' | 'DASHBOARD' | 'CLIENTS' | 'SETTINGS' | 'BILLING' | 'AUTH' | 'INVOICES';
