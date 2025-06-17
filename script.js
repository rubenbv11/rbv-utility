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

      fetch('https://formspree.io/f/mkgbrnvo',  {
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
}); 

// === Resumen Spotify ===
const resumenForm = document.getElementById('resumenForm');
const resumenMessage = document.getElementById('message');

if (resumenForm && resumenMessage) {
  resumenForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const tipoResumen = document.getElementById('tipoResumen').value;

    // Validación básica del correo
    if (!email || !email.includes('@')) {
      resumenMessage.textContent = 'Por favor introduce un correo válido.';
      resumenMessage.className = 'message error';
      return;
    }

    // Validar tipo de resumen
    if (!['semanal', 'mensual', 'anual'].includes(tipoResumen)) {
      resumenMessage.textContent = 'Tipo de resumen inválido.';
      resumenMessage.className = 'message error';
      return;
    }

    try {
      // Crear objeto state
      const stateObject = { 
        email: email, 
        tipoResumen: tipoResumen,
        timestamp: Date.now() // Agregar timestamp para debug
      };
      
      // Codificar en base64
      const stateJson = JSON.stringify(stateObject);
      const state = btoa(stateJson);
      
      console.log('State object:', stateObject);
      console.log('State JSON:', stateJson);
      console.log('State encoded:', state);

      // Verificar que el state se puede decodificar
      const testDecode = JSON.parse(atob(state));
      console.log('Test decode:', testDecode);

      // Construir URL de autorización
      const clientId = 'c54d0fa62f254d86b2735844b1690a50';
      const redirectUri = 'https://n8n.rbv-utility.es/webhook/oauth/spotify/callback';
      const scopes = 'user-top-read';
      
      const authUrl = new URL('https://accounts.spotify.com/authorize');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', scopes);
      authUrl.searchParams.set('state', state);
      
      console.log('Auth URL:', authUrl.toString());

      // Mostrar mensaje de carga
      resumenMessage.textContent = 'Redirigiendo a Spotify...';
      resumenMessage.className = 'message info';

      // Redirigir a Spotify
      window.location.href = authUrl.toString();
      
    } catch (error) {
      console.error('Error al generar state:', error);
      resumenMessage.textContent = 'Error al procesar la solicitud. Inténtalo de nuevo.';
      resumenMessage.className = 'message error';
    }
  });
}

// Función para debug - verificar parámetros URL al cargar
document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  console.log('URL params on load:', Object.fromEntries(urlParams));
  
  // Si hay parámetros de error de Spotify
  if (urlParams.get('error')) {
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    console.error('Spotify OAuth error:', error, errorDescription);
    
    if (resumenMessage) {
      resumenMessage.textContent = `Error de autorización: ${errorDescription || error}`;
      resumenMessage.className = 'message error';
    }
  }
});

