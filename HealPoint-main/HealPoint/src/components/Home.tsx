import React, { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import FeaturedDoctors from './FeaturedDoctors';
import SpecialtySection from './SpecialtySection';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Book Appointment With Trusted Doctors</h1>
          <div className="hero-subtext">
            <div className="avatars">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar1" />
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="avatar2" />
              <img src="https://randomuser.me/api/portraits/men/54.jpg" alt="avatar3" />
            </div>
            <p>Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
          </div>
          <button 
            className="book-btn"
            onClick={() => navigate('/doctors')}
          >
            Book appointment <span className='arrowForBook'>→</span>
          </button>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800" alt="Doctors" />
        </div>
      </section>

      <SpecialtySection />
      <FeaturedDoctors />

    </div>
  );
};

export default Home; 