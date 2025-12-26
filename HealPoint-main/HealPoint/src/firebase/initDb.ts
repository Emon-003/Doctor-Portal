import { collection, addDoc } from 'firebase/firestore';
import { db } from './config';

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
  {
    name: 'Dr. Chloe Evans',
    specialty: 'General physician',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '8 years',
    
  },
  {
    name: 'Dr. John Smith',
    specialty: 'General physician',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '20 years',
   
  },

  // Gynecologists
  {
    name: 'Dr. Sarah Wilson',
    specialty: 'Gynecologist',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '18 years',
    
  },
  {
    name: 'Dr. Maria Garcia',
    specialty: 'Gynecologist',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '10 years',
    
  },
  {
    name: 'Dr. Lisa Chen',
    specialty: 'Gynecologist',
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '14 years',
   
  },

  // Dermatologists
  {
    name: 'Dr. Michael Brown',
    specialty: 'Dermatologist',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '16 years',

  },
  {
    name: 'Dr. David Kim',
    specialty: 'Dermatologist',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '9 years',
   
  },
  {
    name: 'Dr. Rachel Patel',
    specialty: 'Dermatologist',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '11 years',

  },

  // Pediatricians
  {
    name: 'Dr. Emily Taylor',
    specialty: 'Pediatricians',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '13 years',

  },
  {
    name: 'Dr. James Wilson',
    specialty: 'Pediatricians',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '17 years',
    
  },
  {
    name: 'Dr. Sophia Lee',
    specialty: 'Pediatricians',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=facearea&w=400&h=400',
    available: true,
    experience: '7 years',
    
  },

];

export const initializeDoctors = async () => {
  try {
    const doctorsRef = collection(db, 'doctors');
    
    for (const doctor of doctors) {
      await addDoc(doctorsRef, doctor);
    }
    
    console.log('Doctors data initialized successfully!');
  } catch (error) {
    console.error('Error initializing doctors data:', error);
  }
}; 