import {player, playerType, cS} from "main/main";
import {gameSettings} from "settings";
import {activeStage} from "stages/activeStage";

const Np = 10*60; //1 pattern = 1 frame
const Ni = 17; //inputs
const No = 10; //outputs
const inputData = createArray(Np,Ni);
const outputData = createArray(Np,No);
let count = 0;

let stateDurationCount = 0;

export function getPlayerData(player){
  
}

export function getCount(){
  return count;
}

export function runAI (i){
  //if stage is not battlefield, dont run
  //if matchup is not 1v1, dont run
  //if cpu is not marth, dont run
  //if opponent is not marth, dont run
  //if has not initialized, initialize
  //2 million multiplies to work with

  if(i !== 1){
    return;
  }
  // if(count < Np){
  // 	//inputs
  //   inputData[count][0] = player[0].phys.pos.x; //my.pos.x: [-200,200]
  //   inputData[count][1] = player[0].phys.pos.y; //my.pos.y: [-100,100]
  //   inputData[count][2] = player[1].phys.pos.x; //enemy.pos.x: [-200,200]
  //   inputData[count][3] = player[1].phys.pos.y; //enemy.pos.y: [-100,100]
  //   inputData[count][4] = player[1].phys.pos.x - player[0].phys.pos.x; //enemy distance x: [-200,200]
  //   inputData[count][5] = player[1].phys.pos.y - player[0].phys.pos.y; //enemy distance y: [-100,100]
  //   inputData[count][6] = player[0].phys.doubleJumped; //doubleJumped: {false,true}
  //   inputData[count][7] = player[0].phys.fastfalled; //fastfalled: {false,true}
  //   inputData[count][8] = player[0].phys.face; //face: {-1,1}
  //   inputData[count][9] = player[0].phys.grounded; //grounded: {false,true} 
  //   inputData[count][10] = player[0].phys.onLedge; //onLedge: {-1,1}
  //   inputData[count][11] = player[0].phys.charging; //charging: {false,true}
  //   inputData[count][12] = player[0].phys.grabbedBy; //grabbedBy: {-1,1}
  //   inputData[count][13] = player[0].phys.grabbing; //grabbing: {-1,1}
  //   inputData[count][14] = player[0].percent; //percent: {0,200}
  //   inputData[count][15] = player[0].actionState; //actionState: {name}
  //   if(player[0].actionState !== player[0].prevActionState){
  //     stateDurationCount = 0;
  //   }else{
  //     stateDurationCount++;
  //   }
  //   inputData[count][16] = stateDurationCount;

  //   //outputs
  //   outputData[count][0] = player[0].inputs.lStickAxis[0].x; // analog-stick 
  //   outputData[count][1] = player[0].inputs.lStickAxis[0].y;
  //   outputData[count][2] = player[0].inputs.cStickAxis[0].x; // c-stick
  //   outputData[count][3] = player[0].inputs.cStickAxis[0].y;
  //   outputData[count][4] = player[0].inputs.a[0]; //single buttons
  //   outputData[count][5] = player[0].inputs.b[0];
  //   outputData[count][6] = player[0].inputs.z[0];
  //   outputData[count][7] = player[0].inputs.x[0] || player[0].inputs.y[0]; // X and Y combined
  //   outputData[count][8] = player[0].inputs.l[0] || player[0].inputs.r[0]; // L and R combined
  //   outputData[count][9] = Math.max(player[0].inputs.lAnalog[0], player[0].inputs.rAnalog[0]); // max of L/R analog inputs

  //   console.log(player[0].actionState + ", " + stateDurationCount);
  //   console.log(outputData[count]);

  //   //random cpu actions for now
  //   randomPolicy(i);
  //   count++;
  // }else{
  //   nnPolicy(i);
  // }

  // msDelay(10);


  count++;

}


function randomPolicy(i) {
  player[i].inputs.lStickAxis[0].x = 2*Math.random()-1;
  player[i].inputs.lStickAxis[0].y = 2*Math.random()-1;
  player[i].inputs.cStickAxis[0].x = 2*Math.random()-1;
  player[i].inputs.cStickAxis[0].y = 2*Math.random()-1;

  player[i].inputs.x[0] = randomBool();
  player[i].inputs.b[0] = randomBool();
  player[i].inputs.a[0] = randomBool();

  player[i].inputs.l[0] = randomBool();
  if(player[i].inputs.l[0]){
  	player[i].inputs.lAnalog[0] = 1;
  }else{
  	player[i].inputs.lAnalog[0] = 0;
  }

  return;
}

function randomBool(){
  return (Math.random() > 0.5) ? true:false;
}


