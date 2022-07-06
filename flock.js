let flock;
let dog;
let grass = [];
function setup() {
  createCanvas(640, 360);
  createP("Controls!");
  createP("- Use the mouse cursor to move the dog");
  createP("-Move the dog to prevent the sheep from escaping the pen")
  createP("- Press the Up Arrow to place a new sheep at the mouse cursor's location");
  createP("- Press the Down Arrow to place a tuft of grass at the mouse cursor's location");

  flock = new Flock();
  // Add an initial set of boids into the system
  for (let i = 0; i < 10; i++) {
    let b = new Boid(width / 2,height / 2);
    flock.addBoid(b);
  }

  dog = new Dog(40, 136);
}
function draw() {
  background('#6B8E67');
  fill('#362C1C');
  rect(115, 345, 520, 10, 10);
  rect(115, 5, 520, 10, 10);
  rect(620, 5, 10, 350, 10);
  flock.run();
  dog.show();
  dog.move();
  if(grass.length != 0){
    grass[0].show();
  }
}

// // Add a new boid into the System
// function mouseDragged() {
//   flock.addBoid(new Boid(mouseX, mouseY));
// }

function keyPressed(){
  if(keyCode == UP_ARROW){
    flock.addBoid(new Boid(mouseX, mouseY));
  }
  if(keyCode == DOWN_ARROW){
    if(grass.length == 0){
      grass.push(new Grass(mouseX, mouseY));
      console.log(grass.length);
    }
  }
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Flock object
// Does very little, simply manages the array of all the boids

function Flock() {
  // An array for all the boids
  this.boids = []; // Initialize the array
}

class Dog{
  constructor(x, y){
    this.x = x;
    this.y = y;
  }
  move(){
    this.y = mouseY;
  }
  show(){
    noStroke();
    fill('#EE81A6');
    rect(this.x + 40, this.y - 4, 25, 6, 8);
    fill('#8C5140');
    ellipse(this.x, this.y, 33, 23);
    ellipse(this.x + 20, this.y, 33, 23);
    ellipse(this.x + 40, this.y, 23, 23);
    rect(this.x + 35, this.y - 9, 23, 16, 10);
    ellipse(this.x + 45, this.y - 10, 8, 13);
    ellipse(this.x + 45, this.y + 10, 8, 13);
    ellipse(this.x - 20, this.y, 18, 6);
  }
}

class Grass{
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.placed = false;
  }
  show(){
    let x = this.x;
    let y = this.y;
    noStroke();
    fill('#475F45');
    triangle(x, y, x + 10, y - 10, x + 20, y);
    x += 10;
    triangle(x, y, x + 10, y - 10, x + 20, y);
    x += 10;
    triangle(x, y, x + 10, y - 10, x + 20, y);
    this.placed = true;
  }
  disappear(){
    grass.splice(0, 1);
    this.placed = false;
  }
}

Flock.prototype.run = function() {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);  // Passing the entire list of boids to each boid individually
  }
}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added

function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-1, 1), random(-1, 1));
  this.position = createVector(x, y);
  this.r = 3.0; // og - 3
  this.maxspeed = 1.75;    // Maximum speed og - 3
  this.maxforce = 0.05; // Maximum steering force og - 0.05
}

Boid.prototype.run = function(boids) {
  this.flock(boids);
  this.update();
  // this.borders();
  this.render();
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
  let sep = this.separate(boids);   // Separation
  let ali = this.align(boids);      // Alignment
  let coh = this.cohesion(boids);   // Cohesion
  let avo = this.avoid(boids);      // Avoid walls
  // Arbitrarily weight these forces
  sep.mult(10.0); // og - 10
  ali.mult(2.0); // og - 2
  coh.mult(1.0); // og - 1
  avo.mult(4.0); // og - 3
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
  this.applyForce(avo);
}

// Method to update location
Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  let desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  let steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}

// drawing the boid
Boid.prototype.render = function() {
  // Draw a triangle rotated in the direction of velocity
  let theta = this.velocity.heading() + radians(90);
  fill(127);
  stroke(200);
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);

  strokeWeight(1);
  fill('tan');
  ellipse(-8, -22, 9, 4);
  ellipse(8, -22, 9, 4);
  ellipse(0, -20, 14, 19);
  fill('white');
  strokeWeight(0);
  ellipse(0, 0, 29, 29);
  ellipse(-5, -10, 19, 19);
  ellipse(5, -10, 19, 19);
  ellipse(10, 0, 19, 19);
  ellipse(5, 10, 19, 19);
  ellipse(-5, 10, 19, 19);
  ellipse(-10, 0, 19, 19);

  // old boid
  // beginShape();
  // vertex(0, -this.r * 2);
  // vertex(-this.r, this.r * 2);
  // vertex(this.r, this.r * 2);
  // endShape(CLOSE);
  pop();
}

// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r)  this.position.x = width + this.r;
  if (this.position.y < -this.r)  this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  // the desired distance between the different boids
  let desiredseparation = 45.0; // og - 25
  let steer = createVector(0, 0);
  let count = 0;
  // For every boid in the system, check if it's too close
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
  let neighbordist = 50; // og - 50
  let sum = createVector(0,0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
  let neighbordist = 75; // og - 50
  let sum = createVector(0, 0);   // Start with empty vector to accumulate all locations
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position,boids[i].position);
    
    if(grass.length != 0){
      let g_cord = createVector(grass[0].x, grass[0].y);
      let gd = p5.Vector.dist(this.position,g_cord);
      if(gd > 0 && gd < 55){
        grass[0].disappear();
      }
      let grassdist = 75
      let gsum = createVector(0, 0);
      if((gd > 0 && gd < grassdist)){
        gsum.add(g_cord);
        return this.seek(gsum);
      }
    }
    // if(grass[0].placed == true){
    //   let gd = p5.Vector.dist(this.position, (grass.x, grass.y));
    // }
    else if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  } 
  // else if(grass[0].placed == true){
  //   this.seek(grass[0].x, grass[0].y);
  // }
  else{
    return createVector(0, 0);
  }
}

Boid.prototype.avoid = function(boids) {
  let steer = createVector(0, 0);
  // if (this.position.x <= 30) {
  //   steer.add(createVector(1, 0));
  // }
  if (this.position.x > 600) { // width of canvas - 640
    steer.add(createVector(-1, 0));
  }
  if (this.position.y <= 40) {
    steer.add(createVector(0, 1));
  }
  if (this.position.y > 320) { // height of canvas - 360
    steer.add(createVector(0, -1));
  }
  // testing stuff
  let d = dist(this.position.x, this.position.y, dog.x, dog.y);
  if(d < 85){
    steer.add(createVector(1, 0));
  }
  return steer;
}
