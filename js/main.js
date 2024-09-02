// settings
const maxSpeedCap = window.innerWidth <= 480 ? 5 : 12;
const minSpeedCap = window.innerWidth <= 480 ? 3 : 5;
const dragMinimumDist = 5;

// dynamic stuff
let framesPerSecond = 0;
let activeCards = [];
let isPaused = false;

// functions
function initCard(el, x, y, xSpeed, ySpeed) {
    if (x === undefined) x = el.offset().left;
    if (y === undefined) y = el.offset().top;
    if (x === 0) x = 10 + Math.random() * (window.innerWidth - el.outerWidth() - 20);
    if (y === 0) y = 10 + Math.random() * (window.innerHeight - el.outerHeight() - 20);
    if (xSpeed === undefined) xSpeed = Math.random() * (maxSpeedCap * 2 + 1) - maxSpeedCap;
    if (ySpeed === undefined) ySpeed = Math.random() * (maxSpeedCap * 2 + 1) - maxSpeedCap;

    el.css({ left: x, top: y });
    activeCards.push({
        el: el, x: x, y: y,
        xSpeed: xSpeed,
        ySpeed: ySpeed,
        dragged: false,
        forced: false
    });
}

function checkCollisions() {
    for (let i = 0; i < activeCards.length; i++) {
        const cardA = activeCards[i];
        const rectA = cardA.el[0].getBoundingClientRect();
        const centerAX = rectA.left + rectA.width / 2;
        const centerAY = rectA.top + rectA.height / 2;

        for (let j = i + 1; j < activeCards.length; j++) {
            const cardB = activeCards[j];
            const rectB = cardB.el[0].getBoundingClientRect();
            const centerBX = rectB.left + rectB.width / 2;
            const centerBY = rectB.top + rectB.height / 2;
            const distX = centerAX - centerBX;
            const distY = centerAY - centerBY;
            const minDistX = (rectA.width + rectB.width) / 2;
            const minDistY = (rectA.height + rectB.height) / 2;

            if (Math.abs(distX) < minDistX && Math.abs(distY) < minDistY) {
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
                if (velocityAlongNormal > 0) continue;

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
                if (speedA > maxSpeedCap) {
                    const scaleA = maxSpeedCap / speedA;
                    cardA.xSpeed *= scaleA;
                    cardA.ySpeed *= scaleA;
                }
                if (speedB > maxSpeedCap) {
                    const scaleB = maxSpeedCap / speedB;
                    cardB.xSpeed *= scaleB;
                    cardB.ySpeed *= scaleB;
                }

                // minimum speed cap
                if (speedA < minSpeedCap) {
                    const scaleA = minSpeedCap / speedA;
                    cardA.xSpeed *= scaleA;
                    cardA.ySpeed *= scaleA;
                }

                if (speedB < minSpeedCap) {
                    const scaleB = minSpeedCap / speedB;
                    cardB.xSpeed *= scaleB;
                    cardB.ySpeed *= scaleB;
                }
            }
        }
    }
}

function animateCards() {
    framesPerSecond += 1;

    if (!isPaused) {
        checkCollisions();
        activeCards.forEach(card => {
            if (!card.dragged) {
                card.x += card.xSpeed;
                card.y += card.ySpeed;

                if (!card.forced) {
                    if (card.x <= 0) {
                        card.x = 0;
                        card.xSpeed *= -1;
                    } else if (card.x + card.el.outerWidth() >= window.innerWidth) {
                        card.x = window.innerWidth - card.el.outerWidth();
                        card.xSpeed *= -1;
                    }

                    if (card.y <= 0) {
                        card.y = 0;
                        card.ySpeed *= -1;
                    } else if (card.y + card.el.outerHeight() >= window.innerHeight) {
                        card.y = window.innerHeight - card.el.outerHeight();
                        card.ySpeed *= -1;
                    }
                }
            }

            card.el.css({ left: card.x, top: card.y });
        });
    }

    requestAnimationFrame(animateCards);
}

