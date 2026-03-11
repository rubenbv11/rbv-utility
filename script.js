document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const modeIndicator = document.getElementById("modeIndicator");

  // Cargar estado del modo oscuro
  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) {
    document.body.classList.add("dark");
    if (darkModeToggle) darkModeToggle.textContent = "☀️";
    if (modeIndicator) modeIndicator.textContent = "Modo Oscuro";
  } else {
    if (darkModeToggle) darkModeToggle.textContent = "🌙";
    if (modeIndicator) modeIndicator.textContent = "Modo Claro";
  }

  // Cambiar modo al hacer clic
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const isNowDark = document.body.classList.contains("dark");
      localStorage.setItem("darkMode", isNowDark);
      darkModeToggle.textContent = isNowDark ? "☀️" : "🌙";
      if (modeIndicator) modeIndicator.textContent = isNowDark ? "Modo Oscuro" : "Modo Claro";
    });
  }

  // Ocultar loader al cargar
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
      loader.classList.add("hidden");
    }
  });

  // Menú desplegable
  const dropdownTrigger = document.querySelector('.dropdown-trigger');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  if (dropdownTrigger && dropdownMenu) {
    dropdownTrigger.addEventListener('click', () => {
      const expanded = dropdownTrigger.getAttribute('aria-expanded') === 'true';
      dropdownTrigger.setAttribute('aria-expanded', !expanded);
    });

    document.addEventListener('click', (e) => {
      if (!dropdownTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownTrigger.setAttribute('aria-expanded', false);
      }
    });
  }

  // Validación formulario - Contacto
  const contactForm = document.getElementById('contactForm');
  const contactMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const formData = new FormData(contactForm);

      fetch('https://formspree.io/f/mkgbrnvo', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      })
      .then(response => {
        if (response.ok) {
          contactForm.reset();
          if (contactMessage) contactMessage.style.display = 'block';
          if (errorMessage) errorMessage.style.display = 'none';
        } else {
          response.json().then(json => {
            console.error(json);
            if (errorMessage) errorMessage.style.display = 'block';
            if (contactMessage) contactMessage.style.display = 'none';
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        if (errorMessage) errorMessage.style.display = 'block';
        if (contactMessage) contactMessage.style.display = 'none';
      });
    });
  }

// ==========================================
// 1. CURSOR PREMIUM (Punto + Anillo con retraso)
// ==========================================
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline) {
  let outlineX = 0;
  let outlineY = 0;
  let targetX = 0;
  let targetY = 0;

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    
    // El punto sigue al instante
    cursorDot.style.transform = `translate(${targetX}px, ${targetY}px)`;
  });

  // Animación suave para el anillo (efecto inercia)
  function renderCursor() {
    outlineX += (targetX - outlineX) * 0.15;
    outlineY += (targetY - outlineY) * 0.15;
    cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();
}

// ==========================================
// 2. TARJETAS 3D Y LUZ GLOW (Efecto Apple)
// ==========================================
const cards = document.querySelectorAll('.feature-card');

cards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.
    
    // Calcula la rotación 3D
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10; // Máximo 10 grados
    const rotateY = ((x - centerX) / centerX) * 10;

    // Aplica la transformación y mueve el foco de luz
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });

  card.addEventListener('mouseleave', () => {
    // Vuelve a su sitio suavemente
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    card.style.transition = 'transform 0.5s ease';
  });

  card.addEventListener('mouseenter', () => {
    // Quita la transición al entrar para que el 3D sea instantáneo
    card.style.transition = 'none';
  });
});

// ==========================================
// 3. EASTER EGG (M A T R I X)
// ==========================================
let secretCode = "matrix";
let inputBuffer = "";

document.addEventListener("keydown", (e) => {
  inputBuffer += e.key.toLowerCase();
  
  // Mantener el buffer del tamaño de la palabra secreta
  if (inputBuffer.length > secretCode.length) {
    inputBuffer = inputBuffer.substring(1);
  }
  
  if (inputBuffer === secretCode) {
    activarModoMatrix();
  }
});

function activarModoMatrix() {
  // Cambia todo a negro y verde hacker
  document.body.style.backgroundColor = "#000";
  document.body.style.color = "#0f0";
  
  const textos = document.querySelectorAll("h1, h2, h3, p, span, a");
  textos.forEach(txt => {
    txt.style.color = "#0f0";
    txt.style.fontFamily = "monospace";
    txt.style.textShadow = "0 0 5px #0f0";
  });

  // Ocultar círculos bonitos
  const circulos = document.querySelector(".bg-circles");
  if(circulos) circulos.style.display = "none";

  alert("Neo... El servidor R² ha sido desbloqueado.");
}

  // === INICIALIZAR SPOTIFY AL CARGAR LA PÁGINA ===
  initializeSpotifyForm();
  handleOAuthResponse();
}); 

