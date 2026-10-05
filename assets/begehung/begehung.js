// Interaktive Geländebegehung Projektareal Berg
// Standorte und Blickrichtungen wurden aus dem Bildinhalt rekonstruiert
// (Fotos ohne GPS-Daten) und am Orthofoto basemap.at verortet.
(function () {
  const el = document.getElementById("begehung-map");
  if (!el || !window.L) return;

  const AREAL = [[48.1207862,17.0587303],[48.1208095,17.0586574],[48.1209278,17.0582871],[48.1212848,17.0571519],[48.1213606,17.0569299],[48.1214812,17.0565349],[48.121503,17.0564737],[48.1215409,17.0563672],[48.1215791,17.0562916],[48.1216012,17.0562563],[48.1216298,17.0562493],[48.1217148,17.0563188],[48.1217412,17.0564203],[48.1218275,17.0586437],[48.1218457,17.0595273],[48.121861,17.0601161],[48.1219031,17.0611898],[48.1219205,17.0614456],[48.1216475,17.0613115],[48.1215391,17.0612582],[48.1213578,17.0611689],[48.1211082,17.0610444],[48.1208691,17.060926],[48.1203241,17.0606563],[48.1202095,17.0605776],[48.1205629,17.0594285],[48.1207862,17.0587303]];

  // Reihenfolge = Rundgang (Nordrand an der B9 -> Westen -> Süden -> Mitte -> Becken -> Osten)
  const STOPS = [
    { f: "1989", lat: 48.1217919, lon: 17.0584345, b: 0,   t: "Ehemaliges Zollamt Berg", d: "Blick vom Nordrand des Areals über die B9 auf das frühere Zollamtsgebäude (außerhalb des Areals)." },
    { f: "1992", lat: 48.1216964, lon: 17.0590425, b: 315, t: "Trafostation am Nordrand", d: "Kompakte Trafostation im Norden des Areals; dahinter jenseits der B9 das ehemalige Zollamt Berg." },
    { f: "1990", lat: 48.1217202, lon: 17.0583272, b: 225, t: "Ehemalige Abfertigungsfläche", d: "Betonplatten der früheren Abfertigung mit Absperrgittern im Westteil des Areals; im Hintergrund Sendemast und Hundsheimer Berge." },
    { f: "2002", lat: 48.1211592, lon: 17.0573616, b: 70,  t: "Sendemast am Südwestrand", d: "Sendemast mit eingezäunter Technik und Solarpaneel am Feldweg entlang der Südwestgrenze; links hinten das ehemalige Zollamt." },
    { f: "2003", lat: 48.1207892, lon: 17.0586848, b: 15,  t: "Zufahrtsweg von Süden", d: "Betonierter Weg vom Feldweg nach Norden ins Arealinnere; Sendemasten und Gehölz." },
    { f: "2001", lat: 48.1211282, lon: 17.05881,   b: 60,  t: "Technik am Sendemast", d: "Detail der Mobilfunk-Technik am Mastfuß in der Arealmitte." },
    { f: "1999", lat: 48.1213621, lon: 17.0585418, b: 130, t: "Asphaltschleife mit Sendemast", d: "Asphaltierte Wendeschleife in der Arealmitte; Blick nach Südosten zum Sendemast." },
    { f: "2004", lat: 48.1212667, lon: 17.0589888, b: 105, t: "Wiese und Gehölzstreifen", d: "Asphaltfläche und Wiese im Arealinneren; im Hintergrund der Gehölzbestand im Ostteil." },
    { f: "1991", lat: 48.1216486, lon: 17.0591927, b: 85,  t: "Betonbecken mit Steigleiter", d: "Offenes Betonbecken im Nordteil, vermutlich zur Regenwasserrückhaltung; Blick nach Osten zur Halle." },
    { f: "1993", lat: 48.1216773, lon: 17.0592856, b: 165, t: "Eingewachsenes Becken", d: "Becken mit Geländer, teils eingewachsen; Blick nach Süden auf Wiese und Gehölze." },
    { f: "1995", lat: 48.1215651, lon: 17.0592213, b: 85,  t: "Grasmulde zwischen den Becken", d: "Begrünte Mulde zwischen den Betonbecken; Blick nach Osten zur Halle am Ostrand." },
    { f: "1994", lat: 48.1214815, lon: 17.0591998, b: 92,  t: "Langgestrecktes Betonbecken", d: "Schmales, langes Betonbecken mit Geländer; Blick nach Osten." },
    { f: "1996", lat: 48.121577,  lon: 17.0597577, b: 105, t: "Mulde vor der Halle", d: "Gemähte Retentionsmulde im Ostteil; links die Halle, rechts der Gehölzstreifen." },
    { f: "1997", lat: 48.1216367, lon: 17.0597219, b: 250, t: "Mulden und Becken, Blick nach Westen", d: "Mulden mit Rohrauslässen im Vordergrund, dahinter die Becken, Sendemasten und Hundsheimer Berge." },
    { f: "1998", lat: 48.1217011, lon: 17.0597577, b: 245, t: "Blick über das Areal nach Westen", d: "Mulden und Becken im Nordteil; rechts die B9 mit Straßenbeleuchtung." },
  ];

  const DIRS = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];
  const dirName = (b) => DIRS[Math.round(b / 45) % 8];

  const ortho = L.tileLayer("https://mapsneu.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg", {
    maxNativeZoom: 19, maxZoom: 20,
    attribution: 'Orthofoto: <a href="https://basemap.at">basemap.at</a> (CC BY 4.0)',
  });
  const karte = L.tileLayer("https://mapsneu.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png", {
    maxNativeZoom: 19, maxZoom: 20,
    attribution: 'Karte: <a href="https://basemap.at">basemap.at</a> (CC BY 4.0)',
  });

  const map = L.map(el, { layers: [ortho], scrollWheelZoom: false, zoomSnap: 0.25 });
  L.control.layers({ "Orthofoto": ortho, "Karte": karte }, null, { position: "topright" }).addTo(map);
  L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);
  map.on("focus", () => map.scrollWheelZoom.enable());
  map.on("blur", () => map.scrollWheelZoom.disable());

  const areal = L.polygon(AREAL, { color: "#e8961e", weight: 3, fillColor: "#e8961e", fillOpacity: 0.08, dashArray: "6 4" })
    .addTo(map).bindTooltip("Projektareal (rund 3,9 ha)", { sticky: true });
  map.fitBounds(areal.getBounds(), { padding: [24, 24] });

  const camSvg = (b, n) =>
    `<svg viewBox="-34 -34 68 68" width="52" height="52" aria-hidden="true">
      <g transform="rotate(${b})">
        <path class="cone" d="M0 0 L-16 -32 A36 36 0 0 1 16 -32 Z"/>
        <path class="arrow" d="M0 -31 L-7 -19 L7 -19 Z"/>
      </g>
      <circle class="dot" r="13"/>
      <g class="glyph" transform="translate(-7,-5.5)">
        <rect x="0" y="2" width="14" height="9" rx="2"/>
        <rect x="4" y="0" width="6" height="3" rx="1"/>
        <circle cx="7" cy="6.5" r="2.6" class="lens"/>
      </g>
      <text class="num" x="12" y="-11">${n}</text>
    </svg>`;

  const markers = STOPS.map((s, i) => {
    const m = L.marker([s.lat, s.lon], {
      icon: L.divIcon({ className: "cam-icon", html: camSvg(s.b, i + 1), iconSize: [52, 52], iconAnchor: [26, 26] }),
      keyboard: true, title: `${i + 1}: ${s.t}`, riseOnHover: true,
    }).addTo(map);
    m.bindTooltip(`<b>${i + 1}</b> · ${s.t}`, { direction: "top", offset: [0, -16] });
    m.on("click", () => open(i));
    return m;
  });

  // Vorschaubild-Leiste
  const strip = document.getElementById("begehung-strip");
  STOPS.forEach((s, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = `<img src="assets/begehung/thumb_${s.f}.jpg" alt="" loading="lazy"><span>${i + 1}</span>`;
    btn.title = `${i + 1}: ${s.t}`;
    btn.addEventListener("click", () => open(i));
    strip.appendChild(btn);
  });

  // Foto-Viewer
  const v = document.getElementById("begehung-viewer");
  const vImg = v.querySelector("img");
  const vTitle = v.querySelector(".bv-title");
  const vMeta = v.querySelector(".bv-meta");
  const vDesc = v.querySelector(".bv-desc");
  let cur = -1;

  function open(i) {
    cur = (i + STOPS.length) % STOPS.length;
    const s = STOPS[cur];
    vImg.src = `assets/begehung/foto_${s.f}.jpg`;
    vImg.alt = s.t;
    vTitle.textContent = `${cur + 1}. ${s.t}`;
    vMeta.textContent = `Standort ${cur + 1} von ${STOPS.length} · Blickrichtung ${dirName(s.b)}`;
    vDesc.textContent = s.d;
    markers.forEach((m, k) => m.getElement() && m.getElement().classList.toggle("is-active", k === cur));
    strip.querySelectorAll("button").forEach((b, k) => b.classList.toggle("is-active", k === cur));
    v.classList.add("open");
    map.panTo([s.lat, s.lon], { animate: true });
  }
  function close() {
    v.classList.remove("open");
  }
  v.querySelector(".bv-prev").addEventListener("click", (e) => { e.stopPropagation(); open(cur - 1); });
  v.querySelector(".bv-next").addEventListener("click", (e) => { e.stopPropagation(); open(cur + 1); });
  v.querySelector(".bv-close").addEventListener("click", close);
  v.addEventListener("click", (e) => { if (e.target === v) close(); });
  document.addEventListener("keydown", (e) => {
    if (!v.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") open(cur - 1);
    if (e.key === "ArrowRight") open(cur + 1);
  });
  document.getElementById("begehung-start").addEventListener("click", () => open(0));
})();
