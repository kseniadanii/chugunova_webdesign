const gallery = document.getElementById("catGallery");
const cards = Array.from(document.querySelectorAll(".work-card"));
const shuffleBtn = document.getElementById("shuffleBtn");
const resetBtn = document.getElementById("resetBtn");

const defaultLayouts = {
  mobile: [
    { left: 12, top: 110, rotate: -12, scale: 0.92, z: 2 },
    { left: 52, top: 70, rotate: -6, scale: 0.96, z: 3 },
    { left: 95, top: 30, rotate: 0, scale: 1.02, z: 5 },
    { left: 138, top: 72, rotate: 7, scale: 0.96, z: 3 },
    { left: 175, top: 118, rotate: 13, scale: 0.92, z: 2 }
  ],
  desktop: [
    { left: 70, top: 150, rotate: -16, scale: 0.94, z: 2 },
    { left: 220, top: 90, rotate: -8, scale: 0.98, z: 3 },
    { left: 400, top: 40, rotate: 0, scale: 1.05, z: 5 },
    { left: 610, top: 92, rotate: 8, scale: 0.98, z: 3 },
    { left: 760, top: 155, rotate: 16, scale: 0.94, z: 2 }
  ]
};

function isDesktop() {
  return window.innerWidth >= 768;
}

function getBaseLayout() {
  return isDesktop() ? defaultLayouts.desktop : defaultLayouts.mobile;
}

function applyLayout(layout) {
  cards.forEach((card, index) => {
    const item = layout[index];
    card.style.left = `${item.left}px`;
    card.style.top = `${item.top}px`;
    card.style.transform = `rotate(${item.rotate}deg) scale(${item.scale})`;
    card.style.zIndex = item.z;
    card.dataset.pos = index;
    card.classList.toggle("is-active", index === 2);
    card.style.filter = index === 2 ? "none" : "saturate(0.92)";
  });
}

function centerCard(activeIndex) {
  const base = getBaseLayout().map(item => ({ ...item }));

  const centerPosition = isDesktop()
    ? { left: 400, top: 40, rotate: 0, scale: 1.05, z: 6 }
    : { left: 95, top: 30, rotate: 0, scale: 1.02, z: 6 };

  const sidePositions = isDesktop()
    ? [
        { left: 60, top: 160, rotate: -18, scale: 0.9, z: 2 },
        { left: 220, top: 105, rotate: -9, scale: 0.95, z: 3 },
        { left: 610, top: 105, rotate: 9, scale: 0.95, z: 3 },
        { left: 790, top: 165, rotate: 18, scale: 0.9, z: 2 }
      ]
    : [
        { left: 5, top: 120, rotate: -15, scale: 0.88, z: 2 },
        { left: 45, top: 78, rotate: -8, scale: 0.94, z: 3 },
        { left: 150, top: 80, rotate: 8, scale: 0.94, z: 3 },
        { left: 190, top: 125, rotate: 15, scale: 0.88, z: 2 }
      ];

  let sideIndex = 0;

  cards.forEach((card, index) => {
    let pos;

    if (index === activeIndex) {
      pos = centerPosition;
      card.classList.add("is-active");
      card.style.filter = "none";
    } else {
      pos = sidePositions[sideIndex];
      sideIndex++;
      card.classList.remove("is-active");
      card.style.filter = "saturate(0.9)";
    }

    card.style.left = `${pos.left}px`;
    card.style.top = `${pos.top}px`;
    card.style.transform = `rotate(${pos.rotate}deg) scale(${pos.scale})`;
    card.style.zIndex = pos.z;
  });
}

function shuffleGallery() {
  const width = gallery.clientWidth;
  const height = gallery.clientHeight;

  cards.forEach((card, index) => {
    const cardWidth = isDesktop() ? 240 : 190;
    const randomLeft = Math.max(8, Math.floor(Math.random() * (width - cardWidth - 16)));
    const randomTop = Math.max(20, Math.floor(Math.random() * (height - 300)));
    const randomRotate = Math.floor(Math.random() * 31) - 15;
    const randomScale = (0.9 + Math.random() * 0.16).toFixed(2);

    card.style.left = `${randomLeft}px`;
    card.style.top = `${randomTop}px`;
    card.style.transform = `rotate(${randomRotate}deg) scale(${randomScale})`;
    card.style.zIndex = String(index + 1);
    card.classList.remove("is-active");
    card.style.filter = "saturate(0.95)";
  });
}

cards.forEach((card, index) => {
  card.addEventListener("click", () => {
    centerCard(index);
  });
});

shuffleBtn.addEventListener("click", shuffleGallery);
resetBtn.addEventListener("click", () => applyLayout(getBaseLayout()));
window.addEventListener("resize", () => applyLayout(getBaseLayout()));

applyLayout(getBaseLayout());