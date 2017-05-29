import {player, playerType, cS} from "main/main";
import {gameSettings} from "settings";
import {activeStage} from "stages/activeStage";
import {createNN,loadNet,normalizeData,feedforward} from "ai/sML";
import {uniqueS1,uniqueS2,uniqueO} from "ai/model";

const prevActionState = ["",""];
const actionStateDuration = [0,0];

const p1StatesList = JSON.parse(uniqueS1);
const p2StatesList = JSON.parse(uniqueS2);
const p1OutputList = JSON.parse(uniqueO);

const net = createNN();
loadNet(net);

export function resetAI(){
  console.log("AI RESET");
  prevActionState[0] = "";
  prevActionState[1] = "";
  actionStateDuration[0] = 0;
  actionStateDuration[1] = 0;
}

export function updateAI(){
  prevActionState[0] = player[0].actionState;
  prevActionState[1] = player[1].actionState;
}

export function runAI(i){
  updateStateDurations();//always do first

  const inputVector = getInputVector();

  const normInputVector = normalizeData(net,inputVector);

  const outputVector = feedforward(net,normInputVector);

  doOutputClass(outputVector);

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

function getInputVector(){
  const inputVector = [];
  //bias
  inputVector.push(1);
  //real features p1
  inputVector.push(player[0].phys.pos.x); //real, max: 105.5, min: -87.3
  inputVector.push(player[0].phys.pos.y); //real, max: 184, min: -110.9
  // inputVector.push(player[0].percent); //positive integers, max: 0, min: 0
  inputVector.push(actionStateDuration[0]%200); //positive integers, max: 107, min: 0
  //real features p2
  inputVector.push(player[1].phys.pos.x); //real, max: 150.7, min: -91.1
  inputVector.push(player[1].phys.pos.y); //real, max: 183.5, min: -110.5
  inputVector.push(player[1].percent); //positive integers, max: 100.3, min: 0
  inputVector.push(actionStateDuration[1]%635); //positive integers, max: 300, min: 0
  
  inputVector.push(player[1].phys.pos.x-player[0].phys.pos.x); //real, max: 167.8, min: -99.5
  inputVector.push(player[1].phys.pos.y-player[0].phys.pos.y); //real, max: 242.8, min: -293.9
  //binary features p1
  inputVector.push(player[0].phys.grounded*1); //binary
  inputVector.push(player[0].phys.fastfalled*1); //binary
  inputVector.push(player[0].phys.face); //binary 
  inputVector.push(player[0].phys.shielding*1); //binary
  inputVector.push((player[0].phys.onLedge>-1)?1:0); //binary
  inputVector.push(player[0].phys.sideBJumpFlag*1); //binary
  // inputVector.push((player[0].phys.grabbedBy>-1)?1:0); //binary
  inputVector.push((player[0].phys.grabbing>-1)?1:0); //binary
  inputVector.push(player[0].phys.jumpsUsed); //binary
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

function doOutputClass(outputVector){
  const outputIndex = outputVector[0].findIndex((e)=>{
    return (e === 1);
  });
  const outputClass = p1OutputList[outputIndex];

  player[0].inputs.lStickAxis[0].x = outputClass[0]; // analog-stick, -0 causes problems, dont multiply by -1 
  player[0].inputs.lStickAxis[0].y = outputClass[1];
  player[0].inputs.cStickAxis[0].x = outputClass[2]; // c-stick
  player[0].inputs.cStickAxis[0].y = outputClass[3];
  player[0].inputs.a[0] = outputClass[4]===1?true:false; // single buttons
  player[0].inputs.b[0] = outputClass[5]===1?true:false;
  player[0].inputs.z[0] = outputClass[6]===1?true:false;
  player[0].inputs.x[0] = outputClass[7]===1?true:false; // X and Y combined
  player[0].inputs.lAnalog[0] = outputClass[8]; // max of L/R analog inputs
}