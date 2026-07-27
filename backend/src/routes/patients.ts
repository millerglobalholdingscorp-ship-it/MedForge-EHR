import { Hono } from 'hono';

export const patientsRouter = new Hono();

patientsRouter.get('/', (c) => {
  return c.json({
    patients: [],
    total: 0,
    message: 'Patients endpoint ready. Database integration pending.',
  });
});

patientsRouter.get('/:id', (c) => {
  const id = c.req.param('id');
  return c.json({
    patient: null,
    message: `Patient ${id} lookup ready. Database integration pending.`,
  });
});

patientsRouter.post('/', async (c) => {
  const body = await c.req.json();
  return c.json(
    {
      message: 'Patient creation ready. Database integration pending.',
      received: body,
    },
    201
  );
});
