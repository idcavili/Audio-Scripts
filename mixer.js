var Rms = require("rms");
var Ducker = require("ducker");

var channel;
var solo = {
  "input":0,
  "group":0,
  "aux":0,
  "matrix":0
}
var listen = 0;
var groupBuffer;
var auxBuffer;
var matrixBuffer;
var mainBuffer;
var monBuffer;
var inputSoloed = 0;
var groupSoloed = 0;
var auxSoloed = 0;
var matrixSoloed = 0;
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
    path[idx] = "in";
  }else{
    path[idx] = "subin";
  }
  path[idx + 1] = "l";
  addInput(path);
  path[idx + 1] = "r";
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
    path[idx] = "out";
    path[idx + 1] = "l";
    addOutput(path);
    path[idx + 1] = "r";
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
    setParameterCallback(path, new function(path, value){
      if(value == 1){
        solo.path[0]++;
      }else{
        solo.path[0]--;
      }
    });
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
  setParameterCallback(path, new function(path, value){
    if(value == 1 && getParameter([path[0], path[1], "afl"]) == 1){
       setParameterValue([path[0], path[1], "afl"], 0, false);
    }else{
      listen++;
    }
    if(value == 0){
      listen--;
    }
  });
  setParameterValue(path, 0, true);
  if(type == "main"){
    path[idx] = "mon";
  }else{
    path[idx] = "afl";
  }
  addParameter(path);
  setParameterType(path, 1);
  setParameterStates(path, [0, 1], ["Off", "On"]);
  if(type != "main"){
    setParameterCallback(path, new function(path, value){
    if(value == 1 && getParameter([path[0], path[1], "pfl"]) == 1){
       setParameterValue([path[0], path[1], "pfl"], 0, false);
    }else{
      listen++;
    }
    if(value == 0){
      listen--;
    }
  });
  }
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
      path.length = idx + 1;
      for(i=1;i<=getParameter(["aux","count"]);i++){
        addSend("input", n, "aux", i);
      }
    }
  }
 
  if(type == "group"){
    for(i=1;i<=getParameter(["input", "count"]);i++){
      addParameter(["input", i, "group", n]);
      setParameterType(["input", i, "group", n], 1);
      setParameterStates(["input", i, "group", n], [0, 1], ["Off", "On"]);
      setParameterValue(["input", i, "group", n], 0, true);
    }
  }
  if(type == "aux"){
    for(i=1;i<=getParameter(["input", "count"]);i++){
      addSend(["input", i, "aux", n]);
    }
  }
  if(type == "matrix"){
      for(i=1;i<=getParameter(["input", "count"]);i++){
        addSend(["input", i, "matrix", n]);
      }
      for(i=1;i<=getParameter(["group", "count"]);i++){
        addSend(["group", i, "matrix", n]);
      }
      for(i=1;i<=getParameter(["aux", "count"]);i++){
        addSend(["aux", i, "matrix", n]);
      }
      addSend("main", 0, "matrix", n);
  }
  if(type != "matrix"){
    for(i=0;i<=getParameter(["matrix", "count"]){
        addSend(type, n, "matrix", i);
    }
  }
if(type != "input"){
  channel.type.n.ducker = new Ducker();
  path[idx] = "tb";
  path[idx + 1] = "sw";
  addParameter(path);
  setParameterType(path, 1);
  setParameterStates(path, [0, 1], ["Off", "On"]);
  setParameterValue(path, 0, true);
  
  path[idx + 1] = "vol";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, -inf, 20, 0.1, "dB");
  setParameterCallback(path, new function(path, value){
    channel.path[0].path[1].tb.vol = Math.pow(10, value / 20);
  });
  
  path[idx + 1] = "ducker";
  path[idx + 2] = "sw";
  addParameter(path);
  setParameterType(path, 1);
  setParameterStates(path, [0, 1], ["Off", "On"]);
  setParameterValue(path, 0, true);
    
  path[idx + 1] = "ducker";
  path[idx + 2] = "threshold";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, -inf, 20, 0.1, "dB");
  setParameterCallback(path, new function(path, value){
    if(path[0] == "main"){
      channel.path[0].ducker.setThresh(value);
    }else{
      channel.path[0].path[1].ducker.setThresh(value);
    }
  });
  setParameterValue(path, 0, true);
  
  path[idx + 1] = "ducker";
  path[idx + 2] = "range";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, -inf, 20, 0.1, "dB");
  setParameterCallback(path, new function(path, value){
    if(path[0] == "main"){
      channel.path[0].ducker.setRange(value);
    }else{
      channel.path[0].path[1].ducker.setRange(value);
    }
  });
  setParameterValue(path, 0, true);
  
  path[idx + 1] = "ducker";
  path[idx + 2] = "attack";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, 0, 20, 0.01, "s");
  setParameterCallback(path, new function(path, value){
    if(path[0] == "main"){
      channel.path[0].ducker.setAttack(value);
    }else{
      channel.path[0].path[1].ducker.setAttack(value);
    }
  });
  setParameterValue(path, 0.5, true);
  
  path[idx + 1] = "ducker";
  path[idx + 2] = "hold";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, 0, 20, 0.01, "s");
  setParameterCallback(path, new function(path, value){
    if(path[0] == "main"){
      channel.path[0].ducker.setHold(value);
    }else{
      channel.path[0].path[1].ducker.setHold(value);
    }
  });
  setParameterValue(path, 0.5, true);
  
  path[idx + 1] = "ducker";
  path[idx + 2] = "release";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, 0, 20, 0.01, "s");
  setParameterCallback(path, new function(path, value){
    if(path[0] == "main"){
      channel.path[0].ducker.setRelease(value);
    }else{
      channel.path[0].path[1].ducker.setRelease(value);
    }
  });
  setParameterValue(path, 0.5, true);
  
  path.length = idx + 1;
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
function removeCh(type, n){
  var path;
  path[0] = type;
  path[1] = n;
  path[2] = (type == "input")?"in":"subin";
  path[3] = "l";
  removeInupt(path);
  path[3] = "r";
  removeInput(path);
  path[2] = "insert";
  path[3] = "send";
  path[4] = "l";
  removeOutput(path);
  path[4] = "r";
  removeOutput(path);
  path[3] = "return";
  path[4] = "l";
  removeInput(path);
  path[4] = "r";
  removeInput(path);
  path.length = 4;
  if(type != "input"){
    path[2] = "out";
    path[3] = "l";
    removeOutput(path);
    path[3] = "r";
    removeOutput(path);
  }
  path.length = 3;
  path[1] = "name";
  removeParameter(path);
  path[1] = "vol";
  path[2] = "val";
  removeParameter(path);
  path[2] = "imm";
  removeParameter(path);
  path[2] = "time";
  removeParameter(path);
  channel.path[0].path[1].vol.current = undefined;
  channel.path[0].path[1].vol.target = undefined;
  channel.path[0].path[1].vol.rate = undefined;
  path.length = 3;
  path[2] = "pan";
  removeParameter(path);
  path[2] = "width";
  removeParameter(path);
  path[2] = "mute";
  removeParameter(path);
  path[2] = "solo";
  removeParameter(path);
  path[2] = "safe";
  removeParameter(path);
  path[2] = "insert";
  removeParameter(path);
  path[2] = "mono";
  removeParameter(path);
  path[2] = "main";
  removeParameter(path);
  path[2] = "pfl";
  removeParameter(path);
  path[2] = "afl";
  removeParameter(path);
  path[2] = "phase";
  path[3] = "l";
  removeParameter(path);
  path[3] = "r";
  removeParameter(path);
  path[2] = "tb";
  path[3] = "sw";
  removeParameter(path);
  path[3] = "vol";
  removeParameter(path);
  path[4] = "ducker";
  path[5] = "switch";
  removeParameter(path);
  path[5] = "threshold":
  removeParameter(path);
  path[5] = "range";
  removeParameter(path);
  path[5] = "attack";
  removeParameter(path);
  path[5] = "hold";
  removeParameter(path);
  path[6] = "release";
  removeParameter(path);
  channel.type.n.ducker = undefined;
  path.length = 5;
  path[2] = "rms";
  path[3] = "pre";
  path[4] = "l";
  removeParameter(path);
  path[4] = "r";
  removeParameter(path);
  path[3] = "post";
  path[4] = "l";
  removeParameter(path);
  path[4] = "r";
  removeParameter(path);
  channel.type.n.rms.pre[0] = undefined;
  channel.type.n.rms.pre[1] = undefined;
  channel.type.n.rms.post[0] = undefined;
  channel.type.n.rms.post[1] = undefined;
  path.length = 4;
  path[2] = "group";
  for(i=1;i<=getParameter(["group", "count"]);i++){
    path[3] = i;
    removeParameter(path);
  }
  for(i=1;i<=getParameter(["aux", "count"]);i++){
    removeSend(type, n, "aux", i);
  }
  for(i=1;i<=getParameter(["matrix", "count"]);i++){
    removeSend(type, n, "matrix", i);
  }
  path[2] = "tb";
  path[3] = "sw";
  removeParameter(path);
  path[3] = "vol";
  removeParamter(path);
  path[3] = "ducker";
  path[4] = "sw";
  removeParameter(path);
  path[4] = "threshold";
  removeParameter(path);
  path[4] = "range";
  removeParameter(path);
  path[4] = "attack";
  removeParameter(path);
  path[4] = "hold";
  removeParameter(path);
  path[4] = "release";
  if(type == "group"){
    for(i=1;i<=getParameter(["input", "count"]);i++){
      removeParameter(["input", i, "group", n]);
    }
  }
  if(type == "aux"){
    for(i=0;i<=getParameter(["input", "count"]);i++){
      removeSend("input", i, "aux", n);
    }
  }
  if(type == "matrix"){
    for(i=0;i<=getParameter(["input", "count"]);i++){
      removeSend("input", i, "matrix", n);
    }
    for(i=0;i<=getParameter(["group", "count"]);i++){
      removeSend("group", i, "matrix", n);
    }
    for(i=0;i<=getParameter(["aux", "count"]);i++){
      removeSend("aux", i, "matrix", n);
    }
    removeSend("main", 0, "matrix", n);
  }
}

