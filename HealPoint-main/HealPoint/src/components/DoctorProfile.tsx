import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import './DoctorProfile.css';
import { TIME_SLOTS, DATES } from '../config/timeSlots';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  available: boolean;
  experience: string;
  appointmentReasons: string[];
  about: string;
}

const DoctorProfile: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(0); // Default to first available date
  const [selectedTime, setSelectedTime] = useState(-1); // Default to no time selected
  const [relatedDoctors, setRelatedDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        if (!doctorId) return;
        const doctorRef = doc(db, 'doctors', doctorId);
        const doctorSnap = await getDoc(doctorRef);
        if (doctorSnap.exists()) {
          setDoctor({ id: doctorSnap.id, ...doctorSnap.data() } as Doctor);
        } else {
          setError('Doctor not found');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch doctor details');
        setLoading(false);
        console.error('Error fetching doctor:', err);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    const fetchRelatedDoctors = async () => {
      if (!doctor || !doctor.specialty) return;
      try {
        const doctorsRef = collection(db, 'doctors');
        const q = query(doctorsRef, where('specialty', '==', doctor.specialty));
        const querySnapshot = await getDocs(q);
        const related = querySnapshot.docs
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Doctor))
          .filter(d => d.id !== doctor.id)
          .slice(0, 3);
        setRelatedDoctors(related);
      } catch (err) {
        // fail silently
      }
    };
    fetchRelatedDoctors();
  }, [doctor]);

  const handleBookAppointment = () => {
    if (doctor) {
      navigate('/appointment', {
        state: {
          doctorName: doctor.name,
          doctorId: doctor.id,
          date: DATES[selectedDate],
          time: TIME_SLOTS[selectedTime].time,
        },
      });
    }
  };

  const handleViewProfile = (id: string) => {
    navigate(`/doctor/${id}`);
  };

  if (loading) {
    return <div className="loading">Loading doctor profile...</div>;
  }
  if (error || !doctor) {
    return <div className="error">{error || 'Doctor not found'}</div>;
  }

  return (
    <div className="doctor-profile-main-container">
      <div className="doctor-profile-card-new">
        <img src={doctor.image} alt={doctor.name} className="profile-image-new" />
        <div className="profile-info-new">
          <div className="profile-title-row">
            <h1 className="profile-name">{doctor.name} <span className="verified-icon" title="Verified">{/* blue check SVG */}<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#2563eb"/><path d="M6 10.5L9 13.5L14 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span></h1>
            <div className="profile-meta">MBBS - {doctor.specialty} <span className="profile-years">• Experience : {doctor.experience}</span></div>
          </div>
          <div className="profile-about-row">
            <div className="profile-about-label">About:</div>
            <div className="profile-about-text">{doctor.about || ` ${doctor.name} has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.`}</div>
          </div>
          <div className="profile-fee">Appointment fee: <span className="fee-amount">500tk</span></div>
        </div>
      </div>

      <div className="booking-section">
        <div className="booking-label">Booking slots</div>
        <div className="booking-dates">
          {DATES.map((d, idx) => (
            <div
              key={d.day + d.date}
              className={`booking-date-pill${selectedDate === idx ? ' selected' : ''}`}
              onClick={() => setSelectedDate(idx)}
            >
              <div className="booking-date-day">{d.day}</div>
              <div className="booking-date-num">{d.date}</div>
            </div>
          ))}
        </div>
        <div className="booking-times">
          {TIME_SLOTS.map((slot, idx) => (
            <div
              key={slot.id}
              className={`booking-time-pill${selectedTime === idx ? ' selected' : ''}`}
              onClick={() => setSelectedTime(idx)}
            >
              {slot.time}
            </div>
          ))}
        </div>
        {selectedTime === -1 && (
          <div className="no-time-slot-message">
            Please <strong>select a time slot</strong> to book your appointment
          </div>
        )}
        <button className="book-appointment-btn-new" onClick={handleBookAppointment} disabled={!doctor.available || selectedTime === -1}>
          Book an appointment
        </button>
      </div>

      <div className="related-doctors-section">
        <h2 className="related-title">Related Doctors</h2>

        <div className="related-doctors-list">
          {relatedDoctors.length === 0 && <div style={{color:'#888',fontSize:'1rem'}}>No related doctors found.</div>}
          {relatedDoctors.map((relDoc) => (
            <div className="related-doctor-card clickable" key={relDoc.id} onClick={() => handleViewProfile(relDoc.id)}>
              <img className="related-doctor-img" src={relDoc.image} alt={relDoc.name} />
              <div className="related-doctor-info">
                <div className={`related-doctor-status ${relDoc.available ? 'available' : 'unavailable'}`}>
                  <span className="status-dot"></span>
                  {relDoc.available ? 'Available' : 'Unavailable'}
                </div>
                <div className="related-doctor-name">{relDoc.name}</div>
                <div className="related-doctor-specialty">{relDoc.specialty}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile; 