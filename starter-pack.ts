namespace SpriteKind {
    export const Sword = SpriteKind.create()
}

enum ActionKind {
    Walking,
    Idle,
    Jumping,
    下に進む,
    上に進む,
    左に進む,
    右に進む,
    下方向に攻撃
}
let playerSprite: Sprite = null
/**
 * ダンジョンスターターパック
 */
//% weight=150 color=#e67e22 icon="\uf3ed" block="ダンジョンスターターパック"
namespace dungeon_starter_pack {
    /**
     * プレイヤースプライトを生成する
    */
    //% block="勇者 ($kind=spritekind タイプ)"
    //% weight=100
    export function spawnDungeonPlayer(kind: number): Sprite {
        const sprite = sprites.create(assets.image`myImage4`, kind)
        sprites.setDataNumber(sprite, "attacking", 0)
        sprites.setDataNumber(sprite, "direction", 0)
        sprites.setDataBoolean(sprite, "damaging", false)
        sprites.setDataBoolean(sprite, "fighting", false)
        sprite.z = 20
        playerSprite = sprite
        return sprite
    }

    /**
     * プライトにステータスバーを設定する
    */
    //% block="$sprite=variables_get(mySprite) にHPステータスバーを設定する"
    //% weight=99
    export function setStatausBar(sprite: Sprite) {
        const statusbar = statusbars.create(20, 4, StatusBarKind.Health)
        statusbar.setColor(7, 1)
        statusbar.attachToSprite(sprite, -3, 0)
    }