function addSend(chType, ch, sendType, send){
  var path;
  var idx = (chType == "main")?1:2;
  path[0] = chType;
  if(chType != "main"){
    path[idx] = ch;
  }
  path[idx] = sendType;
  path[idx + 1] = send;
  path[idx + 2] = "vol";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, -inf, 20, 0.1, "dB");
  setParameterCallback(path, new function(path, value){
    channel.path[0].path[1].path[2].path[3].vol = Math.pow(10, value / 20);
  });
  setParameterValue(path, 0, true);
  path[idx + 2] = "pan";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, 0, 1, 0.1, "");
  setParameterValue(path, 0.5, true);
  path[idx + 2] = "width";
  addParameter(path);
  setParameterType(path, 0);
  setParameterRange(path, 0, 1, 0.1, "");
  setParameterValue(path, 1, true);
  path[idx + 2] = "mute";
  addParameter(path);
  setParameterType(path, 1);
  setParameterStates(path, [0, 1], ["Unmuted", "Muted"]);
  setParameterValue(path, 1, true);
  path[idx + 2] = "pos";
  addParameter(path);
  setParameterType(path, 1);
  setParameterStates(path, [0, 1, 2], ["Pre-Insert", "Pre-Fader", "Post-Fader"]);
  setParameterValue(path, 2, true);
  path[idx + 2] = "premute";
  addParameter(path);
  setParameterType(path, 1);
  setParameterStates(path, [0, 1], ["No", "Yes"]);
  setParameterValue(path, 0, true);
}
function removeSend(chType, ch, sendType, send){
  var path;
  var idx = (chType == "main")?1:2;
  path[0] = chType;
  if(chType != "main"){
    path[idx] = ch;
  }
  path[idx] = sendType;
  path[idx + 1] = send;
  path[idx + 2] = "vol";
  removeParameter(path);
  path[idx + 2] = "pan";
  removeParamater(path);
  path[idx + 2] = "width";
  removeParameter(path);
  path[idx + 2] = "mute";
  removeParameter(path);
  path[idx + 2] = "pos";
  removeParaemter(path);
  path[idx + 2] = "premute";
  removeParameter(path);
  channel.path[0].path[1].path[2].path[3].vol = undefined;
}
