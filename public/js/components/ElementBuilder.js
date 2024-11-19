// ElementBuilder.js

class ElementBuilder {
    constructor(tag) {
        this.element = document.createElement(tag)
    }

    setAttribute(name, value) {
        this.element.setAttribute(name, value)
        return this
    }

    addClass(...classNames) {
        this.element.classList.add(...classNames)
        return this
    }

    setText(text) {
        this.element.textContent = text
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