function disableCard(el) {
    let index = activeCards.findIndex(function(card) {
        return card.el[0].isEqualNode(el[0])
    });
    activeCards.splice(index, 1);
}

function getCard(el) {
    let index = activeCards.findIndex(function(card) {
        return card.el[0].isEqualNode(el[0])
    });
    return activeCards[index];
}

const backtrace = [];
function cardAction(el) {
    switch (el.data("action")) {
        case "open-tab": {
            window.open(el.data("target"), '_blank');
            boom(el); break;
        }
        case "expand": {
            let target = $(`#${el.data("target")}`);
            let visible = $(".flying-card:visible");
            visible.each(function() {
                boom($(this));
            });
            backtrace.push(visible);
            setTimeout(function() {
                let index = 0;
                target.children(".flying-card").show()
                    .each(function() {
                        let item = $(visible[index]);
                        initCard($(this), item.offset().left, item.offset().top);
                        index++; if (index >= visible.length) index = 0;
                    });
                visible.hide().each(function() {
                    disableCard($(this));
                });
            }, 400);
            break;
        }
        case "back": {
            let visible = $(".flying-card:visible");
            visible.each(function() {
                boom($(this));
            });
            setTimeout(function() {
                let index = 0;
                backtrace[backtrace.length - 1].show()
                    .each(function() {
                        let item = $(visible[index]);
                        initCard($(this), item.offset().left, item.offset().top);
                        index++; if (index >= visible.length) index = 0;
                    });
                backtrace.splice(backtrace.length - 1, 1);
                visible.hide().each(function() {
                    disableCard($(this));
                });
            }, 400);
            break;
        }
    }
}

function boom(el) {
    function setPosition(boom) {
        if (el.is(":hidden")) return;
        boom.css({
            left: el.offset().left + el.width() / 2 - 100,
            top: el.offset().top + el.height() / 2 - 120
        });
    }

    let boom = $(`<div class="on-top-of-everyone"><img src="res/boom.gif?t=${new Date().getTime()}" alt="boom"/></div>`)
        .appendTo(document.body);
    setPosition(boom);
    let update = setInterval(function() {
        setPosition(boom);
    }, 10);
    setTimeout(function() {
        clearInterval(update);
        boom.remove();
    }, 640);
}

// load everything
$(document).ready(function() {
    $(".flying-card:visible")
        .each(function() {
            initCard($(this), 0, 0)
        })

    $(".flying-card").on("mousedown", function(e) {
        let el = $(this); let doc = $(document); let card = getCard(el);
        let lastPos = { x: e.clientX, y: e.clientY };
        let curPos = { x: e.clientX, y: e.clientY };
        doc.on("mousemove.drag", function(e) {
            if (!card.dragged) {
                if (Math.abs(curPos.x - e.clientX) + Math.abs(curPos.y - e.clientY) > dragMinimumDist)
                    card.dragged = true;
                return;
            }

            lastPos = curPos;
            curPos = { x: e.clientX, y: e.clientY };
            card.xSpeed = curPos.x - lastPos.x;
            card.ySpeed = curPos.y - lastPos.y;
            card.x += card.xSpeed;
            card.y += card.ySpeed;
            checkCollisions();
        }).on("mouseup.drag", function() {
            doc.off("mousemove.drag mouseup.drag");
            if (!card.dragged) cardAction(el);
            card.dragged = false;
        })
    });

    setInterval(function() {
        $("#fps").text(`${framesPerSecond} FPS`)
        framesPerSecond = 0;
    }, 1000);

    $("#refresh").click(function() {
        $(".flying-card:visible")
            .each(function() {
                let el = $(this);
                disableCard(el);
                initCard(el, 0, 0);
                boom(el);
            })
    })

    $("#pause").click(function() {
        isPaused = !isPaused;
    });

    $("#help").click(function() {
        $("#help-modal").show().fadeTo(200, 1);
    });

    $(".help-close").click(function() {
        $("#help-modal").fadeTo(200, 0, function() { $(this).hide() });
    });

    animateCards();
});