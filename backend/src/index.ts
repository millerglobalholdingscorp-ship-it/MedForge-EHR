import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { patientsRouter } from './routes/patients';
import { contactRouter } from './routes/contact';
import { auth } from './middleware/auth';

const app = new Hono();

// CORS for frontend dev server
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://0.0.0.0:3000'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Health check — public
app.get('/api/health', (c) => {
  return c.json({ status: 'ok' });
});

// Contact — public
app.route('/api/contact', contactRouter);

// Patients — auth required
app.use('/api/patients/*', auth);
app.route('/api/patients', patientsRouter);

export default {
  port: 3001,
  fetch: app.fetch,
};
