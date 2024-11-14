import React, { useState } from 'react';

interface ProfileProps {
  userId: number;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ userId, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <div className="relative">
      {/* Profile Image Button */}
      <button onClick={toggleDropdown} className="focus:outline-none">
        <img
          src={`/images/user/${userId}.png`}
          alt="User Profile"
          className="w-8 h-8 rounded-full border border-gray-300"
        />
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
