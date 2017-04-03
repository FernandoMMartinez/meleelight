import {player, playerType, cS} from "main/main";
import {gameSettings} from "settings";
import {activeStage} from "stages/activeStage";

const prevActionState = ["",""];
const actionStateDuration = [0,0];

let cdCount = 0;
const Np = 60*60; //1 pattern = 1 frame
const inputData = [];
const outputData = [];

export function resetAI(){
  console.log("AI RESET");
  prevActionState[0] = "";
  prevActionState[1] = "";
  actionStateDuration[0] = 0;
  actionStateDuration[1] = 0;
}

export function updateAI(){
  if(shouldCollectData()){
    collectPlayerData();
  }
  prevActionState[0] = player[0].actionState;
  prevActionState[1] = player[1].actionState;
}

export function runAI(i){
  updateStateDurations();//always do first

  if(shouldCollectData()){
    // msDelay(16); //delay to compensate for none in the main loop
  }else{
    if(!hasTrained){
      preprocessdata();
      initnn();
      train();
      hasTrained = true;
    }
    // use it to play the game
    const inputVector = getInputVector();
    const cinputVector = convertInputVector(inputVector);
    const cinputMatrix = [cinputVector];
    const outputMatrix = feedforward(cinputMatrix);
    const midx = maxIndex(outputMatrix);
    outputNN(0,midx);
  }
}

import {createMatrix,zerosMatrix,createRandMatrix,multiplyScalarMatrix,multiplyMatrices,
subtractMatrices,matrixTranspose,elementMultiplyMatrices} from "ai/sBLAS";
const uniqueStateStrings0 = [];
const uniqueStateStrings1 = [];
const uniqueOutputs = [];
const D = [];
const t = [];
function preprocessdata(){
  //process the string state inputs
  getUniques();
  //create new data matrix, 1-hot encode
  for(let i = 0; i < inputData.length; i++){
    D.push(convertInputVector(inputData[i]));
  }
  //process the output data
  for(let i = 0; i < outputData.length; i++){
    t.push(convertOutputVector(outputData[i]));
  }
}

function getUniques(){
  for(let i = 0; i < inputData.length; i++){
    //input states
    if(uniqueStateStrings0.indexOf(inputData[i][28]) === -1){
      uniqueStateStrings0.push(inputData[i][28]);
    }
    if(uniqueStateStrings1.indexOf(inputData[i][29]) === -1){
      uniqueStateStrings1.push(inputData[i][29]);
    }
    //outputs
    let isUnique = true;
    for(let j = 0; j < uniqueOutputs.length; j++){
      if(isVectorEqual(outputData[i],uniqueOutputs[j])){
        isUnique = false;
      }
    }
    if(isUnique){
      uniqueOutputs.push(outputData[i]);
    }
  }
}

function convertInputVector(inputVec){
  const tempVec = [];
  tempVec.push(1);

  for(let i = 0; i < 10; i++){ //numerical features
    tempVec.push(...realToBinaryVector(inputVec[i],10));
  }
  for(let i = 10; i < inputVec.length-2; i++){ //binary features
    tempVec.push(inputVec[i]);
  }
    
  const index0 = uniqueStateStrings0.indexOf(inputVec[28]);
  tempVec.push(...realToOneHot(index0,uniqueStateStrings0.length));

  const index1 = uniqueStateStrings1.indexOf(inputVec[29]);
  tempVec.push(...realToOneHot(index1,uniqueStateStrings1.length));

  return new Float32Array(tempVec);    
}

function convertOutputVector(outputVec){
  const retVec = new Float32Array(uniqueOutputs.length);
  let equalIndex = -1;
  for(let j = 0; j < uniqueOutputs.length; j++){
    if(isVectorEqual(outputVec,uniqueOutputs[j])){
      equalIndex = j;
    }
  }
  if(equalIndex !== -1){
    retVec[equalIndex] = 1;
  }
  return retVec;  
}

