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
  
  addParameter(["main", "vol", "val"]);
  setParameterType(["main", "vol", "val"], 0);
  setParameterRange(["main", "vol", "val"], -inf, 20, 0.1, "dB");
  setParameterCallback(["main", "vol", "val"], new function(path, value){
    inputs.n.vol.target = Math.pow(10, value / 20);
    inputs.n.vol.rate = (inputs.n.vol.target - inputs.n.vol.current) / (getParameter(["input", "n", "vol", "time"]) * system.fs);
  });
  setParameterValue(["main", "vol", "val"], 0, true);
  
  addParameter(["main", "vol", "imm"]);
  setParameterType(["main", "vol", "imm"], 0);
  setParameterRange(["main", "vol", "imm"], -inf, 20, 0.1, "dB");
  setParameterCallback(["main", "vol", "imm"], new function(path, value){
    inputs.n.vol.current = Math.pow(10, value / 20);
    inputs.n.vol.target = inputs.n.vol.target;
  });
  setParameterValue(["main", "vol", "imm"], 0, true);
  removeFromState(["main", "imm"], true);
  
  addParameter(["main", "vol", "time"]);
  setParameterType(["main", "vol", "time"], 0);
  setParameterRange(["main", "vol", "time"], 0, 20, 0.01, "s");
  setParameterCallback(["main", "vol", "time"], new function(path, value){
    inputs.n.vol.rate = (inputs.n.vol.target - inputs.n.vol.current) / (getParameter(["input", "n", "vol", "time"]) * system.fs);
  });
  setParameterValue(["main", "vol", "time"], 0, true);
  
  addParameter(["main", "pan"]);
  setParameterType(["main", "pan"], 0);
  setParameterRange(["main", "pan"], 0, 1, 0.01, "");
  setParameterValue(["main", "pan"], 0.5, true);
  
  addParameter(["main", "width"]);
  setParameterType(["main", "width"], 0);
  setParameterRange(["main", "width"], 0, 1, 0.01, "");
  setParameterValue(["main", "width"], 0.5, true);
  
  addParameter(["main", "mute"]);
  setParameterType(["main", "mute"], 1);
  setParameterStates(["main", "mute"], [0, 1], ["Unmuted", "Muted"]);
  setParameterValue(["main", "mute"], 0, true);
  
  addParameter(["main", "insert"]);
  setParameterType(["main", "insert"], 1);
  setParameterStates(["main", "insert"], [0, 1], ["Off", "On"]);
  setParameterValue(["main", "insert"], 0, true);
  
  addInput(["tb");
  addOutput(["mon", "l"]);
  addOutput(["mon", "r"]);
  
  
}

