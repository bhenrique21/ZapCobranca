
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
  createdAt?: string; // Mapeado do created_at do Supabase
}

export interface MessageLog {
  id: string;
  clientId: string;
  clientName: string;
  type: 'LEMBRETE' | 'COBRANÇA' | 'ATRASO';
  sentAt: string;
  status: 'SENT' | 'FAILED';
}

export type View = 'DASHBOARD' | 'CLIENTS' | 'SETTINGS' | 'BILLING' | 'AUTH';
