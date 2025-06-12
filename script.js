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

 // Validación formulario - Resumen Spotify
const resumenForm = document.getElementById('resumenForm');
const resumenMessage = document.getElementById('message');

if (resumenForm && resumenMessage) {
  resumenForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = resumenForm.email.value.trim();
    if (!email || !email.includes('@')) {
      resumenMessage.textContent = 'Por favor introduce un correo válido.';
      resumenMessage.className = 'message error';
      return;
    }

    resumenMessage.textContent = 'Solicitando resumen...';
    resumenMessage.className = 'message';

    // Enviar datos al webhook de n8n
      fetch("https://n8n.rbv-utility.es/webhook/spotify-summary",  {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: resumenForm.email.value.trim(),
          tipoResumen: resumenForm.tipoResumen.value 
        })
      })
    .then(response => response.json())
    .then(data => {
      console.log("Respuesta de n8n:", data);
      resumenMessage.textContent = "¡Resumen solicitado! Revisa tu correo pronto.";
      resumenMessage.className = "message success";
      resumenForm.reset();
    })
    .catch(error => {
      console.error("Error al enviar:", error);
      resumenMessage.textContent = "Hubo un problema. Inténtalo más tarde.";
      resumenMessage.className = "message error";
    });
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