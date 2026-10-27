// ---------- DATA: edit schedules and doctors here ----------
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
  Thu: "Thursday", Fri: "Friday", Sat: "Saturday"
};

const IM_SLOTS = ["10:00 AM – 12:00 NN", "1:30 – 4:00 PM"];

const DOCTORS = [
  {
    id: "mallillin",
    name: "Minerva B. Mallillin, MD, FPPS",
    role: "Pediatrician",
    group: "Pediatrics",
    photo: "images/mallillin.jpg",
    schedule: null
  },
  {
    id: "mabbonag",
    name: "Emely L. Mabbonag, MD, DPPS",
    role: "Pediatrician",
    group: "Pediatrics",
    photo: "images/mabbonag.jpg",
    schedule: null
  },
  {
    id: "campos-escalona",
    name: "Cristine S. Campos-Escalona, MD",
    role: "Internist, adult specialist",
    group: "Internal Medicine",
    photo: "images/campos-escalona.jpg",
    schedule: { Mon: IM_SLOTS, Wed: IM_SLOTS, Fri: IM_SLOTS }
  },
  {
    id: "salvador",
    name: "Jervis T. Salvador, MD",
    role: "Internist, adult specialist",
    group: "Internal Medicine",
    photo: "images/salvador.jpg",
    schedule: { Tue: IM_SLOTS, Thu: IM_SLOTS, Sat: IM_SLOTS }
  },
  {
    id: "quilang",
    name: "Mayoline M. Quilang, MD",
    role: "Internist, adult specialist",
    group: "Internal Medicine",
    photo: "images/quilang.jpg",
    schedule: { Wed: IM_SLOTS, Fri: IM_SLOTS, Sat: IM_SLOTS }
  },
  {
    id: "de-guzman",
    name: "Ellen May De Guzman, MD, FPOGS, FPSMFM",
    role: "Obstetrician-gynecologist, high-risk pregnancy specialist",
    group: "OB-GYN",
    photo: "images/de-guzman.jpg",
    schedule: null
  },
  {
    id: "nolasco",
    name: "Monique R. Nolasco, MD, DPOGS",
    role: "Obstetrician-gynecologist",
    group: "OB-GYN",
    photo: "images/nolasco.jpg",
    schedule: {
      Mon: ["1:00 – 3:00 PM"],
      Tue: ["9:00 AM – 12:00 NN"],
      Thu: ["1:00 – 3:00 PM"],
      Fri: ["9:00 AM – 12:00 NN"],
      Sat: ["1:00 – 3:00 PM"]
    }
  },
  {
    id: "cruz",
    name: "Iverson S. Cruz, MD, FPSOHNS",
    role: "ENT, head and neck disease specialist",
    group: "ENT",
    photo: "images/cruz.jpg",
    schedule: {
      Mon: ["10:00 AM – 1:00 PM"],
      Tue: ["10:00 AM – 1:00 PM"],
      Wed: ["10:00 AM – 1:00 PM"],
      Thu: ["9:00 AM – 12:00 NN"],
      Fri: ["1:00 – 4:00 PM"],
      Sat: ["9:00 AM – 12:00 NN"]
    }
  },
  {
    id: "lingan",
    name: "Paul Aries C. Lingan, MD, DPBS",
    role: "Surgeon, general laparoscopic and cancer surgery",
    group: "Surgery",
    photo: "images/lingan.jpg",
    schedule: Object.fromEntries(DAYS.map(d => [d, ["9:00 AM – 4:00 PM"]]))
  }
];

const GROUPS = ["All", "Pediatrics", "Internal Medicine", "OB-GYN", "ENT", "Surgery"];
const CLINIC_PHONE = "396-0905";

// ---------- helpers ----------
const $ = (sel) => document.querySelector(sel);

function todayKey() {
  // JS: 0 = Sunday
  const idx = new Date().getDay();
  return idx === 0 ? null : DAYS[idx - 1];
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  }
  [].concat(children).forEach(c => node.append(c));
  return node;
}

