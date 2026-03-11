document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("darkModeToggle");

  // 1. GESTIÓN MODO OSCURO
  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) document.body.classList.add("dark");
  if (darkModeToggle) darkModeToggle.textContent = isDark ? "☀️" : "🌙";

  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const isNowDark = document.body.classList.contains("dark");
      localStorage.setItem("darkMode", isNowDark);
      darkModeToggle.textContent = isNowDark ? "☀️" : "🌙";
    });
  }

  // 2. MENÚ DESPLEGABLE
  const dropdownTrigger = document.querySelector('.dropdown-trigger');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  if (dropdownTrigger && dropdownMenu) {
    dropdownTrigger.addEventListener('click', () => {
      const expanded = dropdownTrigger.getAttribute('aria-expanded') === 'true';
      dropdownTrigger.setAttribute('aria-expanded', !expanded);
    });
  }

  // 3. TARJETAS 3D (Efecto Apple)
  const apply3DEffect = () => {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    });
  };
  apply3DEffect();

  // 4. MOTOR SPOTIFY SEGURO (PKCE)
  const SPOTIFY_CLIENT_ID = 'c54d0fa62f254d86b2735844b1690a50'; 
  const REDIRECT_URI = 'https://rbv-utility.es/spotify-summary.html';

  const spotifyLoginBtn = document.getElementById('btn-spotify-login');

  if (spotifyLoginBtn) {
    spotifyLoginBtn.addEventListener('click', async () => {
      const codeVerifier = generateRandomString(128);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      localStorage.setItem('code_verifier', codeVerifier);

      const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        scope: 'user-top-read'
      });

      window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    });
  }

  // Lógica de recepción del código
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (code) {
    const codeVerifier = localStorage.getItem('code_verifier');
    const body = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    });

    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    })
    .then(res => res.json())
    .then(data => {
      if (data.access_token) {
        window.history.replaceState({}, document.title, window.location.pathname);
        fetchSpotifyStats(data.access_token);
      }
    });
  }

  async function fetchSpotifyStats(token) {
    const loginSec = document.getElementById('login-section');
    const loadingSec = document.getElementById('loading-stats');
    if(loginSec) loginSec.style.display = 'none';
    if(loadingSec) loadingSec.style.display = 'block';

    try {
      const response = await fetch('https://api.spotify.com/v1/me/top/artists?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      renderResults(data.items);
    } catch (err) {
      console.error("Error API:", err);
    }
  }

  function renderResults(items) {
    const grid = document.getElementById('artists-grid');
    const resultsSec = document.getElementById('stats-results');
    const loadingSec = document.getElementById('loading-stats');
    if(loadingSec) loadingSec.style.display = 'none';
    if(resultsSec) resultsSec.style.display = 'block';

    if(grid && items) {
      grid.innerHTML = items.map(artist => `
        <div class="feature-card">
          <img src="${artist.images[0].url}" style="width: 100%; border-radius: 12px; margin-bottom: 1rem;">
          <h3 style="margin: 0;">${artist.name}</h3>
          <p style="font-size: 0.8rem; color: #6c63ff;">${artist.genres.slice(0, 2).join(', ')}</p>
        </div>
      `).join('');
      apply3DEffect(); // Aplicar efecto a las nuevas tarjetas
    }
  }

  // Auxiliares PKCE
  function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
});