import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import './FeaturedDoctors.css';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  available: boolean;
  experience: string;
  featured: boolean;
}

const FeaturedDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 4;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedDoctors = async () => {
      try {
        const doctorsRef = collection(db, 'doctors');
        const q = query(doctorsRef, where('featured', '==', true));
        const querySnapshot = await getDocs(q);
        const doctorsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Doctor[];
        setDoctors(doctorsList);
      } catch (err) {
        console.error('Error fetching featured doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDoctors();
  }, []);

  const handleDoctorClick = (doctor: Doctor) => {
    navigate(`/doctor/${doctor.id}`);
  };

  // Calculate pagination
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(doctors.length / doctorsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return <div className="loading">Loading featured doctors...</div>;
  }

  if (doctors.length === 0) {
    return null;
  }

  return (
    <section className="featured-doctors">
      <h2>Popular Doctors</h2>
      <div className="featuredSection-doctors-grid">
        {currentDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className="featured-doctor-card"
            onClick={() => handleDoctorClick(doctor)}
          >
            <img src={doctor.image} alt={doctor.name} />
            <div className="featured-doctor-info">
              <span className={`availability ${doctor.available ? 'available' : 'unavailable'}`}>
                {doctor.available ? 'Available' : 'Unavailable'}
              </span>
              <h3>{doctor.name}</h3>
              <p className="specialty">{doctor.specialty}</p>
              <p className="experience">{doctor.experience} Experience ⭐⭐⭐</p>
            </div>
          </div>
        ))}
      </div>
      {doctors.length > doctorsPerPage && (
        <div className="featured-pagination">
          <button 
            className="pagination-btn" 
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button 
            className="pagination-btn" 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
};

export default FeaturedDoctors; 