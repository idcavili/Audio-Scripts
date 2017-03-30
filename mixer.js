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
function processInput(n){
  var buffer = [];
  buffer[0] = readSample(["input", n, "l"]);
  buffer[1] = readSample(["input", n, "r"]);
  if(getParameter(["input", n, "mono"]) == 1){
    buffer[0] += buffer[1];
    buffer[1] = buffer[0];
  }
  if(getParameter(["input", n, "phase", "l"]) == 1){
    buffer[0] *= -1;
  }
  if(getParameter(["input", n, "phase", "r"]) == 1){
    buffer[1] *= -1;
  }
  var muted;
  if(getParameter(["input", n, "mute"]) == 0 && (getParameter(["input", n, "solo"]) == 1 || getParameter(["input", n, "safe"]) == 1 || solo."input" == 0)){
     muted = false;
  }else{
    muted = true;
  }
  for(i=1;i<=getParameter(["aux", "count"]);i++){
    if(getParameter(["input", n, "aux", i, "pos"]) == 0){
      if(getParameter(["input", n, "aux", i, "mute"]) == 0 && (!muted || getParameter(["input", n, "aux", i, "premute"]) == 1)){
        processSend(buffer, "input", n, "aux", i);
      }
    }
  }
  for(i=1;i<=getParameter(["matrix", "count"]);i++){
    if(getParameter(["input", n, "matrix", i, "pos"]) == 0){
      if(getParameter(["input", n, "matrix", i, "mute"]) == 0 && (!muted || getParameter(["input", n, "matrix", i, "premute"]) == 1)){
        processSend(buffer, "input", n, "matrix", i);
      }
    }
  }
  writeSample(["input", n, "insert", "send", "l"], buffer[0]);
  writeSample(["input", n, "insert", "send", "r"], buffer[1]);
  if(getParameter(["input", n, "insert"]) == 1){
    buffer[0] = readSample(["input", n, "insert", "return", "l"]);
    buffer[1] = readSample(["input", n, "insert", "return", "r"]);
  }
  setParameter(["input", n, "rms", "pre", "l"], Math.pow(10, channel.input.n.rms.pre[0].calculate(buffer[0])) / 20);
  setParameter(["input", n, "rms", "pre", "r"], Math.pow(10, channel.input.n.rms.pre[1].calculate(buffer[1])) / 20);
  if(getParameter(["input", n, "pfl"]) == 1){
    mon[0] += buffer[0];
    mon[1] += buffer[1];
  }
  for(i=1;i<=getParameter(["aux", "count"]);i++){
    if(getParameter(["input", n, "aux", i, "pos"]) == 1){
      if(getParameter(["input", n, "aux", i, "mute"]) == 0 && (!muted || getParameter(["input", n, "aux", i, "premute"]) == 1)){
        processSend(buffer, "input", n, "aux", i);
      }
    }
  }
  for(i=1;i<=getParameter(["matrix", "count"]);i++){
    if(getParameter(["input", n, "matrix", i, "pos"]) == 1){
      if(getParameter(["input", n, "matrix", i, "mute"]) == 0 && (!muted || getParameter(["input", n, "matrix", i, "premute"]) == 1)){
        processSend(buffer, "input", n, "matrix", i);
      }
    }
  }
  var buffera = [];
  buffera[0] = buffer[0] * getParameter(["input", n, "width]"]);
  buffera[0] += buffer[1] * (1 - getParameter("input", n, "width"]));
  buffera[1] = buffer[1] * getParameter(["input", n, "width]"]);
  buffera[1] += buffer[0] * (1 - getParameter("input", n, "width"]));
  buffer[0] = buffera[0];
  buffer[1] = buffera[1];
  if(channel."input".n.vol.current != channel."input".n.vol.target){
    channel."input".n.vol.current += channel."input".n.vol.rate;
  }
  buffer[0] *= channel."input".n.vol.current;
  buffer[1] *= channel."input".n.vol.current;
  buffer[0] *= (1 - getParameter(["input", n, "pan"]));
  buffer[1] *= getParameter(["input", n, "pan"]);
  setParameter(["input", n, "rms", "post", "l"], Math.pow(10, channel.input.n.rms.post[0].calculate(buffer[0])) / 20);
  setParameter(["input", n, "rms", "post", "r"], Math.pow(10, channel.input.n.rms.post[1].calculate(buffer[1])) / 20);
  if(getParameter(["input", n, "afl"]) == 1){
    mon[0] += buffer[0];
    mon[1] += buffer[1];
  }
  for(i=1;i<=getParameter(["aux", "count"]);i++){
    if(getParameter(["input", n, "aux", i, "pos"]) == 2){
      if(getParameter(["input", n, "aux", i, "mute"]) == 0 && (!muted || getParameter(["input", n, "aux", i, "premute"]) == 1)){
        processSend(buffer, "input", n, "aux", i);
      }
    }
  }
  for(i=1;i<=getParameter(["matrix", "count"]);i++){
    if(getParameter(["input", n, "matrix", i, "pos"]) == 2){
      if(getParameter(["input", n, "matrix", i, "mute"]) == 0 && (!muted || getParameter(["input", n, "matrix", i, "premute"]) == 1)){
        processSend(buffer, "input", n, "matrix", i);
      }
    }
  }
  if(!muted){
    for(i=1;i<=getParameter(["group", "count"]);i++){
      if(getParameter(["input", n, "group", i])){
        channel."group".i.buffer[0] += buffer[0];
        channel."group".i.buffer[1] += buffer[1];
      }
    }
    if(getParameter(["input", n, "main"])){
      channel."main".0.buffer[0] += buffer[0];
      channel."main".0.buffer[1] += buffer[1];
    }
  }
