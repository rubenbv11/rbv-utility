document.addEventListener("DOMContentLoaded", () => {
    // 1. MODO OSCURO
    const darkModeToggle = document.getElementById("darkModeToggle");
    const isDark = localStorage.getItem("darkMode") === "true";
    
    if (isDark) document.body.classList.add("dark");
    if (darkModeToggle) darkModeToggle.textContent = isDark ? "☀️" : "🌙";

    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark");
            const nowDark = document.body.classList.contains("dark");
            localStorage.setItem("darkMode", nowDark);
            darkModeToggle.textContent = nowDark ? "☀️" : "🌙";
        });
    }

    // 2. TARJETAS 3D (Efecto Apple)
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

    // 3. CONFIGURACIÓN SPOTIFY PKCE
    const CLIENT_ID = 'c54d0fa62f254d86b2735844b1690a50';
    const REDIRECT_URI = 'https://rbv-utility.es/spotify-summary.html';
    
    // Variables de estado para los filtros
    window.spotifyToken = '';
    window.currentType = 'artists';
    window.currentTimeRange = 'medium_term';

    const loginBtn = document.getElementById('btn-spotify-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const verifier = generateRandomString(128);
            const challenge = await generateCodeChallenge(verifier);
            localStorage.setItem('code_verifier', verifier);

            const params = new URLSearchParams({
                client_id: CLIENT_ID,
                response_type: 'code',
                redirect_uri: REDIRECT_URI,
                code_challenge_method: 'S256',
                code_challenge: challenge,
                scope: 'user-top-read'
            });

            // Redirección limpia a Spotify
            window.location.href = 'https://accounts.spotify.com/authorize?' + params.toString();
        });
    }

    // 4. CAPTURAR CÓDIGO AL VOLVER DE SPOTIFY
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
        const verifier = localStorage.getItem('code_verifier');
        
        fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
                code_verifier: verifier
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.access_token) {
                window.spotifyToken = data.access_token;
                // Limpiar la URL para quitar el código feo
                window.history.replaceState({}, document.title, window.location.pathname);
                loadSpotifyData();
            }
        })
        .catch(err => console.error("Error canjeando token:", err));
    }

    // 5. FUNCIÓN MAESTRA DE CARGA DE DATOS
    window.loadSpotifyData = async () => {
        const grid = document.getElementById('stats-grid');
        const title = document.getElementById('stats-title');
        const loading = document.getElementById('loading-stats');
        const results = document.getElementById('stats-results');
        const login = document.getElementById('login-section');

        if(login) login.style.display = 'none';
        if(loading) loading.style.display = 'block';
        if(results) results.style.display = 'block';

        const typeLabel = window.currentType === 'artists' ? 'Artistas' : 'Canciones';
        title.innerText = 'Tus ' + typeLabel + ' Top';

        try {
            const url = 'https://api.spotify.com/v1/me/top/' + window.currentType + 
                        '?limit=20&time_range=' + window.currentTimeRange;

            const res = await fetch(url, {
                headers: { 'Authorization': 'Bearer ' + window.spotifyToken }
            });
            const data = await res.json();
            
            grid.innerHTML = data.items.map((item, index) => {
                const img = window.currentType === 'artists' ? item.images[0].url : item.album.images[0].url;
                const info = window.currentType === 'artists' ? item.genres.slice(0,2).join(', ') : item.artists[0].name;
                const rankClass = index < 3 ? 'rank-highlight' : '';

                return `
                    <div class="feature-card ${rankClass}" style="position: relative;">
                        <div class="rank-badge">${index + 1}</div>
                        <img src="${img}" style="width: 100%; border-radius: 12px; margin-bottom: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                        <h3 style="margin: 0; font-size: 1.1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</h3>
                        <p style="font-size: 0.8rem; color: #6c63ff; font-weight: bold;">${info}</p>
                    </div>`;
            }).join('');
            
            loading.style.display = 'none';
            // Re-activar el 3D en las nuevas tarjetas
            apply3DEffect();
        } catch (err) {
            console.error("Error API Spotify:", err);
        }
    };

    // FUNCIONES AUXILIARES (Seguridad PKCE)
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

// FUNCIONES GLOBALES PARA BOTONES (Fuera del DOMContentLoaded)
function updateType(type) {
    window.currentType = type;
    if (window.spotifyToken) window.loadSpotifyData();
}

function updateTime(range) {
    window.currentTimeRange = range;
    if (window.spotifyToken) window.loadSpotifyData();
}