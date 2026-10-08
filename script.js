"use strict";

const floaterLayer = document.querySelector(".floaters");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const maxFloaters = 24;
const spawnInterval = 700;
const moonButton = document.querySelector(".moon");
const song = document.querySelector("#garden-song");
const musicToggle = document.querySelector(".music-toggle");
const musicLabel = document.querySelector(".music-label");
const musicVolume = document.querySelector(".music-volume input");
const musicStatus = document.querySelector(".music-status");
const paperPlaneButton = document.querySelector(".paper-plane");
const surpriseDialog = document.querySelector(".surprise-dialog");
const surpriseContinueButton = document.querySelector(".surprise-continue");
const letterDialog = document.querySelector(".letter-dialog");
const letterCloseButton = document.querySelector(".letter-close");

if (!floaterLayer) {
  throw new Error("The floating decoration layer (.floaters) is missing.");
}

if (
  !moonButton ||
  !song ||
  !musicToggle ||
  !musicLabel ||
  !musicVolume ||
  !musicStatus ||
  !paperPlaneButton ||
  !surpriseDialog ||
  !surpriseContinueButton ||
  !letterDialog ||
  !letterCloseButton
) {
  throw new Error("The moon, paper plane, and letter controls must be present.");
}

song.volume = Number(musicVolume.value) / 100;

async function startSong() {
  try {
    await song.play();
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      musicStatus.textContent = "Sentuh atau klik halaman untuk mulai memutar lagu.";
      return;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }

    musicStatus.textContent = "Lagunya belum bisa diputar. Coba periksa file audio.";
    console.error("Unable to play the supplied audio file.", error);
  }
}

function startSongAfterGesture(event) {
  if (musicToggle.contains(event.target)) {
    return;
  }

  void startSong();
}

document.addEventListener("pointerdown", startSongAfterGesture);
document.addEventListener("keydown", startSongAfterGesture);
void startSong();

musicToggle.addEventListener("click", async () => {
  if (!song.paused) {
    song.pause();
    return;
  }

  await startSong();
});

song.addEventListener("playing", () => {
  musicLabel.textContent = "Jeda lagu";
  musicToggle.setAttribute("aria-pressed", "true");
  musicStatus.textContent = "Lagu sedang diputar.";
  document.removeEventListener("pointerdown", startSongAfterGesture);
  document.removeEventListener("keydown", startSongAfterGesture);
});

song.addEventListener("pause", () => {
  musicLabel.textContent = "Putar lagu";
  musicToggle.setAttribute("aria-pressed", "false");
  musicStatus.textContent = "Lagu dijeda.";
});

song.addEventListener("error", () => {
  musicLabel.textContent = "Putar lagu";
  musicToggle.setAttribute("aria-pressed", "false");
  musicStatus.textContent = "File lagu tidak bisa dimuat. Periksa kembali file audio.";
  console.error("Unable to load the supplied audio file.", song.error);
});

musicVolume.addEventListener("input", () => {
  song.volume = Number(musicVolume.value) / 100;
});

const photoFlowers = document.querySelectorAll(".flower[data-photo]");

function setPhotoOpen(flower, open) {
  flower.classList.toggle("is-photo-open", open);
  flower.setAttribute("aria-expanded", String(open));
}

photoFlowers.forEach((flower) => {
  flower.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch") {
      flower.setAttribute("aria-expanded", "true");
    }
  });
  flower.addEventListener("pointerleave", () => {
    if (!flower.classList.contains("is-photo-open")) {
      flower.setAttribute("aria-expanded", "false");
    }
  });
  flower.addEventListener("focus", () => {
    flower.setAttribute("aria-expanded", "true");
  });
  flower.addEventListener("blur", () => {
    if (!flower.classList.contains("is-photo-open") && !flower.matches(":hover")) {
      flower.setAttribute("aria-expanded", "false");
    }
  });
  flower.addEventListener("click", (event) => {
    const open = !flower.classList.contains("is-photo-open");
    flower.classList.toggle("is-photo-open", open);
    flower.setAttribute("aria-expanded", String(
      open || (event.pointerType !== "touch" && flower.matches(":hover, :focus")),
    ));
  });
  flower.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      flower.click();
    }
  });
});

document.addEventListener("pointerdown", (event) => {
  photoFlowers.forEach((flower) => {
    if (!flower.contains(event.target)) {
      setPhotoOpen(flower, false);
    }
  });
});

moonButton.addEventListener("click", () => {
  if (!surpriseDialog.open) {
    surpriseDialog.showModal();
  }
});

paperPlaneButton.addEventListener("animationend", (event) => {
  if (event.animationName === "plane-arrive") {
    paperPlaneButton.classList.add("is-hovering");
    paperPlaneButton.focus();
  } else if (event.animationName === "plane-depart") {
    paperPlaneButton.hidden = true;
    paperPlaneButton.disabled = false;
    paperPlaneButton.classList.remove("is-departing");
  }
});

surpriseContinueButton.addEventListener("click", () => {
  surpriseDialog.close();
  paperPlaneButton.hidden = false;
  moonButton.setAttribute("aria-expanded", "true");
});

surpriseDialog.addEventListener("click", (event) => {
  if (event.target === surpriseDialog) {
    surpriseDialog.close();
  }
});

paperPlaneButton.addEventListener("click", () => {
  if (!letterDialog.open) {
    letterDialog.showModal();
  }
});

letterCloseButton.addEventListener("click", () => {
  letterDialog.close();
});

letterDialog.addEventListener("click", (event) => {
  if (event.target === letterDialog) {
    letterDialog.close();
  }
});

letterDialog.addEventListener("close", () => {
  moonButton.setAttribute("aria-expanded", "false");
  paperPlaneButton.classList.remove("is-hovering");
  paperPlaneButton.disabled = true;
  moonButton.focus();

  if (reducedMotion.matches) {
    paperPlaneButton.hidden = true;
    paperPlaneButton.disabled = false;
    return;
  }

  paperPlaneButton.classList.add("is-departing");
});

function createFloater() {
  if (document.hidden || reducedMotion.matches || floaterLayer.childElementCount >= maxFloaters) {
    return;
  }

  const isHeart = Math.random() < 0.5;
  const floater = document.createElement("span");
  const duration = 12 + Math.random() * 8;

  floater.className = `floater floater--${isHeart ? "heart" : "flower"}`;
  floater.textContent = isHeart ? "♥" : "✿";
  floater.style.setProperty("--start-x", `${4 + Math.random() * 92}%`);
  floater.style.setProperty("--start-height", `${29 + Math.random() * 8}%`);
  floater.style.setProperty("--size", `${0.8 + Math.random() * 0.8}rem`);
  floater.style.setProperty("--duration", `${duration}s`);
  floater.style.setProperty("--drift", `${Math.random() * 7 - 3.5}rem`);
  floater.addEventListener("animationend", () => floater.remove(), { once: true });

  floaterLayer.append(floater);
}

if (!reducedMotion.matches) {
  for (let index = 0; index < 5; index += 1) {
    window.setTimeout(createFloater, index * 350);
  }

  window.setInterval(createFloater, spawnInterval);
}
