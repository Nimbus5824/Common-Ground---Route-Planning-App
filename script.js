"use strict";

const initialStops = [
  { id: "falls", name: "Multnomah Falls", category: "nature", detail: "A waterfall worth the little climb", rating: "4.9", time: "10:15" },
  { id: "lunch", name: "Brigham Fish Market", category: "food", detail: "Fresh catch, right by the river", rating: "4.8", time: "12:30" },
  { id: "orchard", name: "Hood River Fruit Loop", category: "culture", detail: "Farm stands & orchard views", rating: "4.7", time: "14:00" }
];
const categoryLabels = { food: "Food & drink", nature: "Outdoors", culture: "Culture", services: "Services" };
const categoryIcons = { food: "✳", nature: "↟", culture: "◈", services: "⌖" };
const descriptions = {
  falls: "A waterfall worth the little climb",
  lunch: "Fresh catch, right by the river",
  orchard: "Farm stands & orchard views"
};
const storageKey = "common-ground-route-v1";
let stops = loadStops();
let currentFilter = "all";
let selectedStop = null;
let toastTimer;

function loadStops() {
  try {
    const sharedPlan = new URLSearchParams(location.hash.slice(1)).get("plan");
    if (sharedPlan) {
      const parsedPlan = JSON.parse(sharedPlan);
      if (Array.isArray(parsedPlan) && parsedPlan.length <= 50 && parsedPlan.every((stop) =>
        stop && typeof stop.name === "string" && stop.name.trim().length > 0 &&
        stop.name.length <= 60 && Object.hasOwn(categoryLabels, stop.category)
      )) {
        return parsedPlan.map((stop, index) => ({
          id: `shared-${index}`,
          name: stop.name.trim(),
          category: stop.category,
          detail: categoryLabels[stop.category],
          rating: "",
          time: ""
        }));
      }
    }
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved) && saved.every((stop) =>
      stop && typeof stop.id === "string" && typeof stop.name === "string" &&
      Object.hasOwn(categoryLabels, stop.category)
    )) return saved;
  } catch (error) {
    // Storage may be unavailable in private browsing; the in-memory plan still works.
  }
  return initialStops.map((stop) => ({ ...stop }));
}

function saveStops() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(stops));
  } catch (error) {
    showToast("Your browser couldn’t save this draft.");
  }
}

