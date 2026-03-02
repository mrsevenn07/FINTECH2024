
export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'OWNER';
export type AccountType = 'PERSONAL' | 'BUSINESS';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE';
export type PaymentProvider = 'M-PESA' | 'E-MOLA' | 'CASH' | 'BANK_TRANSFER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  active: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  type: AccountType;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  accountType: AccountType | 'BOTH';
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  status: TransactionStatus;
  categoryId: string;
  tenantId: string;
  accountType: AccountType; // Crítico para separação de dados
  notes?: string;
  paymentMethod?: PaymentProvider;
  mobileNumber?: string;
  providerRef?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
}

export interface Client {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LEAD';
  totalRevenue: number;
  lastInteraction: string;
  joinDate?: string;
  tags: string[];
}
