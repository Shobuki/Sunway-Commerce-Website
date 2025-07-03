import React, { useState, useEffect } from 'react';
import Navbar from '../../components/header/navbar'; // Import the Navbar

interface UserProfile {
  Id: number;
  Name: string;
  Email: string;
  Address: string;
  PhoneNumber: string;
  Birthdate: string;
  Country: string;
  Gender: string;
  Province: string;
  Image: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phoneNumber: '',
    birthdate: '',
    country: '',
    gender: '',
    province: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [token, setToken] = useState('');
const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  const storedToken = sessionStorage.getItem('userToken') || '';
  const storedUserId = sessionStorage.getItem('userId');
  setToken(storedToken);
  setUserId(storedUserId);
}, []);


useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Pastikan token dan userId tersedia
        if (!token || !userId) {
          throw new Error('Token atau UserID tidak tersedia');
        }
  
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/dealer/dealer/profile', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ UserId: userId }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal memuat profil');
        }
        
        const data = await response.json();
        
        // Perbaikan: Gunakan data langsung (tanpa .data)
        setProfile(data);
        setFormData({
          name: data.Name,
          email: data.Email,
          address: data.Address,
          phoneNumber: data.PhoneNumber,
          birthdate: data.Birthdate?.split('T')[0] || '',
          country: data.Country,
          gender: data.Gender,
          province: data.Province,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
  
    // Jalankan hanya jika token dan userId tersedia
    if (token && userId) {
      fetchProfile();
    }
  }, [token, userId]); // Tambahkan token dan userId sebagai dependency

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/dealer/dealer/profile/picture/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ UserId: userId }),
        });

        if (response.ok) {
          const data = await response.json();
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        console.error('Gagal memuat foto profil:', err);
      }
    };

    fetchProfilePicture();
  }, [userId, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/dealer/dealer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          UserId: userId,
          email: formData.email,
          name: formData.name,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          birthdate: formData.birthdate,
          country: formData.country,
          gender: formData.gender,
          province: formData.province,
        }),
      });

      if (!response.ok) throw new Error('Gagal memperbarui profil');
      const data = await response.json();
      setProfile(data.data);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    if (userId) {
      formData.append('UserId', userId.toString());
    } else {
      throw new Error('UserId is null');
    }
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/dealer/dealer/profile/picture/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Gagal mengunggah foto');
      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePicture = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/dealer/dealer/profile/picture/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ UserId: userId }),
      });

      if (!response.ok) throw new Error('Gagal menghapus foto');
      setImageUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Memuat...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <><Navbar /><div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Profil Pengguna</h1>

          {/* Bagian Foto Profil */}
          <div className="mb-8 text-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200">
                  {imageUrl ? (
                      <img src={imageUrl} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400">Tidak ada foto</span>
                      </div>
                  )}
              </div>
              <div className="mt-4 space-x-3">
                  <label className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                      Unggah Foto
                      <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden" />
                  </label>
                  {imageUrl && (
                      <button
                          onClick={handleDeletePicture}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                          Hapus Foto
                      </button>
                  )}
              </div>
          </div>

          {/* Form Edit Profil */}
          {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Nama</label>
                          <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              required />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              required />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Alamat</label>
                          <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Telepon</label>
                          <input
                              type="tel"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                          <input
                              type="date"
                              name="birthdate"
                              value={formData.birthdate}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Negara</label>
                          <input
                              type="text"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                          <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                              <option value="">Pilih</option>
                              <option value="Male">Laki-laki</option>
                              <option value="Female">Perempuan</option>
                              <option value="Other">Lainnya</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700">Provinsi</label>
                          <input
                              type="text"
                              name="province"
                              value={formData.province}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                      </div>
                  </div>

                  <div className="flex space-x-3 mt-6">
                      <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                          Simpan Perubahan
                      </button>
                      <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                          Batal
                      </button>
                  </div>
              </form>
          ) : (
              <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <p className="font-medium">Nama:</p>
                          <p className="text-gray-600">{profile?.Name}</p>
                      </div>
                      <div>
                          <p className="font-medium">Email:</p>
                          <p className="text-gray-600">{profile?.Email}</p>
                      </div>
                      <div>
                          <p className="font-medium">Alamat:</p>
                          <p className="text-gray-600">{profile?.Address || '-'}</p>
                      </div>
                      <div>
                          <p className="font-medium">Telepon:</p>
                          <p className="text-gray-600">{profile?.PhoneNumber || '-'}</p>
                      </div>
                      <div>
                          <p className="font-medium">Tanggal Lahir:</p>
                          <p className="text-gray-600">
                              {profile?.Birthdate ? new Date(profile.Birthdate).toLocaleDateString() : '-'}
                          </p>
                      </div>
                      <div>
                          <p className="font-medium">Negara:</p>
                          <p className="text-gray-600">{profile?.Country || '-'}</p>
                      </div>
                      <div>
                          <p className="font-medium">Jenis Kelamin:</p>
                          <p className="text-gray-600">{profile?.Gender || '-'}</p>
                      </div>
                      <div>
                          <p className="font-medium">Provinsi:</p>
                          <p className="text-gray-600">{profile?.Province || '-'}</p>
                      </div>
                  </div>
                  <button
                      onClick={() => setIsEditing(true)}
                      className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                      Edit Profil
                  </button>
              </div>
          )}
      </div></>
  );
};

export default Profile;