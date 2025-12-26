import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AppointmentSuccess.css';

const AppointmentSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Appointment Booked Successfully!</h1>
        <p>
          Your appointment request has been submitted. You will receive a confirmation email
          once the doctor confirms your appointment.
        </p>
        <div className="success-actions">
          <button onClick={() => navigate('/')} className="home-btn">
            Return to Home
          </button>
          <button onClick={() => navigate('/all-doctors')} className="doctors-btn">
            View All Doctors
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSuccess; 