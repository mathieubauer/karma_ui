import ElementBuilder from "./ElementBuilder.js"

const createModalWithButton = (modalId, buttonText, modalTitle, modalMessage) => {
    // Button to trigger the modal
    const button = new ElementBuilder("button")
        .addClass("btn btn-secondary")
        .setAttribute("type", "button")
        .setAttribute("data-bs-toggle", "modal")
        .setAttribute("data-bs-target", `#${modalId}`)
        .setText(buttonText)
        .build()

    // Modal container
    const modal = new ElementBuilder("div")
        .addClass("modal fade")
        .setAttribute("id", modalId)
        .setAttribute("tabindex", "-1")
        .setAttribute("aria-labelledby", `${modalId}Label`)
        .setAttribute("aria-hidden", "true")
        .build()

    // Modal dialog
    const modalDialog = new ElementBuilder("div") //
        .addClass("modal-dialog")
        .build()

    // Modal content
    const modalContent = new ElementBuilder("div") //
        .addClass("modal-content")
        .build()

    // Modal header
    const modalHeader = new ElementBuilder("div")
        .addClass("modal-header")
        .addChild(
            new ElementBuilder("h5") //
                .addClass("modal-title text-dark")
                .setAttribute("id", `${modalId}Label`)
                .setText(modalTitle)
                .build(),
        )
        .addChild(
            new ElementBuilder("button")
                .addClass("btn-close")
                .setAttribute("type", "button")
                .setAttribute("data-bs-dismiss", "modal")
                .setAttribute("aria-label", "Close")
                .build(),
        )
        .build()

    // Modal body
    const modalBody = new ElementBuilder("div") //
        .addClass("modal-body text-dark")
        .setHTML(modalMessage)
        .build()

    // Assemble modal content
    modalContent.appendChild(modalHeader)
    modalContent.appendChild(modalBody)

    // Assemble modal dialog
    modalDialog.appendChild(modalContent)

    // Assemble modal container
    modal.appendChild(modalDialog)

    // Return both button and modal
    return { button, modal }
}

// Example usage
const { button, modal } = createModalWithButton("exampleModal", "Open Modal", "Modal Title", "This is the modal body content.")
document.body.appendChild(button)
document.body.appendChild(modal)

const createModal = (modalId, title, message) => {
    // Modal container
    const modal = new ElementBuilder("div")
        .addClass("modal", "fade")
        .setAttribute("id", modalId)
        .setAttribute("tabindex", "-1")
        .setAttribute("aria-labelledby", `${modalId}Label`)
        .setAttribute("aria-hidden", "true")
        .build()

    // Modal dialog
    const modalDialog = new ElementBuilder("div").addClass("modal-dialog").build()

    // Modal content
    const modalContent = new ElementBuilder("div").addClass("modal-content").build()

    // Modal header
    const modalHeader = new ElementBuilder("div")
        .addClass("modal-header")
        .addChild(new ElementBuilder("h5").addClass("modal-title").setAttribute("id", `${modalId}Label`).setText(title).build())
        .addChild(
            new ElementBuilder("button")
                .addClass("btn-close")
                .setAttribute("type", "button")
                .setAttribute("data-bs-dismiss", "modal")
                .setAttribute("aria-label", "Close")
                .build(),
        )
        .build()

    // Modal body
    const modalBody = new ElementBuilder("div").addClass("modal-body").setText(message).build()

    // Modal footer
    const modalFooter = new ElementBuilder("div")
        .addClass("modal-footer")
        .addChild(
            new ElementBuilder("button")
                .addClass("btn", "btn-secondary")
                .setAttribute("type", "button")
                .setAttribute("data-bs-dismiss", "modal")
                .setText("Close")
                .build(),
        )
        .build()

    // Assemble modal content
    modalContent.appendChild(modalHeader)
    modalContent.appendChild(modalBody)
    modalContent.appendChild(modalFooter)

    // Assemble modal dialog
    modalDialog.appendChild(modalContent)

    // Assemble modal container
    modal.appendChild(modalDialog)

    return modal
}

export { createModal, createModalWithButton }
