// ========================================
// D Ozen - Landing Page JavaScript
// ========================================

const cards = document.querySelectorAll(".h-card");

window.addEventListener("mousemove", (e) => {
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--x", `${x}px`);
    card.style.setProperty("--y", `${y}px`);

    // Distancia del cursor al borde de la tarjeta
    const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
    const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
    const distance = Math.hypot(dx, dy);

    const radius = 500;
    const opacity = Math.max(0, 1 - distance / radius);

    card.style.setProperty("--glow-opacity", opacity);
  });
});

document.addEventListener('DOMContentLoaded', function () {
  // ========================================
  // Language Toggle
  // ========================================
  const langToggle = document.getElementById('langToggle');
  let currentLang = 'es';

  langToggle.addEventListener('click', function () {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    updateLanguage();
    updateLangToggleUI();
  });

  function updateLangToggleUI() {
    const active = langToggle.querySelector('.lang-active');
    const inactive = langToggle.querySelector('.lang-inactive');

    if (currentLang === 'es') {
      active.textContent = 'ES';
      inactive.textContent = 'EN';
    } else {
      active.textContent = 'EN';
      inactive.textContent = 'ES';
    }
  }

  function updateLanguage() {
    const elements = document.querySelectorAll('[data-es][data-en]');
    elements.forEach(el => {
      const text = el.getAttribute(`data-${currentLang}`);
      if (text) {
        el.textContent = text;
      }
    });

    // Update HTML lang attribute
    document.documentElement.lang = currentLang;

    // Update calendar weekdays
    updateCalendarWeekdays();
  }

  function updateCalendarWeekdays() {
    const weekdaysContainer = document.querySelector('.calendar-weekdays');
    if (weekdaysContainer) {
      const weekdaysES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const weekdaysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekdays = currentLang === 'es' ? weekdaysES : weekdaysEN;

      weekdaysContainer.innerHTML = weekdays.map(day => `<span>${day}</span>`).join('');
    }
  }

  // ========================================
  // Mobile Menu
  // ========================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  mobileMenuBtn.addEventListener('click', function () {
    navLinks.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
  });

  // Close mobile menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileMenuBtn.classList.remove('active');
    });
  });

  // ========================================
  // Form Submission
  // ========================================
  const contactForm = document.getElementById('contactForm');

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate date and time selection
    if (!selectedDateInput.value) {
      alert(currentLang === 'es' ? 'Por favor selecciona una fecha' : 'Please select a date');
      return;
    }

    if (!selectedTimeInput.value) {
      alert(currentLang === 'es' ? 'Por favor selecciona una hora' : 'Please select a time');
      return;
    }

    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    // Here you would typically send the data to a server
    console.log('Form submitted:', data);

    // Show success message
    const successMsg = currentLang === 'es'
      ? '¡Gracias! Tu cita ha sido agendada. Te contactaremos pronto.'
      : 'Thank you! Your appointment has been scheduled. We will contact you soon.';

    alert(successMsg);

    // Reset form
    contactForm.reset();
    selectedDate = null;
    selectedTime = null;
    calendarDays.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
    timeSlots.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    renderCalendar();
  });

  // ========================================
  // Smooth Scroll for Navigation Links
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ========================================
  // Scroll Animations
  // ========================================
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe sections for scroll animations
  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(section);
  });

  // Make hero visible immediately
  document.querySelector('.hero').style.opacity = '1';
  document.querySelector('.hero').style.transform = 'translateY(0)';

  // ========================================
  // Navbar Background on Scroll
  // ========================================
  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(0, 0, 0, 0.95)';
    } else {
      navbar.style.background = 'rgba(0, 0, 0, 0.8)';
    }
  });
});
