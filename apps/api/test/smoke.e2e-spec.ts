import request from 'supertest';

const smokeBaseUrl = process.env.SMOKE_BASE_URL;
const describeIfSmoke = smokeBaseUrl ? describe : describe.skip;

describeIfSmoke('Smoke checks (running stack)', () => {
  const target = smokeBaseUrl as string;

  it('GET /api/health should return 200', async () => {
    await request(target).get('/api/health').expect(200);
  });

  it('GET /api/contacts without auth should return 401', async () => {
    await request(target).get('/api/contacts').expect(401);
  });

  it('POST /api/auth/login invalid payload should return 400', async () => {
    await request(target)
      .post('/api/auth/login')
      .send({ email: 'broken' })
      .expect(400);
  });
});
