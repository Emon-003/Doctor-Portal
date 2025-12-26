import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, updateProfile, updateEmail } from 'firebase/auth';
import { auth } from '../firebase/config'; // Your Firebase auth instance
import './UserProfile.css'; // Styling for this component

const UserProfile: React.FC = () => {
  // --- State Management ---
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // Firebase Auth `phoneNumber` is read-only for `updateProfile`
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // --- Effect Hook for Firebase Auth State Change ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setEmail(currentUser.email || '');
        setPhoneNumber(currentUser.phoneNumber || '');
      } else {
        // If no user is logged in, redirect to login page
        navigate('/login', { state: { from: '/profile' } });
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [navigate]);

  // --- Handle Form Submission (Save Profile Changes) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!user) {
        navigate('/login', { state: { from: '/profile' } });
        return;
      }

      // --- Update User Profile (displayName) ---
      await updateProfile(user, {
        displayName: displayName,
        // photoURL is no longer handled here
      });

      // --- Update Email if Changed ---
      if (email !== user.email) {
        // Note: Firebase `updateEmail` often requires recent re-authentication for security.
        // If it fails, the user will need to log in again.
        await updateEmail(user, email);
      }

      // phoneNumber is generally read-only for updateProfile and requires
      // specific Firebase Phone Auth flows to change.

      setSuccess('Profile updated successfully!');
      setIsEditing(false); // Exit edit mode on success
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      // If the error is due to authentication, redirect to login
      if (err.code === 'auth/requires-recent-login' || err.code === 'auth/invalid-credential') {
        alert('Your session has expired or requires re-authentication. Please log in again.');
        navigate('/login', { state: { from: '/profile' } });
      }
    } finally {
      setLoading(false);
      // Clear messages after some time
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
    }
  };

  // --- Handle Display Name Input with Capitalization ---
  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Capitalize the first letter of each word
    const input = e.target.value;
    const capitalizedInput = input.replace(/\b\w/g, (char) => char.toUpperCase());
    setDisplayName(capitalizedInput);
  };

  // --- Handle Cancel Edit ---
  const handleCancelEdit = () => {
    // Reset states to original values from Firebase Auth user object
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
      // photoURL is no longer reset
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  // --- Function to get the first letter of the display name for the avatar ---
  const getDisplayNameInitial = (name: string | null | undefined) => {
    if (name && name.trim().length > 0) {
      return name.trim().charAt(0).toUpperCase();
    }
    // Fallback if no display name is set (e.g., user's first login)
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?'; // Default if no name or email
  };

  // --- Loading State for Initial Auth Check ---
  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="loading-spinner">Loading profile...</div>
        </div>
      </div>
    );
  }

  // --- Render Profile Form ---
  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>User Profile</h1>

        {/* Messages */}
        {error && <div className="message error-message">{error}</div>}
        {success && <div className="message success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-image-section">
            {/* Display the first letter of the display name */}
            <div className="profile-initial-avatar">
              {getDisplayNameInitial(displayName || user.displayName)}
            </div>
            {/* Image upload section removed */}
          </div>

          <div className="form-group">
            <label htmlFor="displayName">Full Name</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={handleDisplayNameChange}
              placeholder="Enter your name"
              disabled={!isEditing || loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={!isEditing || loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              disabled={true} // Still disabled as it's not directly updatable via updateProfile
              title="Phone number can only be updated via Firebase Phone Authentication methods."
            />
          </div>

          <div className="button-group">
            {isEditing ? (
              <>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="edit-btn"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;