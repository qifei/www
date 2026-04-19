(() => {
  const overlay = document.getElementById("pageDropOverlay");
  const dialog = document.getElementById("pageDropCard");
  if (!overlay) return;

  let active = false;
  let depth = 0;

  function hasFiles(event) {
    const types = event && event.dataTransfer && event.dataTransfer.types;
    return !!types && Array.from(types).includes("Files");
  }

  function showOverlay() {
    if (active) return;
    active = true;
    document.body.classList.add("fileDropActive");
    overlay.setAttribute("aria-hidden", "false");
    dialog.showModal()
  }

  function hideOverlay() {
    active = false;
    depth = 0;
    document.body.classList.remove("fileDropActive");
    overlay.setAttribute("aria-hidden", "true");
    dialog.close()
  }

  function handleLeave(event) {
    if (!active || !hasFiles(event)) return;
    depth = Math.max(0, depth - 1);
    const outsideWindow =
      event.clientX <= 0 ||
      event.clientY <= 0 ||
      event.clientX >= window.innerWidth ||
      event.clientY >= window.innerHeight;
    if (outsideWindow || depth === 0) {
      window.setTimeout(() => {
        if (depth === 0) hideOverlay();
      }, 0);
    }
  }

  window.addEventListener("dragenter", (event) => {
    if (!hasFiles(event)) return;
    depth += 1;
    showOverlay();
  }, { passive: false });

  window.addEventListener("dragover", (event) => {
    if (!hasFiles(event)) return;
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    showOverlay();
  }, { passive: false });

  window.addEventListener("dragleave", handleLeave, { passive: false });
  window.addEventListener("drop", hideOverlay, { passive: false });
  window.addEventListener("dragend", hideOverlay, { passive: false });
  window.addEventListener("blur", hideOverlay);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) hideOverlay();
  });
})();
