import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Country, State } from 'country-state-city';

// Register Component
const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [gender, setGender] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const router = useRouter();

  // Get country and province data
  const countries = Country.getAllCountries();
  const provinces = country ? State.getStatesOfCountry(country) : [];

  // Handle country selection and update provinces
  const handleCountryChange = (selectedCountryCode: string) => {
    setCountry(selectedCountryCode);
    setProvince(''); // Reset province when country changes
  };

  // Handle image upload with validation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (e.g., max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        return;
      }

      // Validate file type (only JPEG and PNG allowed)
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Only JPEG and PNG images are allowed');
        return;
      }

      // Convert image to base64
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string); // Set the base64 string
      };
      reader.readAsDataURL(file);

      setError(''); // Clear any previous errors
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');

    // Prepare the data to send in the request
    const requestData = {
      email,
      username,
      password,
      name,
      address,
      birthdate,
      country,
      gender,
      phonenumber,
      province,
      image, // base64 image string
    };

    try {
      // API call to register user
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error details:', errorData);
        throw new Error('Failed to register');
      }

      const data = await response.json();
      const { token } = data;

      // Store the token securely in sessionStorage or localStorage
      sessionStorage.setItem('userToken', token);

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000); // Redirect after 2 seconds
    } catch (error) {
      const err = error as Error;
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src="/images/logo/sunway-logo.png" alt="Sunway Logo" width={200} height={80} />
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-6 text-center">Create an Account</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Required Fields */}
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-gray-700 font-semibold">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-gray-700 font-semibold">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>

          {/* Optional Fields */}
          <div>
            <label htmlFor="image" className="block text-gray-700 font-semibold">
              Profile Image
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-gray-700 font-semibold">
              Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div>
            <label htmlFor="birthdate" className="block text-gray-700 font-semibold">
              Birthdate
            </label>
            <input
              type="date"
              id="birthdate"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-gray-700 font-semibold">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Can't say">Can't say</option>
            </select>
          </div>
          <div>
            <label htmlFor="country" className="block text-gray-700 font-semibold">
              Country
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.isoCode} value={c.isoCode}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="province" className="block text-gray-700 font-semibold">
              Province
            </label>
            <select
              id="province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              disabled={!country}
            >
              <option value="">Select Province</option>
              {provinces.map((p) => (
                <option key={p.isoCode} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="phonenumber" className="block text-gray-700 font-semibold">
              Phone Number
            </label>
            <input
              type="text"
              id="phonenumber"
              value={phonenumber}
              onChange={(e) => setPhonenumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
          >
            Register
          </button>
        </form>
        <p className="text-gray-600 text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-red-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
