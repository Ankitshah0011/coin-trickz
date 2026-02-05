/* =========================================================
   TRICKS ZONE — script.js (FULL) ✅ UPDATED
   - Preloader
   - Navbar blur on scroll
   - Smooth scroll + close mobile menu
   - Reveal on scroll
   - Counters (once)
   - ✅ NEW: Horizontal Gallery Slider + Fullscreen Modal
       - Wheel -> horizontal scroll
       - Drag scroll (desktop)
       - Touch swipe scroll (mobile)
       - Click open fullscreen
       - Swipe next/prev in modal
       - Keyboard arrows + ESC
       - Focus trap
   - Back-to-top
   - Button ripple
   - Contact form validation + success message
   - Footer year
   - ✅ Welcome Voice: "Welcome to Trick Zone" (NO audio file needed)
   - ✅ Payment Modal Logic (UTR + Continue buttons enable/disable + focus)
========================================================= */

(() => {
  "use strict";

  /* -----------------------------
     Helpers
  ------------------------------ */
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  /* -----------------------------
     Elements (Main site)
  ------------------------------ */
  const preloader = $("#preloader");
  const navbar = $("#tzNavbar");
  const topBtn = $("#tzTop");

  // ✅ NEW Slider + Modal elements (must exist in HTML)
  const slider = $("#tzSlider");                 // horizontal slider container
  const slideBtns = slider ? $$(".tz-slide", slider) : []; // each slide button

  const modal = $("#tzModal");
  const modalImg = $("#tzModalImg");
  const modalClose = $("#tzModalClose");
  const modalStage = $("#tzModalStage");
  const modalLive = $("#tzModalLive");

  // Contact Form
  const contactForm = $("#tzContactForm");
  const formMsg = $("#tzFormMsg");

  /* -----------------------------
     ✅ Welcome Voice (Text to Speech)
  ------------------------------ */
  const playWelcomeVoice = () => {
    if (localStorage.getItem("tz_voice_played") === "1") return;

    const speak = () => {
      if (!("speechSynthesis" in window)) return;

      const msg = new SpeechSynthesisUtterance("Welcome to Trick Zone");
      msg.rate = 0.95;
      msg.pitch = 1.0;
      msg.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(v => v.name.toLowerCase().includes("google") && v.lang.toLowerCase().startsWith("en")) ||
        voices.find(v => v.lang.toLowerCase().startsWith("en"));

      if (preferred) msg.voice = preferred;

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);

      localStorage.setItem("tz_voice_played", "1");
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => speak();
    } else {
      speak();
    }

    // Mobile unlock (first user action)
    const unlock = () => {
      try { speak(); } catch { }
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
  };

  /* -----------------------------
     1) Preloader + Welcome voice
  ------------------------------ */
  window.addEventListener("load", () => {
    if (!preloader) {
      setTimeout(playWelcomeVoice, 400);
      return;
    }
    setTimeout(() => {
      preloader.classList.add("hide");
      playWelcomeVoice();
    }, 350);
  });

  /* -----------------------------
     2) Navbar blur on scroll
     3) Back to top visibility
  ------------------------------ */
  const onScrollUI = () => {
    const y = window.scrollY || 0;

    if (navbar) {
      if (y > 30) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    }

    if (topBtn) {
      if (y > 450) topBtn.classList.add("show");
      else topBtn.classList.remove("show");
    }
  };

  window.addEventListener("scroll", onScrollUI, { passive: true });
  onScrollUI();

  /* -----------------------------
     4) Smooth scroll for anchor links
        + close mobile menu after click
  ------------------------------ */
  const navOffcanvas = $("#tzNav");
  const bsOffcanvas =
    navOffcanvas && window.bootstrap
      ? new bootstrap.Offcanvas(navOffcanvas)
      : null;

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();

      if (navOffcanvas && navOffcanvas.classList.contains("show") && bsOffcanvas) {
        bsOffcanvas.hide();
      }

      const navH = navbar ? navbar.getBoundingClientRect().height : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - (navH - 2);

      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* -----------------------------
     5) Reveal on scroll (IntersectionObserver)
     (keeps your existing .reveal -> add class "show")
  ------------------------------ */
  const revealEls = $$(".reveal");
  if (revealEls.length) {
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (ent.isIntersecting) {
            ent.target.classList.add("show");
            revealIO.unobserve(ent.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    revealEls.forEach((el) => revealIO.observe(el));
  }

  /* -----------------------------
     6) Counters animation (once)
  ------------------------------ */
  const counterEls = [...$$(".counter"), ...$$(".metric-num")];
  const animateCount = (el, to) => {
    const duration = 900;
    const start = performance.now();
    const from = 0;

    const step = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from + (to - from) * eased);
      el.textContent = String(val);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (counterEls.length) {
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (!ent.isIntersecting) return;
          const el = ent.target;
          const to = parseInt(el.getAttribute("data-counter") || "0", 10);
          if (!Number.isFinite(to)) return;
          animateCount(el, to);
          counterIO.unobserve(el);
        });
      },
      { threshold: 0.55 }
    );

    counterEls.forEach((el) => {
      el.textContent = "0";
      counterIO.observe(el);
    });
  }

  /* =========================================================
     ✅ 7) NEW: Horizontal Gallery Slider + Fullscreen Modal
  ========================================================== */
  if (slider && slideBtns.length && modal && modalImg && modalClose && modalStage) {
    let activeIndex = 0;
    let lastFocus = null;

    /* ---- Wheel -> horizontal scroll ---- */
    slider.addEventListener(
      "wheel",
      (e) => {
        // trackpad horizontal should stay natural
        const isMostlyVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);
        if (isMostlyVertical) {
          e.preventDefault();
          slider.scrollLeft += e.deltaY;
        }
      },
      { passive: false }
    );

    /* ---- Drag to scroll (desktop) ---- */
    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;

    const dragStart = (clientX) => {
      isDown = true;
      startX = clientX;
      startScrollLeft = slider.scrollLeft;
      slider.classList.add("is-dragging");
    };

    const dragMove = (clientX) => {
      if (!isDown) return;
      const walk = (clientX - startX) * 1.2;
      slider.scrollLeft = startScrollLeft - walk;
    };

    const dragEnd = () => {
      isDown = false;
      slider.classList.remove("is-dragging");
    };

    slider.addEventListener("mousedown", (e) => {
      // prevent text selection while dragging
      e.preventDefault();
      dragStart(e.clientX);
    });

    window.addEventListener("mousemove", (e) => dragMove(e.clientX));
    window.addEventListener("mouseup", dragEnd);

    /* ---- Touch drag (mobile) ---- */
    slider.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches?.length) return;
        dragStart(e.touches[0].clientX);
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchmove",
      (e) => {
        if (!e.touches?.length) return;
        dragMove(e.touches[0].clientX);
      },
      { passive: true }
    );

    slider.addEventListener("touchend", dragEnd);

    /* ---- Modal open/close helpers ---- */
    const setModalImage = (index) => {
      const btn = slideBtns[index];
      const full = btn.getAttribute("data-full") || btn.querySelector("img")?.src || "";

      // nice fade on swap
      modalImg.style.opacity = "0";
      requestAnimationFrame(() => {
        modalImg.src = full;
        modalImg.onload = () => (modalImg.style.opacity = "1");
        if (modalLive) modalLive.textContent = `Image ${index + 1} of ${slideBtns.length}`;
      });
    };

    const openModal = (index) => {
      activeIndex = clamp(index, 0, slideBtns.length - 1);
      lastFocus = document.activeElement;

      setModalImage(activeIndex);

      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      modalClose.focus({ preventScroll: true });
    };

    const closeModal = () => {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      modalImg.src = "";

      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus({ preventScroll: true });
      }
    };

    const goNext = () => {
      activeIndex = (activeIndex + 1) % slideBtns.length;
      setModalImage(activeIndex);
    };

    const goPrev = () => {
      activeIndex = (activeIndex - 1 + slideBtns.length) % slideBtns.length;
      setModalImage(activeIndex);
    };

    /* ---- Click slide -> open modal ---- */
    slideBtns.forEach((btn, idx) => {
      btn.addEventListener("click", () => openModal(idx));
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(idx);
        }
      });
    });

    /* ---- Close actions ---- */
    modalClose.addEventListener("click", closeModal);

    // Click outside close (backdrop)
    modal.addEventListener("click", (e) => {
      // if you used backdrop div with data-close="true"
      const t = e.target;
      if (t && t.getAttribute && t.getAttribute("data-close") === "true") closeModal();

      // also close if user clicks empty modal container
      if (t === modal) closeModal();
    });

    /* ---- Keyboard (ESC + arrows + focus trap) ---- */
    const trapFocus = (e) => {
      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("show")) return;

      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Tab") {
        trapFocus(e);
      }
    });

    /* ---- Swipe next/prev inside modal ---- */
    let touchStartX = 0;
    let touchDeltaX = 0;

    modalStage.addEventListener(
      "touchstart",
      (e) => {
        if (!modal.classList.contains("show")) return;
        if (!e.touches?.length) return;
        touchStartX = e.touches[0].clientX;
        touchDeltaX = 0;
      },
      { passive: true }
    );

    modalStage.addEventListener(
      "touchmove",
      (e) => {
        if (!modal.classList.contains("show")) return;
        if (!e.touches?.length) return;
        touchDeltaX = e.touches[0].clientX - touchStartX;

        modalImg.style.transition = "none";
        modalImg.style.transform = `translateX(${touchDeltaX}px)`;
      },
      { passive: true }
    );

    modalStage.addEventListener("touchend", () => {
      if (!modal.classList.contains("show")) return;

      const threshold = 60;
      modalImg.style.transition = "";
      if (touchDeltaX <= -threshold) {
        modalImg.style.transform = "translateX(-20px)";
        setTimeout(() => {
          modalImg.style.transform = "translateX(0)";
          goNext();
        }, 120);
      } else if (touchDeltaX >= threshold) {
        modalImg.style.transform = "translateX(20px)";
        setTimeout(() => {
          modalImg.style.transform = "translateX(0)";
          goPrev();
        }, 120);
      } else {
        modalImg.style.transform = "translateX(0)";
      }
    });
  }

  /* -----------------------------
     8) Back to top action
  ------------------------------ */
  if (topBtn) {
    topBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* -----------------------------
     9) Ripple effect on buttons
  ------------------------------ */
  $$(".tz-ripple").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = `${size}px`;
      span.style.left = `${x}px`;
      span.style.top = `${y}px`;

      const old = this.querySelector(".ripple");
      if (old) old.remove();

      this.appendChild(span);
      span.addEventListener("animationend", () => span.remove());
    });
  });

  /* -----------------------------
     10) Contact form validation + fake submit
  ------------------------------ */
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = contactForm.elements["name"]?.value.trim();
      const email = contactForm.elements["email"]?.value.trim();
      const message = contactForm.elements["message"]?.value.trim();

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || name.length < 2) {
        if (formMsg) {
          formMsg.textContent = "Please enter your name (at least 2 characters).";
          formMsg.style.color = "rgba(255,79,216,.9)";
        }
        return;
      }
      if (!emailOk) {
        if (formMsg) {
          formMsg.textContent = "Please enter a valid email address.";
          formMsg.style.color = "rgba(255,79,216,.9)";
        }
        return;
      }
      if (!message || message.length < 10) {
        if (formMsg) {
          formMsg.textContent = "Please write a message (at least 10 characters).";
          formMsg.style.color = "rgba(255,79,216,.9)";
        }
        return;
      }

      if (formMsg) {
        formMsg.textContent = "✅ Message sent! I’ll reply within 24 hours.";
        formMsg.style.color = "rgba(38,247,255,.9)";
      }
      contactForm.reset();

      setTimeout(() => {
        if (formMsg) formMsg.textContent = "";
      }, 4500);
    });
  }

  /* -----------------------------
     11) Footer year
  ------------------------------ */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();

