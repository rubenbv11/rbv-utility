document.addEventListener("DOMContentLoaded", () => {
    // 1. MODO OSCURO
    const darkModeToggle = document.getElementById("darkModeToggle");
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) document.body.classList.add("dark");

    if (darkModeToggle) {
        darkModeToggle.textContent = isDark ? "☀️" : "🌙";
        darkModeToggle.addEventListener("click", () => {
            document.body.classList.toggle("dark");
            const nowDark = document.body.classList.contains("dark");
            localStorage.setItem("darkMode", nowDark);
            darkModeToggle.textContent = nowDark ? "☀️" : "🌙";
        });
    }

    // 2. MOTOR SPOTIFY PKCE
    const CLIENT_ID = 'c54d0fa62f254d86b2735844b1690a50';
    const REDIRECT_URI = 'https://rbv-utility.es/spotify-summary.html';

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

            window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
        });
    }

    // 3. RECIBIR CÓDIGO Y CARGAR DATOS
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
                window.history.replaceState({}, document.title, window.location.pathname);
                loadSpotifyData('artists');
            }
        })
        .catch(err => console.error("Error en Token:", err));
    }

    // FUNCIÓN PARA CARGAR LOS DATOS
    window.loadSpotifyData = async (type) => {
        const grid = document.getElementById('stats-grid');
        const title = document.getElementById('stats-title');
        const loading = document.getElementById('loading-stats');
        const results = document.getElementById('stats-results');
        const login = document.getElementById('login-section');

        if(login) login.style.display = 'none';
        if(loading) loading.style.display = 'block';
        if(results) results.style.display = 'block';

        const endpoint = type === 'artists' ? 'artists' : 'tracks';
        title.innerText = type === 'artists' ? 'Tus Artistas Top' : 'Tus Canciones Top';

        try {
            const res = await fetch(`https://api.spotify.com/v1/me/top/${endpoint}?limit=20`, {
                headers: { 'Authorization': `Bearer ${window.spotifyToken}` }
            });
            const data = await res.json();
            
            grid.innerHTML = data.items.map(item => {
                const img = type === 'artists' ? item.images[0].url : item.album.images[0].url;
                const info = type === 'artists' ? item.genres.slice(0,2).join(', ') : item.artists[0].name;
                return `
                    <div class="feature-card">
                        <img src="${img}" style="width: 100%; border-radius: 12px; margin-bottom: 1rem;">
                        <h3>${item.name}</h3>
                        <p style="font-size: 0.8rem; color: #6c63ff;">${info}</p>
                    </div>`;
            }).join('');
            
            loading.style.display = 'none';
            // Re-aplicar efecto 3D si lo tienes
        } catch (err) {
            console.error("Error API:", err);
        }
    };

    // AUXILIARES
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

// FUNCIÓN PARA EL BOTÓN DEL HTML
function changeTab(type) {
    if (window.spotifyToken) window.loadSpotifyData(type);
}