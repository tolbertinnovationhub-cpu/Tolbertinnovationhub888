document.querySelectorAll('form.form-card').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const feedback = form.querySelector('.form-feedback');
    const message = form.dataset.successMessage || 'Form submitted successfully.';

    if (!form.checkValidity()) {
      feedback.textContent = 'Please complete all required fields before submitting.';
      feedback.style.color = '#b42318';
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const entries = Object.fromEntries(data.entries());
    console.log('Form submission preview:', entries);

    feedback.textContent = message;
    feedback.style.color = '#0b5a32';
    form.reset();
  });
});

const navWrap = document.querySelector('.nav-wrap');
const navLinks = navWrap?.querySelector('.nav-links');
const siteHeader = document.querySelector('.site-header');

const newsPosts = [
  {
    title: '2026 Scholarship Intake Opens for Qualified Applicants',
    date: 'March 8, 2026',
    category: 'Scholarships',
    summary: 'Applications are now open with updated document requirements, guidance sessions, and admission support timelines.',
    href: 'news-scholarship-2026.html',
    image: 'https://i.ibb.co/JW664n2y/Chat-GPT-Image-Mar-8-2026-12-00-34-PM.png',
    imageAlt: 'Students celebrating scholarship opportunities'
  },
  {
    title: 'IELTS Mock Exam Certificate Request System Launched',
    date: 'March 8, 2026',
    category: 'Announcements',
    summary: 'Students who complete IELTS mock exams can now request certificate processing through the new dedicated certificate workflow.',
    href: 'news-ielts-certificate-system.html',
    image: 'https://i.ibb.co/5W4FhDnH/Chat-GPT-Image-Mar-8-2026-08-38-03-PM-1.png',
    imageAlt: 'IELTS classroom completion and certificate announcement'
  },
  {
    title: 'Healthcare Referral Program Expansion Update',
    date: 'March 8, 2026',
    category: 'Healthcare Programs',
    summary: 'Tolbert Innovation Hub has expanded healthcare referral support pathways for families seeking treatment coordination in India.',
    href: 'news-healthcare-referral-expansion.html',
    image: 'https://i.ibb.co/PZtxGS1X/Chat-GPT-Image-Mar-8-2026-01-03-34-PM.png',
    imageAlt: 'Healthcare support and treatment coordination update'
  },
  {
    title: 'Technology Innovation Support for Liberian Businesses',
    date: 'March 8, 2026',
    category: 'Technology Programs',
    summary: 'New technology consultation support helps businesses modernize operations with websites, platforms, and digital process tools.',
    href: 'news-technology-support-2026.html',
    image: 'https://i.ibb.co/wFnGC1NQ/Chat-GPT-Image-Mar-8-2026-12-25-09-PM.png',
    imageAlt: 'Technology innovation and software support update'
  }
];

function renderLatestUpdates() {
  const container = document.querySelector('[data-latest-news]');
  if (!container) return;

  container.innerHTML = newsPosts
    .slice(0, 3)
    .map((post) => `
      <article class="card news-card">
        <img class="news-card-image" src="${post.image}" alt="${post.imageAlt}" loading="lazy" />
        <p class="news-meta">${post.date}</p>
        <p class="news-category">${post.category}</p>
        <h3>${post.title}</h3>
        <p>${post.summary}</p>
        <a class="card-link" href="${post.href}">Read More →</a>
      </article>
    `)
    .join('');
}

function injectFooterFeaturedNews() {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;
  if (footer.querySelector('[data-featured-news-footer]')) return;

  const footerGrid = footer.querySelector('.footer-grid');
  if (footerGrid) {
    const card = document.createElement('div');
    card.setAttribute('data-featured-news-footer', 'true');
    card.innerHTML = '<h3>Featured News</h3><p><a href="news.html">Read the latest updates from Tolbert Innovation Hub</a></p>';
    footerGrid.appendChild(card);
    return;
  }

  const container = footer.querySelector('.container') || footer;
  const paragraph = document.createElement('p');
  paragraph.setAttribute('data-featured-news-footer', 'true');
  paragraph.innerHTML = '<a href="news.html">Featured News: Read the latest updates</a>';
  container.appendChild(paragraph);
}

