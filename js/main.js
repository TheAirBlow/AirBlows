function boom(x, y) {
    let boom = $(`<div class="on-top-of-everyone"><img src="res/boom.gif?t=${new Date().getTime()}" alt="boom"/></div>`)
        .appendTo(document.body).css("left", x + "px").css("top", y + "px");
    setTimeout(function() {
        boom.remove();
    }, 640);
}

function checkCollisions(el) {
    let rect1 = el[0].getBoundingClientRect();
    let other, otherBox = null;
    $(".flying-card:visible,.collider:visible").each(function() {
        if (this !== el[0]) {
            const rect2 = this.getBoundingClientRect();
            if (!(rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom)) {
                otherBox = rect2;
                other = this;
                return false;
            }
        }
    });
    return { originalBox: rect1, otherBox: otherBox, original: el, other: other };
}

const dragSpeedCap = window.innerWidth <= 480 ? 4 : 8;
const randomSpeedCap= window.innerWidth <= 480 ? 3 : 6;
function initCard(el, x, y, xSpeed, ySpeed) {
    if (x === undefined) x = Math.random() * window.innerWidth;
    if (y === undefined) y = Math.random() * window.innerHeight;
    if (xSpeed === undefined) xSpeed = (Math.random() * 2 - 1) * randomSpeedCap;
    if (ySpeed === undefined) ySpeed = (Math.random() * 2 - 1) * randomSpeedCap;
    if (Math.abs(xSpeed) > dragSpeedCap) xSpeed = dragSpeedCap * Math.sign(xSpeed)
    if (Math.abs(ySpeed) > dragSpeedCap) ySpeed = dragSpeedCap * Math.sign(ySpeed)
    let isInside = null;

    function updatePosition() {
        if (el.is(":hidden") || el.is(":active")) return;
        x += xSpeed;
        y += ySpeed;

        if (x <= 0) {
            x = 0;
            xSpeed *= -1;
        } else if (x + el.outerWidth() >= window.innerWidth) {
            x = window.innerWidth - el.outerWidth();
            xSpeed *= -1;
        }

        if (y <= 0) {
            y = 0;
            ySpeed *= -1;
        } else if (y + el.outerHeight() >= window.innerHeight) {
            y = window.innerHeight - el.outerHeight();
            ySpeed *= -1;
        }

        let { original, other, originalBox, otherBox } = checkCollisions(el);
        if (other != null) {
            if (isInside !== other) {
                // this works shit but at least no cards get stuck in a bumping loop
                // nonetheless seeing XDA Forums card humping the right side was hilarious
                const overlapX = Math.min(originalBox.right - otherBox.left, originalBox.right - otherBox.left);
                const overlapY = Math.min(originalBox.bottom - otherBox.top, originalBox.bottom - otherBox.top);
                if (overlapX < overlapY) {
                    xSpeed *= -1;
                } else if (overlapY < overlapX) {
                    ySpeed *= -1;
                } else {
                    xSpeed *= -1;
                    ySpeed *= -1;
                }

                isInside = other;
            }
        } else isInside = null;

        el.offset({ left: x, top: y });
        requestAnimationFrame(updatePosition);
    }

    updatePosition();
}

const backtrace = [];
function cardAction(el) {
    boom(el.offset().left + el.width() / 2 - 128,
        el.offset().top + el.height() / 2 - 128);
    switch (el.data("action")) {
        case "open-tab": {
            window.open(el.data("target"), '_blank');
            break;
        }
        case "expand": {
            let target = $(`#${el.data("target")}`);
            let hidden = $(".flying-card:visible").hide();
            backtrace.push(hidden);
            target.children(".flying-card").show()
                .each(function() {
                    initCard($(this));
                });
            break;
        }
        case "back": {
            $(".flying-card:visible").hide();
            backtrace[backtrace.length - 1].show()
                .each(function() {
                    initCard($(this));
                });
            backtrace.splice(backtrace.length - 1, 1);
            break;
        }
        default: {
            el.remove();
            break;
        }
    }
}

$(document).ready(function() {
    if (window.innerWidth <= 480) {
        // remove collider with profile pic and username
        $(".collider:visible").removeClass(".collider");
    }

    $(".flying-card:visible").each(function() {
        initCard($(this))
    })

    $(".flying-card").on("mousedown", function(e) {
        let el = $(this); let doc = $(document);
        let data = { dragging: false, diffX: 0, diffY: 0, lastX: e.clientX, lastY: e.clientY };
        doc.on("mousemove", function(e) {
            data.diffX = data.lastX - e.clientX;
            data.diffY = data.lastY - e.clientY;
            if (!data.dragging) {
                if (Math.abs(data.diffX) > 10 || Math.abs(data.diffY) > 10)
                    data.dragging = true;
            } else {
                data.lastX = e.clientX;
                data.lastY = e.clientY;
                let off = el.offset();
                el.offset({ left: off.left - data.diffX, top: off.top - data.diffY });
            }
        }).on("mouseup", function() {
            if (!data.dragging) cardAction(el);
            else setTimeout(function() {
                let off = el.offset();
                initCard(el, off.left, off.top, -data.diffX, -data.diffY);
            }, 10);
            doc.off("mousemove");
            doc.off("mouseup");
        })
    });

    /*Please ignore this :D
    $("#pfp").click(function() {
       for (let i = 0; i < 100; i++)
           boom(Math.random() * window.innerWidth,
               Math.random() * window.innerHeight);
        setTimeout(function() {
            location.replace("https://www.youtube.com/watch?v=o-YBDTqX_ZU")
        }, 600);
    });*/
});