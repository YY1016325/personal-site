const header = document.querySelector("[data-header]");
const brand = document.querySelector(".brand");
const canvas = document.querySelector("#signalCanvas");
const ctx = canvas.getContext("2d");
const rotatingText = document.querySelector("[data-rotating-text]");
const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
const realismTrigger = document.querySelector("[data-realism-trigger]");
const realismDialog = document.querySelector("#realismDialog");
const realismCloseControls = Array.from(document.querySelectorAll("[data-realism-close]"));
const drinkTrigger = document.querySelector("[data-drink-trigger]");
const drinkDialog = document.querySelector("#drinkDialog");
const drinkCloseControls = Array.from(document.querySelectorAll("[data-drink-close]"));
const beverageTrigger = document.querySelector("[data-beverage-trigger]");
const beverageDialog = document.querySelector("#beverageDialog");
const beverageCloseControls = Array.from(document.querySelectorAll("[data-beverage-close]"));
const cityTrigger = document.querySelector("[data-city-trigger]");
const cityDialog = document.querySelector("#cityDialog");
const cityCloseControls = Array.from(document.querySelectorAll("[data-city-close]"));
const productTrigger = document.querySelector("[data-product-trigger]");
const productDialog = document.querySelector("#productDialog");
const productCloseControls = Array.from(document.querySelectorAll("[data-product-close]"));
const copyButtons = Array.from(document.querySelectorAll("[data-copy-value]"));
const watchedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const stars = [];
const pointer = {
  active: false,
  x: 0,
  y: 0,
};
let width = 0;
let height = 0;
let animationFrame = 0;
let rotatingIndex = 0;
const rotatingPhrases = ["热爱探索", "终身学习", "知行并进"];
let typingTimer = 0;
const dialogCloseTimers = new WeakMap();
const dialogTransitionDuration = 340;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  width = rect.width;
  height = rect.height;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  stars.length = 0;
  const count = Math.max(90, Math.floor((width * height) / 16000));

  for (let index = 0; index < count; index += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;

    stars.push({
      x,
      y,
      originX: x,
      originY: y,
      drawX: x,
      drawY: y,
      vx: 0,
      vy: 0,
      radius: 0.8 + Math.random() * 2.2,
      alpha: 0.18 + Math.random() * 0.5,
      speed: 0.0008 + Math.random() * 0.0025,
      hue: Math.random() > 0.72 ? "blue" : "amber",
      drift: Math.random() * Math.PI * 2,
      mode: Math.random() > 0.58 ? "follow" : "orbit",
      orbitRadius: 5 + Math.random() * 18,
      orbitSpeed: 0.00035 + Math.random() * 0.001,
      magnet: 0.006 + Math.random() * 0.01,
    });
  }
}

