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

var background_color = '#D0E4F2';
canvas.setAttribute('style', 'background-color: ' + background_color);

class Bullet{
    x: number;
    y: number; 
    dy: number;
    base: number;
    height: number;

    constructor(private c: CanvasRenderingContext2D, x: number, y: number, dy: number, base: number, height: number){
        this.x = x;
        this.y = y;
        this.dy = dy;
        this.base = base;
        this.height = height;
    }

    bWidth = 5;
    bHeight = 10;
    draw(){
        this.c.beginPath();
        var x = this.x - this.base/2, y = this.y;
        this.c.moveTo(x, y);
        x += this.base/2, y -= this.height;
        this.c.lineTo(x, y);
        x += this.base/2, y += this.height;
        this.c.lineTo(x, y);
        this.c.closePath();
		//c.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
		//c.fillStyle = this.color;
		this.c.fill();
    }

    update(){
        this.draw();
        this.y += this.dy;
    }

    getTriCoord(){
        var v1 = [this.x - this.base/2, this.y];
        var v2 = [this.x, this.y - this.height];
        var v3 = [this.x + this.base/2, this.y];
        return [v1, v2, v3];
    }
}

var colors1 = [
    '#30395C',
    '#4A6491',
    '#85A5CC'
]
class Bodies{
    x: number;
    y: number; 

    dx: number;
    dy: number;

    radius: number = 10;
    maxRadius: number = 15;

    vanquished: boolean = false;

    color: number = 2;

    constructor(){
        this.x = randeRangeInt(0 + this.radius, canvas.width - this.radius);
        this.y = randeRangeInt(30, 200);
        this.dx = randeRangeInt(-6, 6);
        this.dy = randeRange(0.1, 0.5);
    }

    draw(){
        c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
		c.fillStyle = colors1[this.color];
		c.fill();
    }

    update(){
        this.draw();
        if(this.x + this.radius  >= canvas.width || this.x - this.radius <= 0){
            this.dx = -this.dx;
        }
        this.y += this.dy;

        this.x += this.dx;
    }

    pointCircleCollide(point, circle, r): boolean{
        if (r===0) return false;
        var dx = circle[0] - point[0];
        var dy = circle[1] - point[1];
        return dx * dx + dy * dy <= r * r;
    }

    lineCircleCollide(a, b, circle, radius, nearest=null): boolean{
        var tmp = [0, 0];
        //check to see if start or end points lie within circle 
        if (this.pointCircleCollide(a, circle, radius)) {
            if (nearest) {
                nearest[0] = a[0];
                nearest[1] = a[1];
            }
            return true
        } if (this.pointCircleCollide(b, circle, radius)) {
            if (nearest) {
                nearest[0] = b[0];
                nearest[1] = b[1];
            }
            return true
        }
        
        var x1 = a[0], y1 = a[1], x2 = b[0], y2 = b[1];
        var cx = circle[0], cy = circle[1];

        //vector d
        var dx = x2 - x1;
        var dy = y2 - y1;
        
        //vector lc
        var lcx = cx - x1;
        var lcy = cy - y1;
        
        //project lc onto d, resulting in vector p
        var dLen2 = dx * dx + dy * dy; //len2 of d
        var px = dx;
        var py = dy;
        if (dLen2 > 0) {
            var dp = (lcx * dx + lcy * dy) / dLen2;
            px *= dp;
            py *= dp;
        }
        
        if (!nearest)
            nearest = tmp;
        nearest[0] = x1 + px;
        nearest[1] = y1 + py;
        
        //len2 of p
        var pLen2 = px * px + py * py;
        
        //check collision
        return this.pointCircleCollide(nearest, circle, radius)
                && pLen2 <= dLen2 && (px * dx + py * dy) >= 0;
    }

