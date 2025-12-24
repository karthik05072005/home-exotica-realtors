export type LeadStatus = "new" | "followup" | "converted" | "closed";
export type LeadSource = "whatsapp" | "phone" | "website" | "instagram" | "manual";
export type PaymentStatus = "paid" | "pending" | "partial";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: Date;
}

export interface Lead {
  id: string;
  customerId?: string;
  customerName: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FollowUp {
  id: string;
  leadId: string;
  customerId?: string;
  customerName: string;
  phone: string;
  scheduledAt: Date;
  notes?: string;
  completed: boolean;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: PaymentStatus;
  dueDate?: Date;
  createdAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}
