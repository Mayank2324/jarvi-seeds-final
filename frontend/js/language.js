let currentTranslations = {};

const modal = document.getElementById("languageModal");

async function loadLanguage(lang) {

    try {

        const response = await fetch(`languages/${lang}.json`);

        currentTranslations = await response.json();

        translatePage();

        localStorage.setItem("language", lang);

        if (modal) {
            modal.style.display = "none";
        }

    } catch (error) {

        console.error("Language loading failed:", error);

    }

}

function translatePage() {

    document.querySelectorAll("[data-i18n]").forEach(element => {

        const key = element.getAttribute("data-i18n");

        if (currentTranslations[key]) {

            element.innerHTML = currentTranslations[key];

        }

    });

}

function openLanguagePopup() {

    if (modal) {

        modal.style.display = "flex";

    }

}

function closeLanguagePopup() {

    if (modal) {

        modal.style.display = "none";

    }

}

document.addEventListener("DOMContentLoaded", () => {

    const savedLanguage = localStorage.getItem("language");

    if (savedLanguage) {

        loadLanguage(savedLanguage);

    } else {

        openLanguagePopup();

    }

    document.querySelectorAll(".language-btn").forEach(button => {

        button.addEventListener("click", () => {

            loadLanguage(button.dataset.lang);

        });

    });

});