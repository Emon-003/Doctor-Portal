import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Appointment.css';
import { auth } from '../firebaseConfig';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { createUserWithEmailAndPassword, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { TIME_SLOTS, TimeSlot } from '../config/timeSlots';

interface LocationState {
  doctorName?: string;
  doctorId?: string;
  date?: { day: string; date: string };
  time?: string;
}

// Helper to get next date string (YYYY-MM-DD) for given day and date
function getNextDateString(day: string, dateNum: string): string {
  const targetDay = day.toUpperCase();
  const targetDate = parseInt(dateNum, 10);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const today = new Date();
  for (let i = 0; i < 14; i++) { // look ahead 2 weeks
    const d = new Date();
    d.setDate(today.getDate() + i);
    if (
      daysOfWeek[d.getDay()] === targetDay &&
      d.getDate() === targetDate
    ) {
      return d.toISOString().split('T')[0];
    }
  }
  return '';
}

const Appointment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctorName, doctorId, date, time } = (location.state as LocationState) || {};

  const { currentUser } = useAuth();

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  
  // Get maximum date (3 months from today)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Auto-fill date and time from location.state if present
  useEffect(() => {
    if (date && date.day && date.date) {
      const realDate = getNextDateString(date.day, date.date);
      setSelectedDate(realDate);
    }
    if (time) {
      const slot = TIME_SLOTS.find(slot => slot.time === time);
      if (slot) setSelectedTimeSlot(slot.id);
    }
  }, [date, time]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    setSelectedTimeSlot(timeSlotId);
    setShowTimeSlots(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTimeSlot && reason && patientName && phone) {
      const selectedTime = TIME_SLOTS.find(slot => slot.id === selectedTimeSlot)?.time;
      try {
        await addDoc(collection(db, 'appointments'), {
          patientName,
          phone,
          doctorName,
          doctorId,
          date: selectedDate,
          time: selectedTime,
          reason,
          status: 'pending',
          createdAt: new Date().toISOString(),
          patientEmail: currentUser?.email || '',
        });
        setConfirmation(
          `Appointment booked for ${patientName} (${phone}) with ${doctorName} for ${selectedDate} at ${selectedTime}. Reason: ${reason}`
        );
        setSelectedDate('');
        setSelectedTimeSlot('');
        setReason('');
        setPatientName('');
        setPhone('');
      } catch (error) {
        alert('Failed to book appointment. Please try again.');
      }
    } else {
      alert('Please enter your name, phone, select date, time slot, and enter a reason.');
    }
  };

  useEffect(() => {
    const appointmentsRef = collection(db, 'appointments');
    const unsubscribe = onSnapshot(appointmentsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
      setLoadingAppointments(false);
    });
    return () => unsubscribe();
  }, []);

  const selectedTime = TIME_SLOTS.find(slot => slot.id === selectedTimeSlot)?.time || '';

  return (
    <div className="appointment-container">
      <div className="appointment-card">
        <h2>Book Your Appointment</h2>
        <div className="doctor-info">
          <h3>{doctorName}</h3>
        </div>
        {confirmation && (
          <div className="confirmation-message" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>
            {confirmation}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="patientName">Patient Name:</label>
            <input
              type="text"
              id="patientName"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              required
              placeholder="Enter your name"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="patientEmail">Email:</label>
            <input
              type="email"
              id="patientEmail"
              value={currentUser?.email || ''}
              disabled
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone:</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              placeholder="Enter your phone number"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Select Date:</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={today}
              max={maxDateStr}
              required
            />
          </div>

          <div className="form-group">
            <label>Selected Time:</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                value={selectedTime}
                readOnly
                style={{ 
                  flex: 1,
                  padding: '0.75rem', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd', 
                  background: '#f3f4f6' 
                }}
              />
              <button
                type="button"
                onClick={() => setShowTimeSlots(!showTimeSlots)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: '1px solid #2563eb',
                  background: '#fff',
                  color: '#2563eb',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {showTimeSlots ? 'Hide Times' : 'Time Slots'}
              </button>
            </div>
            {showTimeSlots && (
              <div className="time-slots-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}>
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={`time-slot-btn ${selectedTimeSlot === slot.id ? 'selected' : ''} ${
                      !slot.available ? 'unavailable' : ''
                    }`}
                    onClick={() => handleTimeSlotSelect(slot.id)}
                    disabled={!slot.available}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      background: selectedTimeSlot === slot.id ? '#2563eb' : '#fff',
                      color: selectedTimeSlot === slot.id ? '#fff' : '#000',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Visit:</label>
            <textarea
              id="reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              placeholder="Please describe your reason for visit"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', minHeight: '100px' }}
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '4px',
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Book Appointment
          </button>
        </form>
      </div>
    </div>
  );
};

export default Appointment; 