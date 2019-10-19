import Phaser from 'phaser'

import { Bullets } from './bullets'

import playerImg from './assets/running-animation.png'
import platformImg from './assets/platform.png'
import levelJson from './assets/tiled/level.json'
import levelTiles from './assets/tiled/tiles.png'
import coinImg from './assets/coin.png'
import zombieImg from './assets/zombie.png'
import bulletImg from './assets/bullet.png'

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 512,
  height: 512,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  render: {
    pixelArt: true
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
}

const game = new Phaser.Game(config)
let platforms = null
let meter = null
let player = null
let coins = null
let cursors = null
let level = null
let tileset = null
let worldLayer = null
let music = null
let scoreText = null
let zombie = null
let zombies = null
let bullets = null

let score = 0
let zombieHit = false
let health = 100
let gameOver = false
let spaceIsDown = false

function preload() {
  this.load.image('platform', platformImg)
  this.load.spritesheet('player', playerImg, {
    frameWidth: 16,
    frameHeight: 16
  })
  this.load.spritesheet('bullet', bulletImg, {
    frameWidth: 16,
    frameHeight: 16
  })
  this.load.spritesheet('zombie', zombieImg, {
    frameWidth: 16,
    frameHeight: 16
  })
  this.load.spritesheet('coin', coinImg, {
    frameWidth: 16,
    frameHeight: 16
  })

  this.load.tilemapTiledJSON('level', levelJson)
  this.load.image('tiles', levelTiles)
  this.load.audio('background', 'src/assets/creepy.mp3')
}

const baseY = 512 - 16 / 2

function collectCoin(player, coin) {
  coin.disableBody(true, true)

  score += 10
  scoreText.setText(`score: ${score}`)
}

function hitByZombie(player, zombie) {
  if (!zombieHit) {
    zombieHit = true
    player.setVelocityY(-90)
    player.setVelocityX(-180)
    health -= 10

    if (health <= 0) {
      this.physics.pause()
      player.setTint(0xff0000)
      gameOver = true
    }
  }
}

function zombieBitBullet(zombie, bullet) {
  zombie.disableBody(true, true)
  zombie.setActive(false)
  zombie.setVisible(false)

  // bullet.disableBody(true, true);
  bullet.setActive(false)
  bullet.setVisible(false)
}

function create() {
  scoreText = this.add.text(116, 450, 'score: 0', {
    fontSize: '32px',
    fill: '#0c0c0c'
  })
  scoreText.setScrollFactor(1)

  music = this.sound.add('background')

  level = this.make.tilemap({ key: 'level' })
  tileset = level.addTilesetImage('tiles', 'tiles')
  worldLayer = level.createDynamicLayer('Tile Layer 1', tileset, 0, 0)
  // worldLayer.setCollisionByProperty({ collides: true });
  worldLayer.setCollisionByExclusion([-1])

  bullets = new Bullets(this)

  coins = this.physics.add.group({
    key: 'coin',
    repeat: 16,
    setXY: { x: 64, y: 16, stepX: 64 }
  })

  coins.children.iterate(child => {
    child.setBounce(Phaser.Math.FloatBetween(0.5, 0.6))
    child.setCollideWorldBounds(true)
  })

  zombies = this.physics.add.group({
    key: 'zombie',
    repeat: 12,
    setXY: { x: 64, y: 16, stepX: 72 }
  })

  zombies.children.iterate(child => {
    child.setBounce(0)
    child.setCollideWorldBounds(true)
  })

  player = this.physics.add.sprite(100, 450, 'player')
  player.setBounce(0)
  player.setCollideWorldBounds(true)

  zombie = this.physics.add.sprite(150, 450, 'zombie')
  zombie.setBounce(0)
  zombie.setCollideWorldBounds(true)

  this.anims.create({
    key: 'swirl',
    frames: this.anims.generateFrameNumbers('bullet', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  })

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  })

  this.anims.create({
    key: 'turn',
    frames: [{ key: 'player', frame: 0 }],
    frameRate: 20
  })

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  })

  this.anims.create({
    key: 'zLeft',
    frames: this.anims.generateFrameNumbers('zombie', { start: 0, end: 3 }),
    frameRate: 5,
    repeat: -1
  })

  this.anims.create({
    key: 'zIdle',
    frames: [{ key: 'zombie', frame: 0 }],
    frameRate: 20
  })

  this.anims.create({
    key: 'zRight',
    frames: this.anims.generateFrameNumbers('zombie', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  })

  this.anims.create({
    key: 'rotate',
    frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: Infinity
  })

  this.cameras.main.setBounds(0, 0, 1536, 512)
  this.cameras.main.startFollow(player)
  this.cameras.main.setBackgroundColor('#cadc9f')
  this.cameras.main.setZoom(5)

  // this.physics.add.collider(player, platforms);
  this.physics.world.setBounds(0, 0, 1536, 512)
  this.physics.add.collider(player, worldLayer)
  this.physics.add.collider(coins, worldLayer)
  this.physics.add.collider(zombie, worldLayer)
  this.physics.add.collider(zombies, worldLayer)
  this.physics.add.collider(bullets, worldLayer)
  this.physics.add.overlap(player, coins, collectCoin, null, this)
  this.physics.add.overlap(player, zombie, hitByZombie, null, this)
  this.physics.add.overlap(player, zombies, hitByZombie, null, this)
  this.physics.add.overlap(zombies, bullets, zombieBitBullet, null, this)
  this.physics.add.overlap(zombie, bullets, zombieBitBullet, null, this)

  cursors = this.input.keyboard.createCursorKeys()
  music.play()
}

