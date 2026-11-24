document.addEventListener("DOMContentLoaded", () => {
    const langToggleBtn = document.getElementById("langToggleBtn");
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const searchInput = document.getElementById("checklistSearch");
    const pillButtons = document.querySelectorAll(".pill-btn");
    const checkCards = document.querySelectorAll(".check-card");
    const inspectButtons = document.querySelectorAll(".inspect-btn");
    const checkAllBtn = document.getElementById("checkAllBtn");
    const resetAllBtn = document.getElementById("resetAllBtn");
    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");
    const checklistModal = document.getElementById("checklistModal");
    const closeChecklistModal = document.getElementById("closeChecklistModal");
    const htmlRoot = document.documentElement;

    const STORAGE_KEY = "uht_content_checklist_v1";
    let currentLang = "both"; // 'km', 'en', or 'both'
    let activeFilter = "all";

    // 1. Language Toggle (Khmer / English / Both)
    if (langToggleBtn) {
        langToggleBtn.addEventListener("click", () => {
            if (currentLang === "both") {
                currentLang = "km";
                document.querySelectorAll(".km").forEach(el => el.style.display = "inline-block");
                document.querySelectorAll(".en").forEach(el => el.style.display = "none");
                langToggleBtn.innerText = "🇰🇭 ភាសាខ្មែរ";
            } else if (currentLang === "km") {
                currentLang = "en";
                document.querySelectorAll(".km").forEach(el => el.style.display = "none");
                document.querySelectorAll(".en").forEach(el => el.style.display = "inline-block");
                langToggleBtn.innerText = "🇬🇧 English";
            } else {
                currentLang = "both";
                document.querySelectorAll(".km").forEach(el => el.style.display = "");
                document.querySelectorAll(".en").forEach(el => el.style.display = "");
                langToggleBtn.innerText = "🇰🇭 / EN";
            }
        });
    }

    // 2. Dark / Light Theme Toggle
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = htmlRoot.getAttribute("data-theme");
            if (currentTheme === "dark") {
                htmlRoot.setAttribute("data-theme", "light");
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            } else {
                htmlRoot.setAttribute("data-theme", "dark");
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            }
        });
    }

    // 3. Checklist State & Progress Bar
    function saveState() {
        const checkedIds = [];
        checkCards.forEach(card => {
            const cb = card.querySelector(".item-checkbox");
            if (cb && cb.checked) {
                checkedIds.push(card.getAttribute("data-id"));
            }
        });
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedIds));
        } catch (_) {}
    }

    function updateProgress() {
        const total = checkCards.length;
        let done = 0;
        checkCards.forEach(card => {
            const cb = card.querySelector(".item-checkbox");
            const isChecked = cb ? cb.checked : false;
            card.classList.toggle("completed", isChecked);
            if (isChecked) done++;
        });
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        if (progressText) progressText.textContent = `${done} / ${total} (${pct}%)`;
        if (progressFill) progressFill.style.width = `${pct}%`;
    }

    function loadState() {
        let saved = [];
        try {
            saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        } catch (_) {
            saved = [];
        }
        checkCards.forEach(card => {
            const id = card.getAttribute("data-id");
            const cb = card.querySelector(".item-checkbox");
            if (cb) cb.checked = Array.isArray(saved) && saved.includes(id);
        });
        updateProgress();
    }

    checkCards.forEach(card => {
        const cb = card.querySelector(".item-checkbox");
        if (cb) {
            cb.addEventListener("change", () => {
                updateProgress();
                saveState();
            });
        }
    });

    if (checkAllBtn) {
        checkAllBtn.addEventListener("click", () => {
            checkCards.forEach(card => {
                const cb = card.querySelector(".item-checkbox");
                if (cb) cb.checked = true;
            });
            updateProgress();
            saveState();
        });
    }

    if (resetAllBtn) {
        resetAllBtn.addEventListener("click", () => {
            checkCards.forEach(card => {
                const cb = card.querySelector(".item-checkbox");
                if (cb) cb.checked = false;
            });
            updateProgress();
            saveState();
        });
    }

    loadState();

    // 4. Combined Filter & Search
    function applyFilters() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        checkCards.forEach(card => {
            const cat = card.getAttribute("data-cat");
            const text = card.textContent.toLowerCase();
            const matchCat = activeFilter === "all" || cat === activeFilter;
            const matchQuery = !query || text.includes(query);

            if (matchCat && matchQuery) {
                card.classList.remove("hidden-card");
            } else {
                card.classList.add("hidden-card");
            }
        });
    }

    pillButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            pillButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeFilter = btn.getAttribute("data-filter");
            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    // 5. Checklist Item Modal
    inspectButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            document.getElementById("modalChkTitle").textContent = btn.getAttribute("data-title");
            document.getElementById("modalChkCode").textContent = btn.getAttribute("data-code");
            document.getElementById("modalChkOwner").textContent = btn.getAttribute("data-owner");
            document.getElementById("modalChkNotes").textContent = btn.getAttribute("data-notes");
            checklistModal.classList.remove("hidden");
        });
    });

    if (closeChecklistModal) {
        closeChecklistModal.addEventListener("click", () => {
            checklistModal.classList.add("hidden");
        });
    }

    if (checklistModal) {
        checklistModal.addEventListener("click", (e) => {
            if (e.target === checklistModal) {
                checklistModal.classList.add("hidden");
            }
        });
    }
});
