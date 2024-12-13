import ElementBuilder from "./ElementBuilder.js"

function buildLogo() {
    const logo = new ElementBuilder("img")
        .setAttribute("src", "img/logo.png")
        .setAttribute("alt", "logo karma")
        .addClass("img-fluid")
        .setAttribute("style", "width: 100%; height: auto; object-fit: contain;")
        .build()

    return logo
}

export { buildLogo }
