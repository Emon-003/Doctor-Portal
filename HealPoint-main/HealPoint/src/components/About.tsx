import React from 'react';
import './About.css'; // This line links the CSS file

const About: React.FC = () => {
  return (
    <section className="about-section-wrapper">
      <div className="about-container">
        <h2 className="about-main-title">ABOUT US</h2>

        <div className="about-intro-flex">
          <div className="about-image-wrapper">
            <img
              src="https://prescripto.vercel.app/assets/about_image-MG9zrc7b.png"
              alt="About Us"
              className="about-image"
            />
          </div>
          <div className="about-text-content">
            <div className="space-y-6"> {/* This class is handled by CSS for paragraph spacing */}
              <p>
                Welcome to HealPoint, your trusted partner in managing your healthcare needs conveniently and efficiently. At HealPoint,
                we understand that your health is your most valuable asset, and we're here to make managing it as simple as possible.
              </p>
              <p>
                HealPoint is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating
                cutting-edge features while maintaining the highest standards of security and privacy. Whether you're booking an
                appointment or managing ongoing care, HealPoint is here to support you every step of the way.
              </p>
              <p>
                Our vision at HealPoint is to create a seamless healthcare experience for every user. We aim to bridge the gap between
                patients and healthcare providers, making quality healthcare accessible to all.
              </p>
            </div>
          </div>
        </div>

        <h2 className="about-main-title">WHY CHOOSE US</h2>

        <div className="why-choose-us-grid">
          <div className="feature-item">
            <h3>EFFICIENCY:</h3>
            <p>
              Streamlined appointment scheduling that fits into your busy lifestyle.
            </p>
          </div>
          <div className="feature-item">
            <h3>CONVENIENCE:</h3>
            <p>
              Access to a network of trusted healthcare professionals in your area.
            </p>
          </div>
          <div className="feature-item">
            <h3>PERSONALIZATION:</h3>
            <p>
              Tailored recommendations and reminders to help you stay on top of your health.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
