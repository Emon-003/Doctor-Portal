import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import './ManageAppointments.css';

interface Appointment {
  id: string;
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  reason: string;
  createdAt: string;
}

const ManageAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const appointmentsRef = collection(db, 'appointments');
      const q = query(appointmentsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const appointmentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(appointmentsList);
    } catch (err) {
      setError('Unable to load appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#00c853';
      case 'pending': return '#ffb400';
      case 'cancelled': return '#ff3d00';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        setDeletingId(appointmentId);
        await deleteDoc(doc(db, 'appointments', appointmentId));
        setAppointments(appointments.filter(apt => apt.id !== appointmentId));
      } catch (err) {
        setError('Failed to delete appointment. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), {
        status: newStatus
      });
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      ));
    } catch (err) {
      setError('Failed to update appointment status. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading appointments...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="appointments-section">
      {appointments.length === 0 ? (
        <div className="no-appointments">
          <p>No appointments found.</p>
        </div>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className='heading'><h3>{appointment.doctorName}</h3>
              <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(appointment.status) }}
                  >
                    {appointment.status === 'pending' && '⏳ Pending'}
                    {appointment.status === 'confirmed' && '✅ Confirmed'}
                    {appointment.status === 'cancelled' && '❌ Cancelled'}
                    
                  </span>
                  <button
                      className="delete-button"
                      onClick={() => handleDelete(appointment.id)}
                      disabled={deletingId === appointment.id}
                    >
                      {deletingId === appointment.id ? 'Deleting...' : '🗑️ Delete'}
                    </button>
              
              </div>
              <div className="appointment-header">
                <div className="header-actions">

                  <div className="action-buttons">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          className="confirm-button"
                          onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                        >
                          ✓ Confirm
                        </button>
                        <button
                          className="cancel-button"
                          onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                        >
                          ✕ Cancel
                        </button>
                      </>
                    )}

                  </div>
                </div>
              </div>
              <div className="status-message">
                {appointment.status === 'pending' && 'Waiting for admin approval'}
                {appointment.status === 'confirmed' && 'Appointment is confirmed!'}
                {appointment.status === 'cancelled' && 'This appointment was cancelled.'}
              </div>
              <div className="appointment-details">
                <div className="detail-item">
                  <span className="label">Patient:</span>
                  <span className="value">{appointment.patientName}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Date:</span>
                  <span className="value">{formatDate(appointment.date)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Time:</span>
                  <span className="value">{appointment.time}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Reason:</span>
                  <span className="value">{appointment.reason}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Booked on:</span>
                  <span className="value">{formatDate(appointment.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageAppointments; 