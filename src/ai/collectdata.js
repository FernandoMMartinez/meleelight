import {player, playerType, cS} from "main/main";
import {gameSettings} from "settings";
import {activeStage} from "stages/activeStage";

const shouldCollect = true;

const prevActionState = ["",""];
const actionStateDuration = [0,0];

let cdCount = 0;
const Np = 1*60*60*60; //1 pattern = 1 frame, 1 min = 1*60*60, 3 hours = 3*60*60*60
const inputData = Array(Np);
const outputData = Array(Np);

export function dataStateReset(){
  prevActionState[0] = "";
  prevActionState[1] = "";
  actionStateDuration[0] = 0;
  actionStateDuration[1] = 0;
}

export function collectData(){
  if(shouldCollect){
    updateStateDurations(); //always do first

    if(doneCollecting()){
      collectPlayerData();
    }else{
      console.log("copy(JSON.stringify(temp0))");
      console.log(inputData);
      console.log(outputData); //copy(JSON.stringify(outputData))
    }

    updatePrevActionStates(); //always do last
  }
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

function doneCollecting(){
  return (cdCount < Np);
}

function updatePrevActionStates(){
  prevActionState[0] = player[0].actionState;
  prevActionState[1] = player[1].actionState;
}

function collectPlayerData(){ //i = 0, 1-i = 1
  //game data
  inputData[cdCount] = getInputVector();
  //controller data
  outputData[cdCount] = getOutputVector();
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
  //real features p1/p2
  inputVector.push(player[1].phys.pos.x-player[0].phys.pos.x); //real, max: 167.8, min: -99.5
  inputVector.push(player[1].phys.pos.y-player[0].phys.pos.y); //real, max: 242.8, min: -293.9
  //binary features p1
  inputVector.push(player[0].phys.fastfalled*1); //binary
  inputVector.push(player[0].phys.face); //binary 
  inputVector.push(player[0].phys.sideBJumpFlag*1); //binary
  inputVector.push(player[0].phys.jumpsUsed); //binary
  //binary features p2
  inputVector.push(player[1].phys.fastfalled*1); //binary
  inputVector.push(player[1].phys.face); //binary
  inputVector.push(player[1].phys.sideBJumpFlag*1); //binary
  inputVector.push(player[1].phys.jumpsUsed); //binary
  //string states
  inputVector.push(player[0].actionState); //string
  inputVector.push(player[1].actionState); //string

  // inputVector.push(player[0].phys.cVel.x);
  // inputVector.push(player[0].phys.cVel.y);
  // inputVector.push(player[0].phys.kVel.x);
  // inputVector.push(player[0].phys.kVel.y);
  // inputVector.push(player[0].phys.kDec.x);
  // inputVector.push(player[0].phys.kDec.y);
  // inputVector.push(player[0].phys.pos.x);
  // inputVector.push(player[0].phys.pos.y);
  // inputVector.push(player[0].phys.posPrev.x);
  // inputVector.push(player[0].phys.posPrev.y);
  // inputVector.push(player[0].phys.posDelta.x);
  // inputVector.push(player[0].phys.posDelta.y);
  // inputVector.push(player[0].phys.grounded);
  // inputVector.push(player[0].phys.airborneTimer);
  // inputVector.push(player[0].phys.fastfalled);
  // inputVector.push(player[0].phys.face);
  // inputVector.push(player[0].phys.ECBp[0].x);
  // inputVector.push(player[0].phys.ECBp[0].y);
  // inputVector.push(player[0].phys.ECBp[1].x);
  // inputVector.push(player[0].phys.ECBp[1].y);
  // inputVector.push(player[0].phys.ECBp[2].x);
  // inputVector.push(player[0].phys.ECBp[2].y);
  // inputVector.push(player[0].phys.ECBp[3].x);
  // inputVector.push(player[0].phys.ECBp[3].y);
  // inputVector.push(player[0].phys.ECB1[0].x);
  // inputVector.push(player[0].phys.ECB1[0].y);
  // inputVector.push(player[0].phys.ECB1[1].x);
  // inputVector.push(player[0].phys.ECB1[1].y);
  // inputVector.push(player[0].phys.ECB1[2].x);
  // inputVector.push(player[0].phys.ECB1[2].y);
  // inputVector.push(player[0].phys.ECB1[3].x);
  // inputVector.push(player[0].phys.ECB1[3].y);
  // inputVector.push(player[0].phys.ECB2[0].x);
  // inputVector.push(player[0].phys.ECB2[0].y);
  // inputVector.push(player[0].phys.ECB2[1].x);
  // inputVector.push(player[0].phys.ECB2[1].y);
  // inputVector.push(player[0].phys.ECB2[2].x);
  // inputVector.push(player[0].phys.ECB2[2].y);
  // inputVector.push(player[0].phys.ECB2[3].x);
  // inputVector.push(player[0].phys.ECB2[3].y);
  // inputVector.push(player[0].phys.abovePlatforms[0]);
  // inputVector.push(player[0].phys.abovePlatforms[1]);
  // inputVector.push(player[0].phys.abovePlatforms[2]);
  // inputVector.push(player[0].phys.onSurface[0]);
  // inputVector.push(player[0].phys.onSurface[1]);
  // inputVector.push(player[0].phys.doubleJumped);
  // inputVector.push(player[0].phys.shieldHP);
  // inputVector.push(player[0].phys.shieldSize);
  // inputVector.push(player[0].phys.shieldAnalog);
  // inputVector.push(player[0].phys.shielding);
  // inputVector.push(player[0].phys.shieldPosition.x);
  // inputVector.push(player[0].phys.shieldPosition.y);
  // inputVector.push(player[0].phys.shieldPositionReal.x);
  // inputVector.push(player[0].phys.shieldPositionReal.y);
  // inputVector.push(player[0].phys.shieldStun);
  // inputVector.push(player[0].phys.powerShieldActive);
  // inputVector.push(player[0].phys.powerShieldReflectActive);
  // inputVector.push(player[0].phys.powerShielded);
  // inputVector.push(player[0].phys.onLedge);
  // inputVector.push(player[0].phys.ledgeSnapBoxF.min.x);
  // inputVector.push(player[0].phys.ledgeSnapBoxF.min.y);
  // inputVector.push(player[0].phys.ledgeSnapBoxF.max.x);
  // inputVector.push(player[0].phys.ledgeSnapBoxF.max.y);
  // inputVector.push(player[0].phys.ledgeSnapBoxB.min.x);
  // inputVector.push(player[0].phys.ledgeSnapBoxB.min.y);
  // inputVector.push(player[0].phys.ledgeSnapBoxB.max.x);
  // inputVector.push(player[0].phys.ledgeSnapBoxB.max.y);
  // inputVector.push(player[0].phys.ledgeRegrabTimeout);
  // inputVector.push(player[0].phys.ledgeRegrabCount);
  // inputVector.push(player[0].phys.hurtbox.min.x);
  // inputVector.push(player[0].phys.hurtbox.min.y);
  // inputVector.push(player[0].phys.hurtbox.max.x);
  // inputVector.push(player[0].phys.hurtbox.max.y);
  // inputVector.push(player[0].phys.hurtBoxState);
  // inputVector.push(player[0].phys.intangibleTimer);
  // inputVector.push(player[0].phys.invincibleTimer);
  // inputVector.push(player[0].phys.lCancel);
  // inputVector.push(player[0].phys.lCancelTimer);
  // inputVector.push(player[0].phys.autoCancel);
  // inputVector.push(player[0].phys.landingLagScaling);
  // inputVector.push(player[0].phys.passFastfall);
  // inputVector.push(player[0].phys.jabCombo);
  // inputVector.push(player[0].phys.sideBJumpFlag);
  // inputVector.push(player[0].phys.charging);
  // inputVector.push(player[0].phys.chargeFrames);
  // inputVector.push(player[0].phys.stuckTimer);
  // inputVector.push(player[0].phys.techTimer);
  // inputVector.push(player[0].phys.grabbedBy);
  // inputVector.push(player[0].phys.grabbing);
  // inputVector.push(player[0].phys.dashbuffer);
  // inputVector.push(player[0].phys.jumpType);
  // inputVector.push(player[0].phys.jumpSquatType);
  // inputVector.push(player[0].phys.wallJumpTimer);
  // inputVector.push(player[0].phys.canWallJump);
  // inputVector.push(player[0].phys.upbAngleMultiplier);
  // inputVector.push(player[0].phys.thrownHitbox);
  // inputVector.push(player[0].phys.thrownHitboxOwner);
  // inputVector.push(player[0].phys.landingMultiplier);
  // inputVector.push(player[0].phys.wallJumpCount);
  // inputVector.push(player[0].phys.isInterpolated);
  // inputVector.push(player[0].phys.facePrev);
  // inputVector.push(player[0].phys.jumpsUsed);
  // inputVector.push(player[0].phys.releaseFrame);
  // inputVector.push(player[0].phys.vCancelTimer);
  // inputVector.push(player[0].phys.shoulderLockout);
  // inputVector.push(player[0].phys.inShine);
  // inputVector.push(player[0].phys.jabReset);
  // inputVector.push(player[0].phys.outOfCameraTimer);
  // inputVector.push(player[0].phys.rollOutDistance);
  // inputVector.push(player[0].phys.bTurnaroundTimer);
  // inputVector.push(player[0].phys.bTurnaroundDirection);

  // inputVector.push(player[0].actionState);
  // inputVector.push(player[0].prevActionState);
  // inputVector.push(player[0].timer);
  // inputVector.push(player[0].charAttributes);
  // inputVector.push(player[0].charHitboxes);
  // inputVector.push(player[0].showLedgeGrabBox);
  // inputVector.push(player[0].showECB);
  // inputVector.push(player[0].showHitbox);
  // inputVector.push(player[0].spawnWaitTime);
  // inputVector.push(player[0].hitboxes);
  // inputVector.push(player[0].hit);
  // inputVector.push(player[0].percent);
  // inputVector.push(player[0].stocks);
  // inputVector.push(player[0].miniView);
  // inputVector.push(player[0].miniViewPoint.x);
  // inputVector.push(player[0].miniViewPoint.y);
  // inputVector.push(player[0].inCSS);
  // inputVector.push(player[0].furaLoopID);
  // inputVector.push(player[0].percentShake.x);
  // inputVector.push(player[0].percentShake.y);
  // inputVector.push(player[0].shineLoop);
  // inputVector.push(player[0].laserCombo);
  // inputVector.push(player[0].rotation);
  // inputVector.push(player[0].rotationPoint.x);
  // inputVector.push(player[0].rotationPoint.y);
  // inputVector.push(player[0].colourOverlay);
  // inputVector.push(player[0].colourOverlayBool);
  // inputVector.push(player[0].currentAction);
  // inputVector.push(player[0].currentSubaction);
  // inputVector.push(player[0].difficulty);
  // inputVector.push(player[0].lastMash);
  // inputVector.push(player[0].hasHit);
  // inputVector.push(player[0].shocked);
  // inputVector.push(player[0].burning);

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
  outputVector.push(Math.max(player[0].inputs.lAnalog[0],player[0].inputs.rAnalog[0])); // max of L/R analog inputs

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
