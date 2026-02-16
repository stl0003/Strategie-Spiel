export class BaseView {
    constructor(model) {
        this.model = model;
        this.model.addListener(() => this.draw());
    }

    draw() {
        // Wird von Unterklassen überschrieben
    }
}