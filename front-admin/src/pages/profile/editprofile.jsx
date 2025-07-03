import React, { useState, useEffect } from "react";
import axios from "axios";

import "./EditProfile.css";

const EditProfile = () => {
  const [profile, setProfile] = useState({
    id: "",
    username: "",
    email: "",
    name: "",
    birthdate: "",
    phonenumber: "",
    address: "",
    gender: "",
  });

  const [image, setImage] = useState(null); // File for upload
  const [profileImage, setProfileImage] = useState(null); // Profile image URL
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to fetch profile data and image
 // Function to fetch profile data and image
const fetchProfileData = async () => {
  const token = localStorage.getItem("token");
;

  

  try {
    const profileResponse = await axios.get("/api/admin/admin/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = profileResponse.data;

    // Update the profile state
    setProfile({
      id: data.Id || "",
      username: data.Username || "",
      email: data.Email || "",
      name: data.Name || "",
      birthdate: data.Birthdate || "",
      phonenumber: data.PhoneNumber || "",
      address: data.Address || "",
      gender: data.Gender || "",
    });

    // Fetch the profile image if the ID is available
    if (data.Id) {
      const imageResponse = await axios.get(
        `/api/admin/admin/profile/image/${data.Id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const imageUrl = URL.createObjectURL(imageResponse.data);
      setProfileImage(imageUrl);
    }
  } catch (error) {
    if (error.response?.status === 403) {
     
    } else {
      console.error("Error fetching profile data:", error.message);
      setMessage("Failed to load profile data.");
    }
  }
};


  // Initial data fetch
  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
;

    if (!token) {
      setMessage("Unauthorized access.");
      return;
    }

    setLoading(true);
    try {
      // Upload image if selected
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("adminId", profile.id);

        const imageUploadResponse = await axios.post(
          "/api/admin/admin/profile/image",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (imageUploadResponse.status === 200) {
          const updatedImageUrl = `/api/admin/admin/profile/image/${profile.id}`;
          setProfileImage(updatedImageUrl);
        }
      }

      // Update profile
      const profileUpdateResponse = await axios.put(
        "/api/admin/admin/profile",
        {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          birthdate: profile.birthdate,
          phonenumber: profile.phonenumber,
          address: profile.address,
          gender: profile.gender,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (profileUpdateResponse.status === 200) {
        setMessage("Profile updated successfully!");
        await fetchProfileData(); // Refresh profile data after update
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-content">
        <div className="edit-profile-container">
          <div className="profile-image-section">
            <h2>Profile Image</h2>
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="profile-image-preview" />
            ) : (
              <p>No profile image uploaded.</p>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          <div className="edit-profile-form-section">
            <h2>Edit Profile</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit} className="edit-profile-form">
              <div className="form-group">
                <label>Username:</label>
                <input type="text" name="username" value={profile.username} disabled />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" name="email" value={profile.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Name:</label>
                <input type="text" name="name" value={profile.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Birthdate:</label>
                <input
                  type="date"
                  name="birthdate"
                  value={profile.birthdate?.split("T")[0] || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                <input type="text" name="phonenumber" value={profile.phonenumber} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <input type="text" name="address" value={profile.address} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Gender:</label>
                <select name="gender" value={profile.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
