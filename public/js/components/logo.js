// page est défini dans le fichier appelant

function buildLogo() {
    const img = document.createElement("img")
    img.src = "img/logo.png"
    img.alt = "logo karma"
    img.classList.add("img-fluid")
    img.style.width = "100%"
    img.style.height = "auto"
    img.style.objectFit = "contain"
    page.appendChild(img)
}

export { buildLogo }
