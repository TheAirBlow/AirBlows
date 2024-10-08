/**
 * Card group backtrace
 */
export default class Backtrace {
    /**
     * Creates a new backtrace
     * @param main Main game
     */
    constructor(main) {
        this.backtrace = [];
        this.main = main;
    }

    /**
     * Opens a card group
     * @param id Unique identifier
     */
    open(id) {
        this.backtrace.push(this.main.activeCards.slice());
        this.main.activeCards.forEach(card => card.hideElement());
        this.main.getCardGroup(id).initializeAll();
    }

    /**
     * Revert to last backtrace
     */
    back() {
        this.main.activeCards.forEach(card => card.hideElement());
        this.backtrace[this.backtrace.length - 1].forEach(card => {
            card.randomize(); card.showElement();
        });
        this.backtrace.splice(this.backtrace.length - 1, 1);
    }
}