import {player} from "main/main";
import {pushInputBuffer} from "ai/aiutil"; 
import {createNN,loadNet,normalizeMatrix,feedforward} from "ai/sML";
import {w,u,s,uniqueS1,uniqueS2,uniqueO} from "ai/aimodels/nnmodel";

const prevActionState = ["",""];
const actionStateDuration = [0,0];

const p1StatesList = JSON.parse(uniqueS1);
const p2StatesList = JSON.parse(uniqueS2);
const p1OutputList = JSON.parse(uniqueO);

const net = createNN();
loadNet(net,w,u,s);

export function resetAI(){
  prevActionState[0] = "";
  prevActionState[1] = "";
  actionStateDuration[0] = 0;
  actionStateDuration[1] = 0;
}

export function runAI(i){
  updateStateDurations();//always do first
  
  const inputVector = getInputVector();

  const normInputVector = normalizeMatrix(net,inputVector);

  const outputVector = feedforward(net,normInputVector);

  doOutputClass(i,outputVector);

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
  //bias
  inputVector.push(1);
  //real features p1
  inputVector.push(player[0].phys.pos.x); //real, max: 105.5, min: -87.3
  inputVector.push(player[0].phys.pos.y); //real, max: 184, min: -110.9
  // inputVector.push(player[0].percent); //positive integers, max: 0, min: 0
  inputVector.push(actionStateDuration[0]%201); //positive integers, max: 107, min: 0
  //real features p2
  inputVector.push(player[1].phys.pos.x); //real, max: 150.7, min: -91.1
  inputVector.push(player[1].phys.pos.y); //real, max: 183.5, min: -110.5
  inputVector.push(player[1].percent); //positive integers, max: 100.3, min: 0
  inputVector.push(actionStateDuration[1]%636); //positive integers, max: 300, min: 0
  
  inputVector.push(player[1].phys.pos.x-player[0].phys.pos.x); //real, max: 167.8, min: -99.5
  inputVector.push(player[1].phys.pos.y-player[0].phys.pos.y); //real, max: 242.8, min: -293.9
  //binary features p1
  inputVector.push(player[0].phys.grounded*1); //binary, correlated
  inputVector.push(player[0].phys.fastfalled*1); //binary, not correlated
  inputVector.push(player[0].phys.face); //binary, not correlated
  inputVector.push(player[0].phys.shielding*1); //binary, correlated
  inputVector.push((player[0].phys.onLedge>-1)?1:0); //binary, correlated
  inputVector.push(player[0].phys.sideBJumpFlag*1); //binary, not correlated
  // inputVector.push((player[0].phys.grabbedBy>-1)?1:0); //binary, correlated
  inputVector.push((player[0].phys.grabbing>-1)?1:0); //binary, correlated
  inputVector.push(player[0].phys.jumpsUsed); //binary, not correlated
  //binary features p2
  inputVector.push(player[1].phys.grounded*1); //binary
  // inputVector.push(player[1].phys.fastfalled*1); //binary
  inputVector.push(player[1].phys.face); //binary
  // inputVector.push(player[1].phys.shielding*1); //binary
  inputVector.push((player[1].phys.onLedge>-1)?1:0); //binary
  // inputVector.push(player[1].phys.sideBJumpFlag*1); //binary
  inputVector.push((player[1].phys.grabbedBy>-1)?1:0); //binary
  // inputVector.push((player[1].phys.grabbing>-1)?1:0); //binary
  // inputVector.push(player[1].phys.jumpsUsed); //binary
  //string states
  inputVector.push(...stringToOneHot(player[0].actionState,p1StatesList)); //string
  inputVector.push(...stringToOneHot(player[1].actionState,p2StatesList)); //string

  return [new Float32Array(inputVector)];
}

function stringToOneHot(str,strArray){
  const index = strArray.indexOf(str);
  const retVec = new Array(strArray.length);
  for(let i = 0; i < strArray.length; i++){
    if(index === i){
      retVec[i] = 1;
    }else{
      retVec[i] = 0;
    }
  }
  return retVec;
}

function doOutputClass(i,outputVector){
  if(i === 0){
    pushInputBuffer(i);
  }
  
  const outputClass = chooseProbabilisticClass(outputVector);
  const outputControls = p1OutputList[outputClass];

  const k = 0; //temp
  player[k].inputs.lStickAxis[0].x = outputControls[0]; // analog-stick, -0 causes problems, dont multiply by -1 
  player[k].inputs.lStickAxis[0].y = outputControls[1];
  player[k].inputs.cStickAxis[0].x = outputControls[2]; // c-stick
  player[k].inputs.cStickAxis[0].y = outputControls[3];
  player[k].inputs.a[0] = outputControls[4]===1?true:false; // single buttons
  player[k].inputs.b[0] = outputControls[5]===1?true:false;
  player[k].inputs.z[0] = outputControls[6]===1?true:false;
  player[k].inputs.x[0] = outputControls[7]===1?true:false; // X and Y combined
  player[k].inputs.r[0] = outputControls[8]===1?true:false;
  player[k].inputs.rAnalog[0] = outputControls[8]; // max of L/R analog inputs
}

function chooseProbabilisticClass(outputVector){
  const randVal = Math.random();
  const outputVec = outputVector[0];
  
  let vecsum = 0;
  for(let i = 0; i < outputVec.length; i++){
    if(randVal >= vecsum && randVal < (outputVec[i]+vecsum)){
      return i;
    }
    vecsum = vecsum + outputVec[i];
  }
  return outputVec.indexOf(Math.max(...outputVec)); //if the above fails for some reason, return the maximum
}
