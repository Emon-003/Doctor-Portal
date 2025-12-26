import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import './DoctorList.css';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  available: boolean;
  experience: string;
}

const DoctorList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsRef = collection(db, 'doctors');
        const querySnapshot = await getDocs(doctorsRef);
        const doctorsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Doctor[];
        const available = doctorsList.filter(doc => doc.available);
        setDoctors(available);
        setFilteredDoctors(available);
        
        // Extract unique specialties
        const uniqueSpecialties = Array.from(new Set(available.map(doc => doc.specialty)));
        setSpecialties(uniqueSpecialties);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to fetch doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedSpecialty === '') {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(doctor => 
        doctor.specialty === selectedSpecialty
      );
      setFilteredDoctors(filtered);
    }
  }, [selectedSpecialty, doctors]);

  const handleSelectDoctor = (doctor: Doctor) => {
    navigate('/appointment', { 
      state: { 
        doctorName: doctor.name,
        doctorId: doctor.id,
        reason: 'General Consultation'
      } 
    });
  };

  const handleViewProfile = (doctorId: string) => {
    navigate(`/doctor/${doctorId}`);
  };

  if (loading) {
    return <div className="loading">Loading doctors...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="doctor-list-container">
      <h1>Select a Doctor for General Consultation</h1>
      <p className="subtitle">Choose from our available doctors below</p>
      
      <div className="search-container">
        <select
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className="specialty-select"
        >
          <option value="">All Specialties</option>
          {specialties.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>
      </div>

      <div className="doctors-grid">
        {filteredDoctors.map((doctor) => (
          <div 
            key={doctor.id} 
            className="doctor-card"
            
          >
            
            <img src={doctor.image} alt={doctor.name} className="doctor-image" />
            <div className="doclist-doctor-info">
              <span className="status available">Available</span>
              <h2>{doctor.name}</h2>
              <p className="specialty">{doctor.specialty}</p>
              <p className="experience">Experience: {doctor.experience}</p>
              
              <div className="button-group">
               
                <button 
                  className="view-profile-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProfile(doctor.id);
                  }}
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorList; 