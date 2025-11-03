// GET /api/v1/settings - Get all settings
export async function onRequestGet({ env, request }: any) {
  try {
    const { getAuthUser, errorResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }
    const results = await env.DB.prepare('SELECT * FROM settings').all();
    const settings: Record<string, any> = {};

    results.results.forEach((setting: any) => {
      let value = setting.value;
      if (setting.type === 'json' && value) {
        try {
          value = JSON.parse(value);
        } catch {}
      } else if (setting.type === 'number' && value) {
        value = parseFloat(value);
      } else if (setting.type === 'boolean') {
        value = value === 'true' || value === '1';
      }
      settings[setting.key] = value;
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: settings,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT /api/v1/settings - Update settings
export async function onRequestPut({ env, request }: any) {
  try {
    const { getAuthUser, checkRole, errorResponse } = await import('../../_utils');
    const user = getAuthUser(request);
    if (!user || !checkRole(user, ['admin'])) {
      return errorResponse('Forbidden', 403);
    }
    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      let stringValue: string;
      let type = 'string';

      if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
        type = 'json';
      } else if (typeof value === 'number') {
        stringValue = String(value);
        type = 'number';
      } else if (typeof value === 'boolean') {
        stringValue = value ? '1' : '0';
        type = 'boolean';
      } else {
        stringValue = String(value);
      }

      await env.DB.prepare(
        `INSERT INTO settings (key, value, type, updated_at)
         VALUES (?, ?, ?, datetime("now"))
         ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         type = excluded.type,
         updated_at = datetime("now")`
      )
        .bind(key, stringValue, type)
        .run();
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Settings updated successfully',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

