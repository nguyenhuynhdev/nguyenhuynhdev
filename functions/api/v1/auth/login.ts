import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// OPTIONS handler for CORS
export async function onRequestOptions() {
  const { corsHeaders } = await import('../../_utils');
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function onRequestPost({ env, request }: any) {
  try {
    console.log('Login request received');
    const body: LoginRequest = await request.json();
    console.log('Request body parsed:', { email: body.email, hasPassword: !!body.password });
    const { email, password, rememberMe } = body;

    const { errorResponse, jsonResponse } = await import('../../_utils');
    console.log('Utils imported successfully');
    
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // Query user from database
    let userResult;
    try {
      console.log('Querying user from database...');
      userResult = await env.DB.prepare(
        'SELECT * FROM users WHERE email = ? AND is_active = 1'
      )
        .bind(email)
        .first();
      console.log('User query result:', userResult ? { id: userResult.id, email: userResult.email } : 'not found');
    } catch (dbErr: any) {
      console.error('Database query error:', dbErr);
      console.error('Error details:', JSON.stringify(dbErr, null, 2));
      return errorResponse('Database error: ' + (dbErr.message || 'Unknown error'), 500);
    }

    if (!userResult) {
      console.log('User not found or inactive');
      // Log failed login attempt (ignore errors if table doesn't exist)
      try {
        await env.DB.prepare(
          'INSERT INTO login_logs (email, success, ip_address, user_agent) VALUES (?, 0, ?, ?)'
        )
          .bind(
            email,
            request.headers.get('CF-Connecting-IP') || 'unknown',
            request.headers.get('User-Agent') || 'unknown'
          )
          .run();
      } catch (logErr) {
        // Ignore logging errors
        console.warn('Failed to log login attempt:', logErr);
      }

      return errorResponse('Invalid email or password', 401);
    }

    // Verify password
    let passwordValid = false;
    try {
      console.log('Verifying password with bcrypt...');
      console.log('Password hash exists:', !!userResult.password_hash);
      passwordValid = await bcrypt.compare(password, userResult.password_hash);
      console.log('Password valid:', passwordValid);
    } catch (bcryptErr: any) {
      console.error('Bcrypt error:', bcryptErr);
      console.error('Bcrypt error details:', JSON.stringify(bcryptErr, null, 2));
      console.error('Error stack:', bcryptErr.stack);
      return errorResponse('Password verification failed: ' + (bcryptErr.message || 'Unknown error'), 500);
    }

    if (!passwordValid) {
      // Log failed login attempt (ignore errors if table doesn't exist)
      try {
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
      } catch (logErr) {
        // Ignore logging errors
        console.warn('Failed to log login attempt:', logErr);
      }

      return errorResponse('Invalid email or password', 401);
    }

    // Log successful login (ignore errors if table doesn't exist)
    try {
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
    } catch (logErr) {
      // Ignore logging errors
      console.warn('Failed to log successful login:', logErr);
    }

    // Update last login (ignore errors)
    try {
      await env.DB.prepare('UPDATE users SET last_login_at = datetime("now") WHERE id = ?')
        .bind(userResult.id)
        .run();
    } catch (updateErr) {
      // Ignore update errors
      console.warn('Failed to update last_login_at:', updateErr);
    }

    // Generate JWT token
    let token: string;
    try {
      console.log('Generating JWT token...');
      console.log('JWT_SECRET exists:', !!JWT_SECRET);
      token = jwt.sign(
        {
          userId: userResult.id,
          email: userResult.email,
          role: userResult.role,
        },
        JWT_SECRET,
        { expiresIn: rememberMe ? '30d' : '7d' }
      );
      console.log('JWT token generated successfully');
    } catch (jwtErr: any) {
      console.error('JWT sign error:', jwtErr);
      console.error('JWT error details:', JSON.stringify(jwtErr, null, 2));
      console.error('Error stack:', jwtErr.stack);
      return errorResponse('Token generation failed: ' + (jwtErr.message || 'Unknown error'), 500);
    }

    const response = jsonResponse({
      success: true,
      token,
      user: {
        id: userResult.id,
        email: userResult.email,
        name: userResult.name,
        role: userResult.role,
        avatar_url: userResult.avatar_url,
      },
    });

    // Set cookie if rememberMe is true
    if (rememberMe) {
      response.headers.set(
        'Set-Cookie',
        `auth_token=${token}; Path=/; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`
      );
    }

    console.log('Login successful');
    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    console.error('Error type:', typeof err);
    console.error('Error message:', err?.message);
    console.error('Error stack:', err?.stack);
    console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    const { errorResponse } = await import('../../_utils');
    // Include error message for debugging
    return errorResponse('Login failed: ' + (err?.message || 'Unknown error'), 500);
  }
}

