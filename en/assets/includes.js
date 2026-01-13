  // ================= VIDEO CARDS (Showcase) =================
  function ensureVideoModal() {
    if (document.getElementById("adiaVideoModal")) return;

    const modal = document.createElement("div");
    modal.id = "adiaVideoModal";
    modal.className = "fixed inset-0 z-[9999] hidden items-center justify-center bg-black/70 p-4";
    modal.innerHTML = `
      <div class="relative w-full max-w-5xl">
        <button id="adiaVideoModalClose"
                class="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-semibold">
          Close ✕
        </button>

        <div class="rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
          <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div class="text-white font-bold" id="adiaVideoModalTitle">Video</div>
            <div class="text-xs text-white/60">Press ESC to close</div>
          </div>

          <div class="aspect-video bg-black">
            <div id="adiaVideoModalBody" class="h-full w-full"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.classList.remove("modal-open");
      const body = document.getElementById("adiaVideoModalBody");
      if (body) body.innerHTML = "";
    };

    document.getElementById("adiaVideoModalClose")?.addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    modal._close = close;
  }

  function openVideoModal({ src, title, subtitlesVtt }) {
    ensureVideoModal();

    const modal = document.getElementById("adiaVideoModal");
    const body = document.getElementById("adiaVideoModalBody");
    const t = document.getElementById("adiaVideoModalTitle");
    if (!modal || !body) return;

    t.textContent = title || "Video";
    body.innerHTML = "";

    const v = document.createElement("video");
    v.className = "h-full w-full object-contain bg-black";
    v.controls = true;
    v.playsInline = true;
    v.autoplay = true;

    const s = document.createElement("source");
    s.src = src;
    s.type = "video/mp4";
    v.appendChild(s);

    if (subtitlesVtt) {
      const track = document.createElement("track");
      track.kind = "subtitles";
      track.srclang = "en";
      track.label = "English";
      track.src = subtitlesVtt;
      track.default = true;
      v.appendChild(track);

      // Force showing in some browsers
      v.addEventListener("loadedmetadata", () => {
        try {
          for (const tt of v.textTracks) tt.mode = "showing";
        } catch (_) {}
      }, { once: true });
    }

    body.appendChild(v);

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("modal-open");

    v.play().catch(() => {});
  }

  function initVideoCards() {
    const cards = document.querySelectorAll(".js-videoCard[data-video-src]");
    if (!cards.length) return;

    cards.forEach((card) => {
      // avoid double binding
      if (card.dataset.vbound === "1") return;
      card.dataset.vbound = "1";

      card.addEventListener("click", () => {
        const src = card.getAttribute("data-video-src");
        const title = card.getAttribute("data-video-title") || "Video";
        const subtitlesVtt = (src === "hero-reel.mp4") ? "hero-reel.en.vtt" : "";

        if (src) openVideoModal({ src, title, subtitlesVtt });
      });
    });
  }

  async function inject() {
    const headerHost = document.getElementById("siteHeader");
    const footerHost = document.getElementById("siteFooter");

    if (!headerHost && !footerHost) return;

    try {
      if (headerHost) {
        const res = await fetch(HEADER_URL, { cache: "no-store" });
        headerHost.innerHTML = await res.text();
      }
      if (footerHost) {
        const res = await fetch(FOOTER_URL, { cache: "no-store" });
        footerHost.innerHTML = await res.text();
      }
    } catch (e) {
      return;
    }

    // Init behaviors after injection
    setActiveNav();
    initMobileMenu();
    setFooterYear();
    initLangSwitcher();
    initVideoCards();
  }

  window.addEventListener("DOMContentLoaded", inject);

})(); // ✅ CIERRE CORRECTO DEL WRAPPER PRINCIPAL