function realToBinaryVector(num,maxlen){
  const binvec = new Float32Array(maxlen);
  const sign = Math.sign(num);
  let absnum = Math.abs(num);
  if(absnum >= Math.pow(2,maxlen)-1){
    for(let i = 0; i < binvec.length; i++){
      binvec[i] = 1*sign; 
    }
  }else{
    for(let i = binvec.length-1; i > -1; i--){
      const twopow = Math.pow(2,i);
      if(absnum >= twopow){
        binvec[i] = 1*sign;
        absnum = absnum - twopow;
      }
    }
  }
  return binvec;
}

function realToOneHot(index,len){
  const retVec = new Float32Array(len);
  if(index >= 0 && index < len){
    retVec[index] = 1;
  }
  return retVec;
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

function isMatrixEqual(m1,m2){
  const r = m1.length;
  const c = m1[0].length;
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      if(m1[i][j] !== m2[i][j]){
        console.log("not equal");
        return false;
      }
    }
  }
  return true;
}


import {applyFunctionToMatrix,addOnesColToMatrix,removeOnesColFromMatrix} from "ai/sML";
let hasTrained = false;
const batchSize = Np;
const epochs = 2000;
const alpha = 0.3;//add momentum and batches later
const mse = new Float32Array(epochs);
const pe = new Float32Array(epochs);
let netSize;
let w1;
let w2;
let w3;

function initnn(){
  const isize = D[0].length;
  const h1size = 300;
  const h2size = 300;
  const osize = t[0].length;

  w1 = createRandMatrix(isize,h1size);
  w1 = multiplyScalarMatrix(w1,3*Math.sqrt(6/(isize+h1size-1)));

  w2 = createRandMatrix(h1size+1,h2size);
  w2 = multiplyScalarMatrix(w2,3*Math.sqrt(6/(h1size+1+h2size-1)));

  w3 = createRandMatrix(h2size+1,osize);
  w3 = multiplyScalarMatrix(w3,3*Math.sqrt(6/(h2size+1+osize-1)));
}

function train(){
  const x = D;
  let z1;
  let h1;
  let z2;
  let h2;
  let z3;
  let y;
  let delta3;
  let dYdW3;
  let delta2;
  let dYdW2;
  let delta1;
  let dYdW1;
  for(let e = 0; e < epochs; e++){
    console.log("Epoch: " + (e+1));
    //feed forward
    z1 = multiplyMatrices(x,w1); // 3x3 * 3x5 = 3x5
    h1 = applyFunctionToMatrix(z1,relu); // 3x5
    h1 = addOnesColToMatrix(h1); //3x6

    z2 = multiplyMatrices(h1,w2); // 3x6 * 6x8 = 3x8 
    h2 = applyFunctionToMatrix(z2,relu); // 3x8
    h2 = addOnesColToMatrix(h2); // 3x9

    z3 = multiplyMatrices(h2,w3); // 3x9 * 9x2 = 3x2
    y = softmax(z3); // y = applyFunctionToMatrix(z3,logsig); // 3x2

    //basic statistics
    mse[e] = calculateMSE(y,t);
    pe[e] = calculatePercentage(y,t)*100;
    console.log(mse[e]);
    console.log(pe[e]);
    if(pe[e] === 0){
      break;
    }

    //backprop
    delta3 = subtractMatrices(y,t); //(y-t) or (y-t)*f'(y)
    dYdW3 = multiplyMatrices(matrixTranspose(h2),delta3); // h2'*delta3
    delta2 = elementMultiplyMatrices(multiplyMatrices(delta3,removeOnesColFromMatrix(matrixTranspose(w3))),applyFunctionToMatrix(removeOnesColFromMatrix(h2),drelu)); // (y-t)*w3'*f'(h2)
    dYdW2 = multiplyMatrices(matrixTranspose(h1),delta2); // h1'*delta2
    delta1 = elementMultiplyMatrices(multiplyMatrices(delta2,removeOnesColFromMatrix(matrixTranspose(w2))),applyFunctionToMatrix(removeOnesColFromMatrix(h1),drelu)); // ((y-t)*w3'*f'(h2))*w2'*f'(h1)
    dYdW1 = multiplyMatrices(matrixTranspose(x),delta1); // x'*delta1;
    
    w3 = subtractMatrices(w3,multiplyScalarMatrix(dYdW3,alpha/batchSize)); //w3 = w3 - alpha/batchSize*dYdW3;
    w2 = subtractMatrices(w2,multiplyScalarMatrix(dYdW2,alpha/batchSize)); //w2 = w2 - alpha/batchSize*dYdW2;
    w1 = subtractMatrices(w1,multiplyScalarMatrix(dYdW1,alpha/batchSize)); //w1 = w2 - alpha/batchSize*dYdW1;
  }
}

