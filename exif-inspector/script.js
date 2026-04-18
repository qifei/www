const photoInput = document.getElementById("photoInput");
const result = document.getElementById("result");
const previewContainer = document.getElementById("previewContainer");
const rawJsonContainer = document.getElementById("rawJsonContainer");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

function getTag(tags, key) {
  return tags[key]?.description || "N/A";
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function createMapButtons(lat, lng) {
  if (lat === "N/A" || lng === "N/A") return "";

  const google = `https://www.google.com/maps?q=${lat},${lng}`;
  const osm = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}`;

  return `
    <button class="map-btn" onclick="window.open('${google}', '_blank')">
      Open in Google Maps
    </button>
    <button class="map-btn" onclick="window.open('${osm}', '_blank')">
      Open in OpenStreetMap
    </button>
  `;
}

function createPreview(file, fileName) {
  const url = URL.createObjectURL(file);

  return `
    <div class="card">
      <div class="section-title">${fileName}</div>
      <img src="${url}" alt="Photo Preview" class="preview-image">
    </div>
  `;
}

function buildRawJson(tags, index, fileName, file) {
  const url = URL.createObjectURL(file);

  return `
    <div class="raw-box">
      <img src="${url}" alt="Photo Preview" class="preview-image">

      <div class="raw-title">${fileName} Raw JSON</div>
      <textarea readonly>${JSON.stringify(tags, null, 2)}</textarea>
    </div>
  `;
}

function buildCard(file, tags, index, fileName) {
  const date = getTag(tags, "DateTimeOriginal");
  const width = getTag(tags, "Image Width");
  const height = getTag(tags, "Image Height");
  const maker = getTag(tags, "Make");
  const model = getTag(tags, "Model");

  const lat = getTag(tags, "GPSLatitude");
  const lng = getTag(tags, "GPSLongitude");
  const alt = getTag(tags, "GPSAltitude");

  const metering = getTag(tags, "MeteringMode");
  const exifVersion = getTag(tags, "ExifVersion");
  const exposureBias = getTag(tags, "ExposureBiasValue");
  const iso = getTag(tags, "ISO Speed Ratings");
  const exposureTime = getTag(tags, "ExposureTime");
  const aperture = getTag(tags, "FNumber");

  return `
    <div class="card">
      <div class="section-title">${fileName}</div>

      <div class="info-row"><strong>Date Taken:</strong> ${date}</div>
      <div class="info-row"><strong>Dimensions:</strong> ${width} × ${height}</div>
      <div class="info-row"><strong>File Size:</strong> ${formatFileSize(file.size)}</div>

      <div class="info-row"><strong>Camera Maker:</strong> ${maker}</div>
      <div class="info-row"><strong>Camera Model:</strong> ${model}</div>

      <div class="info-row"><strong>Latitude:</strong> ${lat}</div>
      <div class="info-row"><strong>Longitude:</strong> ${lng}</div>
      <div class="info-row"><strong>Altitude:</strong> ${alt}</div>

      ${createMapButtons(lat, lng)}

      <br>
      <button class="more-btn" onclick="toggleMore(${index})">More Info</button>

      <div id="more-${index}" class="hidden">
        <div class="info-row"><strong>Metering Mode:</strong> ${metering}</div>
        <div class="info-row"><strong>EXIF Version:</strong> ${exifVersion}</div>
        <div class="info-row"><strong>Exposure Bias:</strong> ${exposureBias}</div>
        <div class="info-row"><strong>ISO:</strong> ${iso}</div>
        <div class="info-row"><strong>Exposure Time:</strong> ${exposureTime}</div>
        <div class="info-row"><strong>Aperture:</strong> ${aperture}</div>
      </div>
    </div>
  `;
}

window.toggleMore = function(index) {
  const box = document.getElementById(`more-${index}`);
  box.classList.toggle("hidden");
};

photoInput.addEventListener("change", async (event) => {
  const files = Array.from(event.target.files).slice(0, 2);

  previewContainer.innerHTML = "";
  result.innerHTML = "";
  rawJsonContainer.innerHTML = "";

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const buffer = await file.arrayBuffer();

    try {
      const tags = ExifReader.load(buffer);

      previewContainer.innerHTML += createPreview(file, file.name);
      result.innerHTML += buildCard(file, tags, i, file.name);
      rawJsonContainer.innerHTML += buildRawJson(tags, i, file.name, file);
    } catch (err) {
      result.innerHTML += `<div class="card">Failed to read metadata for ${file.name}</div>`;
    }
  }
});

for (const button of tabButtons) {
  button.addEventListener("click", () => {
    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabContents.forEach(tab => tab.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.add("active");
  });
}