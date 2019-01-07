'use strict';

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
class ActorParam {
    constructor( sprite , animationMaterialList ) {
        
        this.sprite = sprite;
        this.animationMaterialList = animationMaterialList;

        this.position = new THREE.Vector3();
        this.accel = new THREE.Vector3();

        this.animation = 0;
        this.animationWait = 0;

        this.dirc = 0;
    }

    //アニメーション
    updateAnimation() {

        --this.animationWait;
        if (this.animationWait < 0) {
            this.animation++;
            this.animationWait = 10;
        }

        const L = this.animationMaterialList;
        const idx = this.animation % L.length;
        this.sprite.material = L[idx];
        
    }

    //移動
    updatePosition(mouse) {
        const X_POWER = 0.1;
        const X_BREAK = 0.4;
        const JUMP_POWER = 10;
        const GRAVITY = -0.5;
        const GROUND_HEIGHT = 0;

        const xx = mouse.x;
        this.dirc = this.accel.x;

        //ジャンプ
        if( mouse.click ) {
            mouse.click = false;
            this.accel.y = JUMP_POWER;
        }
        this.accel.y += GRAVITY;

        //左右
        this.accel.x += (xx - this.position.x) * X_POWER;
        this.accel.x *= X_BREAK;

        //移動
        this.position.x += this.accel.x;
        this.position.y += this.accel.y;

        //ジャンプ着地
        if( this.position.y < GROUND_HEIGHT ) {
            this.accel.y = 0;
            this.position.y = GROUND_HEIGHT;
        }
        
        //座標更新
        this.sprite.position.x = this.position.x ;
        this.sprite.position.y = this.position.y ;
    }

    //向き変える
    updateFlip(util) {
        util.filpx(this.sprite.material, this.dirc);
    }
}



///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
class World extends WorldBase {

    //複数のテクスチャを読み込んでマテリアルを返す
    async createSpriteMaterialWithTextureAsyncParallel(filenames) {
        const U = this.util;

        const textureList = await U.loadTextureAsyncParallel(filenames);
        var resultList = [];
        for (var A of textureList) {
            resultList.push(U.createSpriteMaterial(A));
        }
        return resultList;
    }

    initDefine() {
        this.heroParam = null;
        this.initialized = false;
    }

    async initGame() {
        const U = this.util;

        this.matList = await this.createSpriteMaterialWithTextureAsyncParallel([
            'back.jpg',   //0
            'ino01.png',  //1
            'ino02.png'   //2
        ]);

        //背景
        const backgroundSprite = U.createSprite(this.matList[0], 512, 512);
        this.scene.add(backgroundSprite);
        
        //主人公
        const heroSprite = U.createSprite(this.matList[1], 256, 256);
        this.scene.add(heroSprite);
        this.heroParam = new ActorParam( heroSprite , [
            this.matList[1],
            this.matList[2]
        ]);

        //初期化終了
        this.initialized = true;
    }

    update() {
        if( true !== this.initialized ) {
            return;
        }

        const U = this.util;
        this.heroParam.updateAnimation();
        this.heroParam.updatePosition(mouse);
        this.heroParam.updateFlip(U);
    }

};



///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
__gameStart__(() => {
    var world = new World();
    function mainloop() {
        requestAnimationFrame(mainloop);
        world.update();
        world.render();
    }
    mainloop();
});

