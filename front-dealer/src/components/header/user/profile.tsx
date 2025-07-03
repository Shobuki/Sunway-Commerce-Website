import React, { useState, useEffect } from 'react';

interface ProfileProps {
  userId: number;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ userId, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        // Use the correct path
        const imageUrl = `http://localhost:3000/uploads/images/private/user/userprofile/${userId}.png`;
        console.log('Loading image from:', imageUrl);

        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error('Image not found');
        }
        setProfileImage(imageUrl);
      } catch (error) {
        console.error('Error loading profile image:', error);
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [userId]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <div className="relative">
      {/* Profile Image Button */}
      <button onClick={toggleDropdown} className="focus:outline-none">
        {isLoading ? (
          <div className="w-8 h-8 rounded-full border border-gray-300 bg-gray-200 animate-pulse" />
        ) : imageError ? (
          <img
            src="http://localhost:3000/uploads/images/default-profile.png" // Update with correct path for default image
            alt="Default User Profile"
            className="w-8 h-8 rounded-full border border-gray-300"
          />
        ) : (
          <img
            src={profileImage ?? "http://localhost:3000/uploads/images/default-profile.png"}
            alt="User Profile"
            className="w-8 h-8 rounded-full border border-gray-300"
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <ul className="py-2 text-gray-700">
            <li
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer font-semibold"
              onClick={() => {
                onLogout();
                setIsDropdownOpen(false); // Close dropdown after logout
              }}
            >
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Profile;
