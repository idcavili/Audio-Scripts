var Rms = require("rms");
var Ducker = require("ducker");

var inputs;
var groups;
var auxes;
var matrices;
var main;
var groupBuffer;
var auxBuffer;
var matrixBuffer;
var mainBuffer;
var monBuffer;
var lastInputCount = 0;
var lastGroupCount = 0;
var lastAuxCount = 0;
var lastMatrixCount = 0;

function onInit(){
  addParameter(["input", "count"]);
  setParameterType(["input", "count"], 0);
  setParameterRange(["input", "count"], 1, 128, 1, "");
  setParameterCallback(["input", "count"], changeInputCount);
  setParameterValue(["input", "count"], 8, true);
  
  addParameter(["group", "count"]);
  setParameterType(["group", "count"], 0);
  setParameterRange(["group", "count"], 1, 128, 1, "");
  setParameterCallback(["group", "count"], changeGroupCount);
  setParameterValue(["group", "count"], 8, true);
  
  addParameter(["aux", "count"]);
  setParameterType(["aux", "count"], 0);
  setParameterRange(["aux", "count"], 1, 128, 1, "");
  setParameterCallback(["aux", "count"], changeAuxCount);
  setParameterValue(["aux", "count"], 8, true);
  
  addParameter(["matrix", "count"]);
  setParameterType(["matrix", "count"], 0);
  setParameterRange(["matrix", "count"], 1, 128, 1, "");
  setParameterCallback(["matrix", "count"], changeMatrixCount);
  setParameterValue(["matrix", "count"], 8, true);
  
  addInput(["tb");
  addOutput(["mon", "l"]);
  addOutput(["mon", "r"]);
}

function changeInputCount(path, value){
  if(value > this.lastInputCount){
    for(i=this.lastInputCount + 1;i<=value;i++){
      addInput(i);
    }
  }else{
    for(i=this.lastInputCount;i>value;i--){
      removeInput(i);
    }
  }
  this.lastInputCount = value;
}
function changeGroupCount(path, value){
  if(value > this.lastGroupCount){
    for(i=this.lastGroupCount + 1;i<=value;i++){
      addGroup(i);
    }
  }else{
    for(i=this.lastGroupCount;i>value;i--){
      removeGroup(i);
    }
  }
  this.lastGroupCount = value;
}
function changeAuxCount(path, value){
  if(value > lastAuxCount){
    for(i=lastAuxCount + 1;i<=value;i++){
      addAux(i);
    }
  }else{
    for(i=lastAuxCount;i>value;i--){
      removeAux(i);
    }
  }
  lastAuxCount = value;
}
function changeMatrixCount(path, value){
  if(value > lastMatrixCount){
    for(i=lastMatrixCount + 1;i<=value;i++){
      addMatrix(i);
    }
  }else{
    for(i=lastMatrixCount;i>value;i--){
      removeMatrix(i);
    }
  }
  lastMatrixCount = value;
}
