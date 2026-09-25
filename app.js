const TOTAL_LAPS = 50;

const drivers = [
  {
    code: "NOR",
    name: "Lando Norris",
    team: "McLaren",
    position: 1,
    startTyre: "Medium",
    pitLap: 23,
    secondTyre: "Hard",
  },
  {
    code: "VER",
    name: "Max Verstappen",
    team: "Red Bull Racing",
    position: 2,
    startTyre: "Medium",
    pitLap: 21,
    secondTyre: "Hard",
  },
  {
    code: "LEC",
    name: "Charles Leclerc",
    team: "Ferrari",
    position: 3,
    startTyre: "Medium",
    pitLap: 22,
    secondTyre: "Hard",
  },
  {
    code: "PIA",
    name: "Oscar Piastri",
    team: "McLaren",
    position: 4,
    startTyre: "Soft",
    pitLap: 16,
    secondTyre: "Hard",
  },
  {
    code: "HAM",
    name: "Lewis Hamilton",
    team: "Ferrari",
    position: 5,
    startTyre: "Medium",
    pitLap: 24,
    secondTyre: "Hard",
  },
  {
    code: "RUS",
    name: "George Russell",
    team: "Mercedes",
    position: 6,
    startTyre: "Hard",
    pitLap: 30,
    secondTyre: "Medium",
  },
  {
    code: "ANT",
    name: "Kimi Antonelli",
    team: "Mercedes",
    position: 7,
    startTyre: "Medium",
    pitLap: 25,
    secondTyre: "Hard",
  },
  {
    code: "ALO",
    name: "Fernando Alonso",
    team: "Aston Martin",
    position: 8,
    startTyre: "Hard",
    pitLap: 31,
    secondTyre: "Medium",
  },
  {
    code: "SAI",
    name: "Carlos Sainz",
    team: "Williams",
    position: 9,
    startTyre: "Soft",
    pitLap: 15,
    secondTyre: "Hard",
  },
  {
    code: "ALB",
    name: "Alex Albon",
    team: "Williams",
    position: 10,
    startTyre: "Medium",
    pitLap: 26,
    secondTyre: "Hard",
  },
  {
    code: "GAS",
    name: "Pierre Gasly",
    team: "Alpine",
    position: 11,
    startTyre: "Medium",
    pitLap: 27,
    secondTyre: "Hard",
  },
  {
    code: "TSU",
    name: "Yuki Tsunoda",
    team: "Red Bull Racing",
    position: 12,
    startTyre: "Soft",
    pitLap: 14,
    secondTyre: "Medium",
  },
  {
    code: "OCO",
    name: "Esteban Ocon",
    team: "Haas",
    position: 13,
    startTyre: "Hard",
    pitLap: 32,
    secondTyre: "Medium",
  },
  {
    code: "STR",
    name: "Lance Stroll",
    team: "Aston Martin",
    position: 14,
    startTyre: "Medium",
    pitLap: 28,
    secondTyre: "Hard",
  },
  {
    code: "HAD",
    name: "Isack Hadjar",
    team: "Racing Bulls",
    position: 15,
    startTyre: "Soft",
    pitLap: 17,
    secondTyre: "Hard",
  },
  {
    code: "LAW",
    name: "Liam Lawson",
    team: "Racing Bulls",
    position: 16,
    startTyre: "Medium",
    pitLap: 29,
    secondTyre: "Hard",
  },
  {
    code: "BEA",
    name: "Oliver Bearman",
    team: "Haas",
    position: 17,
    startTyre: "Soft",
    pitLap: 18,
    secondTyre: "Medium",
  },
  {
    code: "HUL",
    name: "Nico Hulkenberg",
    team: "Sauber",
    position: 18,
    startTyre: "Hard",
    pitLap: 33,
    secondTyre: "Medium",
  },
  {
    code: "BOR",
    name: "Gabriel Bortoleto",
    team: "Sauber",
    position: 19,
    startTyre: "Medium",
    pitLap: 27,
    secondTyre: "Hard",
  },
  {
    code: "COL",
    name: "Franco Colapinto",
    team: "Alpine",
    position: 20,
    startTyre: "Soft",
    pitLap: 16,
    secondTyre: "Medium",
  },
];

