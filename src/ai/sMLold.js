import {createMatrix, printMatrix, createRandMatrix, addScalarMatrix, multiplyMatrices, subtractMatrices, matrixSize, matrixTranspose,
multiplyScalarMatrix, elementMultiplyMatrices, reshapeToMatrix} from "ai/sBLAS";

const epochs = 100;
const batchSize = 3;
const alpha = 1;
const D = [[1,0,1],[1,1,0],[1,1,1]]; //3 data points, 2 inputs, 1 bias
const t = [[0,0],[1,1],[1,0]]; //3 data points, 2 outputs
let w1 = createRandMatrix(488,2000); //3x5
let w2 = createRandMatrix(2001,200); //6x8
let w3 = createRandMatrix(2001,10); //9x2

const mse = createMatrix(1,epochs);

export function feedforward(input){ //input should include bias already
  let retMat = [];

  retMat = input;
  retMat = multiplyMatrices(retMat,w1);
  retMat = applyFunctionToMatrix(retMat,logsig);

  retMat = addOnesColToMatrix(retMat);
  retMat = multiplyMatrices(retMat,w2);
  retMat = applyFunctionToMatrix(retMat,logsig);

  retMat = addOnesColToMatrix(retMat);
  retMat = multiplyMatrices(retMat,w3);
  retMat = applyFunctionToMatrix(retMat,logsig);

  return retMat;  
}

export function train(){
  const x = D;
  let z1;
  let h1;
  let z2;
  let h2;
  let z3;
  let y;
  let delta3;
  let dYdW3;
  let delta2;
  let dYdW2;
  let delta1;
  let dYdW1;
  for(let e = 0; e < epochs; e++){
    //feed forward
    z1 = multiplyMatrices(x,w1); // 3x3 * 3x5 = 3x5
    h1 = applyFunctionToMatrix(z1,logsig); // 3x5
    h1 = addOnesColToMatrix(h1); //3x6

    z2 = multiplyMatrices(h1,w2); // 3x6 * 6x8 = 3x8 
    h2 = applyFunctionToMatrix(z2,logsig); // 3x8
    h2 = addOnesColToMatrix(h2); // 3x9

    z3 = multiplyMatrices(h2,w3); // 3x9 * 9x2 = 3x2
    y = applyFunctionToMatrix(z3,logsig); // 3x2

    //basic statistics
    mse[0][e] = calculateMSE(y,t);
    
    //backprop
    delta3 = subtractMatrices(y,t); //(y-t) or (y-t)*f'(y)
    dYdW3 = multiplyMatrices(matrixTranspose(h2),delta3); // h2'*delta3
    delta2 = elementMultiplyMatrices(multiplyMatrices(delta3,removeOnesColFromMatrix(matrixTranspose(w3))),applyFunctionToMatrix(removeOnesColFromMatrix(h2),dlogsig)); // (y-t)*w3'*f'(h2)
    dYdW2 = multiplyMatrices(matrixTranspose(h1),delta2); // h1'*delta2
    delta1 = elementMultiplyMatrices(multiplyMatrices(delta2,removeOnesColFromMatrix(matrixTranspose(w2))),applyFunctionToMatrix(removeOnesColFromMatrix(h1),dlogsig)); // ((y-t)*w3'*f'(h2))*w2'*f'(h1)
    dYdW1 = multiplyMatrices(matrixTranspose(x),delta1); // x'*delta1;
    
    w3 = subtractMatrices(w3,multiplyScalarMatrix(dYdW3,alpha/batchSize)); //w3 = w3 - alpha/batchSize*dYdW3;
    w2 = subtractMatrices(w2,multiplyScalarMatrix(dYdW2,alpha/batchSize)); //w2 = w2 - alpha/batchSize*dYdW2;
    w1 = subtractMatrices(w1,multiplyScalarMatrix(dYdW1,alpha/batchSize)); //w1 = w2 - alpha/batchSize*dYdW1;
  }
}

export function initWeights(){
  
}

export function calculateMSE(y,t){
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

export function processData(inputData){
  
}

export function normalizeData(data){
  const rows = data.length;
  const cols = data[0].length;
  const mean = findMean(data);
  const std = findSTD(data);
  const retMat = createMatrix(rows,cols);
  for(let i = 0; i < rows; i++){
    for(let j = 0; j < cols; j++){
      retMat[i][j] = (data[i][j]-mean[j])/std[j]; 
    }
  }
  return retMat;
}

export function findSTD(data){
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

export function findMean(data){
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

export function logsig(x){
  return 1/(1+Math.exp(-x));
}

export function dlogsig(x){
  return x*(1-x);
}

export function tanh(x){
  return (Math.exp(x)-Math.exp(-x))/(Math.exp(x)+Math.exp(-x));
}

export function dtanh(x){
  return 1-x*x;
}

export function relu(x){
  return Math.max(0,x);
}

export function drelu(x){
  return (x>0)*1;
}

export function softmax(x){ //applies to entire vector
  const r = x.length;
  const c = x[0].length;
  const retMat = createMatrix(r,c);
  const rowSums = new Float32Array(c);
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      rowSums[i] = rowSums[i] + Math.exp(x[i][j]);
    }
  }
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      retMat[i][j] = Math.exp(x[i][j])/rowSums[i];
    }
  }
  return retMat;
}

export function dSoftmax(x){ //applies to entire vector
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

export function applyFunctionToMatrix(mat, f){
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

export function addOnesColToMatrix(mat){
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

export function removeOnesColFromMatrix(mat){
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

export function runMLBenchmarks(){
  // const x = 2*Math.random()-1;
  // console.log("x: " + x);
  // console.log("logsig(x): " + logsig(x));
  // console.log("dlogsig(x): " + dlogsig(logsig(x)));
  // console.log("tanh(x): " + tanh(x));
  // console.log("dtanh(x): " + dtanh(tanh(x)));
  // console.log("relu(x): " + relu(x));
  // console.log("drelu(x): " + drelu(relu(x)));
  // const y = [[1,2,3],[-1,-1,0],[-1,1,4]];
  // console.log(findSTD(y));
  // console.log(findMean(y));

  // const z = createRandMatrix(10,11);
  // const logz = applyFunctionToMatrix(z,logsig);
  // console.log(z);
  // console.log(logz);

  // const A = createRandMatrix(5,5);
  // const augA = addOnesColToMatrix(A);
  // console.log(A);
  // console.log(augA);
  
  // printMatrix(D);
  // printMatrix(t);
  // printMatrix(feedforward(D));
  // train();
  // printMatrix(mse);
  // printMatrix(feedforward(D));
  // console.log("");
  // printMatrix(reshapeToMatrix([1,-1,-1],1,3));
  // printMatrix(feedforward(reshapeToMatrix([1,-1,-1],1,3)));
  
  // const ivec = createRandMatrix(1,488);
  // const t0 = +new Date();
  // const ovec = feedforward(ivec);
  // const t1 = +new Date();
  // console.log(t1-t0);
}