import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export async function onRequestPost({ env, request }: any) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const body: LoginRequest = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Query user from database
    const userResult = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND is_active = 1'
    )
      .bind(email)
      .first();

    if (!userResult) {
      // Log failed login attempt
      await env.DB.prepare(
        'INSERT INTO login_logs (email, success, ip_address, user_agent) VALUES (?, 0, ?, ?)'
      )
        .bind(
          email,
          request.headers.get('CF-Connecting-IP') || 'unknown',
          request.headers.get('User-Agent') || 'unknown'
        )
        .run();

      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, userResult.password_hash);
    if (!passwordValid) {
      await env.DB.prepare(
        'INSERT INTO login_logs (user_id, email, success, ip_address, user_agent) VALUES (?, ?, 0, ?, ?)'
      )
        .bind(
          userResult.id,
          email,
          request.headers.get('CF-Connecting-IP') || 'unknown',
          request.headers.get('User-Agent') || 'unknown'
        )
        .run();

      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Log successful login
    await env.DB.prepare(
      'INSERT INTO login_logs (user_id, email, success, ip_address, user_agent) VALUES (?, ?, 1, ?, ?)'
    )
      .bind(
        userResult.id,
        email,
        request.headers.get('CF-Connecting-IP') || 'unknown',
        request.headers.get('User-Agent') || 'unknown'
      )
      .run();

    // Update last login
    await env.DB.prepare('UPDATE users SET last_login_at = datetime("now") WHERE id = ?')
      .bind(userResult.id)
      .run();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: userResult.id,
        email: userResult.email,
        role: userResult.role,
      },
      JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '7d' }
    );

    const response = new Response(
      JSON.stringify({
        success: true,
        token,
        user: {
          id: userResult.id,
          email: userResult.email,
          name: userResult.name,
          role: userResult.role,
          avatar_url: userResult.avatar_url,
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    // Set cookie if rememberMe is true
    if (rememberMe) {
      response.headers.set(
        'Set-Cookie',
        `auth_token=${token}; Path=/; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`
      );
    }

    return response;
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