function feedforward(inputVector){
  let retMat = [];

  retMat = inputVector;
  retMat = multiplyMatrices(retMat,w1);
  retMat = applyFunctionToMatrix(retMat,relu);

  retMat = addOnesColToMatrix(retMat);
  retMat = multiplyMatrices(retMat,w2);
  retMat = applyFunctionToMatrix(retMat,relu);

  retMat = addOnesColToMatrix(retMat);
  retMat = multiplyMatrices(retMat,w3);
  retMat = softmax(retMat); // retMat = applyFunctionToMatrix(retMat,logsig);

  return retMat; 
}

function calculateMSE(y,t){
  const r = y.length;
  const c = y[0].length;
  let ret = 0;
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      ret = ret + (y[i][j]-t[i][j])*(y[i][j]-t[i][j]); // (y-t)^2
    }
  }
  return ret/(r*c);
}

function calculatePercentage(y,t){
  let percentWrong = 0;
  for(let i = 0; i < y.length; i++){
    const maxIndex1 = y[i].indexOf(Math.max(...y[i]));
    const maxIndex2 = t[i].indexOf(Math.max(...t[i]));
    if(maxIndex1 !== maxIndex2){
      percentWrong = percentWrong + 1;
    }
  }
  return percentWrong/y.length;
}

function relu(x){
  return Math.max(0,x);
}

function drelu(x){
  return (x>0)*1;
}

function logsig(x){
  return 1/(1+Math.exp(-x));
}

function dlogsig(x){
  return x*(1-x);
}

function softmax(x){ //applies to entire vector
  const r = x.length;
  const c = x[0].length;
  const retMat = createMatrix(r,c);
  const rowSums = new Float32Array(r);
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      rowSums[i] = rowSums[i] + Math.exp(x[i][j]);
    }
  }
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      retMat[i][j] = Math.exp(x[i][j])/rowSums[i];
    }
  }
  return retMat;
}

function maxIndex(v){
  let maxIndex = 0;
  let maxVal = v[0][0];
  for(let i = 0; i < v[0].length; i++){
    if(v[0][i] > maxVal){
      maxVal = v[0][i];
      maxIndex = i;
    }
  }
  return maxIndex;
}




function shouldCollectData(){
  return cdCount < Np;
}

function updateStateDurations(){
  if(prevActionState[0] !== player[0].actionState){
    actionStateDuration[0] = 0;
  }else{
    actionStateDuration[0] = actionStateDuration[0] + 1;
  }
  if(prevActionState[1] !== player[1].actionState){
    actionStateDuration[1] = 0;
  }else{
    actionStateDuration[1] = actionStateDuration[1] + 1;
  }
}

function collectPlayerData(){ //i = 0, 1-i = 1
  //game data
  inputData.push(getInputVector());
  //controller data
  outputData.push(getOutputVector());
  cdCount++;
}


