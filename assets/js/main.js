document.addEventListener('DOMContentLoaded', () => {

  // 1. Typing Effect Logic
  const typingElement = document.getElementById('typing-text');
  if (typingElement) {
    const roles = [
      "Data Analyst | AI & ML Engineer",
      "Certified Cloud Computing Specialist",
      "NLP & Deep Learning Expert",
      "AWS re:Invent 2025 Attendee"
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 100;

    function type() {
      const currentRole = roles[roleIndex];
      
      if (isDeleting) {
        typingElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typeDelay = 50;
      } else {
        typingElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typeDelay = 100;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        typeDelay = 2000; // Pause at end of sentence
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeDelay = 500; // Pause before typing new sentence
      }

      setTimeout(type, typeDelay);
    }
    
    // Start typing effect slightly delayed to allow fade in
    setTimeout(() => {
        typingElement.style.opacity = '1';
        type();
    }, 1200);
  }

  // 2. Intersection Observer for Scroll Animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        
        // Trigger progress bars if it's the skills section
        if (entry.target.classList.contains('skills-container')) {
          const progressBars = entry.target.querySelectorAll('.progress-fill');
          progressBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width;
          });
        }
        
        scrollObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    scrollObserver.observe(el);
  });

  // 3. 3D Tilt Effect on Glass Cards
  const cards = document.querySelectorAll('.glass-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element
      const y = e.clientY - rect.top; // y position within the element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg rotation
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'none';
      card.style.borderColor = 'rgba(46, 158, 247, 0.4)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease';
      card.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    });
  });

});
