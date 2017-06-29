import {player} from "main/main";
import {pushInputBuffer} from "ai/aiutil";
import {inputVectors,outputVectors,uniqueS1,uniqueS2} from "ai/aimodels/knnmodel";

const prevActionState = ["",""];
const actionStateDuration = [0,0];

const inputData = JSON.parse(inputVectors);
const outputControls = JSON.parse(outputVectors);

const p1StatesList = JSON.parse(uniqueS1);
const p2StatesList = JSON.parse(uniqueS2);

export function resetAI(){
  prevActionState[0] = "";
  prevActionState[1] = "";
  actionStateDuration[0] = 0;
  actionStateDuration[1] = 0;
}

export function runAI (i){
  updateStateDurations(); //always do this first

  const inputVector = getInputVector();

  const minIndex = findKNN(inputVector);

  doOutputIndex(i,minIndex);

  updatePrevActionStates();//always do last
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

function updatePrevActionStates(){
  prevActionState[0] = player[0].actionState;
  prevActionState[1] = player[1].actionState;
}

function getInputVector(){
  const inputVector = [];
  //real features p1
  inputVector.push(player[0].phys.pos.x); //real, max: 105.5, min: -87.3
  inputVector.push(player[0].phys.pos.y); //real, max: 184, min: -110.9
  inputVector.push(player[0].percent); //positive integers, max: 0, min: 0
  inputVector.push(actionStateDuration[0]); //positive integers, max: 107, min: 0
  //real features p2
  inputVector.push(player[1].phys.pos.x); //real, max: 150.7, min: -91.1
  inputVector.push(player[1].phys.pos.y); //real, max: 183.5, min: -110.5
  inputVector.push(player[1].percent); //positive integers, max: 100.3, min: 0
  inputVector.push(actionStateDuration[1]); //positive integers, max: 300, min: 0
  
  inputVector.push(player[1].phys.pos.x-player[0].phys.pos.x); //real, max: 167.8, min: -99.5
  inputVector.push(player[1].phys.pos.y-player[0].phys.pos.y); //real, max: 242.8, min: -293.9
  //binary features p1
  inputVector.push(player[0].phys.fastfalled*1); //binary, not correlated
  inputVector.push(player[0].phys.face); //binary, not correlated
  inputVector.push(player[0].phys.sideBJumpFlag*1); //binary, not correlated
  inputVector.push(player[0].phys.jumpsUsed); //binary, not correlated
  //binary features p2
  inputVector.push(player[1].phys.fastfalled*1); //binary
  inputVector.push(player[1].phys.face); //binary
  inputVector.push(player[1].phys.sideBJumpFlag*1); //binary
  inputVector.push(player[1].phys.jumpsUsed); //binary
  //string states
  inputVector.push(stringToReal(player[0].actionState,p1StatesList)); //p1 state
  inputVector.push(stringToReal(player[1].actionState,p2StatesList)); //p2 state

  return new Float32Array(inputVector);
}

function stringToReal(str,strArray){
  let index = strArray.indexOf(str)+1;
  if(index < 1){
    index = 1;
  }
  return index;
}

function findKNN(inputVector){
  const e = 0; //threshold e = 0.0001
  let smallestIndex = [0];
  let smallestDist = 10000;
  for(let i = 0; i < inputData.length; i++){
    let currentDist = 0;
    for(let f = 0; f < inputData[0].length; f++){
      if(f < 19){
        currentDist += (inputVector[f] - inputData[i][f])*(inputVector[f] - inputData[i][f]);
      }else{
        currentDist += (inputVector[f] !== inputData[i][f])*1000; 
      }
    }
    if(currentDist < smallestDist){
      smallestDist = currentDist;
      smallestIndex = [i];
    }else if(currentDist === smallestDist){
      smallestIndex.push(i);
    }
    else if(Math.abs(currentDist-smallestDist) < e){
      smallestIndex.push(i);
    }
  }
  const randIndex = Math.floor(Math.random()*smallestIndex.length);
  return smallestIndex[randIndex];
}

function doOutputIndex(i,index){
  if(i === 0){
    pushInputBuffer(i);
  }

  player[0].inputs.lStickAxis[0].x = outputControls[index][0]; // analog-stick, -0 causes problems, dont multiply by -1 
  player[0].inputs.lStickAxis[0].y = outputControls[index][1];
  player[0].inputs.cStickAxis[0].x = outputControls[index][2]; // c-stick
  player[0].inputs.cStickAxis[0].y = outputControls[index][3];
  player[0].inputs.a[0] = outputControls[index][4]===1?true:false; // single buttons
  player[0].inputs.b[0] = outputControls[index][5]===1?true:false;
  player[0].inputs.z[0] = outputControls[index][6]===1?true:false;
  player[0].inputs.x[0] = outputControls[index][7]===1?true:false; // X and Y combined
  player[0].inputs.r[0] = outputControls[index][8]===1?true:false;
  player[0].inputs.rAnalog[0] = outputControls[index][8]; // max of L/R analog inputs
}