function getInputVector(){
  const inputVector = [];
  inputVector.push(player[0].phys.pos.x); //real, max: 105.5, min: -87.3
  inputVector.push(player[0].phys.pos.y); //real, max: 184, min: -110.9
  inputVector.push(player[0].percent); //positive integers, max: 0, min: 0
  inputVector.push(actionStateDuration[0]); //positive integers, max: 107, min: 0

  inputVector.push(player[1].phys.pos.x); //real, max: 150.7, min: -91.1
  inputVector.push(player[1].phys.pos.y); //real, max: 183.5, min: -110.5
  inputVector.push(player[1].percent); //positive integers, max: 100.3, min: 0
  inputVector.push(actionStateDuration[1]); //positive integers, max: 300, min: 0

  inputVector.push(player[1].phys.pos.x-player[0].phys.pos.x); //real, max: 167.8, min: -99.5
  inputVector.push(player[1].phys.pos.y-player[0].phys.pos.y); //real, max: 242.8, min: -293.9

  inputVector.push(player[0].phys.grounded*1); //binary
  inputVector.push(player[0].phys.fastfalled*1); //binary
  inputVector.push(player[0].phys.face); //binary 
  inputVector.push(player[0].phys.shielding*1); //binary
  inputVector.push((player[0].phys.onLedge>-1)?1:0); //binary
  inputVector.push(player[0].phys.sideBJumpFlag*1); //binary
  inputVector.push((player[0].phys.grabbedBy>-1)?1:0); //binary
  inputVector.push((player[0].phys.grabbing>-1)?1:0); //binary
  inputVector.push(player[0].phys.jumpsUsed); //binary

  inputVector.push(player[1].phys.grounded*1); //binary
  inputVector.push(player[1].phys.fastfalled*1); //binary
  inputVector.push(player[1].phys.face); //binary
  inputVector.push(player[1].phys.shielding*1); //binary
  inputVector.push((player[1].phys.onLedge>-1)?1:0); //binary
  inputVector.push(player[1].phys.sideBJumpFlag*1); //binary
  inputVector.push((player[1].phys.grabbedBy>-1)?1:0); //binary
  inputVector.push((player[1].phys.grabbing>-1)?1:0); //binary
  inputVector.push(player[1].phys.jumpsUsed); //binary
  
  inputVector.push(player[0].actionState); //string
  inputVector.push(player[1].actionState); //string
  return inputVector;
}

function getOutputVector(){
  const outputVector = [];
  //controller data
  outputVector.push(player[0].inputs.lStickAxis[0].x); // analog-stick, -0 causes problems, dont multiply by -1 
  outputVector.push(player[0].inputs.lStickAxis[0].y);
  outputVector.push(player[0].inputs.cStickAxis[0].x); // c-stick
  outputVector.push(player[0].inputs.cStickAxis[0].y);
  outputVector.push(player[0].inputs.a[0]); // single buttons
  outputVector.push(player[0].inputs.b[0]);
  outputVector.push(player[0].inputs.z[0]);
  outputVector.push(player[0].inputs.x[0] || player[0].inputs.y[0]); // X and Y combined
  outputVector.push(Math.max(player[0].inputs.lAnalog[0], player[0].inputs.rAnalog[0])); // max of L/R analog inputs
  return outputVector;
}

function outputNN(i,idx){
  if(i !== 0){ //always do this before doing AI outputs, do not do this for human output
    pushInputBuffer(i);
  }
  
  player[i].inputs.lStickAxis[0].x = uniqueOutputs[idx][0]; //reverse x-axis analog stick
  player[i].inputs.lStickAxis[0].y = uniqueOutputs[idx][1];
  player[i].inputs.cStickAxis[0].x = uniqueOutputs[idx][2]; //reverse x-axis c-stick
  player[i].inputs.cStickAxis[0].y = uniqueOutputs[idx][3];

  player[i].inputs.a[0] = uniqueOutputs[idx][4]; //single button inputs
  player[i].inputs.b[0] = uniqueOutputs[idx][5];
  player[i].inputs.z[0] = uniqueOutputs[idx][6];

  player[i].inputs.x[0] = uniqueOutputs[idx][7]; //same function buttons 
  player[i].inputs.y[0] = uniqueOutputs[idx][7];

  player[i].inputs.l[0] = uniqueOutputs[idx][8]===1?true:false;
  player[i].inputs.r[0] = uniqueOutputs[idx][8]===1?true:false;

  player[i].inputs.lAnalog[0] = uniqueOutputs[idx][8]; //analog trigger inputs
  player[i].inputs.rAnalog[0] = uniqueOutputs[idx][8];
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


function msDelay(ms){
  //console.log("delay is being used somewhere.");
  for(let m = 0; m < Math.round(ms); m++){
    for(let s = 0; s < 6000; s++){
      const a = Math.exp(10,2);
    }
  }
}






//json test stuff
function loadJSON(callback) {   
  const xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', 'my_data.json', true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function () {
    if (xobj.readyState === 4 && xobj.status === "200") {
    // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);  
}