const markerSlots = [
  [17, 82],
  [12, 69],
  [14, 50],
  [18, 28],
  [27, 15],
  [42, 13],
  [59, 13],
  [73, 14],
  [84, 22],
  [88, 38],
  [86, 57],
  [82, 76],
  [72, 87],
  [58, 87],
  [50, 77],
  [45, 62],
  [37, 59],
  [29, 63],
  [23, 72],
  [20, 88],
];

let selectedDriverCode = "HAM";
let compareDriverOneCode = "HAM";
let compareDriverTwoCode = "LEC";
let timer = null;
let markerProgress = 2;

const elements = {
  playBtn: document.querySelector("#playBtn"),
  previewBtn: document.querySelector("#previewBtn"),
  lapSlider: document.querySelector("#lapSlider"),
  lapNow: document.querySelector("#lapNow"),
  snapshotLap: document.querySelector("#snapshotLap"),
  fieldLap: document.querySelector("#fieldLap"),
  centerLap: document.querySelector("#centerLap"),
  centerDriver: document.querySelector("#centerDriver"),
  markerLayer: document.querySelector("#markerLayer"),
  driverSelect: document.querySelector("#driverSelect"),
  positionList: document.querySelector("#positionList"),
  tyreFilter: document.querySelector("#tyreFilter"),
  tyreDriverList: document.querySelector("#tyreDriverList"),
  softCount: document.querySelector("#softCount"),
  mediumCount: document.querySelector("#mediumCount"),
  hardCount: document.querySelector("#hardCount"),
  softBar: document.querySelector("#softBar"),
  mediumBar: document.querySelector("#mediumBar"),
  hardBar: document.querySelector("#hardBar"),
  stoppedCount: document.querySelector("#stoppedCount"),
  startingTyresCount: document.querySelector("#startingTyresCount"),
  selectedDriverName: document.querySelector("#selectedDriverName"),
  selectedDriverTeam: document.querySelector("#selectedDriverTeam"),
  selectedPositionBadge: document.querySelector("#selectedPositionBadge"),
  selectedTyre: document.querySelector("#selectedTyre"),
  selectedGap: document.querySelector("#selectedGap"),
  selectedPit: document.querySelector("#selectedPit"),
  selectedLap: document.querySelector("#selectedLap"),
  selectedContext: document.querySelector("#selectedContext"),
  compareDriverOne: document.querySelector("#compareDriverOne"),
  compareDriverTwo: document.querySelector("#compareDriverTwo"),
  compareOneName: document.querySelector("#compareOneName"),
  compareOneTeam: document.querySelector("#compareOneTeam"),
  compareOnePosition: document.querySelector("#compareOnePosition"),
  compareOneTyre: document.querySelector("#compareOneTyre"),
  compareOneGap: document.querySelector("#compareOneGap"),
  compareOnePit: document.querySelector("#compareOnePit"),
  compareTwoName: document.querySelector("#compareTwoName"),
  compareTwoTeam: document.querySelector("#compareTwoTeam"),
  compareTwoPosition: document.querySelector("#compareTwoPosition"),
  compareTwoTyre: document.querySelector("#compareTwoTyre"),
  compareTwoGap: document.querySelector("#compareTwoGap"),
  compareTwoPit: document.querySelector("#compareTwoPit"),
  comparisonResult: document.querySelector("#comparisonResult"),
  comparisonTrend: document.querySelector("#comparisonTrend"),
};

function getLap() {
  return Number(elements.lapSlider.value);
}

function getDriver(code) {
  return drivers.find((driver) => driver.code === code);
}

function getCurrentTyre(driver, lap) {
  return lap >= driver.pitLap ? driver.secondTyre : driver.startTyre;
}

function getTyreAge(driver, lap) {
  if (lap >= driver.pitLap) {
    return Math.max(1, lap - driver.pitLap + 1);
  }

  return lap;
}

function hasPitted(driver, lap) {
  return lap >= driver.pitLap;
}

