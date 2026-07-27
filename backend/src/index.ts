import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { patientsRouter } from './routes/patients';
import { contactRouter } from './routes/contact';

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

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok' });
});

// Patients router
app.route('/api/patients', patientsRouter);

// Contact router
app.route('/api/contact', contactRouter);

export default {
  port: 3001,
  fetch: app.fetch,
};
