'use strict';
const width = 512;
const height = 512;
const screen_width = window.innerWidth;
const screen_height = window.innerHeight;

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
//シーンとライトとレンダラー
var scene = new THREE.Scene();

var ambLight = new THREE.AmbientLight(0x907070);
scene.add(ambLight);

var dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
dirLight.position.set(0, 0, 1).normalize();
scene.add(dirLight);

var canvas = document.createElement('canvas');
var context = canvas.getContext('webgl2', { antialias: false });
var renderer = new THREE.WebGLRenderer({ canvas: canvas, context: context });
renderer.setClearColor(0xFFFFFF, 1);
renderer.setSize(screen_width, screen_height);
renderer.setPixelRatio(0.5);
document.body.appendChild(renderer.domElement);


///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
//カメラ

//var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
var camera = new THREE.OrthographicCamera(0, screen_width, screen_height, 0);
camera.lookAt(0, 0, 0);
camera.position.set(0, 0, 1000);

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
//立方体
function createCube() {
    var geometry = new THREE.BoxGeometry(50, 50, 50);
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    var cube = new THREE.Mesh(geometry, material);
    cube.position.set(50, 50, 100);
    return cube;
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
//スプライト
function sprite(filename,size) {

    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load(filename);

    var material = new THREE.MeshBasicMaterial({ map: texture });
    material.transparent = true;
    //material.blending = THREE[ 'AdditiveBlending' ];

    var plane = new THREE.PlaneBufferGeometry(size, size);
    plane.applyMatrix(new THREE.Matrix4().makeTranslation(size/2, size/2, 0));

    var mesh = new THREE.Mesh(plane, material);
    mesh.position.set(0, 0, 0);
    return mesh;
}


///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
function entrypoint() {
    if (WEBGL.isWebGL2Available()) {
        mainloop();
    } else {
        var warning = WEBGL.getWebGLErrorMessage();
        document.getElementById('container').appendChild(warning);
    }
}

function mainloop() {
    requestAnimationFrame(mainloop);
    update();
    render();
};



///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
//マウス

var mouse = { x: 0, y: 0 };
var click = 0;
var onmousemove = function (ev) {
    ev.preventDefault();

    var r = ev.target.getBoundingClientRect();
    mouse.x = ev.clientX - r.left;
    mouse.y = ev.clientY - r.top;

    console.log('x:' + mouse.x);
    console.log('y:' + mouse.y);
}
var onclick = function () {
    click = 5;
}

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
//ゲームメイン部分

var cube = createCube();
scene.add(cube);

var background = sprite('textures/back.jpg',512);
scene.add(background);

var actor = sprite('textures/actor.png',128);
scene.add(actor);

function render() {
    renderer.render(scene, camera);
}

function update() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    var xx = mouse.x;
    actor.position.x += (xx-actor.position.x) * 0.1;
    actor.position.y = ( 0!=click )? 100 : 5;
    click = ( 0<click )? click - 1 : 0 ;

}



///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
entrypoint();

