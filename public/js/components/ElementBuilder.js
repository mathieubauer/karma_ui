// ElementBuilder.js

class ElementBuilder {
    constructor(tag) {
        this.element = document.createElement(tag)
    }

    setId(id) {
        this.element.id = id
        return this
    }

    addClass(classNames) {
        if (typeof classNames === "string") {
            this.element.classList.add(...classNames.split(/\s+/))
        } else {
            throw new Error("addClass expects a string of space-separated class names.")
        }
        return this
    }

    setAttribute(name, value) {
        this.element.setAttribute(name, value)
        return this
    }

    setBooleanAttribute(name, isEnabled) {
        if (isEnabled) {
            this.element.setAttribute(name, "")
        } else {
            this.element.removeAttribute(name)
        }
        return this
    }

    setText(text) {
        this.element.textContent = text
        return this
    }

    setHTML(html) {
        this.element.innerHTML = html
        return this
    }

    addChild(child) {
        this.element.appendChild(child)
        return this
    }

    addEvent(event, handler) {
        this.element.addEventListener(event, handler)
        return this
    }

    build() {
        return this.element
    }
}

export default ElementBuilder