function drawStars(time) {
  ctx.clearRect(0, 0, width, height);

  stars.forEach((star, index) => {
    const pulse = Math.sin(time * star.speed + star.drift) * 0.22;
    let x = star.x;
    let y = star.y;

    if (star.mode === "orbit") {
      const angle = time * star.orbitSpeed + star.drift;
      x = star.originX + Math.cos(angle) * star.orbitRadius;
      y = star.originY + Math.sin(angle) * star.orbitRadius;
    } else {
      const homeForceX = (star.originX - star.x) * 0.006;
      const homeForceY = (star.originY - star.y) * 0.006;
      let mouseForceX = 0;
      let mouseForceY = 0;

      if (pointer.active) {
        const dx = pointer.x - star.x;
        const dy = pointer.y - star.y;
        const distance = Math.hypot(dx, dy);
        const reach = 280;

        if (distance < reach) {
          const force = (1 - distance / reach) * star.magnet;
          mouseForceX = dx * force;
          mouseForceY = dy * force;
        }
      }

      star.vx = (star.vx + homeForceX + mouseForceX) * 0.9;
      star.vy = (star.vy + homeForceY + mouseForceY) * 0.9;
      star.x += star.vx;
      star.y += star.vy;
      x = star.x;
      y = star.y;
    }

    star.drawX = x;
    star.drawY = y;
    const alpha = Math.max(0.08, star.alpha + pulse);

    ctx.beginPath();
    ctx.arc(x, y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle =
      star.hue === "blue"
        ? `rgba(69, 126, 219, ${alpha})`
        : `rgba(216, 145, 55, ${alpha})`;
    ctx.fill();

    if (index % 9 !== 0) {
      return;
    }

    const next = stars[(index + 11) % stars.length];
    const distance = Math.hypot(x - next.drawX, y - next.drawY);

    if (distance < 230) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(next.drawX, next.drawY);
      ctx.strokeStyle = `rgba(216, 145, 55, ${0.06 * (1 - distance / 230)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

  animationFrame = requestAnimationFrame(drawStars);
}

function handleScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 10);
  updateActiveNav();
}

function updateBrandVisibility(event) {
  if (!brand) {
    return;
  }

  const rect = brand.getBoundingClientRect();
  const padding = 120;
  const isNear =
    event.clientX >= rect.left - padding &&
    event.clientX <= rect.right + padding &&
    event.clientY >= rect.top - padding &&
    event.clientY <= rect.bottom + padding;

  brand.classList.toggle("is-near", isNear);
}

function handlePointerMove(event) {
  updateBrandVisibility(event);

  const rect = canvas.getBoundingClientRect();
  pointer.active =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;
  pointer.x = event.clientX - rect.left;
  pointer.y = event.clientY - rect.top;
}

function handlePointerLeave() {
  pointer.active = false;
  brand?.classList.remove("is-near");
}

function openPhotoDialog(dialog) {
  if (!dialog) {
    return;
  }

  window.clearTimeout(dialogCloseTimers.get(dialog));
  dialog.classList.add("is-open");
  dialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("dialog-open");
  const gallery = dialog.querySelector(".realism-gallery");

  if (gallery) {
    gallery.scrollLeft = 0;
  }

  const panel = dialog.querySelector(".realism-panel");

  if (panel) {
    panel.scrollLeft = 0;
  }

  dialog.querySelector(".realism-panel")?.focus();
}

function closePhotoDialog(dialog, trigger) {
  if (!dialog) {
    return;
  }

  dialog.classList.remove("is-open");
  dialog.setAttribute("aria-hidden", "true");
  const closeTimer = window.setTimeout(() => {
    if (!document.querySelector(".realism-dialog.is-open")) {
      document.body.classList.remove("dialog-open");
    }

    trigger?.focus();
  }, dialogTransitionDuration);

  dialogCloseTimers.set(dialog, closeTimer);
}

function bindPhotoDialog(trigger, dialog, closeControls) {
  trigger?.addEventListener("click", () => openPhotoDialog(dialog));
  trigger?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPhotoDialog(dialog);
    }
  });

  closeControls.forEach((control) => {
    control.addEventListener("click", () => closePhotoDialog(dialog, trigger));
  });
}

function handleDialogWheel(event) {
  const dialog =
    event.target.closest?.(".realism-dialog.is-open") ||
    document.querySelector(".realism-dialog.is-open");

  if (!dialog) {
    return;
  }

  const wheelDelta = event.deltaY !== 0 ? event.deltaY : event.deltaX;

  if (!wheelDelta) {
    return;
  }

  let distance = wheelDelta;

  if (event.deltaMode === 1) {
    distance *= 36;
  } else if (event.deltaMode === 2) {
    distance *= window.innerWidth;
  }
  event.preventDefault();
  event.stopPropagation();

  const gallery = dialog.querySelector(".realism-gallery");
  const panel = dialog.querySelector(".realism-panel");
  const scroller =
    gallery && gallery.scrollWidth > gallery.clientWidth
      ? gallery
      : panel;

  if (scroller) {
    scroller.scrollLeft += distance * 7;
  }
}

function bindDialogWheelTarget(target) {
  target?.addEventListener("wheel", handleDialogWheel, { passive: false });
}

function fallbackCopyText(value) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.left = "-9999px";
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  document.body.append(textarea);
  textarea.select();

  try {
    document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch (error) {
      fallbackCopyText(value);
      return;
    }
  }

  fallbackCopyText(value);
}

function bindCopyButton(button) {
  const value = button.dataset.copyValue;
  const defaultLabel = button.getAttribute("aria-label") || "复制";

  button.addEventListener("click", async () => {
    await copyText(value);
    button.classList.add("is-copied");
    button.setAttribute("aria-label", "已复制");
    button.title = "已复制";

    window.setTimeout(() => {
      button.classList.remove("is-copied");
      button.setAttribute("aria-label", defaultLabel);
      button.title = defaultLabel;
    }, 1400);
  });
}

function updateActiveNav() {
  const sections = [...watchedSections].sort((a, b) => a.offsetTop - b.offsetTop);
  const probeY = window.scrollY + window.innerHeight * 0.35;
  let currentId = sections[0]?.id;

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    currentId = sections[sections.length - 1]?.id;
  }

  sections.forEach((section) => {
    if (probeY >= section.offsetTop) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${currentId}`);
  });
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("pointermove", handlePointerMove, { passive: true });
window.addEventListener("pointerleave", handlePointerLeave, { passive: true });

bindPhotoDialog(realismTrigger, realismDialog, realismCloseControls);
bindPhotoDialog(drinkTrigger, drinkDialog, drinkCloseControls);
bindPhotoDialog(beverageTrigger, beverageDialog, beverageCloseControls);
bindPhotoDialog(cityTrigger, cityDialog, cityCloseControls);
bindPhotoDialog(productTrigger, productDialog, productCloseControls);
copyButtons.forEach(bindCopyButton);
document.addEventListener("wheel", handleDialogWheel, { capture: true, passive: false });
document
  .querySelectorAll(".realism-dialog, .realism-panel, .realism-gallery, .realism-gallery img")
  .forEach(bindDialogWheelTarget);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && realismDialog?.classList.contains("is-open")) {
    closePhotoDialog(realismDialog, realismTrigger);
  }

  if (event.key === "Escape" && drinkDialog?.classList.contains("is-open")) {
    closePhotoDialog(drinkDialog, drinkTrigger);
  }

  if (event.key === "Escape" && beverageDialog?.classList.contains("is-open")) {
    closePhotoDialog(beverageDialog, beverageTrigger);
  }

  if (event.key === "Escape" && cityDialog?.classList.contains("is-open")) {
    closePhotoDialog(cityDialog, cityTrigger);
  }

  if (event.key === "Escape" && productDialog?.classList.contains("is-open")) {
    closePhotoDialog(productDialog, productTrigger);
  }
});

if (rotatingText) {
  function typePhrase(phrase) {
    let charIndex = 0;
    rotatingText.textContent = "";
    window.clearInterval(typingTimer);

    typingTimer = window.setInterval(() => {
      rotatingText.textContent = phrase.slice(0, charIndex + 1);
      charIndex += 1;

      if (charIndex >= phrase.length) {
        window.clearInterval(typingTimer);
      }
    }, 200);
  }

  window.setInterval(() => {
    rotatingIndex = (rotatingIndex + 1) % rotatingPhrases.length;
    typePhrase(rotatingPhrases[rotatingIndex]);
  }, 2000);
}

resizeCanvas();
handleScroll();
animationFrame = requestAnimationFrame(drawStars);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
    return;
  }

  animationFrame = requestAnimationFrame(drawStars);
});