function getGapToLeader(driver, lap) {
  if (driver.position === 1) {
    return 0;
  }

  const baseGap = (driver.position - 1) * 1.75;
  const lapVariation = Math.sin((lap + driver.position) * 0.42) * 0.7;

  return Math.max(0.5, baseGap + lapVariation);
}

function getPairGap(driverOne, driverTwo, lap) {
  const gapOne = getGapToLeader(driverOne, lap);
  const gapTwo = getGapToLeader(driverTwo, lap);

  return Math.abs(gapOne - gapTwo);
}

function formatTyre(driver, lap) {
  const tyre = getCurrentTyre(driver, lap);
  const age = getTyreAge(driver, lap);

  return `${tyre} · ${age} ${age === 1 ? "lap" : "laps"} old`;
}

function formatGap(driver, lap) {
  const gap = getGapToLeader(driver, lap);

  if (driver.position === 1) {
    return "Leading";
  }

  return `${gap.toFixed(1)}s behind leader`;
}

function formatPitStatus(driver, lap) {
  if (!hasPitted(driver, lap)) {
    return "Not stopped yet";
  }

  return `1 stop · lap ${driver.pitLap}`;
}

function buildSelectOptions(selectElement, selectedCode) {
  selectElement.innerHTML = "";

  drivers.forEach((driver) => {
    const option = document.createElement("option");
    option.value = driver.code;
    option.textContent = `${driver.name} · ${driver.team}`;
    option.selected = driver.code === selectedCode;
    selectElement.appendChild(option);
  });
}

function buildMarkers() {
  elements.markerLayer.innerHTML = "";

  drivers.forEach((driver) => {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "driver-marker";
    marker.dataset.code = driver.code;
    marker.textContent = driver.code;
    marker.setAttribute("aria-label", `${driver.name}, ${driver.team}`);

    marker.addEventListener("click", () => {
      selectedDriverCode = driver.code;
      compareDriverOneCode = driver.code;
      elements.driverSelect.value = driver.code;
      elements.compareDriverOne.value = driver.code;
      renderAll();
    });

    elements.markerLayer.appendChild(marker);
  });
}

function getMarkerSlot(driverIndex, progress) {
  const movement = Math.max(0, (progress - 1) / 2);
  const baseStep = Math.floor(movement);
  const fraction = movement - baseStep;
  const currentIndex = (driverIndex + baseStep) % markerSlots.length;
  const nextIndex = (currentIndex + 1) % markerSlots.length;
  const [currentLeft, currentTop] = markerSlots[currentIndex];
  const [nextLeft, nextTop] = markerSlots[nextIndex];

  return [
    currentLeft + (nextLeft - currentLeft) * fraction,
    currentTop + (nextTop - currentTop) * fraction,
  ];
}

function renderMarkers(progress = markerProgress) {
  const comparedCodes = new Set([compareDriverOneCode, compareDriverTwoCode]);

  drivers.forEach((driver, index) => {
    const marker = elements.markerLayer.querySelector(
      `[data-code="${driver.code}"]`,
    );
    const [left, top] = getMarkerSlot(index, progress);

    marker.style.left = `${left}%`;
    marker.style.top = `${top}%`;
    marker.classList.toggle("selected", driver.code === selectedDriverCode);
    marker.classList.toggle(
      "compared",
      comparedCodes.has(driver.code) && driver.code !== selectedDriverCode,
    );
  });
}

function renderPositionWall() {
  const lap = getLap();
  elements.positionList.innerHTML = "";

  drivers.forEach((driver) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "position-row";
    row.classList.toggle("active", driver.code === selectedDriverCode);

    const gap =
      driver.position === 1
        ? "Leader"
        : `+${getGapToLeader(driver, lap).toFixed(1)}s`;

    row.innerHTML = `
      <span class="position-number">P${driver.position}</span>
      <span class="position-code">${driver.code}</span>
      <span class="position-name">${driver.name}</span>
      <span class="position-gap">${gap}</span>
    `;

    row.addEventListener("click", () => {
      selectedDriverCode = driver.code;
      compareDriverOneCode = driver.code;
      elements.driverSelect.value = driver.code;
      elements.compareDriverOne.value = driver.code;
      renderAll();
    });

    elements.positionList.appendChild(row);
  });
}

