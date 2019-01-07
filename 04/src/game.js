'use strict';

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
class ActorParam {
    constructor(sprite, animationMaterialList) {

        this.sprite = sprite;
        this.sprite.center.x = 0.5;

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
        if (mouse.click) {
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
        if (this.position.y < GROUND_HEIGHT) {
            this.accel.y = 0;
            this.position.y = GROUND_HEIGHT;
        }

        //座標更新
        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;
    }

    //向き変える
    updateFlip(util) {
        util.filpx(this.sprite.material, this.dirc);
    }

    //食べた
    eat() {
        const S = this.sprite.scale.x + 10;
        this.sprite.scale.x = S;
        this.sprite.scale.y = S;
    }
}


class FoodParam {

    constructor(sprite) {

        this.isEated = false;
        this.respawnTimer = 0;

        this.position = new THREE.Vector3();
        this.position.x = 100;
        this.position.y = 150;

        this.scale = 100;

        this.sprite = sprite;
        this.sprite.center.x = 0.5;

    }

    //移動
    update() {

        if (this.isEated) {
            this.scale = 0;
            this.sprite.opacity = 1;

            const now = (new Date()).getTime();
            if (this.respawnTimer < now) {
                this.isEated = false;
                this.scale = 100;
                this.sprite.opacity = 0;
                this.position.x = Math.random() * screen_width * 0.75;
                this.position.y = Math.random() * screen_height * 0.75;
            }

        }

        this.scale += 0.1;
        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;
        this.sprite.scale.set(this.scale, this.scale, 1);

    }

    //死亡
    eated() {
        this.isEated = true;
        this.respawnTimer = (new Date()).getTime() + 1000;
    }

}


function checkEat(actorParam, foodParam) {

    if (foodParam.isEated) {
        return false;
    }

    const p1 = actorParam.position;
    const s1 = actorParam.sprite.scale.x;

    const p2 = foodParam.position;
    const s2 = foodParam.sprite.scale.x;

    const len = p2.distanceTo(p1);
    const size = (s1 * 0.5 + s2 * 0.2);
    return (len < size);

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
        this.initialized = false;
        this.heroParam = null;
        this.foodParam = null;
    }

    async initGame() {
        const U = this.util;

        this.matList = await this.createSpriteMaterialWithTextureAsyncParallel([
            'back.jpg',   //0
            'ino01.png',  //1
            'ino02.png',  //2
            'food.png'    //3
        ]);

        //背景
        const backgroundSprite = U.createSprite(this.matList[0], 512, 512);
        this.scene.add(backgroundSprite);

        //主人公
        const heroSprite = U.createSprite(this.matList[1], 128, 128);
        this.scene.add(heroSprite);
        this.heroParam = new ActorParam(heroSprite, [
            this.matList[1],
            this.matList[2]
        ]);

        //タケノコ
        const foodSprite = U.createSprite(this.matList[3], 256, 256);
        this.scene.add(foodSprite);
        this.foodParam = new FoodParam(foodSprite);

        //初期化終了
        this.initialized = true;
    }

    update() {
        if (true !== this.initialized) {
            return;
        }

        const U = this.util;
        this.heroParam.updateAnimation();
        this.heroParam.updatePosition(mouse);
        this.heroParam.updateFlip(U);

        this.foodParam.update();

        if (checkEat(this.heroParam, this.foodParam)) {
            this.heroParam.eat();
            this.foodParam.eated();
        }

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