    pointInTriangle(point, triangle): boolean {
        //compute vectors & dot products
        var cx = point[0], cy = point[1],
            t0 = triangle[0], t1 = triangle[1], t2 = triangle[2],
            v0x = t2[0]-t0[0], v0y = t2[1]-t0[1],
            v1x = t1[0]-t0[0], v1y = t1[1]-t0[1],
            v2x = cx-t0[0], v2y = cy-t0[1],
            dot00 = v0x*v0x + v0y*v0y,
            dot01 = v0x*v1x + v0y*v1y,
            dot02 = v0x*v2x + v0y*v2y,
            dot11 = v1x*v1x + v1y*v1y,
            dot12 = v1x*v2x + v1y*v2y

        // Compute barycentric coordinates
        var b = (dot00 * dot11 - dot01 * dot01),
            inv = b === 0 ? 0 : (1 / b),
            u = (dot11*dot02 - dot01*dot12) * inv,
            v = (dot00*dot12 - dot01*dot02) * inv
        return u>=0 && v>=0 && (u+v < 1)
    }

    collision(bullet): boolean{
        var circle = [this.x, this.y], triangle = bullet.getTriCoord(), radius = this.radius;
        if (this.pointInTriangle(circle, triangle))
            return true;
        if (this.lineCircleCollide(triangle[0], triangle[1], circle, radius))
            return true;
        if (this.lineCircleCollide(triangle[1], triangle[2], circle, radius))
            return true;
        if (this.lineCircleCollide(triangle[2], triangle[0], circle, radius))
            return true;
        return false;
    }

    grow(growthRate: number){
        if(!this.vanquished){
            this.radius += growthRate;
            this.color = (this.color > 0) ? --this.color : this.color;
            //this.draw();
            if(this.radius > this.maxRadius){
                this.vanquished = true;
                this.radius = 0;
            }
        }
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

    color: number = 0;

    constructor(private c: CanvasRenderingContext2D, x0: number, y0: number){
        this.x = x0;
        this.y = y0;

        this.dx = 0;
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

        this.c.fillStyle = colors1[this.color];
        this.c.fill();
    }

    stopForce = 0.1;
    update(direction): void{
        if(direction == 0){
            this.dx += (Math.abs(this.dx) > 0) ?  -1 * this.dx * this.stopForce : 0;
        } else{
            this.dx += (Math.abs(this.dx) < this.dxMax) ? direction * this.ax : 0;  // per 1 frame
        }
        this.x += this.dx;
        this.draw();
    }
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

var jet = new Jet(c, canvas.width/2, canvas.height - 50);
var bullets = [];
var shotDistance = 10
function addBullets(){
    var x = jet.x, y = jet.y - jet.hullHeight - 5 - shotDistance;
    bullets.push(new Bullet(c, x, y, -6, 8, 15));
    x -= (jet.wingWidth + jet.rocketWidth/2), y = jet.y + jet.wingHeight/2 - jet.rocketHeight - shotDistance;
    bullets.push(new Bullet(c, x, y, -8, 6, 6));
    x += jet.wingWidth * 2 + jet.rocketWidth;
    bullets.push(new Bullet(c, x, y, -8, 6, 6));
}

var bodies = [];
function addBodies(){
    for(var i = 0; i < 100; i++){
        bodies.push(new Bodies());
    }
}
addBodies();

var frame: number = 0;
function animate(){
    var animation = requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

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

    for(var i = 0; i < bodies.length; i++){
        bodies[i].update();
    }

    // put in previous for loop
    for(var i = 0; i < bodies.length; i++){
        var collision = false;
        var growthRate = 0;
        for(var j = 0; j < bullets.length; j++){
            if(bodies[i].collision(bullets[j])){
                growthRate++;
                collision = true;
                //bullets.splice(j, 1);
            }
        }
        if(collision)
            bodies[i].grow(growthRate);

        if(bodies[i].vanquished){
            bodies.splice(i, 1);
        }
    }

    if(bodies.length == 0)
        cancelAnimationFrame(animation);

    frame++;
}

animate();