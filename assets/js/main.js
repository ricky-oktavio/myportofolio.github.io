/**
* Ricky Oktavio Adi Pranata - Personal Portfolio JavaScript
* Handles navigation, header scrolling, portfolio filters, and lightboxes.
*/
(function() {
  "use strict";

  /**
   * Helper selector function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  /**
   * Helper event listener
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  /**
   * Header scroll class toggle
   */
  const headerScrolled = () => {
    let selectHeader = select('#header');
    if (selectHeader) {
      if (window.scrollY > 50) {
        selectHeader.classList.add('header-scrolled');
      } else {
        selectHeader.classList.remove('header-scrolled');
      }
    }
  };

  window.addEventListener('load', headerScrolled);
  document.addEventListener('scroll', headerScrolled);

  /**
   * Mobile navigation toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile');
    this.classList.toggle('bi-list');
    this.classList.toggle('bi-x');
  });

  /**
   * Smooth scroll on link click
   */
  on('click', '.nav-link, .btn-gradient', function(e) {
    let hash = this.hash;
    if (hash && select(hash)) {
      e.preventDefault();

      let navbar = select('#navbar');
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile');
        let navbarToggle = select('.mobile-nav-toggle');
        navbarToggle.classList.toggle('bi-list');
        navbarToggle.classList.toggle('bi-x');
      }

      let element = select(hash);
      let header = select('#header');
      let offset = header.offsetHeight;

      let elementPosition = element.offsetTop;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  }, true);

  /**
   * Active nav state on scroll (Scrollspy)
   */
  const navLinks = select('.navbar .nav-link', true);
  const sections = select('section', true);

  const activateNavOnScroll = () => {
    let position = window.scrollY + 200;
    sections.forEach(section => {
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + section.id) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  document.addEventListener('scroll', activateNavOnScroll);

  /**
   * Portfolio Isotope and Filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(el => el.classList.remove('filter-active'));
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
      }, true);
    }
  });

  /**
   * Initialize GLightbox
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

})();