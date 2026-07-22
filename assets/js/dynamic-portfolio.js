/**
* Dynamic Portfolio Renderer for Ricky Oktavio Portfolio (index.html)
* Binds live data from Firebase Firestore & LocalStorage to index.html UI
*/

import { 
  getPortfolioDataFromFirebase, 
  subscribeToFirebaseChanges 
} from "./firebase-service.js";

const LOCAL_STORAGE_KEY = "ricky_portfolio_cms_data";

// Fallback Default Data
const DEFAULT_DATA = {
  profile: {
    fullName: "Ricky Oktavio Adi Pranata",
    headline: "Senior Mobile Engineer • Flutter & Dart Specialist",
    statusBadge: "Available for Freelance & Full-time",
    bio: "Passionate Mobile Engineer from Malang, Indonesia with 3+ years of experience building high-performance cross-platform applications using Flutter, Clean Architecture, BLoC, and GetX.",
    location: "Malang City, East Java, Indonesia",
    email: "adioktav1997@gmail.com",
    phone: "+6285171115997",
    experienceYears: "3+",
    appsShipped: "7+",
    cleanCode: "100%",
    socials: {
      github: "https://github.com/ricky-oktavio?tab=repositories",
      linkedin: "https://www.linkedin.com/in/ricky-oktavio-adi-pranata-b27aa61b8/",
      telegram: "https://t.me/rckycrk",
      whatsapp: "https://wa.me/6285171115997"
    }
  },
  projects: [],
  experiences: [],
  skills: []
};

function getLocalData() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_DATA;
}

