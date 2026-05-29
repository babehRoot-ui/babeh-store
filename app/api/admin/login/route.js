import { SignJWT } from 'jose';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '426fa66366d8b6c9A1!b8973f10';
const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'babeh_secret_2024');

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return Response.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const token = await new SignJWT({ role: 'admin', username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(SECRET);

    return Response.json({
      data: {
        token,
        username,
        role: 'admin',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
