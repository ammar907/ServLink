export type UserRole = 'customer' | 'seller' | 'admin';
export type BookingStatus = 'pending' | 'completed' | 'cancelled';
export type PaymentType = 'COD' | 'Voucher';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  isAdmin?: boolean;
  city: string;
  address?: string;
  bio?: string;
  profilePic?: string;
  createdAt: any;
}

export interface ServiceListing {
  id: string;
  sellerId: string;
  title: string;
  category: string;
  description: string;
  price: number;
  city: string;
  paymentType: PaymentType;
  imageUrl?: string;
  isVerified: boolean;
  createdAt: any;
}

export interface Booking {
  id: string;
  customerId: string;
  sellerId: string;
  serviceId: string;
  date: string;
  time: string;
  status: BookingStatus;
  paymentMethod: string;
  voucherCode?: string;
  createdAt: any;
}

export interface Review {
  id: string;
  serviceId: string;
  customerName: string;
  rating: number;
  comment: string;
  timestamp: any;
}
