const FOLLOWER_SIZE = 20; // Cannot be a negative value, denotes the trangle size of the follower
const FOLLOWER_SPEED = 10;

const TARGET_SIZE = 20;
const TARGET_LOCATION = [600, 100];

const FPS = 15; // Frames per second drawn

// Neural Network parameters
const NUM_INPUTS = 2;
const NUM_HIDDEN = 5
const NUM_OUTPUTS = 1;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

class Follower{
  constructor(x, y, angle){
    this._x = x;
    this._y = y;
    this._angle = angle;
  }

  get x(){
    return this._x;
  }
  set x(x){
    this._x = x;
  }

  get y(){
    return this._y;
  }
  set y(y){
    this._y = y;
  }

  get angle(){
    return this._angle;
  }
  set angle(angle){
    this._angle = angle;
  }

  // Uses the rotation and position to draw the follower as a triangle
  draw(){
    ctx.beginPath();
    const x1 = this._x - FOLLOWER_SIZE / 2;
    const y1 = this._y + FOLLOWER_SIZE / 2;
    const rot1 = rotateAboutPoint(x1, y1, this._x, this._y, this._angle);
    ctx.moveTo(rot1[0], rot1[1]);

    const x2 = this._x + FOLLOWER_SIZE / 2;
    const y2 = this._y + FOLLOWER_SIZE / 2;
    const rot2 = rotateAboutPoint(x2, y2, this._x, this._y, this._angle);
    ctx.lineTo(rot2[0], rot2[1]);

    var radius = Math.sqrt(Math.pow(FOLLOWER_SIZE / 2, 2) * 2);
    const x3 = this.x;
    const y3 = -radius * Math.sin(Math.PI/2) + this._y;
    const rot3 = rotateAboutPoint(x3, y3, this._x, this._y, this._angle);
    ctx.lineTo(rot3[0], rot3[1]);

    ctx.fill();
  }

  moveForward(){
    const angle = this._angle - Math.PI/ 2;
    this._x += FOLLOWER_SPEED * Math.cos(angle);
    this._y += FOLLOWER_SPEED * Math.sin(angle);
  }
}

class Target{
  constructor(x, y){
    this._x = x;
    this._y = y;
  }

    get x(){
    return this._x;
  }
  set x(x){
    this._x = x;
  }

  get y(){
    return this._y;
  }
  set y(y){
    this._y = y;
  }

  draw(){
    drawCircle(this._x, this._y, TARGET_SIZE, "red");
    drawCircle(this._x, this._y, TARGET_SIZE / 1.2, "white");
    drawCircle(this._x, this._y, TARGET_SIZE / 1.5, "red");
    drawCircle(this._x, this._y, TARGET_SIZE / 2, "white");
    drawCircle(this._x, this._y, TARGET_SIZE/ 3, "red");
    ctx.fillStyle = "black";
  }
}


var r = 90;
var d = r * Math.PI/180;
var n1 = new Follower(50,50,d);

var t = new Target(TARGET_LOCATION[0],TARGET_LOCATION[1]);


function animate() {
    setTimeout(function() {
        requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);



      n1.angle += 0.3;
      n1.moveForward();
      n1.draw();
      t.draw();



    }, 1000 / FPS);
}






function rotateAboutPoint(x1, y1, cx, cy, rotation){ // rotation must be in radians
  var x = Math.cos(rotation) * (x1 - cx) - Math.sin(rotation) * (y1 - cy) + cx;
  var y = Math.sin(rotation)*(x1 - cx) + Math.cos(rotation) * (y1 - cy) + cy;
  return [x, y];
}
function drawCircle(x, y, size, color){

    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

animate();



nn = new NeuralNetwork(NUM_INPUTS, NUM_HIDDEN, NUM_OUTPUTS);
console.table(nn.weights0.data);
console.table(nn.weights1.data);
nn.train([0,1], [1]);
