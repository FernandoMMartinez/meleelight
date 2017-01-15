import {player, playerType, cS} from "main/main";
import {gameSettings} from "settings";
import {activeStage} from "stages/activeStage";

const Np = 60*60; //1 pattern = 1 frame
const Ni = 4; //# of inputs
const No = 10; //# of outputs
const inputData = createArray(Np,Ni);
const outputData = createArray(Np,No);
let actionStateDuration = 0;

let cdCount = 0;
export function shouldCollectData(){
  return cdCount < Np;
}

export function collectPlayerData(){
  if(player[0].prevActionState !== player[0].actionState){
    actionStateDuration = 0;
  }else{
    actionStateDuration++;
  }
  inputData[cdCount][0] = player[0].phys.pos.x; //optional features: doubleJump, fastfall, face, grounded, onLedge, charging, grabbedBy, grabbing
  inputData[cdCount][1] = player[0].phys.pos.y; //percent
  inputData[cdCount][2] = player[0].actionState;
  inputData[cdCount][3] = actionStateDuration;

  outputData[cdCount][0] = player[0].inputs.lStickAxis[0].x; // analog-stick 
  outputData[cdCount][1] = player[0].inputs.lStickAxis[0].y;
  outputData[cdCount][2] = player[0].inputs.cStickAxis[0].x; // c-stick
  outputData[cdCount][3] = player[0].inputs.cStickAxis[0].y;
  outputData[cdCount][4] = player[0].inputs.a[0]; // single buttons
  outputData[cdCount][5] = player[0].inputs.b[0];
  outputData[cdCount][6] = player[0].inputs.z[0];
  outputData[cdCount][7] = player[0].inputs.x[0] || player[0].inputs.y[0]; // X and Y combined
  outputData[cdCount][8] = player[0].inputs.l[0] || player[0].inputs.r[0]; // L and R combined
  outputData[cdCount][9] = Math.max(player[0].inputs.lAnalog[0], player[0].inputs.rAnalog[0]); // max of L/R analog inputs

  cdCount++;
}

export function runAI (i){
  //if matchup is not 1v1, dont run
  //2 million multiplies to work with

  if(i !== 1 || cS[0] !== cS[1]){ //if cpu is not player 2 or not a mirror match, dont run an AI
    return;
  }
  
  if(shouldCollectData()){
    //random policy
    //randomPolicy(i);
  }else{
    //nearest neighbors
    nnPolicy(i);
  }
  
  //msDelay(10);
}


function randomPolicy(i) {
  player[i].inputs.lStickAxis[0].x = 2*Math.random()-1; //analog stick
  player[i].inputs.lStickAxis[0].y = 2*Math.random()-1;
  player[i].inputs.cStickAxis[0].x = 2*Math.random()-1; //c-stick
  player[i].inputs.cStickAxis[0].y = 2*Math.random()-1;

  player[i].inputs.x[0] = randomBool(); //single buttons
  player[i].inputs.b[0] = randomBool();
  player[i].inputs.a[0] = randomBool();

  player[i].inputs.l[0] = randomBool(); //triggers
  if(player[i].inputs.l[0]){
  	player[i].inputs.lAnalog[0] = 1;
  }else{
  	player[i].inputs.lAnalog[0] = 0;
  }

  return;
}


function nnPolicy(i){
  outputNN(findNN());
}


function findNN(){
  if(player[1].prevActionState !== player[1].actionState){
    actionStateDuration = 0;
  }else{
  	actionStateDuration++;
  }

  const e = 0.01; //threshold e
  let smallestIndex = [-1];
  let smallestDist = 100000;
  for(let j = 0; j < Np; j++){
    const  dist = Math.abs(-1*player[1].phys.pos.x - inputData[j][0]) + 
    Math.abs(player[1].phys.pos.y - inputData[j][1]) + 
    (player[1].actionState !== inputData[j][2])*10 + 
    Math.abs(actionStateDuration - inputData[j][3]);
    if(dist < smallestDist){
      smallestDist = dist;
      smallestIndex = [j];
    }else if(dist === smallestDist){
      //same dist as smallest dist, pick randomly between the two after this loop
      smallestIndex.push(j);
    }else if(Math.abs(dist-smallestDist) < e){ 
      //close dist as smallest dist, pick randomly between the two after this loop
      console.log("threshold reached");
    }
  }
  //console.log(smallestIndex);
  //console.log(smallestDist);
  //console.log(-1*player[1].phys.pos.x + ", " + player[1].phys.pos.y + ", " + player[1].actionState + ", " + actionStateDuration);
  //console.log(inputData[smallestIndex][0] + ", " + inputData[smallestIndex][1] + ", " + inputData[smallestIndex][2] + ", " + inputData[smallestIndex][3]);
  //console.log(outputData[smallestIndex]);
  if(smallestIndex.length > 1){
    //pick randomly
    const randNum = Math.floor((Math.random()*smallestIndex.length));
    smallestIndex[0] = smallestIndex[randNum];
    console.log("multiple minimum found");
  }
  return smallestIndex[0];
}

