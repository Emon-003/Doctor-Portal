import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import './MyBookAppointments.css';

interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: Timestamp;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  reason: string;
}

type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

interface EditFormData {
  doctorName: string;
  doctorSpecialty: string;
  reason: string;
  time: string;
  date: string;
}

const MyBookAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    doctorName: '',
    doctorSpecialty: '',
    reason: '',
    time: '',
    date: ''
  });
  const [doctors, setDoctors] = useState<{ id: string; name: string; specialty: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsRef = collection(db, 'doctors');
        const querySnapshot = await getDocs(doctorsRef);
        const doctorsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          specialty: doc.data().specialty
        }));
        setDoctors(doctorsList);
      } catch (err: any) {
        setError('Failed to fetch doctors: ' + err.message);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login', { state: { from: '/my-appointments' } });
          return;
        }

        const appointmentsRef = collection(db, 'appointments');
        const q = query(appointmentsRef, where('patientEmail', '==', user.email));
        const querySnapshot = await getDocs(q);

        const appointmentsList: Appointment[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const appointmentData = {
            id: doc.id,
            ...data,
            date: data.date instanceof Timestamp ? data.date : Timestamp.fromDate(new Date(data.date))
          } as Appointment;
          appointmentsList.push(appointmentData);
        });

        appointmentsList.sort((a, b) => a.date.toMillis() - b.date.toMillis());
        setAppointments(appointmentsList);
      } catch (err: any) {
        setError('Failed to fetch appointments: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  const formatDate = (timestamp: Timestamp) => {
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setEditForm({
      doctorName: appointment.doctorName,
      doctorSpecialty: appointment.doctorSpecialty,
      reason: appointment.reason,
      time: appointment.time,
      date: appointment.date.toDate().toISOString().split('T')[0]
    });
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDoctor = doctors.find(doc => doc.name === e.target.value);
    setEditForm({
      ...editForm,
      doctorName: e.target.value,
      doctorSpecialty: selectedDoctor?.specialty || ''
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;

    try {
      const appointmentRef = doc(db, 'appointments', editingAppointment.id);
      await updateDoc(appointmentRef, {
        doctorName: editForm.doctorName,
        doctorSpecialty: editForm.doctorSpecialty,
        reason: editForm.reason,
        time: editForm.time,
        date: Timestamp.fromDate(new Date(editForm.date))
      });

      // Update local state
      setAppointments(appointments.map(apt => 
        apt.id === editingAppointment.id 
          ? { 
              ...apt, 
              doctorName: editForm.doctorName,
              doctorSpecialty: editForm.doctorSpecialty,
              reason: editForm.reason,
              time: editForm.time,
              date: Timestamp.fromDate(new Date(editForm.date))
            }
          : apt
      ));

      setEditingAppointment(null);
      setEditForm({ doctorName: '', doctorSpecialty: '', reason: '', time: '', date: '' });
    } catch (err: any) {
      setError('Failed to update appointment: ' + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingAppointment(null);
    setEditForm({ doctorName: '', doctorSpecialty: '', reason: '', time: '', date: '' });
  };

  if (loading) {
    return (
      <div className="appointments-container">
        <div className="loading-spinner">Loading appointments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointments-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="appointments-container">
      <div className="appointments-card">
        <h1>My Appointments</h1>
        
        {appointments.length === 0 ? (
          <div className="no-appointments">
            <p>You don't have any appointments yet.</p>
            <button 
              className="book-appointment-btn"
              onClick={() => navigate('/all-doctors')}
            >
              Book an Appointment
            </button>
          </div>
        ) : (
          <div className="appointments-table-container">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td title={appointment.doctorName}>{appointment.doctorName}</td>
                    <td title={appointment.doctorSpecialty}>{appointment.doctorSpecialty}</td>
                    <td title={formatDate(appointment.date)}>{formatDate(appointment.date)}</td>
                    <td title={appointment.time}>{appointment.time}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td title={appointment.reason}>{appointment.reason}</td>
                    <td>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(appointment)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editingAppointment && (
          <div className="edit-modal">
            <div className="edit-modal-content">
              <h2>Edit Appointment</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label>Doctor:</label>
                  <select
                    value={editForm.doctorName}
                    onChange={handleDoctorChange}
                    required
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.name}>
                        {doctor.name} - {doctor.specialty}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Reason:</label>
                  <textarea
                    value={editForm.reason}
                    onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time:</label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookAppointments; 