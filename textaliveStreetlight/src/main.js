import { Player, Ease } from "textalive-app-api";
import * as THREE from "three";
import { OrbitControls, GLTFLoader } from "three/examples/jsm/Addons.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

//get html elements
const play_button = document.querySelector("#play");
play_button.disabled = true;
const pause_button = document.querySelector("#pause");
pause_button.disabled = true;
const replay_button = document.querySelector("#replay");
replay_button.disabled = true;

let saved_phrase;

//setup event listeners
function onAppReady(app)
{
  player.createFromSongUrl("https://piapro.jp/t/ULcJ/20250205120202");
}

function onTimerReady(t)
{
  play_button.disabled = false;
  play_button.addEventListener("click", ()=> {player.requestPlay()});
  pause_button.disabled = false;
  pause_button.addEventListener("click", ()=>{player.requestPause()});
  replay_button.disabled = false;
  replay_button.addEventListener("click", () => {
    player.requestMediaSeek(0);
    current_phrase_el.textContent = "";
  });
}

//three.js event loop function (instead of onTimerUpdate method)
function renderLoop()
{
  //const delta = clock.getDelta();
  //const elapsedTime = clock.getElapsed();

  //Textalive
  if(player.isPlaying)
  {
      const position = player.timer.position;

      const current_chorus = player.findChorus(position);
      const current_word = player.video.findWord(position);
      const current_phrase = player.video.findPhrase(position);

      if(current_phrase && current_phrase.text)
        {
          //whenever there is a new phrase
          if(current_phrase.text != saved_phrase)
          {
            saved_phrase = current_phrase.text;
            //console.log("new phrase");

            current_phrase_el.textContent = current_phrase.text;

            //update plane position
            x_pos = Math.floor(Math.random()*50)-20;
            z_pos = Math.floor(Math.random()*20)-10;
            plane.position.set(x_pos,y_pos,z_pos);

            //update plane material
            texture_index = Math.floor(Math.random()*3);
            plane.material.map = textures[texture_index]
            plane.material.map.needsUpdate = true;
          }
          
          //detect chorus
          if(current_chorus)
          {
            //console.log("chorus detected");
            light.intensity = 500 * (Ease.cubicOut(current_word?.progress(position)));
            scene.background = new THREE.Color("#66999B");
          }
          else
          {
            light.intensity = 60;
            scene.background = new THREE.Color("#496A81");
          }

        }
  }

  //render scene
  renderer3d.render(scene, camera);
  renderer2d.render(scene, camera);
  requestAnimationFrame(renderLoop);
}

//initialise textalive player
const player = new Player({
  app:{token:"PCvWkkGtKy2DsX9b"},
  mediaElement:document.querySelector("#media")
});

player.addListener({onAppReady, onTimerReady});

//three.js scene creation
const scene = new THREE.Scene();
scene.background = new THREE.Color("#496A81");

//three.js camera config
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 500);
camera.position.set(0.0,10.0,10.0);

//three.js renderer config
const renderer3d = new THREE.WebGLRenderer(
  {canvas: document.querySelector("#three"),
    alpha: true,
    antialias: true
  });
renderer3d.setSize(window.innerWidth,window.innerHeight);// set to fullscreen
renderer3d.setAnimationLoop(renderLoop);

//create elements to handover to the css renderer
const current_phrase_el = document.createElement("span");
const three2d = document.createElement("div");

three2d.className = "lyrics";
three2d.appendChild(current_phrase_el);

//css rendering for text
const renderer2d = new CSS2DRenderer();
renderer2d.setSize(window.innerWidth,window.innerHeight);// set to fullscreen

renderer2d.domElement.className = "renderer2d";
document.body.appendChild(renderer2d.domElement);

const css_text = new CSS2DObject(three2d);

//three.js clock
const clock = new THREE.Timer();
clock.connect(document);

//ambient light
const light = new THREE.AmbientLight(0x404040, 60);
scene.add(light);

//load lampost 3d obj
const loader = new GLTFLoader();

loader.load("/src/assets/streetlight_model.glb", (gltf) =>
{
  scene.add(gltf.scene);
}, undefined, (error) => {
  console.log(error);
});

//preload image materials & create plane
const texture_loader = new THREE.TextureLoader();
const miku_texture = texture_loader.load("src/assets/miku.png");
const kaito_texture = texture_loader.load("src/assets/kaito.png");
const rinlen_texture = texture_loader.load("src/assets/rinlen.png");

const textures = [miku_texture, kaito_texture, rinlen_texture];
let texture_index = Math.floor(Math.random()*3);
//console.log(texture_index);

const plane_geometry = new THREE.PlaneGeometry(15,24);
const plane_material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  side: THREE.DoubleSide,
  map: textures[texture_index]
});

let x_pos = Math.floor(Math.random()*50)-20;
const y_pos = 10;
let z_pos = Math.floor(Math.random()*20)-10;
const plane = new THREE.Mesh(plane_geometry, plane_material);
plane.position.set(x_pos,y_pos,z_pos);
scene.add(plane);
//connecting the text to the plane
plane.add(css_text); 
css_text.position.set(0,7,0);

// three.js orbit controls
const controls = new OrbitControls(camera, renderer3d.domElement);
controls.dollyIn(5);
controls.rotateUp(-(3.14/6));
controls.pan(0,70);
controls.enablePan = false;
controls.saveState();
