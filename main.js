const FOLLOWER_SIZE = 20; // Cannot be a negative value, denotes the trangle size of the follower
const FOLLOWER_SPEED = 10;

const TARGET_SIZE = 20;
const TARGET_LOCATION = [100, 100];

const FPS = 4; // Frames per second drawn

// Neural Network parameters
const NUM_INPUTS = 5;   // followerx folowery targetx target y ship angle
const NUM_HIDDEN = 15;
const NUM_OUTPUTS = 1; // angle
const NUM_SAMPLES = 100000;
const OUTPUT_LEFT = 0; // expected nerual output for truning left anf right
const OUTPUT_RIGHT = 1;
const OUTPUT_THRESHOLD = 0.4; // How close the prediction must be to commit (error)
const ROTATION_INCREMENT = 100; //How fast the ship should rotate
var canvas = document.getElementById("canvas");

var testPoints = [];

var ctx = canvas.getContext("2d");

class Follower{
  constructor(x, y, angle, rot = 0){
    this._x = x;
    this._y = y;
    this._angle = angle;
    this._rot = rot;
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
  get rot(){
    return this._rot;
  }
  set rot(angle){
    this._rot = angle;
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
   manageShipAngle(){ // keeps the ship angle between 0 and 360
    if(this.angle < 0){
      this.angle += (Math.PI * 2);
    }else if(this.angle > Math.PI * 2){
      this.angle -= (Math.PI * 2);
    }
  }
  moveForward(){
    const angle = this._angle - Math.PI/ 2;
    this._x += FOLLOWER_SPEED * Math.cos(angle);
    this._y += FOLLOWER_SPEED * Math.sin(angle);
  }
  rotate(right) {
    let sign = right ? -1 : 1;
    this.rot = ROTATION_INCREMENT / 180 * Math.PI / FPS * sign;
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


let d = 0;
var n1 = new Follower(400,400, d);

var t = new Target(TARGET_LOCATION[0],TARGET_LOCATION[1]);


function animate() {
    setTimeout(function() {
        requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);



      // Make a prediction from the NeuralNetwork
      let fx = n1.x;
      let fy = n1.y;
      let fa = n1.angle;
      let tx = t.x;
      let ty = t.y;
      let angle = angleToPoint(fx, fy, fa, tx, ty);
      let predict = nn.feedForward(normalizeInput(fx, fy, fa, tx, ty)).data[0][0];
      console.log(predict);

      // make a turn
      let dLeft = Math.abs(predict - OUTPUT_LEFT);
      let dRight = Math.abs(predict - OUTPUT_RIGHT);
      if (dLeft < OUTPUT_THRESHOLD) {
          //n1.rotate(false);
      } else if (dRight < OUTPUT_THRESHOLD) {
          //n1.rotate(true);
      } else {
          //n1.rot = 0; // stop rotating
      }

      n1.manageShipAngle();
      //n1.moveForward();
      n1.draw();
      t.draw();

      // rotate the follower
      n1.angle += n1.rot;

      // DRAW testPoints
      for (var i = 0; i < testPoints.length; i++) {
        testPoint(testPoints[i][0], testPoints[i][1], testPoints[i][2],  testPoints[i][3]);
      }
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





function angleToPoint(x, y, bearing, targetX, targetY) {
  let angleToTarget = Math.atan2(-targetY + y, targetX - x);
  let diff = bearing - angleToTarget;
  return (diff + Math.PI * 2) % (Math.PI * 2);
}
console.log(angleToPoint(0, 0, 0, 0, 10));
function normalizeInput(fx, fy, fa, tx, ty){
  // normalize the values to inbetween 0 and 1
  let input = [];

  input[0] = fx / canvas.width;
  input[1] = fy / canvas.height;

  input[2] = fa / (Math.PI * 2);

  input[3] = tx / canvas.width;
  input[4] = ty / canvas.height;

  return input;

}

animate();


var nn = new NeuralNetwork(NUM_INPUTS, NUM_HIDDEN, NUM_OUTPUTS);

//train the network

let fx, fy, fa, tx, ty;
for (let i = 0; i < NUM_SAMPLES; i++) {
  // random target locations
  //tx = Math.random() * canvas.width;
  //ty = Math.random() * canvas.height;
  tx = Math.random() * canvas.width;
  ty = Math.random() * canvas.width;

  // random follower location and angle
  fa = Math.random() * Math.PI * 2;
  fx = 400;
  fy = 400;

  // calculate the angle to the target
  let angle = angleToPoint(fx, fy, fa, tx, ty);

  // determine the direction to turn
  let direction = angle > Math.PI ? OUTPUT_LEFT : OUTPUT_RIGHT;

  if(i % 10000 == 0){
    testPoints.push([fx, fy, "red", ""]);
    var data = " a:" + fa+ " output " + Math.round(angle) +" d: " + direction;
    testPoints.push([tx, ty, "blue", data]);
    console.log("f: ("+ fx + ", " + fy + ")  t: " + tx + ", " + ty + ") ");
    console.log("angle: " + angle);
    console.log("d: " + direction);

  }
  // train the Network
  nn.train(normalizeInput(fx, fy, fa, tx, ty), [direction]);
}





function testPoint(x,y, color, data){
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    ctx.fillText(data, x, y);

  }
}
