try {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Particle Mesh Background
  if (!isReducedMotion) {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles = [];
    const particleCount = Math.floor(width / 28);
    let mouse = { x: null, y: null, radius: 140 };

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 1.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${Math.max(0, 0.12 - dist / 1100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // 2. Interactive Tilt Cards
  if (!isReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const tiltCards = document.querySelectorAll('.tilt-card, .card');
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // 3. Magnetic Hover Effect on Buttons
  if (!isReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // 4. Project Filtering
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.card');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.cat === filter) {
          card.classList.remove('hide');
        } else {
          card.classList.add('hide');
        }
      });
    });
  });

  // 5. Form Logic
  const pForm = document.getElementById('project-form');
  if (pForm) {
    pForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('pf-status');
      const btn = document.getElementById('pf-submit');
      const endpoint = pForm.getAttribute('action');

      if (!endpoint || endpoint.includes('YOUR_FORM_ID')) {
        status.textContent = 'Form configuration pending. Please contact unaizaali888@gmail.com directly.';
        status.className = 'form-status mono err';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Transmitting...';
      status.textContent = '';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(pForm),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          status.textContent = 'Thank you. Your message has been transmitted successfully.';
          status.className = 'form-status mono ok';
          pForm.reset();
        } else {
          throw new Error('Submission failure');
        }
      } catch (err) {
        status.textContent = 'An error occurred. Please email unaizaali888@gmail.com directly.';
        status.className = 'form-status mono err';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Submit Project Brief →';
      }
    });
  }

  // 6. Scroll Reveal Observer
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  // Trigger hero reveal
  document.querySelectorAll('.hero .reveal, .hero .reveal-stagger').forEach(el => {
    requestAnimationFrame(() => el.classList.add('in-view'));
  });

} catch (e) {
  document.documentElement.classList.remove('js-ready');
  console.error('Portfolio initialization error:', e);
}

setTimeout(() => {
  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('in-view'));
}, 2000);
