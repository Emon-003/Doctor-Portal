import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SpecialtySection.css';

const specialties = [
  
  { label: 'General Physician', icon: '🩺' },
  { label: 'Cardiologist', icon: '🤰' },
  { label: 'Dermatologist', icon: '🧴' },
  { label: 'Endocrinologist', icon: '🧒' },
  { label: 'Gastroenterologist', icon: '🧠' },
  { label: 'Neurologist', icon: '🦠' },
  { label: 'Gynecologist', icon: '❤️' },
  { label: 'Obstetrician', icon: '🦋' },
  // { label: 'Orthopedist', icon: '🦴' },
  // { label: 'Psychiatrist', icon: '💭' },
  // { label: 'Pulmonologist', icon: '🫁' },
  // { label: 'Rheumatologist', icon: '🦵' },
  // { label: 'Urologist', icon: '💧' },
  // { label: 'ENT Specialist', icon: '👂' },
  // { label: 'Dentist', icon: '🦷' },
  // { label: 'Surgeon', icon: '🔪' },
  // { label: 'Anesthesiologist', icon: '💉' },
  // { label: 'Radiologist', icon: '🩻' },
  // { label: 'Pathologist', icon: '🧬' },
  // { label: 'Ophthalmologist', icon: '👁️' },
];

const SpecialtySection: React.FC = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.offsetWidth;
      const cardWidth = 200; // width of specialty card
      const gap = 24; // gap between cards
      const cardsPerView = Math.floor(containerWidth / (cardWidth + gap));
      const total = Math.ceil(specialties.length / cardsPerView);
      setTotalSlides(total);
    }
  }, []);

  // Auto-play functionality
  useEffect(() => {
    const startAutoPlay = () => {
      autoPlayInterval.current = setInterval(() => {
        if (!isPaused && scrollContainerRef.current) {
          const nextIndex = (activeIndex + 1) % totalSlides;
          scrollToSlide(nextIndex);
        }
      }, 3000); // Change slide every 3 seconds
    };

    startAutoPlay();

    return () => {
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current);
      }
    };
  }, [activeIndex, totalSlides, isPaused]);

  const handleSpecialtyClick = (specialty: string) => {
    navigate('/all-doctors', { state: { specialty } });
  };

  const scrollToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.offsetWidth;
      const cardWidth = 200; // width of specialty card
      const gap = 24; // gap between cards
      const cardsPerView = Math.floor(containerWidth / (cardWidth + gap));
      const scrollAmount = index * cardsPerView * (cardWidth + gap);
      
      scrollContainerRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.offsetWidth;
      const cardWidth = 200; // width of specialty card
      const gap = 24; // gap between cards
      const cardsPerView = Math.floor(containerWidth / (cardWidth + gap));
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const newIndex = Math.round(scrollLeft / (cardsPerView * (cardWidth + gap)));
      setActiveIndex(newIndex);
    }
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <section className="specialty-section">
      <h2 className="specialty-title">Find by <span>Speciality</span></h2>
      <p className="specialty-desc">
        Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
      </p>
      <div 
        className="carousel-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className="front-page-specialty-list"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {specialties.map((spec) => (
            <div
              className="specialty-card"
              key={spec.label}
              onClick={() => handleSpecialtyClick(spec.label)}
            >
              <div className="specialty-icon">{spec.icon}</div>
              <div className="specialty-label">{spec.label}</div>
            </div>
          ))}
        </div>
        <div className="carousel-dots">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <div
              key={index}
              className={`dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => scrollToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialtySection; 