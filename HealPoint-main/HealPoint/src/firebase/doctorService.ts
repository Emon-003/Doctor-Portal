import { db } from './config';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  orderBy 
} from 'firebase/firestore';

// Interface for doctor data
interface Doctor {
  id?: string;
  name: string;
  specialty: string;
  image: string;
  available: boolean;
  experience: string;
  appointmentReasons: string[];
}

// Get all doctors
export const getAllDoctors = async (): Promise<Doctor[]> => {
  try {
    const doctorsRef = collection(db, 'doctors');
    const querySnapshot = await getDocs(doctorsRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Doctor[];
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw new Error('Failed to fetch doctors. Please try again later.');
  }
};

// Get doctors by specialty
export const getDoctorsBySpecialty = async (specialty: string): Promise<Doctor[]> => {
  try {
    const doctorsRef = collection(db, 'doctors');
    const q = query(
      doctorsRef,
      where('specialty', '==', specialty),
      where('available', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Doctor[];
  } catch (error) {
    console.error(`Error fetching ${specialty} doctors:`, error);
    throw new Error(`Failed to fetch ${specialty} doctors. Please try again later.`);
  }
};

// Get a single doctor by ID
export const getDoctorById = async (doctorId: string): Promise<Doctor | null> => {
  try {
    const doctorRef = doc(db, 'doctors', doctorId);
    const doctorSnap = await getDoc(doctorRef);
    
    if (doctorSnap.exists()) {
      return {
        id: doctorSnap.id,
        ...doctorSnap.data()
      } as Doctor;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching doctor:', error);
    throw new Error('Failed to fetch doctor details. Please try again later.');
  }
};

// Get available doctors
export const getAvailableDoctors = async (): Promise<Doctor[]> => {
  try {
    const doctorsRef = collection(db, 'doctors');
    const q = query(
      doctorsRef,
      where('available', '==', true),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Doctor[];
  } catch (error) {
    console.error('Error fetching available doctors:', error);
    throw new Error('Failed to fetch available doctors. Please try again later.');
  }
}; 