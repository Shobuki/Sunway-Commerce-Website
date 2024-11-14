import { swaggerUi, swaggerSpec } from './swagger';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return swaggerUi.setup(swaggerSpec)(req, res);
  }
  res.status(405).end(); // Method Not Allowed jika metode selain GET
}
