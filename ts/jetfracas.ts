var canvas = document.querySelector('canvas');
var c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function randeRange(x0, x1){
    return Math.random() * (x1 - x0) + x0;
}

function randeRangeInt(x0, x1){
    return Math.round(randeRange(x0, x1));
}

class Bullet{
    x: number;
    y: number; 
    dy: number;
    radius: number;

    constructor(private c: CanvasRenderingContext2D, x: number, y: number, dy: number, radius: number){
        this.x = x;
        this.y = y;
        this.dy = dy;
        this.radius = radius
    }

    draw(){
        c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
		//c.fillStyle = this.color;
		c.fill();
    }

    update(){
        this.draw();
        this.y += this.dy;
    }
}

class Bodies{
    x: number;
    y: number; 
    dx: number;
    radius: number = 30;

    constructor(){
        this.x = randeRangeInt(0 + this.radius, canvas.width - this.radius);
        this.y = this.radius;
        this.dx = 5;
    }

    draw(){
        c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
		//c.fillStyle = this.color;
		c.fill();
    }

    update(){
        this.draw();
        if(this.x + this.radius  >= canvas.width || this.x - this.radius <= 0){
            this.dx = -this.dx;
        }

        this.x += this.dx;
    }
}

class Jet{

    x: number;
    y: number;

    dx: number;
    dxMax: number;
    ax: number;

    wingWidth: number;
    wingHeight: number;
    hullWidth: number;
    hullHeight: number;

    rocketHeight: number;
    rocketWidth: number;

    constructor(private c: CanvasRenderingContext2D, x0: number, y0: number){
        this.x = x0;
        this.y = y0;

        this.dx = 7;
        this.dxMax = 10;
        this.ax = 1; 

        this.wingWidth = 40;
        this.wingHeight = 20;
        this.hullWidth = 16;
        this.hullHeight = 45;

        this.rocketHeight = 30;
        this.rocketWidth = 6;
    }

    draw(): void{
        var x: number = this.x - this.wingWidth, y = this.y;
        this.c.beginPath();
        this.c.moveTo(x, y);
        y -= this.wingHeight/2;
        this.c.lineTo(x, y);
        x = this.x - this.hullWidth/2;
        this.c.lineTo(x, y - 5);
        y -= this.hullHeight;
        this.c.lineTo(x + 4, y);
        x += this.hullWidth;
        this.c.lineTo(x - 4, y);
        y += this.hullHeight;
        this.c.lineTo(x, y - 5);
        x = this.x + this.wingWidth;
        this.c.lineTo(x, y);
        y += this.wingHeight;
        this.c.lineTo(x, y);
        x -= this.wingWidth * 2;
        this.c.lineTo(x, y);
        this.c.closePath();
        // this.c.fillStyle = '#A6A6A6';
        // this.c.fill();

        y -= this.rocketHeight;
        this.c.lineTo(x, y);
        x -= this.rocketWidth;
        this.c.lineTo(x, y);
        y += this.rocketHeight + 5;
        this.c.lineTo(x, y);
        x += this.rocketWidth;
        this.c.lineTo(x, y);
        this.c.closePath();


        x = this.x + this.wingWidth;
        y = this.y + this.wingHeight/2;
        this.c.moveTo(x, y);
        y -= this.rocketHeight;
        this.c.lineTo(x, y);
        x += this.rocketWidth;
        this.c.lineTo(x, y);
        y += this.rocketHeight + 5;
        this.c.lineTo(x, y);
        x -= this.rocketWidth;
        this.c.lineTo(x, y);
        this.c.closePath();

        this.c.fillStyle = '#737373';
        this.c.fill();
        //c.stroke();
    }

    update(direction): void{
        this.x += direction * this.dx;
        // if(this.dx < this.dxMax){
        //     this.dx += direction * this.ax;
        // }
        this.draw();
    }
}

var jet = new Jet(c, canvas.width/2, canvas.height - 50);
var bullets = [];
var shotDistance = 10
function addBullets(){
    var x = jet.x, y = jet.y - jet.hullHeight - 5 - shotDistance;
    bullets.push(new Bullet(c, x, y, -4, 5));
    x -= (jet.wingWidth + jet.rocketWidth/2), y = jet.y + jet.wingHeight/2 - jet.rocketHeight - shotDistance;
    bullets.push(new Bullet(c, x, y, -6, 3));
    x += jet.wingWidth * 2 + jet.rocketWidth;
    bullets.push(new Bullet(c, x, y, -6, 3));
}

var LEFT = 37, RIGHT = 39, UP = 38, DOWN = 40, left = false, right = false;
window.addEventListener('keydown', function(event){
    if(event.keyCode == LEFT){
        right = false;
        left = true;
        event.preventDefault();
    }else if(event.keyCode == RIGHT){
        left = false;
        right = true;
        event.preventDefault();
    }else if(event.keyCode == UP || event.keyCode == DOWN){
        event.preventDefault();
    }
});

window.addEventListener('keyup', function(event){
    if(event.keyCode == LEFT){
        left = false;
        event.preventDefault();
    }else if(event.keyCode == RIGHT){
        right = false;
        event.preventDefault();
    }
});

var bdy = new Bodies();
var frame: number = 0;
function animate(){
    var animation = requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    bdy.update();

    if(frame % 10 == 0){
        addBullets();
    }
    
    if(left){
        jet.update(-1);
    }else if(right){
        jet.update(1);
    }else{
        jet.update(0);
    }

    for(var i = 0; i < bullets.length; i++){
        bullets[i].update();
    }

    frame++;
}

animate();