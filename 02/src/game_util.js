'use strict';
const width = 512;
const height = 512;
const screen_width = window.innerWidth;
const screen_height = window.innerHeight;


///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
class util {

    //sleep(10)みたいな記述で10ms待てるヤツ
    sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    } 

    //awit出来るTexture読み込み
    async loadTextureAsync(filename) {
        var resultTexture = null;
        (new THREE.TextureLoader()).load( "./textures/" + filename, (tex) => {
            resultTexture = tex;
        });
        while (null == resultTexture) {
            await this.sleep(1);
        }

        return resultTexture;
    }

    //複数のテクスチャを並列で読み込み
    async loadTextureAsyncParallel(filenames) {
        var list = [];
        for (var f of filenames) {
            list.push( this.loadTextureAsync(f) );
        }
        var resultTextureList = [];
        await Promise.all(list).then(tmp => {
            resultTextureList = tmp;
        });
        while (null == resultTextureList) {
            await this.sleep(1);
        }
        return resultTextureList;
    }

    //立方体生成
    createCube() {
        var geometry = new THREE.BoxGeometry(50, 50, 50);
        var material = new THREE.MeshLambertMaterial({ color: 0xffffff });
        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(50, 50, 100);
        return cube;
    }

    //スプライト生成
    createSprite(material, w, h) {
        var sprite = new THREE.Sprite(material);
        sprite.position.set(0, 0, 0);
        sprite.center.set(0, 0);
        sprite.scale.set(w, h, 1);
        return sprite;
    }

};

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
var mouse = { x: 0, y: 0, click: 0 };
var mouseDown = function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    mouse.click = 5;
}
var mouseMove = function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var x = 0
    var y = 0

    if (ev.touches && ev.touches[0]) {
        x = ev.touches[0].clientX;
        y = ev.touches[0].clientY;
    } else if (ev.originalEvent && ev.originalEvent.changedTouches[0]) {
        x = ev.originalEvent.changedTouches[0].clientX;
        y = ev.originalEvent.changedTouches[0].clientY;
    } else if (ev.clientX && ev.clientY) {
        x = ev.clientX;
        y = ev.clientY;
    }

    var r = ev.target.getBoundingClientRect();
    mouse.x = x - r.left;
    mouse.y = y - r.top;
}
function initMouse() {
    if ('ontouchstart' in window) {
        document.addEventListener('touchstart', mouseDown, { passive: false });
        document.addEventListener('touchmove', mouseMove, { passive: false });
    } else {
        document.addEventListener('mousedown', mouseDown, { passive: false });
        document.addEventListener('mousemove', mouseMove, { passive: false });
    }
}




///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
class WorldBase {
    constructor() {
        this.initDefine();
        this.initScene();
        this.initGame();
    }

    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //シーンやカメラなどを生成
    initScene() {
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

        //カメラ
        //var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        var camera = new THREE.OrthographicCamera(0, screen_width, screen_height, 0);
        camera.lookAt(0, 0, 0);
        camera.position.set(0, 0, 1000);

        this.scene = scene;
        this.ambLight = ambLight;
        this.dirLight = dirLight;
        this.renderer = renderer;
        this.camera = camera;
    }

    //
    async initGame() { }

    //
    initDefine() {}

    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    update() { }

};


///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
function __gameStart__(entryPoint) {

    if (!WEBGL.isWebGL2Available()) {
        var warning = WEBGL.getWebGLErrorMessage();
        document.getElementById('container').appendChild(warning);
        return;
    }

    initMouse();
    entryPoint();
}

