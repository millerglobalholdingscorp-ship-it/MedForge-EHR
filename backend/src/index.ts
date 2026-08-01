import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { patientsRouter } from './routes/patients';
import { contactRouter } from './routes/contact';
import { notesRouter } from './routes/notes';
import { patientPortalRouter } from './routes/patient-portal';
import { appointmentsRouter, appointmentsPortalRouter } from './routes/appointments';
import { auth } from './middleware/auth';
import { patientAuth } from './middleware/patient-auth';

const isProduction = process.env.NODE_ENV === 'production';

const app = new Hono();

// CORS for frontend dev server (dev) or same-origin (prod)
app.use(
  '*',
  cors({
    origin: isProduction ? [] : ['http://localhost:3000', 'http://0.0.0.0:3000'],
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

// Notes — auth required
app.use('/api/notes/*', auth);
app.route('/', notesRouter);

// Appointments — provider and patient portal routes have separate auth scopes
app.use('/api/appointments/*', auth);
app.route('/api/appointments', appointmentsRouter);
app.use('/api/portal/*', patientAuth);
app.route('/api/portal', patientPortalRouter);
app.route('/api/portal', appointmentsPortalRouter);

// In production, serve static files from the built frontend
if (isProduction) {
  app.use('/assets/*', serveStatic({ root: './public' }));
  app.get('/*', serveStatic({ path: './public/index.html' }));
}

export default {
  port: isProduction ? 3000 : 3001,
  fetch: app.fetch,
};
