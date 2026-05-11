import { Player } from "textalive-app-api";

//get html elements
play_button = document.querySelector("play");
play_button.disabled = true;
pause_button = document.querySelector("pause");
pause_button.disabled = true;

//setup event listeners
function onAppReady(app)
{
  player.createFromSongUrl("https://www.nicovideo.jp/watch/sm44976490");
}

function onTimerReady(t)
{
  play_button.disabled = false;
  play_button.addEventListener("click", ()=> {player.requestPlay()});
  pause_button.disabled = true;
  pause_button.addEventListener("click", ()=>{player.requestPause()});
}

/*function onTimeUpdate(pos)
{
  position = player.video.position;

}*/

//initialise player object
player = new Player({
  app:{token:"PCvWkkGtKy2DsX9b"},
  mediaElement:document.querySelector("media")
});

player.addListener({onAppReady, onTimeUpdate, onTimerReady});

//three.js scene creation
