const video = document.getElementById("heroVideo");
const button = document.getElementById("videoToggle");

function togglePlay() {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

video.addEventListener("play", () => {
    button.classList.add("playing");
});

video.addEventListener("pause", () => {
    button.classList.remove("playing");
});

document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("heroVideo");
  const frame = video.closest(".video-wrapper");

  const placeholder = document.createElement("div");
  placeholder.style.display = "none";
  frame.insertBefore(placeholder, video);

  let isFloating = false;
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  function makeFloating() {
    if (isFloating) return;

    isFloating = true;

    const rect = video.getBoundingClientRect();
    placeholder.style.display = "block";
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;

    Object.assign(video.style, {
      position: "fixed",
      width: "320px",
      height: "180px",
      right: "20px",
      bottom: "20px",
      left: "auto",
      top: "auto",
      zIndex: "9999",
      borderRadius: "14px",
      boxShadow: "0 10px 30px rgba(0,0,0,.45)",
      cursor: "grab",
      objectFit: "cover",
      background: "#000"
    });
  }

  function removeFloating() {
    if (!isFloating) return;

    isFloating = false;
    placeholder.style.display = "none";

    Object.assign(video.style, {
      position: "",
      width: "",
      height: "",
      right: "",
      bottom: "",
      left: "",
      top: "",
      zIndex: "",
      borderRadius: "",
      boxShadow: "",
      cursor: "",
      objectFit: "",
      background: ""
    });
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      removeFloating();
    } else {
      makeFloating();
    }
  }, {
    threshold: 0,
    rootMargin: "-120px 0px -120px 0px"
  });

  observer.observe(frame);

  function getPointer(e) {
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX, y: p.clientY };
  }

  function startDrag(e) {
    if (!isFloating) return;

    dragging = true;
    video.style.cursor = "grabbing";

    const pointer = getPointer(e);
    const rect = video.getBoundingClientRect();

    offsetX = pointer.x - rect.left;
    offsetY = pointer.y - rect.top;
  }

  function moveDrag(e) {
    if (!dragging) return;

    e.preventDefault();

    const pointer = getPointer(e);

    let left = pointer.x - offsetX;
    let top = pointer.y - offsetY;

    left = Math.max(0, Math.min(left, window.innerWidth - video.offsetWidth));
    top = Math.max(0, Math.min(top, window.innerHeight - video.offsetHeight));

    video.style.left = `${left}px`;
    video.style.top = `${top}px`;
    video.style.right = "auto";
    video.style.bottom = "auto";
  }

  function stopDrag() {
    dragging = false;
    if (isFloating) video.style.cursor = "grab";
  }

  video.addEventListener("mousedown", startDrag);
  document.addEventListener("mousemove", moveDrag);
  document.addEventListener("mouseup", stopDrag);

  video.addEventListener("touchstart", startDrag, { passive: false });
  document.addEventListener("touchmove", moveDrag, { passive: false });
  document.addEventListener("touchend", stopDrag);
});