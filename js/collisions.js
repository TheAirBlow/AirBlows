/**
 * Card collision manager
 */
export default class CollisionManager {
    /**
     * Creates a new collision manager
     * @param main Main game
     */
    constructor(main) {
        this.main = main;
    }

    /**
     * Makes all specified cards collide with each other
     */
    collideAll() {
        for (let i = 0; i < this.main.activeCards.length; i++)
            this.collideOne(this.main.activeCards[i], i);
    }

    /**
     * Makes specified card collide with other cards
     * @param cardA Target card
     * @param i Base index
     */
    collideOne(cardA, i) {
        i = i || 0;
        const rectA = cardA.el[0].getBoundingClientRect();
        const centerAX = rectA.left + rectA.width / 2;
        const centerAY = rectA.top + rectA.height / 2;
        this.getCollisions(cardA, i).forEach(cardB => {
            const rectB = cardB.el[0].getBoundingClientRect();
            const centerBX = rectB.left + rectB.width / 2;
            const centerBY = rectB.top + rectB.height / 2;
            const distX = centerAX - centerBX;
            const distY = centerAY - centerBY;
            const minDistX = (rectA.width + rectB.width) / 2;
            const minDistY = (rectA.height + rectB.height) / 2;
            const overlapX = minDistX - Math.abs(distX);
            const overlapY = minDistY - Math.abs(distY);

            // make sure they don't clip into each other
            if (overlapX < overlapY) {
                if (distX > 0) {
                    if (!cardA.dragged) cardA.x += overlapX / 2;
                    if (!cardB.dragged) cardB.x -= overlapX / 2;
                } else {
                    if (!cardA.dragged) cardA.x -= overlapX / 2;
                    if (!cardB.dragged) cardB.x += overlapX / 2;
                }
            } else {
                if (distY > 0) {
                    if (!cardA.dragged) cardA.y += overlapY / 2;
                    if (!cardB.dragged) cardB.y -= overlapY / 2;
                } else {
                    if (!cardA.dragged) cardA.y -= overlapY / 2;
                    if (!cardB.dragged) cardB.y += overlapY / 2;
                }
            }

            cardA.forced = !cardA.dragged && cardB.dragged && (cardA.x <= 0 || cardA.x > window.innerWidth
                || cardA.y <= 0 || cardA.y >= window.innerHeight);
            cardB.forced = !cardB.dragged && cardA.dragged && (cardB.x <= 0 || cardB.x > window.innerWidth
                || cardB.y <= 0 || cardB.y >= window.innerHeight);

            // choose normal
            let normalX = distX / Math.sqrt(distX * distX + distY * distY);
            let normalY = distY / Math.sqrt(distX * distX + distY * distY);

            // calculate velocity
            const relativeVelocityX = cardA.xSpeed - cardB.xSpeed;
            const relativeVelocityY = cardA.ySpeed - cardB.ySpeed;
            const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;
            if (velocityAlongNormal > 0) return;

            // calculate impulse
            const restitution = 1;
            const impulse = -(1 + restitution) * velocityAlongNormal / 2;
            const impulseX = impulse * normalX;
            const impulseY = impulse * normalY;
            cardA.xSpeed += impulseX;
            cardA.ySpeed += impulseY;
            cardB.xSpeed -= impulseX;
            cardB.ySpeed -= impulseY;

            // maximum speed cap
            const speedA = Math.sqrt(cardA.xSpeed * cardA.xSpeed + cardA.ySpeed * cardA.ySpeed);
            const speedB = Math.sqrt(cardB.xSpeed * cardB.xSpeed + cardB.ySpeed * cardB.ySpeed);
            if (speedA > this.main.maxSpeedCap) {
                const scaleA = this.main.maxSpeedCap / speedA;
                cardA.xSpeed *= scaleA;
                cardA.ySpeed *= scaleA;
            }
            if (speedB > this.main.maxSpeedCap) {
                const scaleB = this.main.maxSpeedCap / speedB;
                cardB.xSpeed *= scaleB;
                cardB.ySpeed *= scaleB;
            }

            // minimum speed cap
            if (speedA < this.main.minSpeedCap) {
                const scaleA = this.main.minSpeedCap / speedA;
                cardA.xSpeed *= scaleA;
                cardA.ySpeed *= scaleA;
            }

            if (speedB < this.main.minSpeedCap) {
                const scaleB = this.main.minSpeedCap / speedB;
                cardB.xSpeed *= scaleB;
                cardB.ySpeed *= scaleB;
            }
        });
    }

    /**
     * Checks for collisions with any other cards
     * @param cardA Target card
     * @param i Base index
     * @returns {*[]} Array of cards that collide
     */
    getCollisions(cardA, i) {
        i = i || 0;
        const result = [];
        const rectA = cardA.el[0].getBoundingClientRect();
        const centerAX = rectA.left + rectA.width / 2;
        const centerAY = rectA.top + rectA.height / 2;
        for (let j = i + 1; j < this.main.activeCards.length; j++) {
            const cardB = this.main.activeCards[j];
            const rectB = cardB.el[0].getBoundingClientRect();
            const centerBX = rectB.left + rectB.width / 2;
            const centerBY = rectB.top + rectB.height / 2;
            const distX = centerAX - centerBX;
            const distY = centerAY - centerBY;
            const minDistX = (rectA.width + rectB.width) / 2;
            const minDistY = (rectA.height + rectB.height) / 2;
            if (Math.abs(distX) < minDistX && Math.abs(distY) < minDistY)
                result.push(cardB);
        }

        return result;
    }
}