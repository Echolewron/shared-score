var leaderboard_display_period = HttpGet("https://gopreach-default-rtdb.firebaseio.com/leaderboard-settings/leaderboard-period.json");   // time in minutes leader board is displayed


function HttpGet(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false); // false indicates synchronous
    xhr.send();

    return JSON.parse(xhr.responseText);
}

function HttpPut(url, data) {
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url, false); // false indicates synchronous
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(data);

    return JSON.parse(xhr.responseText);
}

// YOUTUBE VIDEO SCRIPT
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
var videoID = HttpGet("https://gopreach-default-rtdb.firebaseio.com/leaderboard-settings/videoID.json");

function onYouTubeIframeAPIReady() {
player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: videoID,
    playerVars: {
    'playsinline': 1,
    'autoplay': 1,
    'controls': 1,
    'rel': 0,
    },
    events: {
    'onReady': onPlayerReady,
    'onStateChange': onPlayerStateChange
    }
});
}

function forcePlayVideo() {
    console.log(player, player.playVideo(), player.getPlayerState(), "Told video to play again")
    if (player.getPlayerState() != 1) {
        player.playVideo();
        setTimeout(forcePlayVideo, 500)
    }
}

function onPlayerReady(event) {
    event.target.playVideo();
}

// 4. The API will call this function when the video player is ready.

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
var start_playing = false;

function onPlayerStateChange(event) {

    var media_screen = document.getElementById("player");


    if (event.data == 0) {
        media_screen.style.visibility = "hidden";

        setTimeout(() => {
            media_screen.style.visibility = "visible";
            player.playVideo();
            // UpdateLeaderboard(GetData())
        }, leaderboard_display_period * 60 * 1000)
    }
}


const settings_button = document.getElementById("settings-button")
const settings_menu = document.getElementById("settings-menu")

// Allows opening and closing the settings menu
let settings_open = false;
settings_button.addEventListener('click', function(event) {
    if (settings_open) {
        settings_open = false;
        settings_menu.style.left = "calc(-25% - 2px - 4vh)"
        settings_button.style.left = "5px"
    } else {
        settings_open = true;
        settings_menu.style.left = "0"
        settings_button.style.left = "calc(25% + 7px + 4vh)"
    }
})


const save_button = document.getElementById("save-button")
const leaderboard_period_field = document.getElementById("leaderboard-period-field")
const videoid_field = document.getElementById("video-id-field")

leaderboard_period_field.placeholder = leaderboard_display_period;

save_button.addEventListener('click', function(event) {
    
    if (videoid_field.value != "") {
        // Extracts video ID from video link
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S*?\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = videoid_field.value.match(regex);
        //
        if (match) {
            console.log(match[1])
        } else {
            console.log("Video not found");
            return;
        }
        
        // Doesn't start video over if the same video provided
        if (videoID != match[1]) {
            videoID = match[1]
        } else {
            return;
        }

        player.loadVideoById(videoID)
        HttpPut("https://gopreach-default-rtdb.firebaseio.com/leaderboard-settings/videoID.json", `"${videoID}"`)
    } else if (leaderboard_period_field.value != "") {

        let period = parseFloat(leaderboard_period_field.value);
        
        if (!period) {
            return;
        }

        if (period <= 0) {
            return
        }
        
        leaderboard_display_period = period;
        HttpPut("https://gopreach-default-rtdb.firebaseio.com/leaderboard-settings/leaderboard-period.json", period)
    }
})


