import {player, playerType, cS} from "main/main";

export function pushInputBuffer(i){
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