function update() {
  coins.children.iterate(child => {
    child.anims.play('rotate', true)
  })

  bullets.children.iterate(bullet => {
    bullet.anims.play('swirl', true)
  })

  zombie.anims.play('zLeft', true)

  zombies.children.iterate(z => {
    z.anims.play('zLeft', true)
  })
  const volume = meter.volume
  if (!zombieHit) {
    if (volume > 0.1) {
      player.setVelocityX(90)
      player.flipX = false
      player.anims.play('right', true)
      // } else {
      //   player.setVelocityX(0)
      //   player.anims.play('turn')
    } else {
      player.setVelocityX(-90)
      player.flipX = true
      player.anims.play('left', true)
    }

    if (cursors.space.isDown) {
      if (!spaceIsDown) {
        spaceIsDown = true
        bullets.fireBullet(player.x, player.y, zombies, zombieBitBullet, this)
      }
    }

    if (cursors.space.isUp) {
      spaceIsDown = false
    }
  }

  if (player.body.onFloor()) {
    zombieHit = false
  }

  if (volume > 0.8 && player.body.onFloor()) {
    player.setVelocityY(-240)
  }
}

// sound stuff

// monkeypatch Web Audio
window.AudioContext = window.AudioContext || window.webkitAudioContext

// grab an audio context
const audioContext = new AudioContext()

// Attempt to get audio input
try {
  // monkeypatch getUserMedia
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia

  // ask for an audio input
  navigator.getUserMedia(
    {
      audio: {
        mandatory: {
          googEchoCancellation: 'false',
          googAutoGainControl: 'false',
          googNoiseSuppression: 'false',
          googHighpassFilter: 'false'
        },
        optional: []
      }
    },
    gotStream,
    didntGetStream
  )
} catch (e) {
  alert('getUserMedia threw exception :' + e)
}

function didntGetStream() {
  alert('Stream generation failed.')
}

var mediaStreamSource = null

function gotStream(stream) {
  // Create an AudioNode from the stream.
  mediaStreamSource = audioContext.createMediaStreamSource(stream)

  // Create a new volume meter and connect it.
  meter = createAudioMeter(audioContext)
  mediaStreamSource.connect(meter)
}

function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
  var processor = audioContext.createScriptProcessor(512)
  processor.onaudioprocess = volumeAudioProcess
  processor.clipping = false
  processor.lastClip = 0
  processor.volume = 0
  processor.clipLevel = clipLevel || 0.98
  processor.averaging = averaging || 0.95
  processor.clipLag = clipLag || 750

  // this will have no effect, since we don't copy the input to the output,
  // but works around a current Chrome bug.
  processor.connect(audioContext.destination)

  processor.checkClipping = function() {
    if (!this.clipping) return false
    if (this.lastClip + this.clipLag < window.performance.now())
      this.clipping = false
    return this.clipping
  }

  processor.shutdown = function() {
    this.disconnect()
    this.onaudioprocess = null
  }

  return processor
}

function volumeAudioProcess(event) {
  var buf = event.inputBuffer.getChannelData(0)
  var bufLength = buf.length
  var sum = 0
  var x

  // Do a root-mean-square on the samples: sum up the squares...
  for (var i = 0; i < bufLength; i++) {
    x = buf[i]
    if (Math.abs(x) >= this.clipLevel) {
      this.clipping = true
      this.lastClip = window.performance.now()
    }
    sum += x * x
  }

  // ... then take the square root of the sum.
  var rms = Math.sqrt(sum / bufLength)

  // Now smooth this out with the averaging factor applied
  // to the previous sample - take the max here because we
  // want "fast attack, slow release."
  this.volume = Math.max(rms, this.volume * this.averaging)
}

if (
  typeof AudioContext != 'undefined' ||
  typeof webkitAudioContext != 'undefined'
) {
  var resumeAudio = function() {
    if (typeof audioContext == 'undefined' || audioContext == null) return
    if (audioContext.state == 'suspended') audioContext.resume()
    document.removeEventListener('click', resumeAudio)
  }
  document.addEventListener('click', resumeAudio)
}
