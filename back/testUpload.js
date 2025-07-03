const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

const uploadImage = async () => {
  const formData = new FormData();
  formData.append('image', fs.createReadStream('C:/Users/Alfredo/Downloads/0a24f7c8f9383c6b5e335076ed4d9e3e.jpg'));
  formData.append('adminId', '2');

  const response = await fetch('http://localhost:3000/api/admin/admin/profile/image', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoyLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTczNjMyODcxMCwiZXhwIjoxNzM2MzMyMzEwfQ.rJn6Y6QH5tk1LTHeeE8Q7CwL2kUhJkI_jrXO6jUgRjQ',
    },
    body: formData,
  });

  const result = await response.json();
  console.log(result);
};

uploadImage().catch((error) => console.error('Error uploading image:', error));
