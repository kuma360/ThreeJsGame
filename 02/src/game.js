'use strict';

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
class World extends WorldBase {

    initDefine() {
        this.inoPosition = {x:0,y:0};
        this.inoAnimation = 0;
        this.inoWait = 0;
    }

    async initGame() {
        const u = new util();

        const dat = await u.loadTextureAsyncParallel([
            'back.jpg',   //0
            'ino01.png',  //1
            'ino02.png'   //2
        ]);

        var param = { map: dat[0], color: 0xFFFFFF, transparent: true, side:THREE.DoubleSide };
        this.backMat = new THREE.SpriteMaterial(param);

        param.map = dat[1];
        this.ino01Mat = new THREE.SpriteMaterial(param);
        
        param.map = dat[2];
        this.ino02Mat = new THREE.SpriteMaterial(param);

        var background = u.createSprite(this.backMat, 512, 512);
        this.scene.add(background);
        this.background = background;

        var actor = u.createSprite(this.ino01Mat, 128, 128);
        this.scene.add(actor);
        this.actor = actor;
    }

    update() {

        if (null != this.actor) {
            
            var xx = mouse.x;
            var dirc = (xx - this.actor.position.x);

            
            //アニメーション
            --this.inoWait;
            if(this.inoWait<0) {
                this.inoAnimation++;
                this.inoWait = 10;
            }
            if(this.inoAnimation % 2 == 0) {
                this.actor.material = this.ino02Mat;
            } else {
                this.actor.material = this.ino01Mat;
            }

            //移動
            this.actor.position.x += dirc * 0.1;
            this.actor.position.y = (0 != mouse.click) ? 160 : 35;
            mouse.click = (0 < mouse.click) ? mouse.click - 1 : 0;

            //向き変える
            if(0<dirc) {
                var tex = this.actor.material.map;
                tex.wrapS = THREE.RepeatWrapping;
                tex.repeat.x = -1;
            } else {
                var tex = this.actor.material.map;
                tex.wrapS = THREE.RepeatWrapping;
                tex.repeat.x = 1;
            }

        }

    }

};



///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
__gameStart__( () => {
    var world = new World();
    function mainloop() {
        requestAnimationFrame(mainloop);
        world.update();
        world.render();
    }
    mainloop();
} );