function changeInputCount(path, value){
  if(value > lastInputCount){
    for(i=lastInputCount + 1;i<=value;i++){
      addInput(i);
    }
  }else{
    for(i=lastInputCount;i>value;i--){
      removeInput(i);
    }
  }
  lastInputCount = value;
}
function changeGroupCount(path, value){
  if(value > lastGroupCount){
    for(i=lastGroupCount + 1;i<=value;i++){
      addGroup(i);
    }
  }else{
    for(i=lastGroupCount;i>value;i--){
      removeGroup(i);
    }
  }
  lastGroupCount = value;
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
function addInput(n){
  addInput(["input", "n", "in", "l"]);
  addInput(["input", "n", "in", "r"]);
  addOutput(["input", "n", "insert", "send", "l"]);
  addOutput(["input", "n", "insert", "send", "r"]);
  addInput(["input", "n", "insert", "return","l"]);
  addInput(["input", "n", "insert", "return","r"]);
  
  addParamater(["input", "n", "name"]);
  setParameterType(["input", "n", "name"], 2);
  setParameterValue(["input", "n", "name"], "Input " + n);
  
  addParameter(["input", "n", "vol", "val"]);
  setParameterType(["input", "n", "vol", "val"], 0);
  setParameterRange(["input", "n", "vol", "val"], -inf, 20, 0.1, "dB");
  setParameterCallback(["input", "n", "vol", "val"], new function(path, value){
    inputs.n.vol.target = Math.pow(10, value / 20);
    inputs.n.vol.rate = (inputs.n.vol.target - inputs.n.vol.current) / (getParameter(["input", "n", "vol", "time"]) * system.fs);
  });
  setParameterValue(["input", "n", "vol", "val"], 0, true);
  
  addParameter(["input", "n", "vol", "imm"]);
  setParameterType(["input", "n", "vol", "imm"], 0);
  setParameterRange(["input", "n", "vol", "imm"], -inf, 20, 0.1, "dB");
  setParameterCallback(["input", "n", "vol", "imm"], new function(path, value){
    inputs.n.vol.current = Math.pow(10, value / 20);
    inputs.n.vol.target = inputs.n.vol.target;
  });
  setParameterValue(["input", "n", "vol", "imm"], 0, true);
  removeFromState(["input", "n", "vol", "imm"], true);
  
  addParameter(["input", "n", "vol", "time"]);
  setParameterType(["input", "n", "vol", "time"], 0);
  setParameterRange(["input", "n", "vol", "time"], 0, 20, 0.01, "s");
  setParameterCallback(["input", "n", "vol", "time"], new function(path, value){
    inputs.n.vol.rate = (inputs.n.vol.target - inputs.n.vol.current) / (getParameter(["input", "n", "vol", "time"]) * system.fs);
  });
  setParameterValue(["input", "n", "vol", "time"], 0, true);
  
  addParameter(["input", "n", "pan"]);
  setParameterType(["input", "n", "pan"], 0);
  setParameterRange(["input", "n", "pan"], 0, 1, 0.01, "");
  setParameterValue(["input", "n", "pan"], 0.5, true);
  
  addParameter(["input", "n", "width"]);
  setParameterType(["input", "n", "width"], 0);
  setParameterRange(["input", "n", "width"], 0, 1, 0.01, "");
  setParameterValue(["input", "n", "width"], 0.5, true);
  
  addParameter(["input", "n", "mute"]);
  setParameterType(["input", "n", "mute"], 1);
  setParameterStates(["input", "n", "mute"], [0, 1], ["Unmuted", "Muted"]);
  setParameterValue(["input", "n", "mute"], 0, true);
  
  addParameter(["input", "n", "solo"]);
  setParameterType(["input", "n", "solo"], 1);
  setParameterStates(["input", "n", "solo"], [0, 1], ["Off", "On"]);
  setParameterValue(["input", "n", "solo"], 0, true);
  
  addParameter(["input", "n", "safe"]);
  setParameterType(["input", "n", "safe"], 1);
  setParameterStates(["input", "n", "safe"], [0, 1], ["Off", "On"]);
  setParameterValue(["input", "n", "safe"], 0, true);
  
  addParameter(["input", "n", "insert"]);
  setParameterType(["input", "n", "insert"], 1);
  setParameterStates(["input", "n", "insert"], [0, 1], ["Off", "On"]);
  setParameterValue(["input", "n", "insert"], 0, true);
  
  addParameter(["input", "n", "mono"]);
  setParameterType(["input", "n", "mono"], 1);
  setParameterStates(["input", "n", "mono"], [0, 1], ["Off", "On"]);
  setParameterValue(["input", "n", "mono"], 0, true);
  
  addParameter(["input", "n", "main"]);
  setParameterType(["input", "n", "main"], 1);
  setParameterStates(["input", "n", "main"], [0, 1], ["Off", "On"]);
  setParameterValue(["input", "n", "main"], 0, true);
  
  addParameter(["input", "n", "phase", "l"]);
  setParameterType(["input", "n", "phase", "l"], 1);
  setParameterStates(["input", "n", "phase", "l"], [0, 1], ["Normal", "Reverse"]);
  setParameterValue(["input", "n", "phase", "l"], 0, true);
  
  addParameter(["input", "n", "phase", "r"]);
  setParameterType(["input", "n", "phase", "r"], 1);
  setParameterStates(["input", "n", "phase", "r"], [0, 1], ["Normal", "Reverse"]);
  setParameterValue(["input", "n", "phase", "r"], 0, true);
  
  addParameter(["input", "n", "pfl"]);
  setParameterType(["input", "n", "pfl"], 1);
  setParameterStates(["input", "n", "pfl"], [0, 1], ["Off", "On"]);
  setParameterValue(["input", "n", "pfl"], 0, true);
  
  addParameter(["input", "n", "afl"]);
  setParameterType(["input", "n", "afl"], 1);
  setParameterStates(["input", "n", "afl"], [0, 1], ["Off", "On"]);
  setParameterValue(["input", "n", "afl"], 0, true);
  
  addParameter(["input", "n", "rms", "pre", "l"]);
  setParameterType(["input", "n", "rms", "pre", "l"], 0);
  setParameterRange(["input", "n", "rms", "pre", "l"], -inf, 20, 0.1, "dB");
  setParameterReadOnly(["input", "n", "rms", "pre", "l"], true);
  setParameterValue(["input", "n", "rms", "pre", "l"], -inf, true);
  
  addParameter(["input", "n", "rms", "pre", "r"]);
  setParameterType(["input", "n", "rms", "pre", "r"], 0);
  setParameterRange(["input", "n", "rms", "pre", "r"], -inf, 20, 0.1, "dB");
  setParameterReadOnly(["input", "n", "rms", "pre", "r"], true);
  setParameterValue(["input", "n", "rms", "pre", "r"], -inf, true);
  
  addParameter(["input", "n", "rms", "post", "l"]);
  setParameterType(["input", "n", "rms", "post", "l"], 0);
  setParameterRange(["input", "n", "rms", "post", "l"], -inf, 20, 0.1, "dB");
  setParameterReadOnly(["input", "n", "rms", "post", "l"], true);
  setParameterValue(["input", "n", "rms", "post", "l"], -inf, true);
  
  addParameter(["input", "n", "rms", "post", "r"]);
  setParameterType(["input", "n", "rms", "post", "r"], 0);
  setParameterRange(["input", "n", "rms", "post", "r"], -inf, 20, 0.1, "dB");
  setParameterReadOnly(["input", "n", "rms", "post", "r"], true);
  setParameterValue(["input", "n", "rms", "post", "r"], -inf, true);
  
  for(i=1;i<=getParameter(["group", "count"]);i++){
    addParameter(["input", "n", "group", i]);
  }
  
  for(i=1;i<=getParameter(["aux","count"]);i++){
    addParameter(["input", "n", "aux", i, "vol"]);
    setParameterType(["input", "n", "aux", i, "vol"], 0);
    setParameterRange(["input", "n", "aux", i, "vol"], -inf, 20, 0.1, "dB");
    setParameterCallback(["input", "n", "aux", i, "vol"], new function(path, value){
      inputs.n.aux.i.vol = Math.pow(10, value / 20);
    });
    setParameterValue(["input", "n", "aux", i, "vol"], 0, true);
    
    addParameter(["input", "n", "aux", i, "pan"]);
    setParameterType(["input", "n", "aux", i, "pan"], 0);
    setParameterRange(["input", "n", "aux", i, "pan"], 0, 1, 0.1, "");
    setParameterValue(["input", "n", "aux", i, "pan"], 0, true);
    
    addParameter(["input", "n", "aux", i, "width"]);
    setParameterType(["input", "n", "aux", i, "width"], 0);
    setParameterRange(["input", "n", "aux", i, "width"], 0, 1, 0.1, "");
    setParameterValue(["input", "n", "aux", i, "width"], 0, true);
    
    addParameter(["input", "n", "aux", i, "mute"]);
    setParameterType(["input", "n", "aux", i, "mute"], 1);
    setParameterStates(["input", "n", "aux", i, "mute"], [0, 1], ["Unmuted", "Muted"]);
    setParameterValue(["input", "n", "aux", i, "mute"], 0, true);
    
    addParameter(["input", "n", "aux", i, "pos"]);
    setParameterType(["input", "n", "aux", i, "pos"], 1);
    setParameterStates(["input", "n", "aux", i, "pos"], [0, 1, 2], ["Pre-Insert", "Pre-Fader", "Post-Fader"]);
    setParameterValue(["input", "n", "aux", i, "pos"], 2, true);
    
    addParameter(["input", "n", "aux", i, "premute"]);
    setParameterType(["input", "n", "aux", i, "premute"], 1);
    setParameterStates(["input", "n", "aux", i, "premute"], [0, 1], ["No", "Yes"]);
    setParameterValue(["input", "n", "aux", i, "premute"], 0, true);
  }
  for(i=1;i<=getParameter(["matrix","count"]);i++){
    addParameter(["input", "n", "matrix", i, "vol"]);
    setParameterType(["input", "n", "matrix", i, "vol"], 0);
    setParameterRange(["input", "n", "matrix", i, "vol"], -inf, 20, 0.1, "dB");
    setParameterCallback(["input", "n", "matrix", i, "vol"], new function(path, value){
      inputs.n.aux.i.vol = Math.pow(10, value / 20);
    });
    setParameterValue(["input", "n", "matrix", i, "vol"], 0, true);
    
    addParameter(["input", "n", "matrix", i, "pan"]);
    setParameterType(["input", "n", "matrix", i, "pan"], 0);
    setParameterRange(["input", "n", "matrix", i, "pan"], 0, 1, 0.1, "");
    setParameterValue(["input", "n", "matrix", i, "pan"], 0, true);
    
    addParameter(["input", "n", "matrix", i, "width"]);
    setParameterType(["input", "n", "matrix", i, "width"], 0);
    setParameterRange(["input", "n", "matrix", i, "width"], 0, 1, 0.1, "");
    setParameterValue(["input", "n", "matrix", i, "width"], 0, true);
    
    addParameter(["input", "n", "matrix", i, "mute"]);
    setParameterType(["input", "n", "matrix", i, "mute"], 1);
    setParameterStates(["input", "n", "matrix", i, "mute"], [0, 1], ["Unmuted", "Muted"]);
    setParameterValue(["input", "n", "matrix", i, "mute"], 0, true);
    
    addParameter(["input", "n", "matrix", i, "pos"]);
    setParameterType(["input", "n", "matrix", i, "pos"], 1);
    setParameterStates(["input", "n", "matrix", i, "pos"], [0, 1, 2], ["Pre-Insert", "Pre-Fader", "Post-Fader"]);
    setParameterValue(["input", "n", "matrix", i, "pos"], 2, true);
    
    addParameter(["input", "n", "matrix", i, "premute"]);
    setParameterType(["input", "n", "matrix", i, "premute"], 1);
    setParameterStates(["input", "n", "matrix", i, "premute"], [0, 1], ["No", "Yes"]);
    setParameterValue(["input", "n", "matrix", i, "premute"], 0, true);
    
    inputs.i.rms.pre[0] = new Rms();
    inputs.i.rms.pre[1] = new Rms();
    inputs.i.rms.post[0] = new Rms();
    inputs.i.rms.post[1] = new Rms():
    rms.pre[0].setWindowSize(0.3);
    rms.pre[1].setWindowSize(0.3);
    rms.post[0].setWindowSize(0.3);
    rms.post[1].setWindowSize(0.3);
  }                       
}