export function updatePortfolioUI(data) {
  if (!data) return;

  const profile = data.profile || DEFAULT_DATA.profile;

  // 1. Hero & Profile Texts
  const statusBadge = document.getElementById("hero-status-badge");
  if (statusBadge && profile.statusBadge) statusBadge.textContent = profile.statusBadge;

  const heroName = document.getElementById("hero-name");
  if (heroName && profile.fullName) heroName.textContent = profile.fullName;

  const heroHeadline = document.getElementById("hero-headline");
  if (heroHeadline && profile.headline) heroHeadline.textContent = profile.headline;

  const heroBio = document.getElementById("hero-bio");
  if (heroBio && profile.bio) heroBio.textContent = profile.bio;

  const heroStatYears = document.getElementById("hero-stat-years");
  if (heroStatYears && profile.experienceYears) heroStatYears.textContent = profile.experienceYears + " Years";

  // 2. About Me Section & Info Items
  const aboutBioP1 = document.getElementById("about-bio-p1");
  if (aboutBioP1 && profile.bio) aboutBioP1.textContent = profile.bio;

  const aboutBioP2 = document.getElementById("about-bio-p2");
  if (aboutBioP2 && profile.bioP2) aboutBioP2.textContent = profile.bioP2;

  const aboutCity = document.getElementById("about-city");
  if (aboutCity && profile.location) aboutCity.textContent = profile.location;

  const aboutEmail = document.getElementById("about-email");
  if (aboutEmail && profile.email) {
    aboutEmail.textContent = profile.email;
    aboutEmail.href = "mailto:" + profile.email;
  }

  const aboutPhone = document.getElementById("about-phone");
  if (aboutPhone && profile.phone) {
    aboutPhone.textContent = profile.phone;
    aboutPhone.href = "tel:" + profile.phone;
  }

  const aboutDegree = document.getElementById("about-degree");
  if (aboutDegree && profile.degree) aboutDegree.textContent = profile.degree;

  // 3. Metrics
  const metricExpYears = document.getElementById("metric-exp-years");
  if (metricExpYears && profile.experienceYears) metricExpYears.textContent = profile.experienceYears;

  const metricApps = document.getElementById("metric-apps-shipped");
  if (metricApps && profile.appsShipped) metricApps.textContent = profile.appsShipped;

  const metricCleanCode = document.getElementById("metric-clean-code");
  if (metricCleanCode && profile.cleanCode) metricCleanCode.textContent = profile.cleanCode;

  const metricProblemSolving = document.getElementById("metric-problem-solving");
  if (metricProblemSolving && profile.problemSolving) metricProblemSolving.textContent = profile.problemSolving;

  // 4. Contact & Socials
  const socialGithub = document.querySelectorAll(".link-github");
  socialGithub.forEach(el => { if (profile.socials?.github) el.href = profile.socials.github; });

  const socialLinkedin = document.querySelectorAll(".link-linkedin");
  socialLinkedin.forEach(el => { if (profile.socials?.linkedin) el.href = profile.socials.linkedin; });

  const socialTelegram = document.querySelectorAll(".link-telegram");
  socialTelegram.forEach(el => { if (profile.socials?.telegram) el.href = profile.socials.telegram; });

  const socialWhatsapp = document.querySelectorAll(".link-whatsapp");
  socialWhatsapp.forEach(el => { if (profile.socials?.whatsapp) el.href = profile.socials.whatsapp; });

  // 4. Render Skills Grid
  if (data.skills && data.skills.length > 0) {
    const skillsContainer = document.getElementById("skills-container");
    if (skillsContainer) {
      skillsContainer.innerHTML = data.skills.map(sk => `
        <div class="tech-card">
          <div class="tech-icon"><i class="${sk.icon}"></i></div>
          <div class="tech-info">
            <h4>${sk.name}</h4>
            <p>${sk.subtext}</p>
          </div>
        </div>
      `).join("");
    }
  }

  // 5. Render Experiences Timeline
  if (data.experiences && data.experiences.length > 0) {
    const expContainer = document.getElementById("experience-timeline-container");
    if (expContainer) {
      expContainer.innerHTML = data.experiences.map(exp => `
        <div class="timeline-item">
          <span class="timeline-dot"></span>
          <div class="timeline-content">
            <h4 class="timeline-title">${exp.role}</h4>
            <div class="timeline-subtitle">${exp.company} • ${exp.location}</div>
            <span class="timeline-date">${exp.period}</span>
            <ul class="timeline-list">
              ${exp.bullets.map(b => `<li>${b}</li>`).join("")}
            </ul>
          </div>
        </div>
      `).join("");
    }
  }

  // 6. Render Projects Grid
  if (data.projects && data.projects.length > 0) {
    const projectsContainer = document.getElementById("portfolio-grid-container");
    if (projectsContainer) {
      projectsContainer.innerHTML = data.projects.map(proj => `
        <div class="col-lg-4 col-md-6 portfolio-item ${proj.category}">
          <div class="portfolio-wrap">
            <div class="portfolio-img-box">
              <img src="${proj.image}" alt="${proj.title}">
            </div>
            <div class="portfolio-info-box">
              <div>
                <h4>${proj.title}</h4>
                <p>${proj.description}</p>
                <div class="portfolio-tags">
                  ${proj.tags.map(t => `<span class="tag-badge">${t}</span>`).join("")}
                </div>
              </div>
              <div class="portfolio-links-box">
                <a href="${proj.image}" class="portfolio-lightbox btn-icon-link" title="${proj.title}"><i class="bi bi-zoom-in"></i></a>
                ${proj.playstore ? `<a href="${proj.playstore}" target="_blank" class="btn-icon-link" title="Google Play Store"><i class="bi bi-box-arrow-up-right"></i></a>` : ''}
                ${proj.github ? `<a href="${proj.github}" target="_blank" class="btn-icon-link" title="GitHub Repository"><i class="bi bi-github"></i></a>` : ''}
              </div>
            </div>
          </div>
        </div>
      `).join("");

      // Re-initialize Isotope & Lightbox if available
      if (window.Isotope && document.querySelector('.portfolio-container')) {
        setTimeout(() => {
          let portfolioIsotope = new Isotope(document.querySelector('.portfolio-container'), {
            itemSelector: '.portfolio-item',
            layoutMode: 'fitRows'
          });
          if (window.GLightbox) GLightbox({ selector: '.portfolio-lightbox' });
        }, 200);
      }
    }
  }
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", async () => {
  // First load from LocalStorage for instant rendering
  const localData = getLocalData();
  updatePortfolioUI(localData);

  // Then try fetching & listening from Firebase
  try {
    const remoteData = await getPortfolioDataFromFirebase();
    if (remoteData) {
      updatePortfolioUI(remoteData);
    }
    subscribeToFirebaseChanges((data) => {
      if (data) updatePortfolioUI(data);
    });
  } catch (err) {
    console.warn("Using LocalStorage portfolio data");
  }
});
