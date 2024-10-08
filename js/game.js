import CollisionManager from "./collisions.js";
import { Card, CardGroup } from "./card.js";
import Backtrace from "./backtrace.js";

/**
 * Main class for the bouncy card game
 */
export default class CardGame {
    /**
     * Creates a new card game
     * @param groups Card groups
     */
    constructor(groups) {
        this.collision = new CollisionManager(this);
        this.backtrace = new Backtrace(this);
        this.framesPerSecondElement = null;
        this.framesPerSecond = 0;
        this.activeCards = [];
        this.cardGroups = [];
        this.timeSpeed = 1;

        // initialize groups
        groups.forEach(group => {
            let cards = [];
            group.children.forEach(card => {
                cards.push(new Card(this, card.title, card.icon, card.action, card.target));
            });

            let newGroup = new CardGroup(group.id, cards);
            newGroup.createAll();
            this.cardGroups.push(newGroup);
        })

        // configurable stuff below
        this.maxSpeedCap = window.innerWidth <= 480 ? 5 : 12;
        this.minSpeedCap = window.innerWidth <= 480 ? 3 : 5;
        this.dragMinimumDist = 10;

        // making sure collision runs well on phones
        this.ticksPerSecond = 40;
        this.tickDuration = 1000 / this.ticksPerSecond;
        this.lastTickTime = null;
        this.deltaTime = 0;
    }

    /**
     * Initializes cards
     */
    initialize() {
        this.getCardGroup("main").initializeAll();
        let game = this;
        setInterval(function() {
            if (game.framesPerSecondElement !== null)
                game.framesPerSecondElement.text(`${game.framesPerSecond} FPS`);
            game.framesPerSecond = 0;
        }, 1000);
    }

    /**
     * Starts game loop
     */
    startLoop(timestamp) {
        if (timestamp === undefined) {
            requestAnimationFrame(this.startLoop.bind(this));
            return;
        }

        this.framesPerSecond++;
        if (this.lastTickTime === null)
            this.lastTickTime = timestamp;
        this.deltaTime += timestamp - this.lastTickTime;
        if (this.deltaTime >= this.tickDuration) {
            this.collision.collideAll();
            this.deltaTime -= this.tickDuration;
        }

        this.activeCards.forEach(card => card.updateElement());
        this.lastTickTime = timestamp;
        requestAnimationFrame(this.startLoop.bind(this));
    }

    /**
     * Sets an FPS text element
     * @param el Element
     */
    setFpsElement(el) {
        this.framesPerSecondElement = el;
    }

    /**
     * Returns card group by ID
     * @param id Unique identifier
     */
    getCardGroup(id) {
        return this.cardGroups.find(group => group.id === id);
    }

    /**
     * Makes specified card inactive
     * @param card Target card
     */
    disableCard(card) {
        let index = this.activeCards.findIndex(a => a === card);
        if (index !== -1) this.activeCards.splice(index, 1);
    }

    /**
     * Makes specified card active
     * @param card Target card
     */
    enableCard(card) {
        let index = this.activeCards.findIndex(a => a === card);
        if (index === -1) this.activeCards.push(card);
    }
}