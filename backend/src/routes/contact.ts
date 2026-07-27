import { Hono } from 'hono';

export const contactRouter = new Hono();

contactRouter.post('/', async (c) => {
  const body = await c.req.json();

  const { fullName, email, organization, message } = body;

  if (
    !fullName || typeof fullName !== 'string' || fullName.trim() === '' ||
    !email || typeof email !== 'string' || email.trim() === '' ||
    !organization || typeof organization !== 'string' || organization.trim() === '' ||
    !message || typeof message !== 'string' || message.trim() === ''
  ) {
    return c.json({ error: 'All fields are required.' }, 400);
  }

  // Log the submission for now — future: persist to database or send email
  console.log('[Contact] New demo request:', {
    fullName: fullName.trim(),
    email: email.trim(),
    organization: organization.trim(),
    message: message.trim(),
    timestamp: new Date().toISOString(),
  });

  return c.json(
    { success: true, message: "Thank you! We'll be in touch." },
    201
  );
});