function processBus(type, n){
  channel.type.n.buffer[0] += readSample([type, n, "subin", "l"]);
  channel.type.n.buffer[1] += readSample([type, n, "subin", "r"]);
  if(getParameter([type, n, "tb", "sw"]) == 1){
    channel.type.n.buffer = processTB(channel.type.n.buffer, type, n);
  }
  var muted;
  if(getParameter([type, n, "mute"]) == 0 && (getParameter([type, n, "solo"]) == 1 || getParameter([type, n, "safe"]) == 1 || solo.type == 0)){
     muted = false;
  }else{
    muted = true;
  }
  if(type != "matrix"){
    for(i=1;i<=getParameter(["matrix", "count"]);i++){
      if(getParameter([type, n, "matrix", i, "pos"]) == 0){
        if(getParameter([type, n, "matrix", i, "mute"]) == 0 && (!muted || getParameter([type, n, "matrix", i, "premute"]) == 1)){
          processSend(channel.type.n.buffer, type, n, "matrix", i);
        }
      }
    }
  }
  writeSample([type, n, "insert", "send", "l"], channel.type.n.buffer[0]);
  writeSample([type, n, "insert", "send", "r"], channel.type.n.buffer[1]);
  if(getParameter([type, n, "insert"]) == 1){
    channel.type.n.buffer[0] = readSample([type, n, "insert", "return", "l"]);
    channel.type.n.buffer[1] = readSample([type, n, "insert", "return", "r"]);
  }
  setParameter([type, n, "rms", "pre", "l"], Math.pow(10, channel.type.n.rms.pre[0].calculate(buffer[0])) / 20);
  setParameter([type, n, "rms", "pre", "r"], Math.pow(10, channel.type.n.rms.pre[1].calculate(buffer[1])) / 20);
  if(getParameter([type, n, "pfl"]) == 1){
    mon[0] += channel.type.n.buffer[0];
    mon[1] += channel.type.n.buffer[1];
  }
  if(type != "matrix"){
    for(i=1;i<=getParameter(["matrix", "count"]);i++){
      if(getParameter([type, n, "matrix", i, "pos"]) == 1){
        if(getParameter([type, n, "matrix", i, "mute"]) == 0 && (!muted || getParameter([type, n, "matrix", i, "premute"]) == 1)){
          processSend(channel.type.n.buffer, type, n, "matrix", i);
        }
      }
    }
  }
  var buffera = [];
  buffera[0] = channel.type.n.buffer[0] * getParameter([type, n, "width]"]);
  buffera[0] += channel.type.n.buffer[1] * (1 - getParameter(type, n, "width"]));
  buffera[1] = channel.type.n.buffer[1] * getParameter([type, n, "width]"]);
  buffera[1] += channel.type.n.buffer[0] * (1 - getParameter(type, n, "width"]));
  channel.type.n.buffer[0] = buffera[0];
  channel.type.n.buffer[1] = buffera[1];
  if(channel.type.n.vol.current != channel.type.n.vol.target){
    channel.type.n.vol.current += channel.type.n.vol.rate;
  }
  channel.type.n.buffer[0] *= channel.type.n.vol.current;
  channel.type.n.buffer[1] *= channel.type.n.vol.current;
  channel.type.n.buffer[0] *= (1 - getParameter([type, n, "pan"]));
  channel.type.n.buffer[1] *= getParameter([type, n, "pan"]);
  setParameter([type, n, "rms", "post", "l"], Math.pow(10, channel.type.n.rms.post[0].calculate(buffer[0])) / 20);
  setParameter([type, n, "rms", "post", "r"], Math.pow(10, channel.type.n.rms.post[1].calculate(buffer[1])) / 20);
  if(getParameter(["input", n, "afl"]) == 1){
    mon[0] += channel.type.n.buffer[0];
    mon[1] += channel.type.n.buffer[1];
  }
  if(type != "matrix"){
    for(i=1;i<=getParameter(["matrix", "count"]);i++){
      if(getParameter([type, n, "matrix", i, "pos"]) == 2){
        if(getParameter([type, n, "matrix", i, "mute"]) == 0 && (!muted || getParameter([type, n, "matrix", i, "premute"]) == 1)){
          processSend(channel.type.n.buffer, type, n, "matrix", i);
        }
      }
    }
    if(getParameter([type, n, "main"]) == 1 && !muted){
      channel.main.0.buffer[0] += channel.type.n.buffer[0];
      channel.main.0.buffer[1] += channel.type.n.buffer[1];
    }
  }
  if(!muted){
    writeSample([type, n, "out", "l"], channel.type.n.buffer[0]);
    writeSample([type, n, "out", "r"], channel.type.n.buffer[1]);
  }else{
    writeSample([type, n, "out", "l"], 0.0);
    writeSample([type, n, "out", "r"], 0.0);
  }
}
function processMain(){
 channel."main".0.buffer[0] += readSample(["main", "subin", "l"]);
 channel."main".n.buffer[1] += readSample(["main", "subin", "r"]);
 if(getParameter(["main", "tb", "sw"]) == 1){
   channel."main".0.buffer = processTB(channel."main".0.buffer, "main", n);
 }
 var muted;
 if(getParameter(["main", "mute"]) == 1){
   muted = true;
 }else{
   muted = false;
 }
 for(i=1;i<=getParameter(["matrix", "count"]);i++){
      if(getParameter(["main", "matrix", i, "pos"]) == 0){
        if(getParameter(["main", "matrix", i, "mute"]) == 0 && (!muted || getParameter(["main", "matrix", i, "premute"]) == 1)){
          processSend(channel."main".0.buffer, "main", n, "matrix", i);
        }
      }
  }
  writeSample(["main", "insert", "send", "l"], channel.type.n.buffer[0]);
  writeSample(["main", "insert", "send", "r"], channel.type.n.buffer[1]);
  if(getParameter(["main", "insert"]) == 1){
    channel.type.n.buffer[0] = readSample(["main", "insert", "return", "l"]);
    channel.type.n.buffer[1] = readSample(["main", "insert", "return", "r"]);
  }
  setParameter(["main", "rms", "pre", "l"], Math.pow(10, channel."main".0.rms.pre[0].calculate(buffer[0])) / 20);
  setParameter(["main", "rms", "pre", "r"], Math.pow(10, channel."main".1.rms.pre[1].calculate(buffer[1])) / 20);
  if(getParameter([type, n, "pfl"]) == 1){
    mon[0] += channel."main".0.buffer[0];
    mon[1] += channel."main".0.buffer[1];
  }
  for(i=1;i<=getParameter(["matrix", "count"]);i++){
      if(getParameter(["main", "matrix", i, "pos"]) == 1){
        if(getParameter(["main", "matrix", i, "mute"]) == 0 && (!muted || getParameter(["main", "matrix", i, "premute"]) == 1)){
          processSend(channel."main".0.buffer, "main", n, "matrix", i);
        }
      }
  }
  var buffera = [];
  buffera[0] = channel."main".0.buffer[0] * getParameter(["main", "width]"]);
  buffera[0] += channel."main".0.buffer[1] * (1 - getParameter("main", "width"]));
  buffera[1] = channel."main".0.buffer[1] * getParameter(["main", "width]"]);
  buffera[1] += channel."main".0.buffer[0] * (1 - getParameter("main", "width"]));
  channel."main".0.buffer[0] = buffera[0];
  channel."main".0.buffer[1] = buffera[1];
  if(channel."main".0.vol.current != channel."main".0.vol.target){
    channel."main".0.vol.current += channel."main".0.vol.rate;
  }
  channel."main".0.buffer[0] *= channel."main".0.vol.current;
  channel."main".0.buffer[1] *= channel."main".0.vol.current;
  channel."main".0.buffer[0] *= (1 - getParameter(["main", "pan"]));
  channel."main".0.buffer[1] *= getParameter(["main", "pan"]);
  setParameter(["main", "rms", "post", "l"], Math.pow(10, channel."main".0.rms.post[0].calculate(buffer[0])) / 20);
  setParameter(["main", "rms", "post", "r"], Math.pow(10, channel."main".0.rms.post[1].calculate(buffer[1])) / 20);
  if(getParameter(["main", "mon"]) == 1 && listen == 0){
    mon[0] += channel."main".buffer[0];
    mon[1] += channel."main".buffer[1];
  }
  for(i=1;i<=getParameter(["matrix", "count"]);i++){
      if(getParameter(["main", "matrix", i, "pos"]) == 2){
        if(getParameter(["main", "matrix", i, "mute"]) == 0 && (!muted || getParameter(["main", "matrix", i, "premute"]) == 1)){
          processSend(channel."main".0.buffer, "main", n, "matrix", i);
        }
      }
  }
  if(!muted){
    writeSample(["main", "out", "l"], channel."main".buffer[0]);
    writeSample(["main", "out", "r"], channel."main".buffer[1]);
  }else{
    writeSample(["main", "out", "l"], 0.0);
    writeSample(["main", "out", "r"], 0.0);
  }
}
function processSend(sample, chType, ch, sendType, send){
  var samplea = [];
  samplea[0] = sample[0] * getParameter([chType, ch, sendType, send, "width"]);
  samplea[0] += sample[1] * (1 - getParameter([chType, ch, sendType, send, "width"]));
  samplea[1] = sample[1] * getParameter([chType, ch, sendType, send, "width"]);
  samplea[1] += sample[1] * (1 - getParameter([chType, ch, sendType, send, "width"]));
  samplea[0] *= channel.chType.ch.sendType.send.vol;
  samplea[1] *= channel.chType.ch.sendType.send.vol;
  samplea[0] *= (1 - getParameter([chType, ch, sendType, send, "pan"]));
  samplea[1] *= getParameter([chType, ch, sendType, send, "pan"]);
  channel.sendType.send.buffer[0] += samplea[0];
  channel.sendType.send.buffer[1] += samplea[1];
}
 
