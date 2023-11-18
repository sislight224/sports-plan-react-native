class Item {
  constructor(props) {
    this.ctx = props.ctx;
    this.game = props.game;
    this.name = props.name;
    this.x = props.x;
    this.y = props.y;
    this.imgs = props.imgs;
    this.type = props.type
    this.w = props.w;
    this.h = props.h;
    if(!!props.startPos) {
      this.startPos = props.startPos
    } else {
      this.startPos = {
        x : this.x,
        y : this.y
      }
    }

  }

  draw(pos) {
    let x = this.x;
    let y = this.y;
    if(!!pos) {
      x = pos.x;
      y = pos.y;
    }

    x = (x + this.game.camera.x);
    y = (y + this.game.camera.y);

    this.ctx.save()
    this.ctx.translate(x, y)
    if(this.imgs[this.type]) {
        this.ctx.drawImage(this.imgs[this.type], 0 , 0, this.w, this.h);
    }
    if(!!this.name && this.name != "") {
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        this.ctx.font = Math.round(12) + 'px Arial'
        this.ctx.fillStyle = 'white'
        this.ctx.fillText(this.name, this.w / 2, this.h / 2)
    }

    if(this.selected) {
      this.ctx.beginPath();
      this.ctx.rect(0, 0, this.w, this.h);
      this.ctx.stroke();
      this.ctx.closePath();
    }

    this.ctx.restore();
  }

  getJSON() {
    return {
      x : this.x, 
      y : this.y,
      type: this.type,
      name: this.name,
      startPos: this.startPos
    }
  }
}

export default Item;