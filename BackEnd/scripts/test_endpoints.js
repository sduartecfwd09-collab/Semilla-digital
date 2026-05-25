async function run() {
  try {
    console.log('Logging in as Admin...');
    const loginRes = await fetch('http://localhost:3002/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@agromap.com',
        password: 'secret123'
      })
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

    console.log('Login successful.');
    
    // Extract token from set-cookie
    const setCookie = loginRes.headers.get('set-cookie');
    console.log('Set-Cookie:', setCookie);
    let cookieHeader = '';
    if (setCookie) {
      const match = setCookie.match(/agromap_token=([^;]+)/);
      if (match) {
        cookieHeader = `agromap_token=${match[1]}`;
        console.log('Extracted cookie:', cookieHeader);
      }
    }

    const headers = {};
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const endpoints = [
      { name: 'GET /usuarios', url: 'http://localhost:3002/usuarios' },
      { name: 'GET /puestos', url: 'http://localhost:3002/puestos' },
      { name: 'GET /productos', url: 'http://localhost:3002/productos' },
      { name: 'GET /ferias', url: 'http://localhost:3002/ferias' }
    ];

    for (const ep of endpoints) {
      try {
        console.log(`\nTesting ${ep.name}...`);
        const res = await fetch(ep.url, { headers });
        const resData = await res.json();
        if (res.ok) {
          const list = resData.data;
          const len = Array.isArray(list) ? list.length : (list && list.rows ? list.rows.length : 'Object');
          console.log(`Success! Status: ${res.status}. Data count: ${len}`);
        } else {
          console.error(`Error in ${ep.name}: Status ${res.status}`, resData);
        }
      } catch (err) {
        console.error(`Error in ${ep.name}:`, err.message);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during test execution:', err.message);
    process.exit(1);
  }
}

run();