function outputNN(idx){
  pushInputBuffer(1);//always do this before doing AI outputs
  player[1].inputs.lStickAxis[0].x = -1*outputData[idx][0]; //reverse x-axis analog stick
  player[1].inputs.lStickAxis[0].y = outputData[idx][1];
  player[1].inputs.cStickAxis[0].x = -1*outputData[idx][2]; //reverse c-stick
  player[1].inputs.cStickAxis[0].y = outputData[idx][3];

  player[1].inputs.a[0] = outputData[idx][4]; //single button inputs
  player[1].inputs.b[0] = outputData[idx][5];
  player[1].inputs.z[0] = outputData[idx][6];

  player[1].inputs.x[0] = outputData[idx][7]; //same function buttons 
  player[1].inputs.y[0] = outputData[idx][7];
  player[1].inputs.l[0] = outputData[idx][8];
  player[1].inputs.r[0] = outputData[idx][8];

  player[1].inputs.lAnalog[0] = outputData[idx][9]; //analog trigger inputs
  player[1].inputs.rAnalog[0] = outputData[idx][9];
}

function pushInputBuffer(i){
  for (let j = 0; j < 7; j++) {
    player[i].inputs.lStickAxis[7 - j].x = player[i].inputs.lStickAxis[6 - j].x;
    player[i].inputs.lStickAxis[7 - j].y = player[i].inputs.lStickAxis[6 - j].y;
    player[i].inputs.rawlStickAxis[7 - j].x = player[i].inputs.rawlStickAxis[6 - j].x;
    player[i].inputs.rawlStickAxis[7 - j].y = player[i].inputs.rawlStickAxis[6 - j].y;
    player[i].inputs.cStickAxis[7 - j].x = player[i].inputs.cStickAxis[6 - j].x;
    player[i].inputs.cStickAxis[7 - j].y = player[i].inputs.cStickAxis[6 - j].y;
    player[i].inputs.lAnalog[7 - j] = player[i].inputs.lAnalog[6 - j];
    player[i].inputs.rAnalog[7 - j] = player[i].inputs.rAnalog[6 - j];
    player[i].inputs.s[7 - j] = player[i].inputs.s[6 - j];
    player[i].inputs.z[7 - j] = player[i].inputs.z[6 - j];
    player[i].inputs.a[7 - j] = player[i].inputs.a[6 - j];
    player[i].inputs.b[7 - j] = player[i].inputs.b[6 - j];
    player[i].inputs.x[7 - j] = player[i].inputs.x[6 - j];
    player[i].inputs.y[7 - j] = player[i].inputs.y[6 - j];
    player[i].inputs.r[7 - j] = player[i].inputs.r[6 - j];
    player[i].inputs.l[7 - j] = player[i].inputs.l[6 - j];
    player[i].inputs.dpadleft[7 - j] = player[i].inputs.dpadleft[6 - j];
    player[i].inputs.dpaddown[7 - j] = player[i].inputs.dpaddown[6 - j];
    player[i].inputs.dpadright[7 - j] = player[i].inputs.dpadright[6 - j];
    player[i].inputs.dpadup[7 - j] = player[i].inputs.dpadup[6 - j];
  }
}

//util functions
function msDelay(ms){
  for(let m = 0; m < Math.round(ms); m++){
    for(let s = 0; s < 28000; s++){
      const a = Math.exp(10,2);
    }
  }
}

function randomBool(){
  return (Math.random() > 0.5) ? true:false;
}

//lin algebra
function createArray(length){
  const arr = new Array(length || 0);
  let i = length;

  if(arguments.length > 1){
    const args = Array.prototype.slice.call(arguments,1);
    while(i--){
      arr[length-1-i] = createArray.apply(this,args);
    }
  }
  return arr;
}

function getUnique(data){
  const uniqueIndices = [];
  const uniqueVectors = [];
  for(let i = 0; i < data.length; i++){
    let vectorFound = false;
    for(let j = 0; j < uniqueVectors.length; j++){
      if(isVectorEqual(data[i], uniqueVectors[j])){
        uniqueIndices[j].push(i);
        vectorFound = true;
      }else{
      }
    }
    if(!vectorFound){
      uniqueVectors.push(data[i]);
      uniqueIndices.push([i]);
    }
  }
  return uniqueIndices;
}

function isVectorEqual(vec1, vec2){ //numerical
  let output = true;
  if(vec1.length === vec2.length){
    for(let i = 0; i < vec1.length; i++){
      output = output && (vec1[i] === vec2[i]);
    }
    return output;
  }else{
  	return false;
  }
}