function renderTyreSummary() {
  const lap = getLap();
  const tyreCounts = {
    Soft: 0,
    Medium: 0,
    Hard: 0,
  };

  drivers.forEach((driver) => {
    tyreCounts[getCurrentTyre(driver, lap)] += 1;
  });

  elements.softCount.textContent = tyreCounts.Soft;
  elements.mediumCount.textContent = tyreCounts.Medium;
  elements.hardCount.textContent = tyreCounts.Hard;

  elements.softBar.style.width = `${(tyreCounts.Soft / drivers.length) * 100}%`;
  elements.mediumBar.style.width = `${(tyreCounts.Medium / drivers.length) * 100}%`;
  elements.hardBar.style.width = `${(tyreCounts.Hard / drivers.length) * 100}%`;

  const filteredTyre = elements.tyreFilter.value;
  const matchingDrivers = drivers.filter(
    (driver) => getCurrentTyre(driver, lap) === filteredTyre,
  );

  elements.tyreDriverList.innerHTML = "";

  matchingDrivers.forEach((driver) => {
    const chip = document.createElement("span");
    chip.className = "tyre-driver-chip";
    chip.textContent = driver.code;
    chip.title = `${driver.name} · ${driver.team}`;
    elements.tyreDriverList.appendChild(chip);
  });
}

function renderPitProgress() {
  const lap = getLap();
  const stopped = drivers.filter((driver) => hasPitted(driver, lap)).length;

  elements.stoppedCount.textContent = stopped;
  elements.startingTyresCount.textContent = drivers.length - stopped;
}

function renderSelectedDriver() {
  const lap = getLap();
  const driver = getDriver(selectedDriverCode);
  const tyre = getCurrentTyre(driver, lap);
  const tyreAge = getTyreAge(driver, lap);

  elements.selectedDriverName.textContent = driver.name;
  elements.selectedDriverTeam.textContent = driver.team;
  elements.selectedPositionBadge.textContent = `P${driver.position}`;
  elements.selectedTyre.textContent = formatTyre(driver, lap);
  elements.selectedGap.textContent = formatGap(driver, lap);
  elements.selectedPit.textContent = formatPitStatus(driver, lap);
  elements.selectedLap.textContent = `Lap ${lap} of ${TOTAL_LAPS}`;
  elements.centerDriver.textContent = driver.name;

  if (tyre === "Soft") {
    elements.selectedContext.textContent =
      `${driver.name} is on the fastest compound in this prototype, ` +
      `but the tyre is ${tyreAge} ${tyreAge === 1 ? "lap" : "laps"} old.`;
    return;
  }

  if (tyre === "Hard") {
    elements.selectedContext.textContent =
      `${driver.name} is on the longest-lasting compound in this prototype. ` +
      `The pit-status line shows whether that tyre came from a stop or the start.`;
    return;
  }

  elements.selectedContext.textContent =
    `${driver.name} is on the medium compound: a middle-ground strategy between ` +
    `short-run pace and longer tyre life.`;
}

function populateComparisonCard(prefix, driver) {
  const lap = getLap();
  const gap = getGapToLeader(driver, lap);

  elements[`${prefix}Name`].textContent = driver.name;
  elements[`${prefix}Team`].textContent = driver.team;
  elements[`${prefix}Position`].textContent = `P${driver.position}`;
  elements[`${prefix}Tyre`].textContent = formatTyre(driver, lap);
  elements[`${prefix}Gap`].textContent =
    driver.position === 1 ? "Leading" : `${gap.toFixed(1)}s`;
  elements[`${prefix}Pit`].textContent = hasPitted(driver, lap)
    ? `Stopped lap ${driver.pitLap}`
    : "Not stopped";
}

