import ElementBuilder from "./ElementBuilder.js"

function buildLogo() {

    const logoContainer = new ElementBuilder("div") //
        .setId("fullPageContainer")
        .build()

    const logo = new ElementBuilder("img")
        .setId("logo")
        .setAttribute("src", "img/logo.png")
        .setAttribute("alt", "logo karma")
        .addClass("img-fluid")
        .build()

    logoContainer.appendChild(logo)

    return logoContainer
}

export { buildLogo }
