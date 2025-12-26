import { db, storage } from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  doc,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Interface for appointment data
interface AppointmentData {
  patientId: string;
  doctorId: string;
  patientEmail: string;
  date: Date;
  time: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  documents?: File[];
}

// Create a new appointment
export const createAppointment = async (appointmentData: AppointmentData) => {
  try {
    // Add appointment to Firestore
    const appointmentRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      date: Timestamp.fromDate(appointmentData.date),
      createdAt: Timestamp.now(),
      documents: [] // Will store document URLs
    });

    // If there are documents to upload
    if (appointmentData.documents && appointmentData.documents.length > 0) {
      const documentUrls = await Promise.all(
        appointmentData.documents.map(async (file) => {
          const storageRef = ref(storage, `appointments/${appointmentRef.id}/${file.name}`);
          await uploadBytes(storageRef, file);
          return await getDownloadURL(storageRef);
        })
      );

      // Update appointment with document URLs
      await updateDoc(doc(db, 'appointments', appointmentRef.id), {
        documents: documentUrls
      });
    }

    return appointmentRef.id;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Get appointments for a patient
export const getPatientAppointments = async (patientId: string) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    throw error;
  }
};

// Get appointments for a doctor
export const getDoctorAppointments = async (doctorId: string) => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    throw error;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (
  appointmentId: string, 
  status: 'scheduled' | 'completed' | 'cancelled'
) => {
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

// Delete appointment and its associated documents
export const deleteAppointment = async (appointmentId: string) => {
  try {
    const appointmentDoc = await getDocs(query(
      collection(db, 'appointments'),
      where('id', '==', appointmentId)
    ));
    
    if (!appointmentDoc.empty) {
      const appointment = appointmentDoc.docs[0].data();
      
      // Delete associated documents from storage
      if (appointment.documents && appointment.documents.length > 0) {
        await Promise.all(
          appointment.documents.map(async (url: string) => {
            const storageRef = ref(storage, url);
            await deleteObject(storageRef);
          })
        );
      }
      
      // Delete appointment document
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: 'cancelled',
        deletedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
}; 