function showToast(message, type = "success", duration = 3000) {
    const toastContainer = document.getElementById("toastContainer")

    // Créer l'élément du toast
    const toast = document.createElement("div")
    toast.className = `toast align-items-center text-bg-${type} border-0`
    toast.role = "alert"
    toast.setAttribute("aria-live", "assertive")
    toast.setAttribute("aria-atomic", "true")

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `

    toastContainer.appendChild(toast)

    // Initialiser et afficher le toast
    const bootstrapToast = new bootstrap.Toast(toast, { delay: duration })
    bootstrapToast.show()

    // Retirer le toast du DOM après fermeture
    toast.addEventListener("hidden.bs.toast", () => {
        toast.remove()
    })
}

// Exporter la fonction si vous utilisez des modules
export { showToast }