function injectFooterCourseQuickLinks() {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;
  if (footer.querySelector('[data-course-quick-links-footer]')) return;

  const linksMarkup = [
    '<h3>New Courses</h3>',
    '<p><a href="programming-fundamentals.html">Programming Fundamentals</a></p>',
    '<p><a href="microsoft-office-skills.html">Microsoft Office Skills</a></p>',
    '<p><a href="internet-and-email-skills.html">Internet and Email Skills</a></p>'
  ].join('');

  const footerGrid = footer.querySelector('.footer-grid');
  if (footerGrid) {
    const card = document.createElement('div');
    card.setAttribute('data-course-quick-links-footer', 'true');
    card.innerHTML = linksMarkup;
    footerGrid.appendChild(card);
    return;
  }

  const container = footer.querySelector('.container') || footer;
  const block = document.createElement('div');
  block.setAttribute('data-course-quick-links-footer', 'true');
  block.innerHTML = linksMarkup;
  container.appendChild(block);
}

function wireAutoHideHeader() {
  if (!siteHeader) return;

  let lastScrollY = window.scrollY;
  const threshold = 8;

  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;
    const menuOpen = navWrap?.classList.contains('nav-open');

    if (currentY <= 40 || menuOpen) {
      siteHeader.classList.remove('header-hidden');
      lastScrollY = currentY;
      return;
    }

    if (delta > threshold) {
      siteHeader.classList.add('header-hidden');
    } else if (delta < -threshold) {
      siteHeader.classList.remove('header-hidden');
    }

    lastScrollY = currentY;
  }, { passive: true });
}

const courseSlugToLessonSlug = {
  'ielts-preparation': 'ielts',
  'toefl-preparation': 'toefl',
  'scholarship-application-training': 'scholarship',
  'website-development': 'website-development',
  'computer-basics': 'computer-basics',
  'business-startup-training': 'business-startup'
};

function getLessonNumberFromPath(path) {
  const match = path.match(/\/lesson-(\d+)-/i);
  return match ? Number(match[1]) : null;
}

function trackLessonProgress() {
  const currentPath = window.location.pathname.toLowerCase();
  const parts = currentPath.split('/').filter(Boolean);
  const lessonsIndex = parts.indexOf('lessons');
  if (lessonsIndex === -1) return;

  const lessonCourseSlug = parts[lessonsIndex + 1];
  const lessonNumber = getLessonNumberFromPath(currentPath);
  if (!lessonCourseSlug || !lessonNumber) return;

  const key = `learningProgress:${lessonCourseSlug}`;
  const previous = Number(localStorage.getItem(key) || 0);
  const next = Math.max(previous, lessonNumber);
  localStorage.setItem(key, String(next));
}

function updateCourseProgressView() {
  const currentPath = window.location.pathname.toLowerCase();
  const parts = currentPath.split('/').filter(Boolean);
  const coursesIndex = parts.indexOf('courses');
  if (coursesIndex === -1) return;

  const courseSlug = parts[coursesIndex + 1];
  if (!courseSlug) return;

  const lessonSlug = courseSlugToLessonSlug[courseSlug];
  if (!lessonSlug) return;

  const progressItems = document.querySelectorAll('.progress-list li');
  if (!progressItems.length) return;

  const savedProgress = Number(localStorage.getItem(`learningProgress:${lessonSlug}`) || 0);

  progressItems.forEach((item) => {
    const link = item.querySelector('a[href*="lesson-"]');
    if (!link) return;

    const href = link.getAttribute('href') || '';
    const lessonNumber = getLessonNumberFromPath(href);
    if (!lessonNumber) return;

    const isCompleted = lessonNumber <= savedProgress;

    item.classList.toggle('is-complete', isCompleted);
    item.classList.toggle('is-pending', !isCompleted);
    item.innerHTML = `${link.outerHTML} ${isCompleted ? '✓' : '☐'}`;
  });

  const progressList = document.querySelector('.progress-list');
  const progressCard = progressList?.closest('.learning-block');
  if (progressCard && !progressCard.querySelector('[data-reset-progress]')) {
    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'btn btn-secondary progress-reset-btn';
    resetButton.textContent = 'Reset Progress';
    resetButton.setAttribute('data-reset-progress', 'true');

    resetButton.addEventListener('click', () => {
      const shouldReset = window.confirm('Are you sure you want to reset your course progress?');
      if (!shouldReset) return;
      localStorage.removeItem(`learningProgress:${lessonSlug}`);
      updateCourseProgressView();
    });

    progressCard.appendChild(resetButton);
  }
}

