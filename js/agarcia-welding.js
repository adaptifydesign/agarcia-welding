(function($) {
  "use strict";

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 80)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 100
  });

  // Collapse Navbar
  var navbarCollapse = function() {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-shrink");
    } else {
      $("#mainNav").removeClass("navbar-shrink");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);

})(jQuery);

// Gallery category filter
(function() {
  "use strict";

  var filters = document.querySelectorAll('.gallery-filter');
  var images = document.querySelectorAll('.gallery .gallery-container .images');

  function setActiveFilter(active) {
    filters.forEach(function(filter) {
      var isActive = filter === active;
      filter.classList.toggle('active', isActive);
      filter.setAttribute('aria-pressed', String(isActive));
    });
  }

  // Toggles a class rather than writing style.display. An inline display beats
  // every stylesheet rule, which stopped tiles that lay themselves out (the
  // awaiting-photo placeholders use flex centring) from keeping their own
  // display mode once they had been filtered.
  function showCategory(category) {
    images.forEach(function(image) {
      var visible = category === 'all' || image.dataset.class === category;
      image.classList.toggle('is-hidden', !visible);
    });
  }

  filters.forEach(function(filter) {
    filter.addEventListener('click', function() {
      setActiveFilter(filter);
      showCategory(filter.dataset.class);
    });
  });
})();

// Footer copyright year
(function() {
  var year = document.getElementById('current-year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }
})();

// Estimate form: post to Netlify in place so the visitor keeps their scroll
// position and sees the confirmation inline. Without fetch the form submits
// normally and Netlify serves its own thank-you page.
(function() {
  "use strict";

  var form = document.getElementById('estimate-form');
  if (!form || !window.fetch || !window.URLSearchParams) {
    return;
  }

  var success = document.getElementById('estimate-success');
  var error = document.getElementById('estimate-error');
  var button = form.querySelector('button[type="submit"]');
  var buttonLabel = button ? button.textContent : '';

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    if (error) {
      error.hidden = true;
    }
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending...';
    }

    fetch(form.getAttribute('action') || '/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function(response) {
      if (!response.ok) {
        throw new Error(response.status);
      }
      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.focus();
      }
    }).catch(function() {
      if (button) {
        button.disabled = false;
        button.textContent = buttonLabel;
      }
      if (error) {
        error.hidden = false;
      }
    });
  });
})();
