import {checkForSpecials, checkForAerials, airDrift, fastfall, playSounds, aS} from "physics/actionStateShortcuts";
import {cS,  player} from "main/main";
import {sounds} from "main/sfx";
import {framesData} from 'main/characters';
import {drawVfx} from "main/vfx/drawVfx";
export default {
  name : "JUMPAERIALB",
  canPassThrough : true,
  canGrabLedge : [true,false],
  wallJumpAble : true,
  headBonk : true,
  canBeGrabbed : true,
  landType : 0,
  vCancel : true,
  init : function(p){
    player[p].actionState = "JUMPAERIALB";
    player[p].timer = 0;
    player[p].phys.fastfalled = false;
    player[p].phys.doubleJumped = true;
    player[p].phys.jumpsUsed++;

    player[p].phys.cVel.y = player[p].charAttributes.fHopInitV * player[p].charAttributes.djMultiplier;

    player[p].phys.cVel.x = player[p].inputs.lStickAxis[0].x * player[p].charAttributes.djMomentum;
    drawVfx("doubleJumpRings",player[p].phys.pos,player[p].phys.face);
    sounds.jump2.play();
    aS[cS[p]].JUMPAERIALB.main(p);
  },
  main : function(p){
    player[p].timer++;
    playSounds("JUMPAERIAL",p);
    if (!aS[cS[p]].JUMPAERIALB.interrupt(p)){
      fastfall(p);
      airDrift(p);
    }
  },
  interrupt : function(p){
    const a = checkForAerials(p);
    const b = checkForSpecials(p);
    if (a[0]){
      aS[cS[p]][a[1]].init(p);
      return true;
    }
    else if ((player[p].inputs.l[0] && !player[p].inputs.l[1]) || (player[p].inputs.r[0] && !player[p].inputs.r[1])){
      aS[cS[p]].ESCAPEAIR.init(p);
      return true;
    }
    else if (b[0]){
      aS[cS[p]][b[1]].init(p);
      return true;
    }
    else if (player[p].timer > framesData[cS[p]].JUMPAERIALB){
      aS[cS[p]].FALLAERIAL.init(p);
      return true;
    }
    else {
      return false;
    }
  }
};
