const BTN_RATIO = 0.5

class Menu extends PIXI.Container {
  constructor() {
    super()

    let menuWrapper = PIXI.Sprite.from('start.png')
    this.addChild(menuWrapper);

    this.btnMiddle = PIXI.Sprite.from('middle.png')
    this.btnMiddle.scale.set((menuWrapper.width * BTN_RATIO) / this.btnMiddle.width)
    this.btnMiddle.x = (menuWrapper.width - this.btnMiddle.width) / 2
    this.btnMiddle.y = (menuWrapper.height - this.btnMiddle.height) / 2
    this.addChild(this.btnMiddle);

    this.btnEasy = PIXI.Sprite.from('easy.png')
    this.btnEasy.scale.set(this.btnMiddle.scale.x, this.btnMiddle.scale.y)
    this.btnEasy.x = this.btnMiddle.x
    this.btnEasy.y = this.btnMiddle.y - this.btnMiddle.height * 1.5
    this.addChild(this.btnEasy);

    this.btnHard = PIXI.Sprite.from('hard.png')
    this.btnHard.scale.set(this.btnMiddle.scale.x, this.btnMiddle.scale.y)
    this.btnHard.x = this.btnMiddle.x
    this.btnHard.y = this.btnMiddle.y + this.btnMiddle.height * 1.5
    this.addChild(this.btnHard);
  }
}
export default Menu
