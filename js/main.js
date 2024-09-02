// settings
const dragSpeedCap = window.innerWidth <= 480 ? 5 : 10;
const randomSpeedCap= window.innerWidth <= 480 ? 3 : 6;
const dragPeriodMillis = 100;
const dragMinimumDist = 5;

// dynamic stuff
let framesPerSecond = 0;
let activeCards = [];
let isPaused = false;

// functions
function initCard(el, x, y, xSpeed, ySpeed) {
    if (x === undefined) x = el.offset().left;
    if (y === undefined) y = el.offset().top;
    if (x === 0) x = Math.random() * window.innerWidth;
    if (y === 0) y = Math.random() * window.innerHeight;
    if (xSpeed === undefined) xSpeed = (Math.random() * 2 - 1) * randomSpeedCap;
    if (ySpeed === undefined) ySpeed = (Math.random() * 2 - 1) * randomSpeedCap;
    if (Math.abs(xSpeed) > dragSpeedCap) xSpeed = dragSpeedCap * Math.sign(xSpeed);
    if (Math.abs(ySpeed) > dragSpeedCap) ySpeed = dragSpeedCap * Math.sign(ySpeed);

    el.css({ left: x, top: y });
    activeCards.push({
        el: el, x: x, y: y,
        xSpeed: xSpeed,
        ySpeed: ySpeed
    });
}

function animateCards() {
    framesPerSecond += 1;

    if (!isPaused) {
        activeCards.forEach(card => {
            card.x += card.xSpeed;
            card.y += card.ySpeed;

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

            card.el.css({ left: card.x, top: card.y });
        });

        //checkCollisions();
    }

    requestAnimationFrame(animateCards);
}

function disableCard(el) {
    let index = activeCards.findIndex(function(card) {
        return card.el[0].isEqualNode(el[0])
    });
    activeCards.splice(index, 1);
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
            initCard($(this))
        })

    $(".flying-card").on("mousedown", function(e) {
        let el = $(this); let doc = $(document);
        let dragging = false;
        let curPos = { x: e.clientX, y: e.clientY };
        let lastPos = { x: e.clientX, y: e.clientY };
        let nextPos = { x: e.clientX, y: e.clientY };
        let timestamp = Date.now();
        doc.on("mousemove", function(e) {
            if (!dragging) {
                if (Math.abs(curPos.x - e.clientX) + Math.abs(curPos.y - e.clientY) > dragMinimumDist) {
                    disableCard(el); dragging = true;
                }
            } else {
                let off = el.offset();
                el.offset({
                    left: off.left - (curPos.x - e.clientX),
                    top: off.top - (curPos.y - e.clientY)
                });
                nextPos = curPos = { x: e.clientX, y: e.clientY };
                if (Date.now() - timestamp > dragPeriodMillis) {
                    timestamp = Date.now();
                    lastPos = nextPos;
                }
            }
        }).on("mouseup", function() {
            if (!dragging) cardAction(el);
            else {
                let off = el.offset();
                if (Date.now() - timestamp > dragPeriodMillis)
                    lastPos = nextPos;
                initCard(el, off.left, off.top,
                    nextPos.x - lastPos.x,
                    nextPos.y - lastPos.y);
            }
            doc.off("mousemove");
            doc.off("mouseup");
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
                initCard(el, 0, 0);
                boom(el);
            })
    })

    $("#pause").click(function() {
        isPaused = !isPaused;
    });

    animateCards();
});