function nnPolicy(i){
  //const startTime = performance.now();
  const minIndex = findNN();
  //console.log(performance.now()-startTime);

  outputNN(minIndex);
  return;
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

function findNN(){
  if(player[1].prevActionState !== player[1].actionState){
    stateDurationCount = 0;
  }else{
  	stateDurationCount++;
  }

  let smallestIndex = -1;
  let smallestDist = 100000;
  for(let j = 0; j < inputData.length; j++){
    const  dist = Math.abs(-1*player[1].phys.pos.x - inputData[j][0])/100 + 
    Math.abs(player[1].phys.pos.y - inputData[j][1])/50 +
    (player[1].phys.doubleJumped !== inputData[j][6]) + 
    (player[1].phys.fastfalled !== inputData[j][7]) + 
    (player[1].phys.face !== inputData[j][8]) + 
    (player[1].phys.grounded !== inputData[j][9]) + 
    (player[1].phys.onLedge !== inputData[j][10]) + 
    (player[1].phys.charging !== inputData[j][11]) + 
    (player[1].phys.grabbedBy !== inputData[j][12]) + 
    (player[1].phys.grabbing !== inputData[j][13]) +
    (player[1].actionState !== inputData[j][15]) + Math.abs(stateDurationCount - inputData[j][16]);
    if(dist < smallestDist){
      smallestDist = dist;
      smallestIndex = j;
    }
  }
  smallestIndex++;
  if(smallestIndex > Np-1){
    smallestIndex = Np-1;
  }
  console.log(smallestIndex);
  console.log(smallestDist);
  console.log(-1*player[1].phys.pos.x + ", " + player[1].phys.pos.y + ", " + player[1].phys.doubleJumped + ", " + player[1].phys.fastfalled + ", " + 
  	player[1].phys.face + ", " + player[1].phys.grounded + ", " + player[1].phys.onLedge + ", " + player[1].phys.charging + ", " + 
  	player[1].phys.grabbedBy + ", " + player[1].phys.grabbing + ", " + player[1].actionState + ", " + stateDurationCount);
  console.log(inputData[smallestIndex][0] + ", " + inputData[smallestIndex][1] + ", " + inputData[smallestIndex][6] + ", " + inputData[smallestIndex][7] + ", " + 
  	inputData[smallestIndex][8] + ", " + inputData[smallestIndex][9] + ", " + inputData[smallestIndex][10] + ", " + 
  	inputData[smallestIndex][11] + ", " + inputData[smallestIndex][12] + ", " + inputData[smallestIndex][13] + ", " + inputData[smallestIndex][15] + ", " +
  	inputData[smallestIndex][16]);
  console.log(outputData[smallestIndex]);
  return smallestIndex;
}

function outputNN(idx){
  for (let j = 0; j < 7; j++) {
    player[1].inputs.lStickAxis[7 - j].x = player[1].inputs.lStickAxis[6 - j].x;
    player[1].inputs.lStickAxis[7 - j].y = player[1].inputs.lStickAxis[6 - j].y;
    player[1].inputs.rawlStickAxis[7 - j].x = player[1].inputs.rawlStickAxis[6 - j].x;
    player[1].inputs.rawlStickAxis[7 - j].y = player[1].inputs.rawlStickAxis[6 - j].y;
    player[1].inputs.cStickAxis[7 - j].x = player[1].inputs.cStickAxis[6 - j].x;
    player[1].inputs.cStickAxis[7 - j].y = player[1].inputs.cStickAxis[6 - j].y;
    player[1].inputs.lAnalog[7 - j] = player[1].inputs.lAnalog[6 - j];
    player[1].inputs.rAnalog[7 - j] = player[1].inputs.rAnalog[6 - j];
    player[1].inputs.s[7 - j] = player[1].inputs.s[6 - j];
    player[1].inputs.z[7 - j] = player[1].inputs.z[6 - j];
    player[1].inputs.a[7 - j] = player[1].inputs.a[6 - j];
    player[1].inputs.b[7 - j] = player[1].inputs.b[6 - j];
    player[1].inputs.x[7 - j] = player[1].inputs.x[6 - j];
    player[1].inputs.y[7 - j] = player[1].inputs.y[6 - j];
    player[1].inputs.r[7 - j] = player[1].inputs.r[6 - j];
    player[1].inputs.l[7 - j] = player[1].inputs.l[6 - j];
    player[1].inputs.dpadleft[7 - j] = player[1].inputs.dpadleft[6 - j];
    player[1].inputs.dpaddown[7 - j] = player[1].inputs.dpaddown[6 - j];
    player[1].inputs.dpadright[7 - j] = player[1].inputs.dpadright[6 - j];
    player[1].inputs.dpadup[7 - j] = player[1].inputs.dpadup[6 - j];
  }

  player[1].inputs.lStickAxis[0].x = -1*outputData[idx][0];
  player[1].inputs.lStickAxis[0].y = outputData[idx][1];
  player[1].inputs.cStickAxis[0].x = -1*outputData[idx][2];
  player[1].inputs.cStickAxis[0].y = outputData[idx][3];

  player[1].inputs.a[0] = outputData[idx][4];
  player[1].inputs.b[0] = outputData[idx][5];
  player[1].inputs.z[0] = outputData[idx][6];

  player[1].inputs.x[0] = outputData[idx][7];
  player[1].inputs.y[0] = outputData[idx][7];
  player[1].inputs.l[0] = outputData[idx][8];
  player[1].inputs.r[0] = outputData[idx][8];

  player[1].inputs.lAnalog[0] = outputData[idx][9];
  player[1].inputs.rAnalog[0] = outputData[idx][9];
  return;
}



function msDelay(ms){
  for(let m = 0; m < Math.round(ms); m++){
    for(let s = 0; s < 28000; s++){
      const a = Math.exp(10,2);
    }
  }
}



