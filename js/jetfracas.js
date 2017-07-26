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

function Bullet(x, y, dy, radius){
    this.x = x;
    this.y = y;
    this.dy = dy;
    this.radius = radius

    this.draw = function(){
        c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
		//c.fillStyle = this.color;
		c.fill();
    }

    this.update = function(){
        this.draw();
        this.y += this.dy;
    }
}

function Bodies(){
    this.radius = 30;
    this.x = randeRangeInt(0 + this.radius, canvas.width - this.radius);
    this.y = randeRangeInt(0 + this.radius, canvas.height - this.radius);
    this.dx = 5;

    this.draw = function(){
        c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
		//c.fillStyle = this.color;
		c.fill();
    }

    this.update = function(){
        this.draw();
        if(this.x )
        this.x += dx;
    }
}

function Jet(x0, y0){
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

    this.draw = function(){
        var x = this.x - this.wingWidth, y = this.y;
        c.beginPath();
        c.moveTo(x, y);
        y -= this.wingHeight/2;
        c.lineTo(x, y);
        x = this.x - this.hullWidth/2;
        c.lineTo(x, y - 5);
        y -= this.hullHeight;
        c.lineTo(x + 4, y);
        x += this.hullWidth;
        c.lineTo(x - 4, y);
        y += this.hullHeight;
        c.lineTo(x, y - 5);
        x = this.x + this.wingWidth;
        c.lineTo(x, y);
        y += this.wingHeight;
        c.lineTo(x, y);
        x -= this.wingWidth * 2;
        c.lineTo(x, y);
        c.closePath();
        // c.fillStyle = '#A6A6A6';
        // c.fill();

        y -= this.rocketHeight;
        c.lineTo(x, y);
        x -= this.rocketWidth;
        c.lineTo(x, y);
        y += this.rocketHeight + 5;
        c.lineTo(x, y);
        x += this.rocketWidth;
        c.lineTo(x, y);
        c.closePath();


        x = this.x + this.wingWidth;
        y = this.y + this.wingHeight/2;
        c.moveTo(x, y);
        y -= this.rocketHeight;
        c.lineTo(x, y);
        x += this.rocketWidth;
        c.lineTo(x, y);
        y += this.rocketHeight + 5;
        c.lineTo(x, y);
        x -= this.rocketWidth;
        c.lineTo(x, y);
        c.closePath();

        c.fillStyle = '#737373';
        c.fill();
        //c.stroke();
    }

    this.update = function(direction){
        this.x += direction * this.dx;
        // if(this.dx < this.dxMax){
        //     this.dx += direction * this.ax;
        // }
        this.draw();
    }
}

var jet = new Jet(canvas.width/2, canvas.height - 50);
var bullets = [];
var shotDistance = 10
function addBullets(){
    var x = jet.x, y = jet.y - jet.hullHeight - 5 - shotDistance;
    bullets.push(new Bullet(x, y, -4, 5));
    x -= (jet.wingWidth + jet.rocketWidth/2), y = jet.y + jet.wingHeight/2 - jet.rocketHeight - shotDistance;
    bullets.push(new Bullet(x, y, -6, 3));
    x += jet.wingWidth * 2 + jet.rocketWidth;
    bullets.push(new Bullet(x, y, -6, 3));
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

var frames = 0;
function animate(){
    var animation = requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    if(frames % 10 == 0){
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

    frames++;
}

animate();