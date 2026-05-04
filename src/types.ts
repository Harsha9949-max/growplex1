export interface Package {
  id: string;
  quantity: string;
  price: number;
}

export interface Service {
  id: string;
  name: string;
  category: "Instagram Followers" | "Instagram Likes" | "Instagram Comments" | "Instagram Reel Views" | "Instagram Story Views" | string;
  packages: Package[];
  deliveryTime: string;
  description?: string;
  isActive?: boolean;
  displayRate?: number;
}

export interface Order {
  id: string;
  customerName?: string;
  phone?: string;
  serviceName: string;
  quantity: number | string;
  price?: number;
  chargeINR?: number;
  chargeUSD?: number;
  paymentStatus?: "paid" | "failed" | string;
  orderStatus?: "new" | "processing" | "completed" | string;
  status?: string;
  growwOrderId?: string;
  userId?: string;
  serviceId?: string;
  link?: string;
  startCount?: number | string;
  remains?: number | string;
  [key: string]: any;
}

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  balance?: number;
  role?: string;
  [key: string]: any;
}

export interface Transaction {
  id?: string;
  userId?: string;
  amount?: number;
  type?: 'credit' | 'debit' | string;
  status?: 'success' | 'pending' | 'failed' | string;
  createdAt?: any;
  description?: string;
  [key: string]: any;
}

export interface Submission {
  id?: string;
  taskId?: string;
  userId?: string;
  status?: 'pending' | 'approved' | 'rejected' | string;
  proofUrl?: string;
  createdAt?: any;
  [key: string]: any;
}

export interface Task {
  id?: string;
  title?: string;
  description?: string;
  reward?: number;
  status?: string;
  createdAt?: any;
  [key: string]: any;
}

export interface AppNotification {
  id?: string;
  userId?: string;
  title?: string;
  message?: string;
  read?: boolean;
  createdAt?: any;
  [key: string]: any;
}
