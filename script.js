document.addEventListener("DOMContentLoaded", () => {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const modeIndicator = document.getElementById("modeIndicator");

  // Cargar estado guardado del modo oscuro
  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) {
    document.body.classList.add("dark");
    darkModeToggle.textContent = "☀️";
    if (modeIndicator) modeIndicator.textContent = "Modo Oscuro";
  } else {
    darkModeToggle.textContent = "🌙";
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

  // Validación formulario (solo si existe)
  const form = document.getElementById('resumenForm');
  const message = document.getElementById('message');

  if (form && message) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = form.email.value.trim();
      if (!email || !email.includes('@')) {
        message.textContent = 'Por favor introduce un correo válido.';
        message.className = 'message error';
        return;
      }

      message.textContent = 'Generando tu resumen...';
      message.className = 'message';

      setTimeout(() => {
        message.textContent = '¡Resumen solicitado con éxito! Revisa tu correo.';
        message.className = 'message success';
        form.reset();
      }, 2000);
    });
  }
});
// Cursor personalizado
const cursor = document.querySelector('.custom-cursor');

document.addEventListener('mousemove', e => {
  const { clientX: x, clientY: y } = e;
  if (cursor) {
    cursor.style.transform = `translate(${x}px, ${y}px)`;
  }
});

document.addEventListener('mousedown', () => {
  if (cursor) cursor.classList.add('expand');
});
document.addEventListener('mouseup', () => {
  if (cursor) cursor.classList.remove('expand');
});