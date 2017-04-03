import {player, playerType, cS} from "main/main";
import {gameSettings} from "settings";
import {activeStage} from "stages/activeStage";

const actionStateDuration = [0,0];

export function resetAI(){
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