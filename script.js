document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("darkModeToggle");

  // 1. MODO OSCURO
  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) document.body.classList.add("dark");
  if (darkModeToggle) darkModeToggle.textContent = isDark ? "☀️" : "🌙";

  // 2. EFECTO 3D
  window.apply3DEffect = () => {
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

  // 3. MOTOR SPOTIFY PKCE
  const SPOTIFY_CLIENT_ID = 'c54d0fa62f254d86b2735844b1690a50'; 
  const REDIRECT_URI = 'https://rbv-utility.es/spotify-summary.html';
  window.currentToken = ''; // Global para las pestañas

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

  // Capturar código al volver
  const code = new URLSearchParams(window.location.search).get('code');
  if (code) {
    const codeVerifier = localStorage.getItem('code_verifier');
    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.access_token) {
        window.currentToken = data.access_token;
        window.history.replaceState({}, document.title, window.location.pathname);
        fetchSpotifyData('artists');
      }
    });
  }

  // Función de carga de datos
  window.fetchSpotifyData = async (type = 'artists') => {
    const loginSec = document.getElementById('login-section');
    const loadingSec = document.getElementById('loading-stats');
    const resultsSec = document.getElementById('stats-results');
    const grid = document.getElementById('stats-grid');
    const title = document.getElementById('stats-title');

    if(loginSec) loginSec.style.display = 'none';
    if(loadingSec) loadingSec.style.display = 'block';
    if(resultsSec) resultsSec.style.display = 'block';
    
    const endpoint = type === 'artists' ? 'top/artists' : 'top/tracks';
    title.innerText = type === 'artists' ? 'Tus Artistas Top' : 'Tus Canciones Top';

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/${endpoint}?limit=20`, {
        headers: { 'Authorization': `Bearer ${window.currentToken}` }
      });
      const data = await response.json();
      
      grid.innerHTML = data.items.map(item => {
        const imgUrl = type === 'artists' ? item.images[0].url : item.album.images[0].url;
        const sub = type === 'artists' ? item.genres.slice(0,2).join(', ') : item.artists[0].name;
        return `
          <div class="feature-card">
            <img src="${imgUrl}" style="width: 100%; border-radius: 12px; margin-bottom: 1rem;">
            <h3>${item.name}</h3>
            <p style="font-size: 0.8rem; color: #6c63ff;">${sub}</p>
          </div>`;
      }).join('');
      
      loadingSec.style.display = 'none';
      apply3DEffect();
    } catch (err) { console.error(err); }
  };

  // Auxiliares
  function generateRandomString(l) {
    let t = ''; const p = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < l; i++) t += p.charAt(Math.floor(Math.random() * p.length));
    return t;
  }
  async function generateCodeChallenge(v) {
    const d = new TextEncoder().encode(v);
    const hash = await window.crypto.subtle.digest('SHA-256', d);
    return btoa(String.fromCharCode.apply(null, new Uint8Array(hash)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
});

// Función global para los botones
function changeTab(type) {
  if (window.currentToken) window.fetchSpotifyData(type);
}