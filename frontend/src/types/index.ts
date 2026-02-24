export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'moderator' | 'bartender' | 'admin';
  avatar?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  product_count?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  oldPrice?: number;
  categoryId: number;
  categoryName?: string;
  categorySlug?: string;
  image?: string;
  images?: string[];
  isPopular?: boolean;
  isNew?: boolean;
  rating?: number;
  reviewCount?: number;
  stockQuantity?: number;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  finalAmount: number;
  deliveryFee: number;
  discountAmount: number;
  paymentMethod: 'cash' | 'card' | 'online';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  items?: OrderItem[];
  delivery?: Delivery;
  createdAt: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'delivering' 
  | 'delivered' 
  | 'cancelled';

export interface OrderItem {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

export interface Delivery {
  id: number;
  deliveryTypeName: string;
  address?: string;
  city?: string;
  street?: string;
  building?: string;
  apartment?: string;
  floor?: string;
  entrance?: string;
  intercom?: string;
  deliveryInstructions?: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  title?: string;
  comment?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isApproved: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface DeliveryType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  fee: number;
  freeFromAmount?: number;
  estimatedMinutes?: number;
}
