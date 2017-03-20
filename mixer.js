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
  addCh("main", 0);
  
  
}

function changeInputCount(path, value){
  if(value > lastInputCount){
    for(i=lastInputCount + 1;i<=value;i++){
      addCh("input", i);
    }
  }else{
    for(i=lastInputCount;i>value;i--){
      removeCh("input", i);
    }
  }
  lastInputCount = value;
}
function changeGroupCount(path, value){
  if(value > lastGroupCount){
    for(i=lastGroupCount + 1;i<=value;i++){
      addCh("group", i);
    }
  }else{
    for(i=lastGroupCount;i>value;i--){
      removeCh("group", i);
    }
  }
  lastGroupCount = value;
}
function changeAuxCount(path, value){
  if(value > lastAuxCount){
    for(i=lastAuxCount + 1;i<=value;i++){
      addCh("aux", i);
    }
  }else{
    for(i=lastAuxCount;i>value;i--){
      removeCh("aux", i);
    }
  }
  lastAuxCount = value;
}
function changeMatrixCount(path, value){
  if(value > lastMatrixCount){
    for(i=lastMatrixCount + 1;i<=value;i++){
      addCh("matrix", i);
    }
  }else{
    for(i=lastMatrixCount;i>value;i--){
      removeCh("matrix", i);
    }
  }
  lastMatrixCount = value;
}
function addCh(type, n){
  var path;
  path[0] = type;
  var idx = (type == "main")?1:2;
  if(type != "main"){
    path[1] = n;
  }
  if(type == "input"){
    path[idx] = "in"
  }else{
    path[idx] = "subin"
  }
  path[idx + 1] = "l"
  addInput(path);
  path[idx + 1] = "r"
  addInput(path);
  path[idx] = "insert";
  path[idx + 1] = "send";
  path[idx + 2] = "l";
  addOutput(path);
  path[idx + 2] = "r";
  addOutput(path);
  path[idx + 1] = "return";
  path[idx + 2] = "l";
  addInput(path);
  path[idx + 2] = "r";
  addInput(path);
  if(type != input){
    path[idx] = "out"
    path[idx + 1] = "l"
    addOutput(path);
    path[idx + 1] = "r"
    addOutput(path);
  }
  path[idx] = "name";
  addParamater(path);
  setParameterType(path, 2);
  switch(type){
    case "input":
      setParameterValue(path, "Input " + n, true);
      break;
    case "group":
      setParameterValue(path, "Group " + n, true);
      break;
    case "aux":
      setParameterValue(path, "Aux " + n, true);
      break;
    case "matrix":
      setParameterValue(path, "Matrix " + n, true);
      break;
    case "main":
      setParameterValue(path, "Main", true);
      break;
    }
  
  path[idx] = "vol";
  path[idx + 1] = "val";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, -inf, 20, 0.1, "dB");
  setParameterCallback(path, new function(path, value){
    channel.path[0].path[1].vol.target = Math.pow(10, value / 20);
    channel.path[0].path[1].vol.rate = (inputs.n.vol.target - inputs.n.vol.current) / (getParameter(["input", "n", "vol", "time"]) * system.fs);
  });
  setParameterValue(path, 0, true);
  
  path[idx + 1] = "imm";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, -inf, 20, 0.1, "dB");
  setParameterCallback(path, new function(path, value){
    channel.path[0].path[1].vol.current = Math.pow(10, value / 20);
    channel.path[0].path[1].vol.target = inputs.n.vol.target;
  });
  setParameterValue(path, 0, true);
  removeFromState(path, true);
  
  path[idx + 1] = "time"
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, 0, 20, 0.01, "s");
  setParameterCallback(path, new function(path, value){
    channel.path[0].path[1].rate = (inputs.n.vol.target - inputs.n.vol.current) / (getParameter(["input", "n", "vol", "time"]) * system.fs);
  });
  setParameterValue(path, 0, true);
  
  path.length = idx + 1;
  path[idx] = "pan";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, 0, 1, 0.01, "");
  setParameterValue(path, 0.5, true);
  
  path[idx] = "width";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, 0, 1, 0.01, "");
  setParameterValue(path, 0.5, true);
  
  path[idx] = "mute";
  addParameter(path);
  setParameterType(path, 1);
  setParameterStates(path, [0, 1], ["Unmuted", "Muted"]);
  setParameterValue(path, 0, true);
  
  if(type != main){
    path[idx] = "solo";
    addParameter(path);
    setParameterType(path, 1);
    setParameterStates(path, [0, 1], ["Off", "On"]);
    setParameterValue(path, 0, true);
  
    path[idx] = "safe";
    addParameter(path);
    setParameterType(path, 1);
    setParameterStates(path, [0, 1], ["Off", "On"]);
    setParameterValue(path, 0, true);
  }
  
  path[idx] = "insert";
  addParameter(path);
  setParameterType(path, 1);
  setParameterStates(path, [0, 1], ["Off", "On"]);
  setParameterValue(path, 0, true);
  
  if(type == "input"){
    path[idx] = "mono";
    addParameter(path);
    setParameterType(path, 1);
    setParameterStates(path, [0, 1], ["Off", "On"]);
    setParameterValue(path, 0, true);
    
    path[idx] = "phase";
    path[idx + 1] = "l";
    addParameter(path);
    setParameterType(path, 1);
    setParameterStates(path, [0, 1], ["Normal", "Reverse"]);
    setParameterValue(path, 0, true);
  
    path[idx + 1] = "r";
    addParameter(path);
    setParameterType(path, 1);
    setParameterStates(path, [0, 1], ["Normal", "Reverse"]);
    setParameterValue(path, 0, true);
    path.length = idx + 1;
  }
  if(type != "main" && type != "matrix"){
    path[idx] = "main";
    addParameter(path);
    setParameterType(path, 1);
    setParameterStates(path, [0, 1], ["Off", "On"]);
    setParameterValue(path, 0, true);
  }
  
  path[idx] = "pfl";
  addParameter(path);
  setParameterType(path, 1);
  setParameterStates(path, [0, 1], ["Off", "On"]);
  setParameterValue(path, 0, true);
  if(type == "main"){
    path[idx] = "mon";
  }else{
    path[idx] = "afl";
  }
  addParameter(path);
  setParameterType(path, 1);
  setParameterStates(path, [0, 1], ["Off", "On"]);
  setParameterValue(path, 0, true);
  
  path[idx] = "rms";
  path[idx + 1] = "pre";
  path[idx + 2] = "l";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, -inf, 20, 0.1, "dB");
  setParameterReadOnly(path, true);
  setParameterValue(path, -inf, true);
  
  path[idx + 2] = "r";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, -inf, 20, 0.1, "dB");
  setParameterReadOnly(path, true);
  setParameterValue(path, -inf, true);
  
  path[idx + 1] = "post";
  path[idx + 2] = "l";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, -inf, 20, 0.1, "dB");
  setParameterReadOnly(path, true);
  setParameterValue(path, -inf, true);
  
  path[idx + 2] = "r";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, -inf, 20, 0.1, "dB");
  setParameterReadOnly(path, true);
  setParameterValue(path, -inf, true);
  path.length = idx + 1;
  
  if(type == "input"){
    path[idx] = "group";
    for(i=1;i<=getParameter(["group", "count"]);i++){
      path[idx + 1] = i;
      addParameter(path);
      setParameterType(path, 1);
      setParameterStates(path, [0, 1], ["Off", "On"]);
      setParameterValue(path, 0, true);
    }
  }
  path.length = idx + 1;
  if(type == "input"){
    for(i=1;i<=getParameter(["aux","count"]);i++){
      addSend("input", n, "aux", i);
    }
  }
  if(type == "group"){
    for(i=1;i<=getParameter(["input", "count"]);i++){
      addParameter(["input", n, "group", i]);
      setParameterType(["input", n, "group", i], 1);
      setParameterStates(["input", n, "group", i], [0, 1], ["Off", "On"]);
      setParameterValue(["input", n, "group", i], 0, true);
    }
  }
  
    
    channel.path[0].path[1].rms.pre[0] = new Rms();
    channel.path[0].path[1].rms.pre[1] = new Rms();
    channel.path[0].path[1].rms.post[0] = new Rms();
    channel.path[0].path[1].rms.post[1] = new Rms():
    channel.path[0].path[1].rms.pre[0].setWindowSize(0.3);
    channel.path[0].path[1].rms.pre[1].setWindowSize(0.3);
    channel.path[0].path[1].rms.post[0].setWindowSize(0.3);
    channel.path[0].path[1].rms.post[1].setWindowSize(0.3);
  }                       
}
