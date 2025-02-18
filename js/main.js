import CardGame from "./game.js";

const groups = [{
    id: "main",
    children: [{
        action: "expand",
        target: "socials",
        icon: "fa-solid fa-retweet",
        title: "Socials"
    }, {
        action: "expand",
        target: "projects",
        icon: "fa-solid fa-code",
        title: "Projects"
    }, {
        action: "expand",
        target: "services",
        icon: "fa-solid fa-server",
        title: "Services"
    }, {
        action: "open-tab",
        target: "https://sussy.dev/",
        icon: "fa-solid fa-star",
        title: "sussy.dev"
    }, {
        action: "show",
        target: "#about-me",
        icon: "fa-solid fa-at",
        title: "About Me"
    }]
}, {
    id: "socials",
    children: [{
        action: "open-tab",
        target: "https://github.com/TheAirBlow/",
        icon: "fa-brands fa-github",
        title: "Github",
    }, {
        action: "open-tab",
        target: "https://xdaforums.com/m/theairblow.11597903/",
        icon: "fa-solid fa-comments",
        title: "XDA Forums",
    }, {
        action: "open-tab",
        target: "https://www.reddit.com/user/theairblow_/",
        icon: "fa-brands fa-reddit-alien",
        title: "Reddit",
    }, {
        action: "open-tab",
        target: "https://x.com/theairblow",
        icon: "fa-brands fa-twitter",
        title: "Tw*tter",
    }, {
        action: "open-tab",
        target: "https://codeforces.com/profile/TheAirBlow",
        icon: "fa-solid fa-code",
        title: "Codeforces",
    }, {
        action: "open-tab",
        target: "https://www.tiktok.com/@theairblow",
        icon: "fa-brands fa-tiktok",
        title: "Tiktok",
    }, {
        action: "open-tab",
        target: "https://discordlookup.com/user/777865084013510696",
        icon: "fa-brands fa-discord",
        title: "Discord",
    }, {
        action: "open-tab",
        target: "https://t.me/theairblow",
        icon: "fa-brands fa-telegram",
        title: "Telegram",
    }, {
        action: "back",
        icon: "fa-solid fa-backward",
        title: "Go Back",
    }]
}, {
    id: "projects",
    children: [{
        action: "open-tab",
        target: "https://github.com/Samsung-Loki/Thor",
        icon: "fa-solid fa-hammer",
        title: "Thor",
    }, {
        action: "open-tab",
        target: "https://github.com/Samsung-Loki/Syndical",
        icon: "fa-solid fa-download",
        title: "Syndical",
    }, {
        action: "open-tab",
        target: "https://github.com/TheAirBlow/FastStages",
        icon: "fa-solid fa-truck-fast",
        title: "FastStages",
    }, {
        action: "open-tab",
        target: "https://github.com/TheAirBlow/BetterParties",
        icon: "fa-solid fa-book-bookmark",
        title: "BetterParties",
    }, {
        action: "open-tab",
        target: "https://github.com/TheAirBlow/HyperSploit",
        icon: "fa-solid fa-bomb",
        title: "HyperSploit",
    }, {
        action: "open-tab",
        target: "https://github.com/TheAirBlow/Raylib-ImGui",
        icon: "fa-solid fa-desktop",
        title: "Raylib-ImGui",
    }, {
        action: "open-tab",
        target: "https://github.com/TheAirBlow/DisControl",
        icon: "fa-brands fa-discord",
        title: "DisControl",
    }, {
        action: "back",
        icon: "fa-solid fa-backward",
        title: "Go Back",
    }]
}, {
    id: "services",
    children: [{
        action: "open-tab",
        target: "https://pass.airblo.ws/",
        icon: "fa-solid fa-lock",
        title: "Vaultwarden",
    }, {
        action: "open-tab",
        target: "https://git.sussy.dev/",
        icon: "fa-brands fa-gitlab",
        title: "Gitlab",
    }, {
        action: "open-tab",
        target: "https://sipacid.com/wits.mp4",
        icon: "fa-solid fa-face-sad-cry",
        title: "Free Proxy",
    }, {
        action: "back",
        icon: "fa-solid fa-backward",
        title: "Go Back",
    }]
}];

$(document).ready(function() {
    const main = new CardGame(groups);
    window.main = main;
    main.initialize();
    main.startLoop();
    main.setFpsElement($("#fps"));

    $("#refresh").click(function() {
        main.activeCards.forEach(card => {
            card.reInitialize();
        });
    })

    $("#pause").click(function() {
        if (main.timeSpeed <= 0) {
            let interval = setInterval(function() {
                if (main.timeSpeed >= 1) clearInterval(interval);
                main.timeSpeed = Math.min(main.timeSpeed + 0.1, 1);
            }, 50);
        }

        if (main.timeSpeed >= 1) {
            let interval = setInterval(function() {
                if (main.timeSpeed <= 0) clearInterval(interval);
                main.timeSpeed = Math.max(main.timeSpeed - 0.1, 0);
            }, 50);
        }
    });

    $("#help").click(function() {
        $("#help-modal").show().fadeTo(200, 1);
    });

    $(".close-button").click(function() {
        let el = $(this); let target = el.data("target");
        $(target).fadeTo(200, 0, function() { $(this).hide() });
    });
});
