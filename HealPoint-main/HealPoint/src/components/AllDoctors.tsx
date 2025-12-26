import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import './AllDoctors.css';
import { useAuth } from '../contexts/AuthContext';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  available: boolean;
  experience: string;
  appointmentReasons: string[];
}

const specialties = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Endocrinologist',
  'Gastroenterologist',
  'Neurologist',
  'Gynecologist',
  'Obstetrician',
  // 'Ophthalmologist',
  // 'Orthopedist',
  // 'Pediatrician',
  // 'Psychiatrist',
  // 'Pulmonologist',
  // 'Rheumatologist',
  // 'Urologist',
  // 'ENT Specialist',
  // 'Dentist',
  // 'Surgeon',
  // 'Anesthesiologist',
  // 'Radiologist',
  // 'Pathologist'
];

const AllDoctors: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 6;

  // Read specialty from location.state if present
  const specialtyFromState = (location.state as any)?.specialty;
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(specialtyFromState || 'All Doctors');

  useEffect(() => {
    if (specialtyFromState) {
      setSelectedSpecialty(specialtyFromState);
    }
  }, [specialtyFromState]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsRef = collection(db, 'doctors');
        let q;
        if (selectedSpecialty === 'All Doctors') {
          q = doctorsRef;
        } else {
          q = query(doctorsRef, where('specialty', '==', selectedSpecialty));
        }
        const querySnapshot = await getDocs(q);
        const doctorsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Doctor[];
        setDoctors(doctorsData);
        setLoading(false);
        setCurrentPage(1); // Reset to first page when specialty changes
      } catch (err) {
        setError('Failed to fetch doctors');
        setLoading(false);
        console.error('Error fetching doctors:', err);
      }
    };
    fetchDoctors();
  }, [selectedSpecialty]);

  const handleSpecialtyClick = (spec: string) => {
    setSelectedSpecialty(spec);
    setSelectedReason('');
    setCurrentPage(1); // Reset to first page when specialty changes
  };

  const handleBookAppointment = (doctorName: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/appointment', { state: { doctorName } });
  };

  const handleDoctorClick = (doctor: Doctor) => {
    navigate(`/doctor/${doctor.id}`);
  };

  // Calculate pagination
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(doctors.length / doctorsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return <div className="loading">Loading doctors...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="all-doctors-container">
      <aside className="sidebar">
        <h3>Specialist Doctors</h3>
        <div className="specialty-list">
          <button
            key="all-doctors"
            className={selectedSpecialty === 'All Doctors' ? 'specialty-btn active' : 'specialty-btn'}
            onClick={() => handleSpecialtyClick('All Doctors')}
          >
            All Doctors
          </button>
          {specialties.map((spec) => (
            <button
              key={spec}
              className={spec === selectedSpecialty ? 'specialty-btn active' : 'specialty-btn'}
              onClick={() => handleSpecialtyClick(spec)}
            >
              {spec}
            </button>
          ))}
        </div>
      </aside>
      <section className="doctors-list">
        {doctors.length > 0 ? (
          <>
            <div className="all-doctors-grid">
              {currentDoctors.map((doctor) => (
                <div className="all-doctor-card" onClick={() => handleDoctorClick(doctor)} key={doctor.id}>
                  <img className="all-doctor-img" src={doctor.image} alt={doctor.name} />
                  <div className="all-doctor-info">
                    <span className="all-doc-status">
                      <span className="dot" />{doctor.available ? 'Available' : 'Unavailable'}
                    </span>
                    <h3>{doctor.name}</h3>
                    <p>{doctor.specialty}</p>
                    <p className="all_doc_experience">Experience: {doctor.experience}</p>
                  </div>
                </div>
              ))}
            </div>
            {doctors.length > doctorsPerPage && (
              <div className="pagination-controls">
                <button 
                  className="pagination-btn" 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  &#8592; Previous
                </button>
                <span className="page-info">Page {currentPage} of {totalPages}</span>
                <button 
                  className="pagination-btn" 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next &#8594;
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', width: '100%' }}>
            No doctors found for this specialty.
          </div>
        )}
      </section>
    </div>
  );
};

export default AllDoctors; 