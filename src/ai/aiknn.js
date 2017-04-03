import {player, playerType, cS} from "main/main";
import {gameSettings} from "settings";
import {activeStage} from "stages/activeStage";
import {runBLASTests, runBLASBenchmarks} from "ai/sBLAS";
import {runMLBenchmarks} from "ai/sML";

let cdCount = 0;
const Np = 10*60; //1 pattern = 1 frame
const Ni = 40; //# of inputs
const No = 10; //# of outputs
const inputData = createArray(Np,Ni);
const outputData = createArray(Np,No);
const prevActionState = ["",""];
const actionStateDuration = [0,0];

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

export function runAI (i){
  updateStateDurations(); //always do this first
  if(shouldCollectData()){
    // msDelay(16); //do game delay here in the future instead of in the main loop
  }else{
    const gameData = collectGameData(i);
    const bestIndex = findKNN(gameData);
    outputKNN(i,bestIndex);
  }
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

function collectPlayerData(i){
  inputData[cdCount][0] = player[0].phys.pos.x; 
  inputData[cdCount][1] = player[0].phys.pos.y; 
  inputData[cdCount][2] = player[0].phys.grounded*1;
  inputData[cdCount][3] = player[0].phys.fastfalled*1;
  inputData[cdCount][4] = player[0].phys.face;
  inputData[cdCount][5] = player[0].phys.shieldHP;
  inputData[cdCount][6] = player[0].phys.shielding*1;
  inputData[cdCount][7] = player[0].phys.shieldStun; //doesnt work
  inputData[cdCount][8] = ((player[0].phys.onLedge>-1)?1:0);
  inputData[cdCount][9] = player[0].phys.intangibleTimer;
  inputData[cdCount][10] = player[0].phys.invincibleTimer;
  inputData[cdCount][11] = player[0].phys.sideBJumpFlag*1;
  inputData[cdCount][12] = ((player[0].phys.grabbedBy>-1)?1:0);
  inputData[cdCount][13] = ((player[0].phys.grabbing>-1)?1:0);
  inputData[cdCount][14] = player[0].phys.jumpsUsed;
  inputData[cdCount][15] = player[0].actionState;
  inputData[cdCount][16] = actionStateDuration[0];
  inputData[cdCount][17] = prevActionState[0]; 
  inputData[cdCount][18] = player[0].percent;

  inputData[cdCount][19] = player[1].phys.pos.x; 
  inputData[cdCount][20] = player[1].phys.pos.y; 
  inputData[cdCount][21] = player[1].phys.grounded*1;
  inputData[cdCount][22] = player[1].phys.fastfalled*1;
  inputData[cdCount][23] = player[1].phys.face;
  inputData[cdCount][24] = player[1].phys.shieldHP;
  inputData[cdCount][25] = player[1].phys.shielding*1;
  inputData[cdCount][26] = player[1].phys.shieldStun;
  inputData[cdCount][27] = ((player[1].phys.onLedge>-1)?1:0);
  inputData[cdCount][28] = player[1].phys.intangibleTimer;
  inputData[cdCount][29] = player[1].phys.invincibleTimer;
  inputData[cdCount][30] = player[1].phys.sideBJumpFlag*1;
  inputData[cdCount][31] = ((player[1].phys.grabbedBy>-1)?1:0);
  inputData[cdCount][32] = ((player[1].phys.grabbing>-1)?1:0);
  inputData[cdCount][33] = player[1].phys.jumpsUsed;
  inputData[cdCount][34] = player[1].actionState;
  inputData[cdCount][35] = actionStateDuration[1];
  inputData[cdCount][36] = prevActionState[1]; 
  inputData[cdCount][37] = player[1].percent;

  inputData[cdCount][38] = player[1].phys.pos.x-player[0].phys.pos.x;
  inputData[cdCount][39] = player[1].phys.pos.y-player[0].phys.pos.y;

  outputData[cdCount][0] = (player[0].inputs.lStickAxis[0].x===0)?0:-1*player[0].inputs.lStickAxis[0].x; // analog-stick, -0 causes problems, dont multiply by -1 
  outputData[cdCount][1] = player[0].inputs.lStickAxis[0].y;
  outputData[cdCount][2] = (player[0].inputs.cStickAxis[0].x===0)?0:-1*player[0].inputs.cStickAxis[0].x; // c-stick
  outputData[cdCount][3] = player[0].inputs.cStickAxis[0].y;
  outputData[cdCount][4] = player[0].inputs.a[0]; // single buttons
  outputData[cdCount][5] = player[0].inputs.b[0];
  outputData[cdCount][6] = player[0].inputs.z[0];
  outputData[cdCount][7] = player[0].inputs.x[0] || player[0].inputs.y[0]; // X and Y combined
  outputData[cdCount][8] = player[0].inputs.l[0] || player[0].inputs.r[0]; // L and R combined
  outputData[cdCount][9] = Math.max(player[0].inputs.lAnalog[0], player[0].inputs.rAnalog[0]); // max of L/R analog inputs
  cdCount++;
}


function collectGameData(i){
  const gameData = new Array(Ni);
  gameData[0] = -player[1].phys.pos.x; //flip
  gameData[1] = player[1].phys.pos.y; 
  gameData[2] = player[1].phys.grounded*1;
  gameData[3] = player[1].phys.fastfalled*1;
  gameData[4] = -player[1].phys.face; //flip
  gameData[5] = player[1].phys.shieldHP;
  gameData[6] = player[1].phys.shielding*1;
  gameData[7] = player[1].phys.shieldStun;
  gameData[8] = ((player[1].phys.onLedge>-1)?1:0); //possibly flip?
  gameData[9] = player[1].phys.intangibleTimer; 
  gameData[10] = player[1].phys.invincibleTimer; 
  gameData[11] = player[1].phys.sideBJumpFlag*1;
  gameData[12] = ((player[1].phys.grabbedBy>-1)?1:0); 
  gameData[13] = ((player[1].phys.grabbing>-1)?1:0); 
  gameData[14] = player[1].phys.jumpsUsed;
  gameData[15] = player[1].actionState; //string, 226 unique entries
  gameData[16] = actionStateDuration[1];
  gameData[17] = prevActionState[1]; //string
  gameData[18] = player[1].percent;

  gameData[19] = -player[0].phys.pos.x; //flip
  gameData[20] = player[0].phys.pos.y; 
  gameData[21] = player[0].phys.grounded*1;
  gameData[22] = player[0].phys.fastfalled*1;
  gameData[23] = -player[0].phys.face; //flip
  gameData[24] = player[0].phys.shieldHP;
  gameData[25] = player[0].phys.shielding*1;
  gameData[26] = player[0].phys.shieldStun;
  gameData[27] = ((player[0].phys.onLedge>-1)?1:0); //possibly flip?
  gameData[28] = player[0].phys.intangibleTimer;
  gameData[29] = player[0].phys.invincibleTimer;
  gameData[30] = player[0].phys.sideBJumpFlag*1;
  gameData[31] = ((player[0].phys.grabbedBy>-1)?1:0);
  gameData[32] = ((player[0].phys.grabbing>-1)?1:0);
  gameData[33] = player[0].phys.jumpsUsed;
  gameData[34] = player[0].actionState; //string
  gameData[35] = actionStateDuration[0]; 
  gameData[36] = prevActionState[0]; //string
  gameData[37] = player[0].percent;

  gameData[38] = -(player[0].phys.pos.x-player[1].phys.pos.x); //flip 
  gameData[39] = (player[0].phys.pos.y-player[1].phys.pos.y); 
  return gameData;
}

function findKNN(gameData){
  const e = 0.0001; //threshold e
  let smallestIndex = [0];
  let smallestDist = 1000000000;
  for(let i = 0; i < Np; i++){
    let currentDist = 0;
    for(let f = 0; f < Ni; f++){
      if(f === 15 || f === 17 || f === 34 || f === 36){
        currentDist = currentDist + (gameData[f] !== inputData[i][f])*1;
      }else{
        currentDist = currentDist + (gameData[f] - inputData[i][f])*(gameData[f] - inputData[i][f]);
      }
    }
    if(currentDist < smallestDist){
      smallestDist = currentDist;
      smallestIndex = [i];
    }else if(currentDist === smallestDist){
      smallestIndex.push(i);
    }
    // else if(Math.abs(currentDist-smallestDist) < e){
    //   smallestIndex.push(i);
    // }
  }
  const randIndex = Math.floor(Math.random()*smallestIndex.length);
  return smallestIndex[randIndex];
}

function outputKNN(i,idx){
  pushInputBuffer(i);//always do this before doing AI outputs
  
  player[i].inputs.lStickAxis[0].x = outputData[idx][0]; //reverse x-axis analog stick
  player[i].inputs.lStickAxis[0].y = outputData[idx][1];
  player[i].inputs.cStickAxis[0].x = outputData[idx][2]; //reverse x-axis c-stick
  player[i].inputs.cStickAxis[0].y = outputData[idx][3];

  player[i].inputs.a[0] = outputData[idx][4]; //single button inputs
  player[i].inputs.b[0] = outputData[idx][5];
  player[i].inputs.z[0] = outputData[idx][6];

  player[i].inputs.x[0] = outputData[idx][7]; //same function buttons 
  player[i].inputs.y[0] = outputData[idx][7];
  player[i].inputs.l[0] = outputData[idx][8];
  player[i].inputs.r[0] = outputData[idx][8];

  player[i].inputs.lAnalog[0] = outputData[idx][9]; //analog trigger inputs
  player[i].inputs.rAnalog[0] = outputData[idx][9];
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
function createArray(r,c){
  const retMat = new Array(r);
  for(let i = 0; i < r; i++){
    retMat[i] = new Array(c);
  }
  return retMat;
}

function msDelay(ms){
  //console.log("delay is being used somewhere.");
  for(let m = 0; m < Math.round(ms); m++){
    for(let s = 0; s < 6000; s++){
      const a = Math.exp(10,2);
    }
  }
}








function findUniqueStates(inputData){
  const uniqueStates = [];
  for(let i = 0; i < Np; i++){
    if(uniqueStates.indexOf(inputData[i][15]) === -1){
      uniqueStates.push(inputData[i][15]);
    }
    if(uniqueStates.indexOf(inputData[i][34]) === -1){
      uniqueStates.push(inputData[i][34]);
    }
  }
  return uniqueStates;
}

//util functions
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


