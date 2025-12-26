import { db } from './config';
import { collection, addDoc } from 'firebase/firestore';

const doctors = [
  // General Physicians
  {
    name: 'Dr. Richard James',
    specialty: 'General physician',
    image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '15 years',
    
  },
  {
    name: 'Dr. Christopher Davis',
    specialty: 'General physician',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '12 years',
     
  },
  // Gynecologists
  {
    name: 'Dr. Sarah Wilson',
    specialty: 'Gynecologist',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '18 years',
     
  },
  // Dermatologists
  {
    name: 'Dr. Michael Brown',
    specialty: 'Dermatologist',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '16 years',
     
  }
];

export const initializeDoctors = async () => {
  try {
    const doctorsRef = collection(db, 'doctors');
    
    // Add each doctor to the collection
    for (const doctor of doctors) {
      await addDoc(doctorsRef, doctor);
    }
    
    console.log('Doctors collection initialized successfully');
  } catch (error) {
    console.error('Error initializing doctors collection:', error);
    throw error;
  }
}; 