function renderComparison() {
  const lap = getLap();
  const driverOne = getDriver(compareDriverOneCode);
  const driverTwo = getDriver(compareDriverTwoCode);

  populateComparisonCard("compareOne", driverOne);
  populateComparisonCard("compareTwo", driverTwo);

  const gap = getPairGap(driverOne, driverTwo, lap);
  const ahead = driverOne.position < driverTwo.position ? driverOne : driverTwo;
  const behind = ahead.code === driverOne.code ? driverTwo : driverOne;

  elements.comparisonResult.textContent =
    `${ahead.name} is ${gap.toFixed(1)}s ahead of ${behind.name}.`;

  const previousLap = Math.max(1, lap - 3);
  const previousGap = getPairGap(driverOne, driverTwo, previousLap);
  const change = gap - previousGap;
  const direction = change >= 0 ? "grown" : "shrunk";

  elements.comparisonTrend.textContent =
    `The gap has ${direction} by ${Math.abs(change).toFixed(1)}s ` +
    `over the last ${lap - previousLap || 1} laps.`;
}

function renderLapLabels() {
  const lap = getLap();
  const labelIds = [
    "lapNow",
    "snapshotLap",
    "fieldLap",
    "centerLap",
  ];

  labelIds.forEach((id) => {
    elements[id].textContent = lap;
  });
}

function renderAll() {
  renderLapLabels();
  renderMarkers();
  renderPositionWall();
  renderTyreSummary();
  renderPitProgress();
  renderSelectedDriver();
  renderComparison();
}

function syncSelectValues() {
  elements.driverSelect.value = selectedDriverCode;
  elements.compareDriverOne.value = compareDriverOneCode;
  elements.compareDriverTwo.value = compareDriverTwoCode;
}

function setLap(lap) {
  const safeLap = Math.min(TOTAL_LAPS, Math.max(1, lap));
  markerProgress = safeLap;
  elements.lapSlider.value = safeLap;
  renderAll();
}

function togglePlayback() {
  if (timer) {
    window.clearInterval(timer);
    timer = null;
    elements.playBtn.textContent = "Play";
    return;
  }

  elements.playBtn.textContent = "Pause";
  markerProgress = getLap();
  let lastDisplayedLap = getLap();

  timer = window.setInterval(() => {
    markerProgress += 0.12;

    if (markerProgress > TOTAL_LAPS) {
      markerProgress = TOTAL_LAPS;
      window.clearInterval(timer);
      timer = null;
      elements.playBtn.textContent = "Play";
    }

    renderMarkers(markerProgress);

    const displayedLap = Math.min(
      TOTAL_LAPS,
      Math.floor(markerProgress),
    );

    if (displayedLap !== lastDisplayedLap) {
      lastDisplayedLap = displayedLap;
      elements.lapSlider.value = displayedLap;
      renderLapLabels();
      renderPositionWall();
      renderTyreSummary();
      renderPitProgress();
      renderSelectedDriver();
      renderComparison();
    }
  }, 70);
}

function initialise() {
  buildSelectOptions(elements.driverSelect, selectedDriverCode);
  buildSelectOptions(elements.compareDriverOne, compareDriverOneCode);
  buildSelectOptions(elements.compareDriverTwo, compareDriverTwoCode);
  buildMarkers();
  syncSelectValues();

  elements.driverSelect.addEventListener("change", (event) => {
    selectedDriverCode = event.target.value;
    compareDriverOneCode = event.target.value;
    elements.compareDriverOne.value = event.target.value;
    renderAll();
  });

  elements.compareDriverOne.addEventListener("change", (event) => {
    compareDriverOneCode = event.target.value;
    selectedDriverCode = event.target.value;
    elements.driverSelect.value = event.target.value;
    renderAll();
  });

  elements.compareDriverTwo.addEventListener("change", (event) => {
    compareDriverTwoCode = event.target.value;
    renderAll();
  });

  elements.tyreFilter.addEventListener("change", renderTyreSummary);

  elements.lapSlider.addEventListener("input", (event) => {
    setLap(Number(event.target.value));
  });

  elements.previewBtn.addEventListener("click", () => {
    setLap(24);
  });

  elements.playBtn.addEventListener("click", togglePlayback);

  setLap(2);
}

initialise();