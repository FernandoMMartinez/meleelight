import {player, playerType, cS} from "main/main";
import {gameSettings} from "settings";
import {activeStage} from "stages/activeStage";

const prevActionState = ["",""];
const actionStateDuration = [0,0];

let cdCount = 0;
const Np = 1*60*60; //1 pattern = 1 frame, 3 hours
const inputData = [];
const outputData = [];

let hasDisplayedData = false;

export function resetAI(){
  console.log("AI RESET");
  prevActionState[0] = "";
  prevActionState[1] = "";
  actionStateDuration[0] = 0;
  actionStateDuration[1] = 0;
}

export function updateAI(){
  updateStateDurations(); //always do first
  if(shouldCollectData()){
    collectPlayerData();
  }else if(!hasDisplayedData){
    console.log(inputData);
    console.log(outputData); //copy(JSON.stringify(outputData))
    hasDisplayedData = true;
  }
  updatePrevActionStates();
}

export function runAI(i){
  //this never runs in this ai.
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

function shouldCollectData(){
  return cdCount < Np;
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
  inputVector.push(player[0].phys.grounded*1); //binary
  inputVector.push(player[0].phys.fastfalled*1); //binary
  inputVector.push(player[0].phys.face); //binary 
  inputVector.push(player[0].phys.shielding*1); //binary
  inputVector.push((player[0].phys.onLedge>-1)?1:0); //binary
  inputVector.push(player[0].phys.sideBJumpFlag*1); //binary
  inputVector.push((player[0].phys.grabbedBy>-1)?1:0); //binary
  inputVector.push((player[0].phys.grabbing>-1)?1:0); //binary
  inputVector.push(player[0].phys.jumpsUsed); //binary
  //binary features p2
  inputVector.push(player[1].phys.grounded*1); //binary
  inputVector.push(player[1].phys.fastfalled*1); //binary
  inputVector.push(player[1].phys.face); //binary
  inputVector.push(player[1].phys.shielding*1); //binary
  inputVector.push((player[1].phys.onLedge>-1)?1:0); //binary
  inputVector.push(player[1].phys.sideBJumpFlag*1); //binary
  inputVector.push((player[1].phys.grabbedBy>-1)?1:0); //binary
  inputVector.push((player[1].phys.grabbing>-1)?1:0); //binary
  inputVector.push(player[1].phys.jumpsUsed); //binary
  //string states
  inputVector.push(player[0].actionState); //string
  inputVector.push(player[1].actionState); //string
  return inputVector;
}

function getOutputVector(){
  const outputVector = [];
  //player 1 data
  outputVector.push(player[0].inputs.lStickAxis[0].x); // analog-stick, -0 causes problems, dont multiply by -1 
  outputVector.push(player[0].inputs.lStickAxis[0].y);
  outputVector.push(player[0].inputs.cStickAxis[0].x); // c-stick
  outputVector.push(player[0].inputs.cStickAxis[0].y);
  outputVector.push(player[0].inputs.a[0]); // single buttons
  outputVector.push(player[0].inputs.b[0]);
  outputVector.push(player[0].inputs.z[0]);
  outputVector.push(player[0].inputs.x[0] || player[0].inputs.y[0]); // X and Y combined
  outputVector.push(Math.max(player[0].inputs.lAnalog[0], player[0].inputs.rAnalog[0])); // max of L/R analog inputs
  //player 2 data
  outputVector.push(player[1].inputs.lStickAxis[0].x); // analog-stick, -0 causes problems, dont multiply by -1 
  outputVector.push(player[1].inputs.lStickAxis[0].y);
  outputVector.push(player[1].inputs.cStickAxis[0].x); // c-stick
  outputVector.push(player[1].inputs.cStickAxis[0].y);
  outputVector.push(player[1].inputs.a[0]); // single buttons
  outputVector.push(player[1].inputs.b[0]);
  outputVector.push(player[1].inputs.z[0]);
  outputVector.push(player[1].inputs.x[0] || player[1].inputs.y[0]); // X and Y combined
  outputVector.push(Math.max(player[1].inputs.lAnalog[0], player[1].inputs.rAnalog[0])); // max of L/R analog inputs
  return outputVector;
}

