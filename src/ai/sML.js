import {createMatrix, printMatrix, createRandMatrix, addScalarMatrix, multiplyMatrices, subtractMatrices, matrixSize, matrixTranspose,
multiplyScalarMatrix, elementMultiplyMatrices, convertToFloat32Matrix} from "ai/sBLAS";
import {wh1,wh2,wo,u,s} from "ai/model";

export function createNN(netSize){
  const net = new Object();
  if(netSize !== undefined && netSize.length === 4 && netSize[0] > 0 && netSize[1] > 0 && netSize[2] > 0 && netSize[3] > 0){
    net.wh1 = multiplyScalarMatrix(createRandMatrix(netSize[0],netSize[1]),3*Math.sqrt(6/(netSize[0]+netSize[1]-1)));
    net.wh2 = multiplyScalarMatrix(createRandMatrix(netSize[1]+1,netSize[2]),3*Math.sqrt(6/(netSize[1]+netSize[2])));
    net.wo = multiplyScalarMatrix(createRandMatrix(netSize[2]+1,netSize[3]),3*Math.sqrt(6/(netSize[2]+netSize[3])));
    net.means = [];
    net.std = [];
  }else{
    net.wh1 = [];
    net.wh2 = [];
    net.wo = [];
    net.means = [];
    net.std = [];
  }
  return net;
}

export function loadNet(net){
  net.wh1 = convertToFloat32Matrix(JSON.parse(wh1));
  net.wh2 = convertToFloat32Matrix(JSON.parse(wh2));
  net.wo = convertToFloat32Matrix(JSON.parse(wo));
  net.means = JSON.parse(u);
  net.std = JSON.parse(s);
}

export function setNormalization(net,data){
  net.means = findMean(data);
  net.std = findSTD(data);
}

export function normalizeData(net,data){
  const rows = data.length;
  const cols = data[0].length;
  const retMat = createMatrix(rows,cols);
  for(let i = 0; i < rows; i++){
    for(let j = 0; j < cols+1; j++){//ignore bias
      if(j >= 1 && j <= net.means.length){
        retMat[i][j] = (data[i][j]-net.means[j-1])/net.std[j-1];
      }else{
        retMat[i][j] = data[i][j];
      }
    }
  }
  return retMat;
}

export function feedforward(net,data){
  let retMat = [];
  retMat = multiplyMatrices(data,net.wh1);
  retMat = applyFunctionToMatrix(retMat,relu);

  retMat = addOnesColToMatrix(retMat);
  retMat = multiplyMatrices(retMat,net.wh2);
  retMat = applyFunctionToMatrix(retMat,relu);

  retMat = addOnesColToMatrix(retMat);
  retMat = multiplyMatrices(retMat,net.wo);
  retMat = quickmax(retMat);

  return retMat;  
}

export function train(net,data,t,maxEpochs,alpha){
  const x = data;
  let z1; let h1; let z2; let h2; let z3; let y;
  let delta3; let dYdW3; let delta2; let dYdW2; let delta1; let dYdW1;
  for(let e = 0; e < maxEpochs; e++){
    z1 = multiplyMatrices(x,net.wh1); // 3x3 * 3x5 = 3x5
    h1 = applyFunctionToMatrix(z1,relu); // 3x5
    h1 = addOnesColToMatrix(h1); //3x6

    z2 = multiplyMatrices(h1,net.wh2); // 3x6 * 6x8 = 3x8 
    h2 = applyFunctionToMatrix(z2,relu); // 3x8
    h2 = addOnesColToMatrix(h2); // 3x9

    z3 = multiplyMatrices(h2,net.wo); // 3x9 * 9x2 = 3x2
    y = softmax(z3); // 3x2

    console.log("Iteration: " + (e+1) + ", MSE: " + calculateMSE(y,t));

    delta3 = subtractMatrices(y,t); //(y-t) or (y-t)*f'(y)
    dYdW3 = multiplyMatrices(matrixTranspose(h2),delta3); // h2'*delta3
    delta2 = elementMultiplyMatrices(multiplyMatrices(delta3,removeOnesColFromMatrix(matrixTranspose(net.wo))),applyFunctionToMatrix(removeOnesColFromMatrix(h2),drelu)); // (y-t)*w3'*f'(h2)
    dYdW2 = multiplyMatrices(matrixTranspose(h1),delta2); // h1'*delta2
    delta1 = elementMultiplyMatrices(multiplyMatrices(delta2,removeOnesColFromMatrix(matrixTranspose(net.wh2))),applyFunctionToMatrix(removeOnesColFromMatrix(h1),drelu)); // ((y-t)*w3'*f'(h2))*w2'*f'(h1)
    dYdW1 = multiplyMatrices(matrixTranspose(x),delta1); // x'*delta1;
    
    net.wo = subtractMatrices(net.wo,multiplyScalarMatrix(dYdW3,alpha/data.length)); //w3 = w3 - alpha/batchSize*dYdW3;
    net.wh2 = subtractMatrices(net.wh2,multiplyScalarMatrix(dYdW2,alpha/data.length)); //w2 = w2 - alpha/batchSize*dYdW2;
    net.wh1 = subtractMatrices(net.wh1,multiplyScalarMatrix(dYdW1,alpha/data.length)); //w1 = w2 - alpha/batchSize*dYdW1;
  }
}

