import {player} from "main/main";
import {pushInputBuffer} from "ai/aiutil";

const prevActionState = ["",""];
const actionStateDuration = [0,0];

export function resetAI(){
  prevActionState[0] = "";
  prevActionState[1] = "";
  actionStateDuration[0] = 0;
  actionStateDuration[1] = 0;
}

export function runAI(i){
  updateStateDurations();//always do first
  
  

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












function createBatches(data,batchSize){
  const rp = randPerm(data.length);
  const batches = [];
  for(let b = 0; b < Math.floor(data.length/batchSize); b++){
    const currentMat = [];
    for(let i = 0; i < batchSize; i++){
      currentMat.push(data[rp[i+b*batchSize]]);
    }
    batches.push(currentMat);
  }  
  return batches;
}

function randPerm(maxInt){
  const linVec = Array(maxInt);
  for(let i = 0; i < maxInt; i++){
    linVec[i] = i;
  }
  const retVec = Array(maxInt);
  for(let i = 0; i < maxInt; i++){
    const randIndex = Math.floor(Math.random()*(linVec.length));
    
    retVec[i] = linVec[randIndex];

    linVec[randIndex] = linVec[linVec.length-1];
    linVec.pop();
  }
  return retVec;
}