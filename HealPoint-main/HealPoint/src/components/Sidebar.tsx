import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  selectedSpecialty: string;
  onSpecialtyChange: (specialty: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedSpecialty, onSpecialtyChange }) => {
  const specialties = [
    'All Doctors',
    'All Specialists',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Pediatrician',
    'Psychiatrist',
    'Orthopedist',
    'Gynecologist',
    'Ophthalmologist',
    'Dentist',
    'ENT Specialist',
    'Gastroenterologist'
  ];

  return (
    <div className="sidebar">
      <h3 className="sidebar-title">Specialties</h3>
      <div className="specialty-list">
        {specialties.map((specialty) => (
          <button
            key={specialty}
            className={`specialty-btn ${selectedSpecialty === specialty ? 'active' : ''}`}
            onClick={() => onSpecialtyChange(specialty)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 15px',
              marginBottom: '5px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: selectedSpecialty === specialty ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: selectedSpecialty === specialty ? '500' : 'normal',
              transition: 'all 0.3s ease'
            }}
          >
            {specialty}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar; 