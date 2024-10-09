/**
 * Flying card object
 */
export class Card {
    /**
     * Creates a new flying card
     * @param main Main game
     * @param title Display title
     * @param icon Font Awesome icon
     * @param action Action type
     * @param target Target for action
     */
    constructor(main, title, icon, action, target) {
        this.title = title;
        this.icon = icon;
        this.action = action;
        this.target = target;
        this.el = null;

        // Dragging
        this.lastPos = { x: 0, y: 0 };
        this.curPos = { x: 0, y: 0 };
        this.dragged = false;

        // Properties
        this.interactable = false;
        this.forced = false;
        this.main = main;

        // Position and speed
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.x = 0;
        this.y = 0;
    }

    /**
     * Randomizes position and speed
     */
    randomize() {
        this.xSpeed = Math.random() * (this.main.maxSpeedCap * 2 + 1) - this.main.maxSpeedCap;
        this.ySpeed = Math.random() * (this.main.maxSpeedCap * 2 + 1) - this.main.maxSpeedCap;
        this.x = 10 + Math.random() * (window.innerWidth - this.el.outerWidth() - 20);
        this.y = 10 + Math.random() * (window.innerHeight - this.el.outerHeight() - 20);
    }

    /**
     * Creates a DOM element for this card
     */
    createElement() {
        this.el = $("<div>", { "class": "on-top-of-everyone flying-card rows", "style": "display: none" })
            .append($("<div>", { "class": "row" }).append($("<i>", { "class": this.icon })))
            .append($("<div>", { "class": "row" }).append($("<p>", { "class": "has-text-weight-bold" }).text(this.title)))
            .on('mousedown', this.onMouseDown.bind(this))
            .appendTo(document.body);
        return this.el;
    }

    /**
     * Mouse down event handler
     */
    onMouseDown(e) {
        this.lastPos = { x: e.clientX, y: e.clientY };
        this.curPos = { x: e.clientX, y: e.clientY };
        this.el.removeClass("pop-in");
        this.el.addClass("dragged");
        this.interactable = true;
        this.dragged = true;
        $(document)
            .on("mousemove.drag", this.onMouseMove.bind(this))
            .on("mouseup.drag", this.onMouseUp.bind(this));
    }

    /**
     * Mouse moved event handler for dragging
     */
    onMouseMove(e) {
        if (this.interactable) {
            if (Math.abs(this.x - e.clientX) + Math.abs(this.y - e.clientY) > this.main.dragMinimumDist)
                this.interactable = false;
            return;
        }

        this.lastPos = this.curPos;
        this.curPos = { x: e.clientX, y: e.clientY };
        this.xSpeed = this.curPos.x - this.lastPos.x;
        this.ySpeed = this.curPos.y - this.lastPos.y;
        this.x += this.xSpeed;
        this.y += this.ySpeed;
        this.main.collision.collideAll();
    }

    /**
     * Mouse up event handler for dragging
     */
    onMouseUp() {
        this.el.removeClass("dragged");
        this.el.addClass("pop-in");
        $(document).off("mousemove.drag mouseup.drag");
        this.dragged = this.interactable;
        this.performAction();
    }

    /**
     * Performs specified action
     */
    performAction() {
        if (!this.interactable) return;
        let card = this;
        switch (this.action) {
            case "open-tab": {
                this.reInitialize(function() {
                    window.open(card.target, '_blank');
                });
                break;
            }
            case "expand": {
                this.main.backtrace.open(this.target);
                break;
            }
            case "show": {
                this.reInitialize(function() {
                    $(card.target).show().fadeTo(200, 1);
                });
                break;
            }
            case "back": {
                this.main.backtrace.back();
                break;
            }
        }
    }

    /**
     * Shows the element and plays a pop in animation
     * @param callback Optional callback on finish
     */
    showElement(callback) {
        if (this.el === null) throw new Error(
            "No element was created for this card");
        this.el.show();
        this.dragged = false;
        this.main.enableCard(this);
        this.el.removeClass('pop-out');
        this.el.addClass("pop-in");
        setTimeout(() => {
            if (typeof callback === 'function')
                callback(this);
        }, 500);
    }

    /**
     * Hides the element and plays a pop in animation
     * @param callback Optional callback on finish
     */
    hideElement(callback) {
        if (this.el === null) throw new Error(
            "No element was created for this card");
        this.interactable = false;
        this.el.removeClass('pop-in');
        this.el.addClass("pop-out");
        setTimeout(() => {
            this.main.disableCard(this);
            this.el.hide();
            if (typeof callback === 'function')
                callback(this);
        }, 500);
    }

    /**
     * Initializes element
     */
    initialize() {
        this.randomize();
        this.showElement();
    }

    /**
     * Re-initializes element
     */
    reInitialize(callback) {
        this.hideElement(card => {
            card.forced = false;
            card.initialize();
            if (typeof callback === 'function')
                callback(this);
        });
    }

    /**
     * Deletes card's DOM element
     */
    deleteElement() {
        if (this.el === null) throw new Error(
            "No element was created for this card");
        this.main.disableCard(this);
        this.el.remove();
        this.el = null;
    }

    /**
     * Updates element position based on speed
     */
    updateElement() {
        if (this.el === null) throw new Error(
            "No element was created for this card");
        if (!this.dragged) {
            this.x += this.xSpeed * this.main.timeSpeed;
            this.y += this.ySpeed * this.main.timeSpeed;

            if (!this.forced) {
                if (this.x <= 0) {
                    this.x = 0;
                    this.xSpeed *= -1;
                } else if (this.x + this.el.outerWidth() >= window.innerWidth) {
                    this.x = window.innerWidth - this.el.outerWidth();
                    this.xSpeed *= -1;
                }

                if (this.y <= 0) {
                    this.y = 0;
                    this.ySpeed *= -1;
                } else if (this.y + this.el.outerHeight() >= window.innerHeight) {
                    this.y = window.innerHeight - this.el.outerHeight();
                    this.ySpeed *= -1;
                }
            }
        }

        this.el.css({ left: this.x, top: this.y });
    }
}

/**
 * Group of multiple cards
 */
export class CardGroup {
    /**
     * Creates a new card group
     * @param id Unique identifier
     * @param children Array of children
     */
    constructor(id, children) {
        this.id = id;
        this.children = children || [];
    }

    /**
     * Creates elements for all cards and pops them in
     */
    createAll() {
        this.children.forEach(card => {
            card.createElement();
        });
    }

    /**
     * Creates elements for all cards and pops them in
     */
    initializeAll() {
        this.children.forEach(card => {
            card.initialize();
        });
    }
}