// ---------- "Who's in" ----------
let selectedDay = todayKey() || "Mon";
let showSundayNote = todayKey() === null;

function renderDayTabs() {
  const wrap = $(".day-tabs");
  wrap.innerHTML = "";
  const today = todayKey();
  DAYS.forEach(d => {
    const btn = el("button", {
      class: "day-tab",
      role: "tab",
      type: "button",
      "aria-selected": String(d === selectedDay)
    }, [DAY_NAMES[d].slice(0, 3)]);
    if (d === today) btn.append(el("span", { class: "today-dot", title: "Today" }));
    btn.addEventListener("click", () => {
      selectedDay = d;
      showSundayNote = false;
      renderDayTabs();
      renderDayResults();
    });
    wrap.append(btn);
  });
}

function renderDayResults() {
  const box = $("#dayResults");
  box.innerHTML = "";

  if (showSundayNote) {
    box.append(el("p", { class: "sunday", text: "No doctor schedules are posted for Sunday. Pick a day below, or call the clinic." }));
  }

  const rows = [];
  DOCTORS.forEach(doc => {
    const slots = doc.schedule && doc.schedule[selectedDay];
    if (slots) rows.push({ doc, slots });
  });

  // Order by earliest start: simple heuristic via first slot text
  rows.sort((a, b) => startMinutes(a.slots[0]) - startMinutes(b.slots[0]));

  const list = el("ul", { class: "day-list" });
  rows.forEach(({ doc, slots }) => {
    list.append(el("li", {}, [
      el("img", { src: doc.photo, alt: "", width: 56, height: 56, loading: "lazy" }),
      el("div", { class: "day-who" }, [
        el("strong", { text: doc.name.split(",")[0] }),
        el("span", { text: doc.group })
      ]),
      el("div", { class: "day-times" }, slots.map(s => el("span", { text: s })))
    ]));
  });
  box.append(list);
}

function startMinutes(slot) {
  const m = slot.match(/(\d{1,2}):(\d{2})/);
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  // 1:00 / 1:30 starts are afternoon
  if (h < 8) h += 12;
  return h * 60 + min;
}

// ---------- Doctors ----------
let activeGroup = "All";

function renderFilters() {
  const wrap = $(".filters");
  wrap.innerHTML = "";
  GROUPS.forEach(g => {
    const btn = el("button", {
      class: "chip",
      type: "button",
      "aria-pressed": String(g === activeGroup)
    }, [g]);
    btn.addEventListener("click", () => {
      activeGroup = g;
      renderFilters();
      renderDoctors();
    });
    wrap.append(btn);
  });
}

function renderDoctors() {
  const grid = $("#doctorGrid");
  grid.innerHTML = "";
  DOCTORS.filter(d => activeGroup === "All" || d.group === activeGroup).forEach(doc => {
    const card = el("article", { class: "doctor" });

    card.append(el("img", { src: doc.photo, alt: `Portrait of ${doc.name.split(",")[0]}`, loading: "lazy" }));

    const body = el("div", { class: "doctor-body" });
    body.append(el("h3", { text: doc.name }));
    body.append(el("p", { class: "role", text: doc.role }));

    if (doc.schedule) {
      const table = el("dl", { class: "week" });
      DAYS.forEach(d => {
        const slots = doc.schedule[d];
        table.append(el("dt", { text: d }));
        table.append(el("dd", { class: slots ? "" : "off", text: slots ? slots.join(" and ") : "–" }));
      });
      body.append(table);
    } else {
      body.append(el("p", { class: "no-sched" }, [
        "Schedule not posted. Call ",
        el("a", { href: "tel:3960905", text: CLINIC_PHONE }),
        " to book."
      ]));
    }

    card.append(body);
    grid.append(card);
  });
}

// ---------- init ----------
renderDayTabs();
renderDayResults();
renderFilters();
renderDoctors();
$("#year").textContent = new Date().getFullYear();
