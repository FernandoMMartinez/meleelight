/* eslint-disable */

export function createMatrix(r,c){
  const retMat = new Array(r);
  for(let i = 0; i < r; i++){
    retMat[i] = new Float32Array(c);
  }
  return retMat;
}

export function onesMatrix(r,c){
  const retMat = new Array(r);
  for(let i = 0; i < r; i++){
    retMat[i] = new Float32Array(c);
    for(let j = 0; j < c; j++){
      retMat[i][j] = 1;
    }
  }
  return retMat;
}

export function zerosMatrix(r,c){
  const retMat = new Array(r);
  for(let i = 0; i < r; i++){
    retMat[i] = new Float32Array(c);
    for(let j = 0; j < c; j++){
      retMat[i][j] = 0;
    }
  }
  return retMat;
}

export function createRandMatrix(r,c){
  const retMat = new Array(r);
  for(let i = 0; i < r; i++){
    retMat[i] = new Float32Array(c);
    for(let j = 0; j < c; j++){
      retMat[i][j] = 2*Math.random()-1;
    }
  }
  return retMat;
}

export function addScalarMatrix(m,s){
  const r = m.length;
  const c = m[0].length;
  const retMat = createMatrix(r,c);
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      retMat[i][j] = m[i][j] + s;
    }
  }
  return retMat;
}

export function multiplyScalarMatrix(m,s){
  const r = m.length;
  const c = m[0].length;
  const retMat = createMatrix(r,c);
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      retMat[i][j] = m[i][j]*s;
    }
  }
  return retMat;
}

export function addMatrices(m1,m2){
  const r = m1.length;
  const c = m1[0].length;
  const retMat = createMatrix(r,c);
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      retMat[i][j] = m1[i][j] + m2[i][j];
    }
  }
  return retMat;
}

export function subtractMatrices(m1,m2){
  const r = m1.length;
  const c = m1[0].length;
  const retMat = createMatrix(r,c);
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      retMat[i][j] = m1[i][j] - m2[i][j];
    }
  }
  return retMat;
}

export function elementMultiplyMatrices(m1,m2){
  const r = m1.length;
  const c = m1[0].length;
  const retMat = createMatrix(r,c);
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      retMat[i][j] = m1[i][j]*m2[i][j];
    }
  }
  return retMat;
}

export function multiplyMatrices(m1,m2){
  let a = m1.length;
  let b = m2.length;
  let c = m2[0].length; // (axb) * (bxc) = (axc)
  let retMat = createMatrix(a,c);
  for(let i = 0; i < a; i++){
    for(let k = 0; k < c; k++){
      let rcsum = 0;
      for(let j = 0; j < b; j++){
        rcsum = rcsum + m1[i][j]*m2[j][k];
      }
      retMat[i][k] = rcsum;
    }
  }
  return retMat;
}

export function matrixSize(m){
  const matSize = new Float32Array(2);
  matSize[0] = m.length;
  matSize[1] = m[0].length;
  return matSize;
}

export function matrixMin(m){
  let minVal = m[0][0];
  for(let i = 0; i < m.length; i++){
    for(let j = 0; j < m[0].length; j++){
      if(m[i][j] < minVal){
        minVal = m[i][j];
      }
    }
  }
  return minVal;
}

export function matrixMax(m){
  let maxVal = m[0][0];
  for(let i = 0; i < m.length; i++){
    for(let j = 0; j < m[0].length; j++){
      if(m[i][j] > maxVal){
        maxVal = m[i][j];
      }
    }
  }
  return maxVal;
}

export function matrixTranspose(m){
  const r = m.length;
  const c = m[0].length; 
  const retMat = createMatrix(c,r);
  for(let i = 0; i < c; i++){
    for(let j = 0; j < r; j++){
      retMat[i][j] = m[j][i];
    }
  }
  return retMat;
}