function renderStops() {
  const list = document.querySelector("#stop-list");
  const visibleStops = stops.filter((stop) => currentFilter === "all" || stop.category === currentFilter);
  list.replaceChildren();
  document.querySelector("#stop-badge").textContent = String(stops.length);
  document.querySelector("#stop-count").textContent = `${stops.length} ${stops.length === 1 ? "little detour" : "little detours"}`;

  if (!visibleStops.length) {
    const empty = document.createElement("li");
    empty.className = "empty-stops";
    empty.textContent = stops.length ? "No stops in this category just yet." : "No stops planned. Add the first place you’d love to visit.";
    list.append(empty);
  }
  renderInsights(visibleStops);

  visibleStops.forEach((stop, index) => {
    const item = document.createElement("li");
    item.className = "stop-item";
    const marker = document.createElement("span");
    marker.className = `stop-number ${stop.category}`;
    marker.textContent = categoryIcons[stop.category];
    marker.setAttribute("aria-label", categoryLabels[stop.category]);
    const info = document.createElement("button");
    info.type = "button";
    info.className = "stop-info";
    info.setAttribute("aria-label", `Show ${stop.name} on the route`);
    info.style.cssText = "border:0;background:none;padding:0;text-align:left;color:inherit;cursor:pointer";
    const name = document.createElement("strong");
    name.textContent = stop.name;
    const detail = document.createElement("small");
    detail.textContent = stop.detail || categoryLabels[stop.category];
    info.append(name, detail);
    info.addEventListener("click", () => selectStop(stop.id));

    const meta = document.createElement("span");
    meta.className = "stop-meta";
    const rating = document.createElement("span");
    rating.className = "stop-rating";
    rating.textContent = stop.rating ? `★ ${stop.rating}` : categoryLabels[stop.category];
    meta.append(rating, document.createTextNode(` · ${stop.time || `${10 + index}:00`}`));
    item.append(marker, info, meta);

    if (document.querySelector("#role-select").value !== "guest") {
      const remove = document.createElement("button");
      remove.className = "remove-stop";
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remove ${stop.name}`);
      remove.addEventListener("click", () => removeStop(stop.id));
      item.append(remove);
    }
    list.append(item);
  });
  renderMapStops();
}

function renderMapStops() {
  const group = document.querySelector("#map-stops");
  group.replaceChildren();
  const visibleStops = stops.filter((stop) => currentFilter === "all" || stop.category === currentFilter);
  const positions = [
    [164, 176], [268, 210], [382, 129], [490, 162], [535, 116],
    [217, 120], [321, 158], [439, 203], [120, 212], [560, 151]
  ];
  visibleStops.forEach((stop, index) => {
    const originalIndex = stops.indexOf(stop);
    const [x, y] = positions[originalIndex % positions.length];
    const pin = document.createElementNS("http://www.w3.org/2000/svg", "g");
    pin.setAttribute("class", `map-pin${selectedStop === stop.id ? " selected" : ""}`);
    pin.setAttribute("transform", `translate(${x} ${y})`);
    pin.setAttribute("tabindex", "0");
    pin.setAttribute("role", "button");
    pin.setAttribute("aria-label", `${stop.name}, route stop ${originalIndex + 1}`);
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("r", "11");
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("y", "3.5");
    text.textContent = String(index + 1);
    pin.append(circle, text);
    pin.addEventListener("click", () => selectStop(stop.id));
    pin.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectStop(stop.id);
      }
    });
    group.append(pin);
  });
}

function renderInsights(visibleStops) {
  const counts = Object.fromEntries(Object.keys(categoryLabels).map((category) => [category, 0]));
  visibleStops.forEach((stop) => { counts[stop.category] += 1; });
  const largestCount = Math.max(1, ...Object.values(counts));
  document.querySelector("#insight-count").textContent = String(visibleStops.length);
  document.querySelector("#insight-label").textContent = `stop${visibleStops.length === 1 ? "" : "s"} in this view`;
  document.querySelector("#category-chart").setAttribute(
    "aria-label",
    `Stops in this view: ${Object.entries(counts).map(([category, count]) => `${categoryLabels[category]} ${count}`).join(", ")}`
  );
  document.querySelectorAll(".category-row").forEach((row) => {
    const count = counts[row.dataset.category];
    row.querySelector("b").style.width = `${count / largestCount * 100}%`;
    row.querySelector("strong").textContent = String(count);
  });
}

function selectStop(id) {
  selectedStop = selectedStop === id ? null : id;
  renderMapStops();
  const stop = stops.find((item) => item.id === selectedStop);
  if (stop) showToast(`${stop.name} — ${stop.detail || categoryLabels[stop.category]}`);
}

function removeStop(id) {
  stops = stops.filter((stop) => stop.id !== id);
  if (selectedStop === id) selectedStop = null;
  saveStops();
  renderStops();
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2800);
}

document.querySelector("#add-stop-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (document.querySelector("#role-select").value === "guest") return;
  if (stops.length >= 50) {
    showToast("This plan has reached its 50-stop limit.");
    return;
  }
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  if (!name) return;
  stops.push({
    id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    category: form.elements.category.value,
    detail: descriptions[form.elements.category.value] || categoryLabels[form.elements.category.value],
    rating: "",
    time: ""
  });
  saveStops();
  form.reset();
  currentFilter = "all";
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    const active = chip.dataset.filter === "all";
    chip.classList.toggle("active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
  renderStops();
  showToast(`${name} added to your route.`);
});

document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    currentFilter = chip.dataset.filter;
    document.querySelectorAll(".filter-chip").forEach((item) => {
      const active = item === chip;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderStops();
  });
});

document.querySelector("#add-focus").addEventListener("click", () => document.querySelector("#stop-name").focus());

function updateRole(role) {
  const guest = role === "guest";
  document.querySelectorAll(".edit-only").forEach((control) => { control.hidden = guest; });
  const note = document.querySelector("#permission-note");
  note.hidden = !guest;
  note.textContent = guest ? "You’re viewing this plan as a guest. You can explore stops, but editing is turned off." : "";
  renderStops();
}

document.querySelector("#role-select").addEventListener("change", (event) => updateRole(event.target.value));

document.querySelectorAll(".share-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const shareParams = new URLSearchParams();
    shareParams.set("plan", JSON.stringify(stops.map(({ name, category }) => ({ name, category }))));
    shareParams.set("role", "guest");
    const shareUrl = `${location.origin}${location.pathname}#${shareParams.toString()}`;
    try {
      if (navigator.share) await navigator.share({ title: "Our Common Ground route", url: shareUrl });
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Plan link copied. Invite your people!");
      } else showToast("Your plan is ready to share.");
    } catch (error) {
      if (error.name !== "AbortError") showToast("Your plan is ready to share.");
    }
  });
});

document.querySelector("#zoom-button").addEventListener("click", (event) => {
  const map = document.querySelector("#route-map");
  const zoomed = map.dataset.zoomed !== "true";
  map.dataset.zoomed = String(zoomed);
  map.style.transform = zoomed ? "scale(1.13)" : "scale(1)";
  map.style.transformOrigin = "center";
  map.style.transition = "transform .25s ease";
  event.currentTarget.setAttribute("aria-label", zoomed ? "Reset route map zoom" : "Zoom route map");
  event.currentTarget.textContent = zoomed ? "−" : "＋";
});

const initialRole = new URLSearchParams(location.hash.slice(1)).get("role");
if (initialRole === "guest") document.querySelector("#role-select").value = "guest";
updateRole(document.querySelector("#role-select").value);
