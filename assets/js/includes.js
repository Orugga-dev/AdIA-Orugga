(() => {
  const path = location.pathname;

  // Detect language based on URL folder
  const isEN = path.includes("/en/");
  const lang = isEN ? "en" : "es";

  // Detect if current page is language index
  // /en/, /en/index.html, /es/, /es/index.html
  const isLangIndex = /\/(en|es)\/(?:index\.html)?$/.test(path);

  // Relative paths (GitHub Pages safe)
  const P = {
    partialHeader: "../partials/header.html",
    partialFooter: "../partials/footer.html",
    logo: "../assets/img/orugga_logo_white_transparent_wgreen.png",
    switchTo: isEN ? "../es/index.html" : "../en/index.html",
  };

  /**
   * ROUTING RULES (IMPORTANT)
   *
   * - Home        → index.html
   * - Services    → services.html (ALWAYS, hero at top)
   * - About       → anchor on index
   * - Contact     → anchor on index
   */
  function getRoutes(language, onIndex) {
    if (language === "en") {
      return {
        home: "./index.html",
        services: "./services.html",                 // ✅ ALWAYS PAGE
        about: onIndex ? "#about" : "./index.html#about",
        contact: onIndex ? "#contact" : "./index.html#contact",
      };
    }

    // Spanish (kept consistent)
    return {
      home: "./index.html",
      services: "./services.html",
      about: onIndex ? "#about" : "./index.html#about",
      contact: onIndex ? "#contacto" : "./index.html#contacto",
    };
  }

  // Header shrink on scroll
  function initHeaderShrink() {
    const header = document.querySelector(".header");
    if (!header) return;

    const THRESHOLD = 12;

    const apply = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      header.classList.toggle("is-scrolled", y > THRESHOLD);

      const h = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--header-h", `${Math.round(h)}px`);
    };

    apply();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply, { passive: true });
  }

  // Mobile nav toggle (robust, no CSS dependency)
  function initMobileNav() {
    const btn = document.querySelector("[data-mobile-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");
    if (!btn || !panel) return;

    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";

    const setOpen = (open) => {
      panel.classList.toggle("hidden", !open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    };

    setOpen(false);

    btn.addEventListener("click", () => {
      setOpen(panel.classList.contains("hidden"));
    });

    panel.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      setOpen(false);
    });
  }

  async function injectPartials() {
    const headerHost = document.getElementById("siteHeader");
    const footerHost = document.getElementById("siteFooter");
    if (!headerHost || !footerHost) return;

    const [headerHTML, footerHTML] = await Promise.all([
      fetch(P.partialHeader).then(r => {
        if (!r.ok) throw new Error("Header partial not found");
        return r.text();
      }),
      fetch(P.partialFooter).then(r => {
        if (!r.ok) throw new Error("Footer partial not found");
        return r.text();
      }),
    ]);

    headerHost.innerHTML = headerHTML;
    footerHost.innerHTML = footerHTML;

    const routes = getRoutes(lang, isLangIndex);

    /* ================= HEADER ================= */

    const logo = headerHost.querySelector("[data-logo]");
    if (logo) logo.src = P.logo;

    const homeLink = headerHost.querySelector("[data-home]");
    if (homeLink) homeLink.href = routes.home;

    const navHome = headerHost.querySelector('[data-nav="home"]');
    if (navHome) navHome.href = routes.home;

    const navServices = headerHost.querySelector('[data-nav="services"]');
    if (navServices) navServices.href = routes.services;

    const navAbout = headerHost.querySelector('[data-nav="about"]');
    if (navAbout) navAbout.href = routes.about;

    const navContact = headerHost.querySelector('[data-nav="contact"]');
    if (navContact) navContact.href = routes.contact;

    const cta = headerHost.querySelector("[data-cta]");
    if (cta) cta.href = routes.contact;

    const langSwitch = headerHost.querySelector("[data-lang-switch]");
    if (langSwitch) {
      langSwitch.href = P.switchTo;
      langSwitch.textContent = lang === "en" ? "ES" : "EN";
    }

    /* ================= FOOTER ================= */

    const fHome = footerHost.querySelector('[data-foot="home"]');
    if (fHome) fHome.href = routes.home;

    const fServices = footerHost.querySelector('[data-foot="services"]');
    if (fServices) fServices.href = routes.services;   // ✅ FIXED

    const fAbout = footerHost.querySelector('[data-foot="about"]');
    if (fAbout) fAbout.href = routes.about;

    const fContact = footerHost.querySelector('[data-foot="contact"]');
    if (fContact) fContact.href = routes.contact;

    /* ================= INIT ================= */

    initHeaderShrink();
    initMobileNav();
  }

  injectPartials().catch(err => {
    console.error("Failed to inject partials:", err);
  });
})();