/* =========================================================
   ✅ Payment Modal Logic (UPGRADED)
   - Works on enroll.html (and any page having these IDs)
   - Handles: open/close, ESC, click outside
   - Continue buttons disabled until UTR >= 10
========================================================= */
(() => {
  const openBtn = document.getElementById("tzPaymentBtn");
  const payModal = document.getElementById("tzPaymentModal"); // ✅ renamed to avoid conflict
  const closeBtn = document.getElementById("tzPaymentClose");
  const utrInput = document.getElementById("tzUtr");

  const continueBtn = document.getElementById("tzContinueBtn");
  const continueBtnTop = document.getElementById("tzContinueBtnTop");

  // Enrollment inputs (optional)
  const nameInput = document.getElementById("tzName");
  const phoneInput = document.getElementById("tzPhone");
  const ageInput = document.getElementById("tzAge");

  // If page doesn't have payment section, stop safely
  if (!openBtn || !payModal || !closeBtn) return;

  // Helper: enable/disable
  const setDisabled = (btn, disabled) => {
    if (!btn) return;
    btn.disabled = disabled;
    btn.classList.toggle("tz-disabled", disabled);
    btn.setAttribute("aria-disabled", disabled ? "true" : "false");
  };

  // Initially disable continue buttons
  setDisabled(continueBtn, true);
  setDisabled(continueBtnTop, true);

  const toggleContinue = () => {
    const ok = (utrInput?.value || "").trim().length >= 10;
    setDisabled(continueBtn, !ok);
    setDisabled(continueBtnTop, !ok);
  };

  if (utrInput) {
    utrInput.addEventListener("input", toggleContinue);
    toggleContinue();
  }

  const openModal = () => {
    // If enroll form exists, validate before opening payment
    if (nameInput && phoneInput && ageInput) {
      if (!nameInput.value.trim() || !phoneInput.value.trim() || !ageInput.value.trim()) {
        alert("Please fill Name, Phone, and Age before proceeding to payment.");
        return;
      }
    }

    payModal.classList.add("show");
    payModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Focus UTR
    setTimeout(() => utrInput?.focus(), 60);
  };

  const closeModal = () => {
    payModal.classList.remove("show");
    payModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    openBtn.focus();
  };

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  payModal.addEventListener("click", (e) => {
    if (e.target === payModal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && payModal.classList.contains("show")) {
      closeModal();
    }
  });

  // Copy Map Link Button
  (() => {
    const copyBtn = document.getElementById("tzCopyMapLink");
    const toast = document.getElementById("tzMapToast");
    const mapLink = "https://maps.app.goo.gl/8TMCLYWwi3qSZB36A";

    if (!copyBtn) return;

    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(mapLink);
        if (toast) {
          toast.textContent = "✅ Link copied! Paste it anywhere.";
          toast.style.color = "rgba(38,247,255,.9)";
        }
      } catch {
        // fallback
        const temp = document.createElement("input");
        temp.value = mapLink;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();

        if (toast) {
          toast.textContent = "✅ Link copied!";
          toast.style.color = "rgba(38,247,255,.9)";
        }
      }

      setTimeout(() => {
        if (toast) toast.textContent = "";
      }, 3500);
    });
  })();

})();