//activation functions
function relu(x){
  return Math.max(0,x);
}

function drelu(x){
  return (x>0)*1;
}

function softmax(x){ //applies to entire vector
  const r = x.length;
  const c = x[0].length;
  const retMat = createMatrix(r,c);
  const rowSums = new Float32Array(c);
  const rowMax = new Float32Array(c);
  //find maximum of each row
  for(let i = 0; i < r; i++){ 
    for(let j = 0; j < c; j++){
      if(j === 0 || rowMax[i] < x[i][j]){
        rowMax[i] = x[i][j];
      }
    }
  }
  //find normalized row sum
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      rowSums[i] = rowSums[i] + Math.exp(x[i][j]-rowMax[i]);
    }
  }
  //find softmax
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      retMat[i][j] = Math.exp(x[i][j]-rowMax[i])/rowSums[i];
    }
  }
  return retMat;
}

function quickmax(x){
  const r = x.length;
  const c = x[0].length; 
  const retMat = createMatrix(r,c);
  const rowMax = new Float32Array(c);
  const rowMaxIndex = new Float32Array(c);
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      if(j === 0 || rowMax[i] < x[i][j]){
        rowMax[i] = x[i][j];
        rowMaxIndex[i] = j;
      }
    }
  }
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      if(j === rowMaxIndex[i]){
        retMat[i][j] = 1;
      }else{
        retMat[i][j] = 0;
      }
    }
  }
  return retMat;
}

function dSoftmax(x){ //applies to entire vector
  const r = x.length;
  const c = x[0].length;
  const retMat = createMatrix(r,c);
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      retMat[i][j] = x[i][j]*(1-x[i][j]);
    }
  }
  return retMat;
}

//matrix functions
function applyFunctionToMatrix(mat, f){
  const rows = mat.length; 
  const cols = mat[0].length;
  const retMat = createMatrix(rows,cols);
  for(let i = 0; i < rows; i++){
    for(let j = 0; j < cols; j++){
      retMat[i][j] = f(mat[i][j]);
    }  
  }
  return retMat;
}

function addOnesColToMatrix(mat){
  const rows = mat.length;
  const cols = mat[0].length;
  const retMat = createMatrix(rows,cols+1);
  for(let i = 0; i < cols+1; i++){
    for(let j = 0; j < rows; j++){
      if(i === 0){
        retMat[j][i] = 1;
      }else{
        retMat[j][i] = mat[j][i-1];
      }
    }
  }
  return retMat;
}

function removeOnesColFromMatrix(mat){
  const rows = mat.length;
  const cols = mat[0].length;
  const retMat = createMatrix(rows,cols-1);
  for(let i = 1; i < cols; i++){
    for(let j = 0; j < rows; j++){
      retMat[j][i-1] = mat[j][i];
    }
  }
  return retMat;
}

//statistics functions
function findSTD(data){
  const rows = data.length;
  const cols = data[0].length;
  const mean = findMean(data);
  const std = new Float32Array(cols);
  for(let i = 0; i < cols; i++){
    let colsum = 0;
    for(let j = 0; j < rows; j++){
      colsum = colsum + (data[j][i]-mean[i])*(data[j][i]-mean[i]);
    }
    std[i] = Math.sqrt(colsum/(rows-1));
  }
  return std;
}

function findMean(data){
  const rows = data.length;
  const cols = data[0].length;
  const mean = new Float32Array(cols);
  for(let i = 0; i < cols; i++){
    let colsum = 0;
    for(let j = 0; j < rows; j++){
      colsum = colsum + data[j][i];
    }
    mean[i] = colsum/rows;
  }
  return mean;
}

function calculateMSE(y,t){
  const r = y.length;
  const c = y[0].length;
  let ret = 0;
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      ret = ret + (y[i][j]-t[i][j])*(y[i][j]-t[i][j]); // (y-t)^2
    }
  }
  return ret/(r*c);
}

