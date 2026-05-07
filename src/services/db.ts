import { auth, db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ServiceListing, Booking, UserProfile, Review } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  // Extract a clean error message to avoid circular dependency issues when stringifying
  let errorMessage = 'An unknown error occurred';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    try {
      errorMessage = String(error);
    } catch {
      errorMessage = 'Generic Firestore Error';
    }
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };

  const serializedError = JSON.stringify(errInfo);
  console.error('Firestore Error: ', serializedError);
  throw new Error(serializedError);
}

export const dbService = {
  // Users
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as UserProfile : null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
      return null;
    }
  },

  async createUserProfile(profile: Partial<UserProfile>): Promise<void> {
    if (!profile.uid) throw new Error("UID required");
    const path = `users/${profile.uid}`;
    try {
      await setDoc(doc(db, 'users', profile.uid), {
        ...profile,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  // Services
  async getServices(city?: string, category?: string): Promise<ServiceListing[]> {
    const path = 'services';
    try {
      let q = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
      if (city) q = query(q, where('city', '==', city));
      if (category) q = query(q, where('category', '==', category));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceListing));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async getServiceById(id: string): Promise<ServiceListing | null> {
    const path = `services/${id}`;
    try {
      const docSnap = await getDoc(doc(db, 'services', id));
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as ServiceListing : null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
      return null;
    }
  },

  async createService(service: Omit<ServiceListing, 'id' | 'createdAt' | 'isVerified'>): Promise<string> {
    const path = 'services';
    try {
      const docRef = await addDoc(collection(db, 'services'), {
        ...service,
        isVerified: false,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
      return '';
    }
  },

  async updateService(id: string, data: Partial<ServiceListing>): Promise<void> {
    const path = `services/${id}`;
    try {
      await updateDoc(doc(db, 'services', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteService(id: string): Promise<void> {
    const path = `services/${id}`;
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // Bookings
  async createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const path = 'bookings';
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...booking,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
      return '';
    }
  },

  async getBookings(userId: string, role: 'customer' | 'seller'): Promise<Booking[]> {
    const path = 'bookings';
    try {
      const field = role === 'customer' ? 'customerId' : 'sellerId';
      const q = query(collection(db, 'bookings'), where(field, '==', userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async updateBookingStatus(id: string, status: string): Promise<void> {
    const path = `bookings/${id}`;
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  // Reviews
  async getReviews(serviceId: string): Promise<Review[]> {
    const path = `reviews`;
    try {
      const q = query(collection(db, 'reviews'), where('serviceId', '==', serviceId), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async addReview(review: Omit<Review, 'id' | 'timestamp'>): Promise<void> {
    const path = 'reviews';
    try {
      await addDoc(collection(db, 'reviews'), {
        ...review,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  // Admin Methods
  async getAllUsers(): Promise<UserProfile[]> {
    const path = 'users';
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async getAllBookings(): Promise<Booking[]> {
    const path = 'bookings';
    try {
      const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async deleteUser(uid: string): Promise<void> {
    const path = `users/${uid}`;
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  }
};

// Expose to window for admin troubleshooting
if (typeof window !== 'undefined') {
  (window as any).dbService = dbService;
}

export { OperationType, handleFirestoreError };
