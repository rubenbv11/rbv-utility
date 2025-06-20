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

  // Cursor personalizado
  const cursor = document.querySelector('.custom-cursor');

  if (cursor) {
    document.addEventListener('mousemove', e => {
      requestAnimationFrame(() => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        cursor.style.transition = 'none';
      });
    });

    document.addEventListener('mousedown', () => {
      cursor.classList.add('expand');
    });

    document.addEventListener('mouseup', () => {
      cursor.classList.remove('expand');
    });
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