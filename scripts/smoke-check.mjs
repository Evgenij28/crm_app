/* eslint-disable no-console */
const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000/api';

async function check(name, fn) {
  try {
    await fn();
    console.log(`OK: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

await check('health endpoint', async () => {
  const response = await fetch(`${baseUrl}/health`);
  if (!response.ok) {
    throw new Error(`Expected 200, got ${response.status}`);
  }
  const body = await response.json();
  if (body.status !== 'ok') {
    throw new Error(`Expected status=ok, got ${JSON.stringify(body)}`);
  }
});

await check('auth validation', async () => {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'invalid' }),
  });
  if (response.status !== 400) {
    throw new Error(`Expected 400 for invalid payload, got ${response.status}`);
  }
});

await check('protected endpoint unauthorized', async () => {
  const response = await fetch(`${baseUrl}/contacts`);
  if (response.status !== 401) {
    throw new Error(`Expected 401, got ${response.status}`);
  }
});

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log('Smoke checks passed.');