export function reshapeToMatrix(array,r,c){
  let arrayIndex = 0;
  const retMat = createMatrix(r,c);
  for(let i = 0; i < r; i++){
    for(let j = 0; j < c; j++){
      retMat[i][j] = array[arrayIndex];
      arrayIndex = arrayIndex + 1;
    }
  }
  return retMat;
}

export function printMatrix(m){
  const r = m.length;
  const c = m[0].length;
  for(let i = 0; i < r; i++){
    let outputString = "";
    for(let j = 0; j < c; j++){
      if(m[i][j] >= 0){
        outputString = outputString + m[i][j].toFixed(3) + ", ";
      }else{
        outputString = outputString + m[i][j].toFixed(2) + ", ";
      }
    }
    console.log(outputString);
  }
  console.log("");
}

export function runBLASTests(){
  const vec1 = createMatrix(8,1);
  const vec2 = createMatrix(1,8);
  const vec3 = zerosMatrix(5,1);
  const vec4 = onesMatrix(1,5);
  const vec5 = createRandMatrix(3,1);

  const mat1 = createMatrix(4,3); 
  const mat2 = onesMatrix(4,3);
  const mat3 = zerosMatrix(4,3);
  const mat4 = createRandMatrix(3,4);
  const mat5 = addScalarMatrix(mat3,2.5);
  const mat6 = multiplyScalarMatrix(mat2,3);
  const mat7 = addMatrices(mat5,mat2);
  const mat8 = subtractMatrices(mat5,mat2);
  const mat9 = multiplyMatrices(mat2,mat4);
  const mat10 = matrixTranspose(mat4);
  const mat11 = reshapeToMatrix([1,2,3,4,5,6],2,3);
  
  const matSize = matrixSize(mat9);

  const scalar1 = matrixMin(mat4);
  const scalar2 = matrixMax(mat4);

  console.log("Vector Operations");
  console.log(vec1);
  console.log(vec2);
  console.log(vec3);
  console.log(vec4);
  console.log(vec5);
  console.log("Matrix Operations");
  console.log(mat1);
  console.log(mat2);
  console.log(mat3);
  console.log(mat4);
  console.log(mat5);
  console.log(mat6);
  console.log(mat7);
  console.log(mat8);
  console.log(mat9);
  console.log(mat10);
  console.log(mat11);
  console.log("Matrix Size");
  console.log(matSize);
  console.log("Min/Max Vector/Matrix");
  console.log(scalar1);
  console.log(scalar2);

  const mat13 = [[1,2],[3,4]];
  const mat14 = [[1,2,3],[4,5,6]];
  printMatrix(mat13);
  printMatrix(mat14);
  printMatrix(multiplyMatrices(mat13,mat14));
}

export function runBLASBenchmarks(){
  const mat1 = createRandMatrix(2,226+38); //input
  const mat2 = createRandMatrix(226+38,1000);
  const mat3 = createRandMatrix(1000,700);
  const mat4 = createRandMatrix(700,300);
  const mat5 = createRandMatrix(300,100);
  const mat6 = createRandMatrix(100,10);
  let result = [];

  const t0 = +new Date();
  result = multiplyMatrices(mat1,mat2);
  result = multiplyMatrices(result,mat3);
  result = multiplyMatrices(result,mat4);
  result = multiplyMatrices(result,mat5);
  result = multiplyMatrices(result,mat6);
  const t1 = +new Date();
  console.log("Total Time: " + (t1-t0));
  console.log(result);
}






// Computes the inverse of a 2x2 matrix.
export function inverseMatrix([
  [x1, x2],
  [y1, y2]
]) {
  let det = x1 * y2 - x2 * y1;
  if (Math.abs(det) < 0.00001) {
    return "error in inverseMatrix: determinant too small";
  } else {
    return [
      [y2 / det, -x2 / det],
      [-y1 / det, x1 / det]
    ];
  }
};

// Multiplication Av (A a 2x2 matrix, v a 2x1 column vector)
// Return type: [xnew,ynew]
export function multMatVect([
  [x1, x2],
  [y1, y2]
], [x, y]) {
  return [x1 * x + x2 * y, y1 * x + y2 * y];
};