if (navWrap && navLinks) {
  if (!navLinks.id) {
    navLinks.id = 'primary-navigation';
  }

  const isMainNavigation = navLinks.getAttribute('aria-label') === 'Main navigation';
  const homeLink = navLinks.querySelector('a[href$="index.html"]');
  const homeHref = homeLink?.getAttribute('href') || 'index.html';
  const basePrefix = homeHref.replace(/index\.html(?:[#?].*)?$/i, '');

  if (isMainNavigation && !navLinks.querySelector('a[href*="learning"]')) {
    const learningLink = document.createElement('a');
    learningLink.href = `${basePrefix}learning/`;
    learningLink.textContent = 'Learning Hub';

    if (homeLink?.nextSibling) {
      homeLink.insertAdjacentElement('afterend', learningLink);
    } else if (homeLink) {
      navLinks.append(learningLink);
    } else {
      navLinks.prepend(learningLink);
    }
  }

  if (isMainNavigation && !navLinks.querySelector('a[href*="materials"]')) {
    const materialsLink = document.createElement('a');
    materialsLink.href = `${basePrefix}materials/`;
    materialsLink.textContent = 'Materials';
    const learningNav = navLinks.querySelector('a[href*="learning"]');

    if (learningNav?.nextSibling) {
      learningNav.insertAdjacentElement('afterend', materialsLink);
    } else if (learningNav) {
      navLinks.append(materialsLink);
    } else if (homeLink?.nextSibling) {
      homeLink.insertAdjacentElement('afterend', materialsLink);
    } else if (homeLink) {
      navLinks.append(materialsLink);
    } else {
      navLinks.prepend(materialsLink);
    }
  }

  if (isMainNavigation && !navLinks.querySelector('a[href$="news.html"]')) {
    const newsLink = document.createElement('a');
    newsLink.href = `${basePrefix}news.html`;
    newsLink.textContent = 'News';
    const learningNav = navLinks.querySelector('a[href*="learning"]');
    const materialsNav = navLinks.querySelector('a[href*="materials"]');
    if (materialsNav?.nextSibling) {
      materialsNav.insertAdjacentElement('afterend', newsLink);
    } else if (materialsNav) {
      navLinks.append(newsLink);
    } else if (learningNav?.nextSibling) {
      learningNav.insertAdjacentElement('afterend', newsLink);
    } else if (learningNav) {
      navLinks.append(newsLink);
    } else if (homeLink?.nextSibling) {
      homeLink.insertAdjacentElement('afterend', newsLink);
    } else if (homeLink) {
      navLinks.append(newsLink);
    } else {
      navLinks.prepend(newsLink);
    }
  }

  if (isMainNavigation && !navLinks.querySelector('a[href$="courses.html"]')) {
    const coursesLink = document.createElement('a');
    coursesLink.href = `${basePrefix}courses.html`;
    coursesLink.textContent = 'Courses';

    const newsNav = navLinks.querySelector('a[href$="news.html"]');
    if (newsNav?.nextSibling) {
      newsNav.insertAdjacentElement('afterend', coursesLink);
    } else if (newsNav) {
      navLinks.append(coursesLink);
    } else {
      navLinks.append(coursesLink);
    }
  }

  const currentPath = window.location.pathname.toLowerCase();
  const pathLeaf = currentPath.split('/').filter(Boolean).pop() || '';
  const isNewsPage = pathLeaf === 'news' || pathLeaf === 'news.html' || /^news-.*\.html$/i.test(pathLeaf);
  const isLearningPage = pathLeaf === 'learning' || pathLeaf === 'index.html' && /\/learning\//.test(currentPath) || /\/learning\/?$/.test(currentPath);
  const isMaterialsPage = pathLeaf === 'materials' || pathLeaf === 'index.html' && /\/materials\//.test(currentPath) || /\/materials\/?$/.test(currentPath);
  const isCoursesPage = pathLeaf === 'courses' || pathLeaf === 'courses.html' || [
    'programming-fundamentals.html',
    'microsoft-office-skills.html',
    'internet-and-email-skills.html'
  ].includes(pathLeaf);

  if (isNewsPage || isLearningPage || isMaterialsPage || isCoursesPage) {
    navLinks.querySelectorAll('a').forEach((link) => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    if (isNewsPage) {
      const newsNav = navLinks.querySelector('a[href$="news.html"]');
      if (newsNav) {
        newsNav.classList.add('active');
        newsNav.setAttribute('aria-current', 'page');
      }
    }

    if (isLearningPage) {
      const learningNav = navLinks.querySelector('a[href*="learning"]');
      if (learningNav) {
        learningNav.classList.add('active');
        learningNav.setAttribute('aria-current', 'page');
      }
    }

    if (isMaterialsPage) {
      const materialsNav = navLinks.querySelector('a[href*="materials"]');
      if (materialsNav) {
        materialsNav.classList.add('active');
        materialsNav.setAttribute('aria-current', 'page');
      }
    }

    if (isCoursesPage) {
      const coursesNav = navLinks.querySelector('a[href$="courses.html"]');
      if (coursesNav) {
        coursesNav.classList.add('active');
        coursesNav.setAttribute('aria-current', 'page');
      }
    }
  }

  const brand = navWrap.querySelector('.brand');
  if (brand && !brand.querySelector('.brand-logo')) {
    const brandText = brand.textContent.trim();
    brand.textContent = '';

    const logo = document.createElement('img');
    logo.className = 'brand-logo';
    logo.src = 'https://i.ibb.co/SXJKRq0S/Tolbert-Innovation-Logo.jpg';
    logo.alt = 'Tolbert Innovation Hub logo';
    logo.width = 48;
    logo.height = 48;

    const text = document.createElement('span');
    text.className = 'brand-text';
    text.textContent = brandText || 'Tolbert Innovation Hub';

    brand.append(logo, text);
  }

  let menuButton = navWrap.querySelector('.menu-toggle');
  if (!menuButton) {
    menuButton = document.createElement('button');
    menuButton.type = 'button';
    menuButton.className = 'menu-toggle';
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-controls', navLinks.id);
    menuButton.setAttribute('aria-label', 'Toggle navigation menu');
    menuButton.innerHTML = '<span aria-hidden="true">☰</span> Menu';

    if (brand) {
      brand.insertAdjacentElement('afterend', menuButton);
    } else {
      navWrap.prepend(menuButton);
    }
  }

  const closeMenu = () => {
    navWrap.classList.remove('nav-open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.addEventListener('click', () => {
    const shouldOpen = !navWrap.classList.contains('nav-open');
    navWrap.classList.toggle('nav-open', shouldOpen);
    menuButton.setAttribute('aria-expanded', String(shouldOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 920) closeMenu();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 920) {
      closeMenu();
    }
  });
}

wireAutoHideHeader();
renderLatestUpdates();
injectFooterFeaturedNews();
injectFooterCourseQuickLinks();
trackLessonProgress();
updateCourseProgressView();
