import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import ManageAppointments from './ManageAppointments';
import './AdminPanel.css';

const SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Endocrinologist',
  'Gastroenterologist',
  'Neurologist',
  'Obstetrician/Gynecologist',
  'Ophthalmologist',
  'Orthopedist',
  'Pediatrician',
  'Psychiatrist',
  'Pulmonologist',
  'Rheumatologist',
  'Urologist',
  'ENT Specialist',
  'Dentist',
  'Surgeon',
  'Anesthesiologist',
  'Radiologist',
  'Pathologist'
];

interface Doctor {
  id?: string;
  name: string;
  specialty: string;
  image: string;
  available: boolean;
  experience: string;
  appointmentReasons: string[];
  featured: boolean;
  about: string;
}

interface Appointment {
  id?: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  reason: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  phone?: string;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'doctors' | 'appointments'>('doctors');
  const [newDoctor, setNewDoctor] = useState<Doctor>({
    name: '',
    specialty: '',
    image: '',
    available: true,
    experience: '',
    appointmentReasons: [],
    featured: false,
    about: ''
  });
  const [newReason, setNewReason] = useState('');
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [actionDone, setActionDone] = useState<{id: string, action: string} | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const doctorsRef = collection(db, 'doctors');
      const querySnapshot = await getDocs(doctorsRef);
      const doctorsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
      setDoctors(doctorsList);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch doctors');
      setLoading(false);
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const appointmentsRef = collection(db, 'appointments');
      const snapshot = await getDocs(appointmentsRef);
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Appointment[];
      