// === INICIALIZAR FORMULARIO SPOTIFY ===
function initializeSpotifyForm() {
  const resumenForm = document.getElementById('resumenForm');
  const resumenMessage = document.getElementById('message');

  if (resumenForm && resumenMessage) {
    resumenForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const email = document.getElementById('email');
      const tipoResumen = document.getElementById('tipoResumen');
      
      // Verificar que los elementos existen
      if (!email || !tipoResumen) {
        console.error('Elementos del formulario no encontrados');
        showMessage('Error: Formulario no configurado correctamente.', 'error');
        return;
      }

      const emailValue = email.value.trim();
      const tipoResumenValue = tipoResumen.value;

      // Validación básica del correo
      if (!emailValue || !emailValue.includes('@')) {
        showMessage('Por favor introduce un correo válido.', 'error');
        return;
      }

      // Validar tipo de resumen
      if (!['semanal', 'mensual', 'anual'].includes(tipoResumenValue)) {
        showMessage('Tipo de resumen inválido.', 'error');
        return;
      }

      // Mostrar mensaje de procesamiento
      showMessage('Redirigiendo a Spotify para autorización...', 'info');

      // Redirigir directamente a Spotify OAuth
      setTimeout(() => {
        redirectToSpotifyOAuth(emailValue, tipoResumenValue);
      }, 1000);
    });
  }
}

// === FUNCIÓN PARA MOSTRAR MENSAJES ===
function showMessage(text, type) {
  const resumenMessage = document.getElementById('message');
  if (resumenMessage) {
    resumenMessage.textContent = text;
    resumenMessage.className = `message ${type}`;
  }
}

// === FUNCIÓN PARA REDIRIGIR A SPOTIFY OAUTH ===
function redirectToSpotifyOAuth(email, tipoResumen) {
  try {
    const stateObject = { 
      email: email, 
      tipoResumen: tipoResumen,
      timestamp: Date.now()
    };
    
    const stateJson = JSON.stringify(stateObject);
    const state = btoa(stateJson); // Codificar en base64
    
    console.log('Redirecting to Spotify OAuth with state:', state);

    const clientId = 'c54d0fa62f254d86b2735844b1690a50'; // Tu Client ID real
    const redirectUri = 'https://n8n.rbv-utility.es/webhook/oauth/spotify/callback';
    const scopes = 'user-top-read user-read-email';
    
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('show_dialog', 'true'); // Forzar pantalla de autorización
    
    // Redirigir inmediatamente
    window.location.href = authUrl.toString();
    
  } catch (error) {
    console.error('Error en OAuth redirect:', error);
    showMessage('Error al procesar la solicitud. Inténtalo de nuevo.', 'error');
  }
}

// === FUNCIÓN PARA MANEJAR RESPUESTA DE OAUTH ===
function handleOAuthResponse() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Si hay código de autorización de Spotify
  if (urlParams.get('code')) {
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    console.log('Received OAuth code:', code);
    console.log('Received state:', state);
    
    showMessage('✅ Autorización exitosa. Procesando tu resumen...', 'info');
    
    // Limpiar URL sin recargar
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
    
    // Simular proceso de carga
    let dots = 0;
    const loadingInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      const dotString = '.'.repeat(dots);
      showMessage(`🎵 Analizando tu música${dotString}`, 'info');
    }, 500);
    
    // Después de 8 segundos mostrar mensaje de éxito
    setTimeout(() => {
      clearInterval(loadingInterval);
      showMessage('🎉 ¡Resumen enviado a tu correo! Revisa tu bandeja de entrada.', 'success');
    }, 8000);
  }
  
  // Si hay error de OAuth
  if (urlParams.get('error')) {
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    console.error('Spotify OAuth error:', error, errorDescription);
    
    let errorMsg = 'Error de autorización de Spotify.';
    
    if (error === 'access_denied') {
      errorMsg = 'Autorización cancelada. Necesitas dar permisos para generar el resumen.';
    } else if (errorDescription) {
      errorMsg = `Error: ${errorDescription}`;
    }
    
    showMessage(errorMsg, 'error');
    
    // Limpiar URL
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }
}