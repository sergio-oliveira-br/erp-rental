// frontend/src/types/index.ts

// ==========================================
// TIPOS GENÉRICOS E PAGINAÇÃO
// ==========================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ==========================================
// MÓDULO DE CLIENTES (client_context)
// ==========================================

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string; // CPF ou CNPJ
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientCreatePayload {
  name: string;
  email: string;
  phone: string;
  document: string;
  address?: string;
}

export interface ClientUpdatePayload extends Partial<ClientCreatePayload> {
  is_active?: boolean;
}

// ==========================================
// MÓDULO DE MATERIAIS (material_context)
// ==========================================

export const MaterialStatus = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type MaterialStatus = (typeof MaterialStatus)[keyof typeof MaterialStatus];

export interface Material {
  id: string;
  name: string;
  description?: string;
  category: string;
  daily_rate: number;
  status: MaterialStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialCreatePayload {
  name: string;
  description?: string;
  category: string;
  daily_rate: number;
}

export interface MaterialUpdatePayload extends Partial<MaterialCreatePayload> {
  status?: MaterialStatus;
  is_active?: boolean;
}

// ==========================================
// MÓDULO DE ALUGUÉIS (rental_context)
// ==========================================

export const RentalStatus = {
  ACTIVE:  'ACTIVE',
  RETURNED: 'RETURNED',
  OVERDUE:  'OVERDUE',
  CANCELLED:  'CANCELLED',
} as const;

export type RentalStatus = (typeof RentalStatus)[keyof typeof RentalStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface Rental {
  id: string;
  client_id: string;
  client_name?: string;
  material_id: string;
  material_name?: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_value: number;
  rental_status: RentalStatus;
  payment_status: PaymentStatus;
  enable_sms_notification: boolean;
  created_at: string;
  updated_at: string;
}

export interface RentalCreatePayload {
  client_id: string;
  material_id: string;
  start_date: string;
  end_date: string;
  enable_sms_notification: boolean;
}

export interface PaymentRegisterPayload {
  payment_amount: number;
  payment_method: string;
  notes?: string;
}

// ==========================================
// MÓDULO DE DASHBOARD E MÉTRICAS
// ==========================================

export interface RevenueMetrics {
  total_revenue: number;
  pending_revenue: number;
  active_rentals_count: number;
  occupancy_rate: number;
}

export interface CashFlowChartPoint {
  month: string;
  expected: number;
  realized: number;
}

export interface MaterialDemandMetric {
  material_name: string;
  total_rentals: number;
  revenue_generated: number;
}

export interface ClientFinancialSummary {
  client_id: string;
  client_name: string;
  total_spent: number;
  active_contracts: number;
  pending_balance: number;
}