const express = require('express');
const router = express.Router();

// Contoh route dasar
router.get('/', (req, res) => {
  res.send('Welcome to the Sunway API');
});

module.exports = router;