      // Sort appointments by date and time only
      const sortedData = data.sort((a, b) => {
        // Sort by date
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // Handle invalid dates
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          return 0;
        }
        
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        
        // If dates are the same, sort by time
        try {
          const timeA = a.time.split(':').map(Number);
          const timeB = b.time.split(':').map(Number);
          
          // Validate time format
          if (timeA.length !== 2 || timeB.length !== 2) {
            return 0;
          }
          
          // Convert time to minutes for easier comparison
          const minutesA = timeA[0] * 60 + timeA[1];
          const minutesB = timeB[0] * 60 + timeB[1];
          
          return minutesA - minutesB;
        } catch (error) {
          console.error('Error parsing time:', error);
          return 0;
        }
      });
      
      setAppointments(sortedData);
    } catch (err) {
      setError('Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    }
    setLoadingAppointments(false);
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const doctorsRef = collection(db, 'doctors');
      await addDoc(doctorsRef, {
        ...newDoctor,
        appointmentReasons: newDoctor.appointmentReasons || []
      });
      setNewDoctor({
        name: '',
        specialty: '',
        image: '',
        available: true,
        experience: '',
        appointmentReasons: [],
        featured: false,
        about: ''
      });
      setNewReason('');
      fetchDoctors();
    } catch (err) {
      setError('Failed to add doctor');
      console.error('Error adding doctor:', err);
    }
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await deleteDoc(doc(db, 'doctors', doctorId));
        fetchDoctors();
      } catch (err) {
        setError('Failed to delete doctor');
        console.error('Error deleting doctor:', err);
      }
    }
  };

  const handleToggleAvailability = async (doctorId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'doctors', doctorId), {
        available: !currentStatus
      });
      fetchDoctors();
    } catch (err) {
      setError('Failed to update doctor availability');
      console.error('Error updating doctor:', err);
    }
  };

  const handleToggleFeatured = async (doctorId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'doctors', doctorId), {
        featured: !currentStatus
      });
      fetchDoctors();
    } catch (err) {
      setError('Failed to update doctor featured status');
      console.error('Error updating doctor:', err);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: newStatus
      });
      setActionDone({ id: appointmentId, action: newStatus });
      setTimeout(() => setActionDone(null), 2000);
      fetchAppointments();
    } catch (err) {
      alert('Failed to update appointment status.');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin-login');
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setNewDoctor({
      name: doctor.name,
      specialty: doctor.specialty,
      image: doctor.image,
      available: doctor.available,
      experience: doctor.experience,
      appointmentReasons: doctor.appointmentReasons,
      featured: doctor.featured,
      about: doctor.about || ''
    });
    setNewReason('');
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor?.id) return;

    try {
      await updateDoc(doc(db, 'doctors', editingDoctor.id), {
        ...newDoctor,
        appointmentReasons: newDoctor.appointmentReasons || []
      });
      setEditingDoctor(null);
      setNewDoctor({
        name: '',
        specialty: '',
        image: '',
        available: true,
        experience: '',
        appointmentReasons: [],
        featured: false,
        about: ''
      });
      setNewReason('');
      fetchDoctors();
    } catch (err) {
      setError('Failed to update doctor');
      console.error('Error updating doctor:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button className="signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          Manage Doctors
        </button>
        <button 
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Manage Appointments
        </button>
      </div>

      {activeTab === 'doctors' ? (
        <>
          <section className="add-doctor-section">
            <h2>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
            <form onSubmit={editingDoctor ? handleUpdateDoctor : handleAddDoctor} className="add-doctor-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Dr. John Doe"
                />
              </div>

              <div className="form-group">
                <label>Specialty:</label>
                <select
                  value={newDoctor.specialty}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, specialty: e.target.value }))}
                  required
                  className="specialty-select"
                >
                  <option value="">Select a specialty</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Endocrinologist">Endocrinologist</option>
                  <option value="Gastroenterologist">Gastroenterologist</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Obstetrician">Obstetrician</option>
                  <option value="Gynecologist">Gynecologist</option>
                  {/* <option value="Ophthalmologist">Ophthalmologist</option>
                  <option value="Orthopedist">Orthopedist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Psychiatrist">Psychiatrist</option>
                  <option value="Pulmonologist">Pulmonologist</option>
                  <option value="Rheumatologist">Rheumatologist</option>
                  <option value="Urologist">Urologist</option>
                  <option value="ENT Specialist">ENT Specialist</option>
                  <option value="Dentist">Dentist</option>
                  <option value="Surgeon">Surgeon</option>
                  <option value="Anesthesiologist">Anesthesiologist</option>
                  <option value="Radiologist">Radiologist</option>
                  <option value="Pathologist">Pathologist</option> */}
                </select>
              </div>

              <div className="form-group">
                <label>Image URL:</label>
                <input
                  type="url"
                  value={newDoctor.image}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, image: e.target.value }))}
                  required
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label>Experience:</label>
                <input
                  type="text"
                  value={newDoctor.experience}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, experience: e.target.value }))}
                  required
                  placeholder="15 years"
                />
              </div>

              <div className="form-group">
                <label>About:</label>
                <textarea
                  value={newDoctor.about}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, about: e.target.value }))}
                  placeholder="Enter doctor's about information, qualifications, and achievements..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Appointment Reasons (comma-separated):</label>
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="General Checkup, Follow-up, Consultation"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newReason.trim()) {
                      setNewDoctor(prev => ({
                        ...prev,
                        appointmentReasons: [...prev.appointmentReasons, newReason.trim()]
                      }));
                      setNewReason('');
                    }
                  }}
                >
                  Add Reason
                </button>
                <div className="reasons-list">
                  {newDoctor.appointmentReasons.map((reason, index) => (
                    <div key={index} className="reason-tag">
                      {reason}
                      <button
                        type="button"
                        onClick={() => {
                          setNewDoctor(prev => ({
                            ...prev,
                            appointmentReasons: prev.appointmentReasons.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="submit-btn">
                {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
              </button>
              {editingDoctor && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditingDoctor(null);
                    setNewDoctor({
                      name: '',
                      specialty: '',
                      image: '',
                      available: true,
                      experience: '',
                      appointmentReasons: [],
                      featured: false,
                      about: ''
                    });
                    setNewReason('');
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </section>

          <section className="doctors-list-section">
            <h2>Current Doctors</h2>
            <div className="doctors-grid">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="current-doctor-card">
                  <img src={doctor.image} alt={doctor.name} />
                  <h3>{doctor.name}</h3>
                  <p>Specialty: {doctor.specialty}</p>
                  <p>Experience: {doctor.experience}</p>
                  {doctor.about && <p className="doctor-about">{doctor.about}</p>}
                  <div className="doctor-actions">
                    <button
                      className={`availability-btn ${doctor.available ? 'available' : 'unavailable'}`}
                      onClick={() => handleToggleAvailability(doctor.id!, doctor.available)}
                    >
                      {doctor.available ? 'Available' : 'Unavailable'}
                    </button>
                    <button
                      className={`featured-btn ${doctor.featured ? 'featured' : 'not-featured'}`}
                      onClick={() => handleToggleFeatured(doctor.id!, doctor.featured)}
                    >
                      {doctor.featured ? 'Featured' : 'Not Featured'}
                    </button>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditDoctor(doctor)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteDoctor(doctor.id!)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <ManageAppointments />
      )}
    </div>
  );
};

export default AdminPanel; 