    /*
     * 勇者の攻撃
     */
    //% block="勇者の攻撃"
    //% weight=98
    export function playerAttack() {
        if (playerSprite == null) return;
        if (sprites.readDataNumber(playerSprite, "attacking") != 1) {
            music.play(music.createSoundEffect(WaveShape.Square, 1, 1595, 255, 0, 100, SoundExpressionEffect.Warble, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
            const dx = controller.dx()
            const dy = controller.dy()
            if (dx !== 0 || dy !== 0) controller.moveSprite(playerSprite, 0, 0)
            sprites.setDataNumber(playerSprite, "attacking", 1)
            sprites.setDataSprite(playerSprite, "sword", sprites.create(assets.image`Unused`, SpriteKind.Sword))
            sprites.readDataSprite(playerSprite, "sword").setPosition(playerSprite.x, playerSprite.y)
            if (sprites.readDataNumber(playerSprite, "direction") == 0 || sprites.readDataNumber(playerSprite, "direction") == 3) {
                animation.stopAnimation(animation.AnimationTypes.All, playerSprite)
                animation.runImageAnimation(
                    playerSprite,
                    assets.animation`attack_to_downward`,
                    75,
                    false
                )
                animation.runImageAnimation(
                    sprites.readDataSprite(playerSprite, "sword"),
                    assets.animation`sword_to_downward`,
                    75,
                    false
                )
            } else if (sprites.readDataNumber(playerSprite, "direction") == 1) {
                animation.stopAnimation(animation.AnimationTypes.All, playerSprite)
                animation.runImageAnimation(
                    playerSprite,
                    assets.animation`attack_to_upward`,
                    75,
                    false
                )
                animation.runImageAnimation(
                    sprites.readDataSprite(playerSprite, "sword"),
                    assets.animation`sword_to_upward`,
                    75,
                    false
                )
            } else if (sprites.readDataNumber(playerSprite, "direction") == 2) {
                animation.stopAnimation(animation.AnimationTypes.All, playerSprite)
                animation.runImageAnimation(
                    playerSprite,
                    assets.animation`attack_to_rightward`,
                    75,
                    false
                )
                animation.runImageAnimation(
                    sprites.readDataSprite(playerSprite, "sword"),
                    assets.animation`sword_to_rightward`,
                    75,
                    false
                )
            } else if (sprites.readDataNumber(playerSprite, "direction") == 4) {
                animation.stopAnimation(animation.AnimationTypes.All, playerSprite)
                animation.runImageAnimation(
                    playerSprite,
                    assets.animation`attack_to_leftward`,
                    75,
                    false
                )
                animation.runImageAnimation(
                    sprites.readDataSprite(playerSprite, "sword"),
                    assets.animation`sword_to_leftward`,
                    75,
                    false
                )
            }
            pause(375)
            sprites.destroy(sprites.readDataSprite(playerSprite, "sword"))
            sprites.setDataNumber(playerSprite, "attacking", 0)
            if (dx !== 0 || dy !== 0) controller.moveSprite(playerSprite)
        }
    }

    /**
     * スプライトにダメージを加える
    */
    //% block="$sprite=variables_get(mySprite) に$damage のダメージを加える"
    //% weight=98
    //% damage.defl=10
    export function setDamageTo(sprite: Sprite, damage: number) {
        if (sprite === null) return
        const sb = statusbars.getStatusBarAttachedTo(StatusBarKind.Health, sprite)
        if (sb && !sprites.readDataBoolean(sprite, "damaging")) {
            sb.value -= damage
            sprites.setDataBoolean(sprite, "damaging", true)
            control.setInterval(() => {
                sprites.setDataBoolean(sprite, "damaging", false)
                sprite.setFlag(SpriteFlag.Invisible, false)
            }, 2000, control.IntervalMode.Timeout)
        }
    }

    /**
     * タイル上に敵を生成する
     */
    //% block="敵%enemy=screen_image_picker をタイル%tile 上に生成する || (速度 vx:%vx , vy:%vy)"
    //% tile.shadow=tileset_tile_picker
    //% tile.decompileIndirectFixedInstances=true
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% vx.defl=50
    //% vy.defl=50
    //% weight=97
    export function spawnEnemies(enemy: Image, tile: Image, vx: number, vy: number) {
        tiles.getTilesByType(tile).forEach(tLoc => {
            const e = sprites.create(enemy, SpriteKind.Enemy)
            tiles.placeOnTile(e, tLoc)
            tiles.setTileAt(tLoc, img` `)
            e.setVelocity(vx, vy)
            e.setBounceOnWall(true)
        })
    }
}
statusbars.onStatusReached(StatusBarKind.Health, statusbars.StatusComparison.LTE, statusbars.ComparisonType.Percentage, 50, function (status) {
    status.setColor(4, 1)
})
statusbars.onStatusReached(StatusBarKind.Health, statusbars.StatusComparison.LTE, statusbars.ComparisonType.Percentage, 20, function (status) {
    status.setColor(2, 1)
})
let playerHp: StatusBarSprite = null
game.onUpdate(function () {
    if (playerSprite === null) return

    const playerHp = statusbars.getStatusBarAttachedTo(StatusBarKind.Health, playerSprite)

    if (sprites.readDataNumber(playerSprite, "attacking") != 1) {
        if (playerSprite.vx > 0) {
            if (sprites.readDataNumber(playerSprite, "direction") != 2) {
                animation.stopAnimation(animation.AnimationTypes.All, playerSprite)
                animation.runImageAnimation(
                    playerSprite,
                    assets.animation`move_to_rightward`,
                    100,
                    true
                )
                sprites.setDataNumber(playerSprite, "direction", 2)
                if (playerHp) playerHp.positionDirection(CollisionDirection.Top)
            }
        } else if (playerSprite.vx < 0) {
            if (sprites.readDataNumber(playerSprite, "direction") != 4) {
                animation.stopAnimation(animation.AnimationTypes.All, playerSprite)
                animation.runImageAnimation(
                    playerSprite,
                    assets.animation`move_to_leftward`,
                    100,
                    true
                )
                sprites.setDataNumber(playerSprite, "direction", 4)
                if (playerHp) playerHp.positionDirection(CollisionDirection.Top)
            }
        } else if (playerSprite.vy > 0) {
            if (sprites.readDataNumber(playerSprite, "direction") != 3) {
                animation.stopAnimation(animation.AnimationTypes.All, playerSprite)
                animation.runImageAnimation(
                    playerSprite,
                    assets.animation`move_to_downward`,
                    100,
                    true
                )
                sprites.setDataNumber(playerSprite, "direction", 3)
                if (playerHp) playerHp.positionDirection(CollisionDirection.Top)
            }
        } else if (playerSprite.vy < 0) {
            if (sprites.readDataNumber(playerSprite, "direction") != 1) {
                animation.stopAnimation(animation.AnimationTypes.All, playerSprite)
                animation.runImageAnimation(
                    playerSprite,
                    assets.animation`move_to_upward`,
                    100,
                    true
                )
                sprites.setDataNumber(playerSprite, "direction", 1)
                if (playerHp) playerHp.positionDirection(CollisionDirection.Bottom)
            }
        } else {
            animation.stopAnimation(animation.AnimationTypes.All, playerSprite)
            if (sprites.readDataNumber(playerSprite, "direction") == 1) {
                playerSprite.setImage(assets.image`myImage15`)
            } else if (sprites.readDataNumber(playerSprite, "direction") == 2) {
                playerSprite.setImage(assets.image`myImage`)
            } else if (sprites.readDataNumber(playerSprite, "direction") == 3) {
                playerSprite.setImage(assets.image`myImage4`)
            } else if (sprites.readDataNumber(playerSprite, "direction") == 4) {
                playerSprite.setImage(assets.image`myImage0`)
            } else {
                playerSprite.setImage(assets.image`myImage4`)
            }
        }
    }
})
game.onUpdateInterval(50, function () {
    const players = sprites.allOfKind(SpriteKind.Player)
    const enemies = sprites.allOfKind(SpriteKind.Enemy)
    players.concat(enemies).forEach(sprite => {
        if (sprites.readDataBoolean(sprite, "damaging")) {
            sprite.setFlag(SpriteFlag.Invisible, sprites.readDataBoolean(sprite, "visible"))
            sprites.setDataBoolean(sprite, "visible", !(sprites.readDataBoolean(sprite, "visible")))
        }
    })
})
// ここにコードを追加します
