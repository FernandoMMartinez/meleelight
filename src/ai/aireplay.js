import {player, playerType, cS} from "main/main";
import {gameSettings} from "settings";
import {pushInputBuffer} from "ai/aiutil"; 
import {replayData} from "ai/replay";

const outputData = JSON.parse(replayData);
let replayFrame = 0;

export function resetAI(){
  replayFrame = 0;
}

export function runAI (i){
  doOutputClass(0,replayFrame);
  replayFrame++;
}

function doOutputClass(i,frame){
  if(i === 0){
    pushInputBuffer(i);//always do this before doing AI outputs, dont need it if ai is controlling p1
  }

  if(frame < outputData.length && frame > -1){
    player[i].inputs.lStickAxis[0].x = outputData[frame][0]; // analog-stick, -0 causes problems, dont multiply by -1 
    player[i].inputs.lStickAxis[0].y = outputData[frame][1];
    player[i].inputs.cStickAxis[0].x = outputData[frame][2]; // c-stick
    player[i].inputs.cStickAxis[0].y = outputData[frame][3];
    player[i].inputs.a[0] = outputData[frame][4]===1?true:false; // single buttons
    player[i].inputs.b[0] = outputData[frame][5]===1?true:false;
    player[i].inputs.z[0] = outputData[frame][6]===1?true:false;
    player[i].inputs.x[0] = outputData[frame][7]===1?true:false; // X and Y combined
    player[i].inputs.r[0] = outputData[frame][8]===1?true:false; 
    player[i].inputs.rAnalog[0] = outputData[frame][8];
  }
 
}