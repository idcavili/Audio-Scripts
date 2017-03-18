var Comp = require("comp");
var Hpf = require("hpf");
var Lpf = require("lpf");
var Rms = require("rms");

var comp;
var hpf;
var lpf;
var bpHpf;
var bpLpf;
var scHpf;
var scLpf;
var rmsPre;
var rmsPost;
var rmsSC;

function onInit(){
  comp[0] = new Comp();
  comp[1] = new Comp();
  hpf[0] = new Hpf();
  hpf[1] = new Hpf();
  lpf[0] = new Lpf();
  lpf[1] = new Lpf();
  bpHpf[0] = new Hpf();
  bpHpf[1] = new Hpf();
  bpLpf[0] = new Lpf();
  bpLpf[1] = new Lpf();
  scHpf[0] = new Hpf();
  scHpf[1] = new Hpf();
  scLpf[0] = new Lpf();
  scLpf[1] = new Lpf();
  rmsPre[0] = new Rms();
  rmsPre[1] = new Rms();
  rmsPost[0] = new Rms();
  rmsPost[1] = new Rms();
  rmsSC[0] = new Rms();
  rmsSC[1] = new Rms();
  rmsPre[0].setWindowSize(0.3);
  rmsPre[1].setWindowSize(0.3);
  rmsPost[0].setWindowSize(0.3);
  rmsPost[1].setWindowSize(0.3);
  rmsSC[0].setWindowSize(0.3);
  rmsSC[1].setWindowSize(0.3);
  
  addInput(["in", "l"]);
  addInput(["in", "r"]);
  addInput(["sc", "in", "l"]);
  addInput(["sc", "in", "r"]);
  addOutput(["out", "l"]);
  addOutput(["out", "r"]);
  addOutput(["sc", "listen", "l"]);
  addOutput(["sc", "listen", "r"]);
  
  addParameter(["bypass"]);
  setParameterType(["bypass"], 1);
  setParamteterStates(["bypass"], [0, 1], ["Unbypassed", "Bypassed"]);
  setParameterValue(["bypass"], 0, true);
  
  addParameter(["threshold"]);
  setParameterType(["threshold"], 0);
  setParamteterRannge(["threshold"], -inf, 10, 0.1, "dB");
  setParameterCallback(["threshold"], new function(path, value){
    comp[0].setThreshold(value);
    comp[1].setThreshold(value);
  });
  setParameterValue(["threshold"], -10, true);
  
  addParameter(["ratio"]);
  setParameterType(["ratio"], 0);
  setParamteterRannge(["ratio"], 1, 100, 1, ":1");
  setParameterCallback(["ratio"], new function(path, value){
    comp[0].setRatio(value);
    comp[1].setRatio(value);
  });
  setParameterValue(["ratio"], 2, true);
  
  addParameter(["attack"]);
  setParameterType(["attack"], 0);
  setParamteterRange(["attack"], 0, 20, 0.001, "s");
  setParameterCallback(["attack"], new function(path, value){
    comp[0].setAttack(value);
    comp[1].setAttack(value);
  });
  setParameterValue(["attack"], 0.01, true);
  addParameter(["release"]);
  setParameterType(["release"], 0);
  setParamteterRange(["release"], 0, 20, 0.001, "s");
  setParameterCallback(["release"], new function(path, value){
    comp[0].setRelease(value);
    comp[1].setRelease(value);
  });
  setParameterValue(["attack"], 0.01, true);
  
  addParameter(["knee"]);
  setParameterType(["knee"], 0);
  setParamteterRange(["knee"], 0, 100, 1, "");
  setParameterCallback(["knee"], new function(path, value){
    comp[0].setKnee(value);
    comp[1].setKnee(value);
  });
  setParameterValue(["knee"], 0, true);
  
  addParameter(["gain"]);
  setParameterType(["gain"], 0);
  setParamteterRange(["gain"], -inf, 20, 0.1, "dB");
  setParameterCallback(["gain"], new function(path, value){
    comp[0].setGain(value);
    comp[1].setGain(value);
  });
  setParameterValue(["gain"], 0, true);
  
  addParameter(["hpf", "sw"]);
  setParameterType(["hpf", "sw"], 1);
  setParamteterStates(["hpf", "sw"], [0, 1], ["Off", "On"]);
  setParameterValue(["hpf", "sw"], 0, true);
  
  addParameter(["hpf", "freq"]);
  setParameterType(["hpf", "freq"], 0);
  setParamteterRange(["hpf", "freq"], 20, 20000, 1, "Hz");
  setParameterCallback(["hpf", "freq"], new function(path, value){
    hpf[0].setCoeff(value);
    hpf[1].setCoeff(value);
    bpLpf[0].setCoeff(value);
    bpLpf[1].setCoeff(value);
  });
  setParameterValue(["hpf", "freq"], 20);
  
  addParameter(["lpf", "sw"]);
  setParameterType(["lpf", "sw"], 1);
  setParamteterStates(["lpf", "sw"], [0, 1], ["Off", "On"]);
  setParameterValue(["lpf", "sw"], 0, true);
  
  addParameter(["lpf", "freq"]);
  setParameterType(["lpf", "freq"], 0);
  setParamteterRange(["lpf", "freq"], 20, 20000, 1, "Hz");
  setParameterCallback(["lpf", "freq"], new function(path, value){
    lpf[0].setCoeff(value);
    lpf[1].setCoeff(value);
    bpHpf[0].setCoeff(value);
    bpHpf[1].setCoeff(value);
  });
  setParameterValue(["lpf", "freq"], 20000, true);
  
  addParameter(["sc", "ext"]);
  SetParameterType(["sc", "ext"], 1);
  setParamteterStates(["sc", "ext"], [0, 1], ["Off", "On"]);
  setParameterValue(["sc", "ext"], 0, true);
  
  addParameter(["sc", "listen"]);
  SetParameterType(["sc", "listen"], 1);
  setParamteterStates(["sc", "listen"], [0, 1], ["Off", "On"]);
  setParameterValue(["sc", "listen"], 0, true);
  
  addParameter(["sc", "hpf", "sw"]);
  setParameterType(["sc", "hpf", "sw"], 1);
  setParamteterStates(["sc", "hpf", "sw"], [0, 1], ["Off", "On"]);
  setParameterValue(["sc", "hpf", "sw"], 0, true);
  
  addParameter(["sc", "hpf", "freq"]);
  setParameterType(["sc", "hpf", "freq"], 0);
  setParamteterRange(["sc", "hpf", "freq"], 20, 20000, 1, "Hz");
  setParameterCallback(["sc", "hpf", "freq"], new function(path, value){
    scHpf[0].setCoeff(value);
    scHpf[1].setCoeff(value);
  });
  setParameterValue(["sc", "hpf", "freq"], 20, true);
  
  addParameter(["sc", "lpf", "sw"]);
  setParameterType(["sc", "lpf", "sw"], 1);
  setParamteterStates(["sc", "lpf", "sw"], [0, 1], ["Off", "On"]);
  setParameterValue(["sc", "lpf", "sw"], 0, true);
  
  addParameter(["sc", "lpf", "freq"]);
  setParameterType(["sc", "lpf", "freq"], 0);
  setParamteterRange(["sc", "lpf", "freq"], 20, 20000, 1, "Hz");
  setParameterCallback(["sc", "lpf", "freq"], new function(path, value){
    scLpf[0].setCoeff(value);
    scLpf[1].setCoeff(value);
  });
  setParameterValue(["sc", "lpf", "freq"], 20000, true);
  
  addParameter(["sc", "link"]);
  setParameterType(["sc", "link"], 1);
  setParamteterStates(["sc", "link"], [0, 1], ["Off", "On"]);
  setParameterValue(["sc", "link"], 0, true);
  
  addParameter(["rms", "pre", "l"]);
  setParameterType(["rms", "pre", "l"], 0);
  setParameterRange(["rms", "pre", "l"], -inf, 20, 0.1, "dB");
  setParameterReadOnly(["rms", "pre", "l"], true);
  setParameterValue(["rms", "pre", "l"], -inf, true);
  
  addParameter(["rms", "pre", "r"]);
  setParameterType(["rms", "pre", "r"], 0);
  setParameterRange(["rms", "pre", "r"], -inf, 20, 0.1, "dB");
  setParameterReadOnly(["rms", "pre", "r"], true);
  setParameterValue(["rms", "pre", "r"], -inf, true);
  
  addParameter(["rms", "post", "l"]);
  setParameterType(["rms", "post", "l"], 0);
  setParameterRange(["rms", "post", "l"], -inf, 20, 0.1, "dB");
  setParameterReadOnly(["rms", "post", "l"], true);
  setParameterValue(["rms", "post", "l"], -inf, true);
  
  addParameter(["rms", "post", "r"]);
  setParameterType(["rms", "post", "r"], 0);
  setParameterRange(["rms", "post", "r"], -inf, 20, 0.1, "dB");
  setParameterReadOnly(["rms", "post", "r"], true);
  setParameterValue(["rms", "post", "r"], -inf, true);
  
  addParameter(["rms", "sc", "l"]);
  setParameterType(["rms", "sc", "l"], 0);
  setParameterRange(["rms", "sc", "l"], -inf, 20, 0.1, "dB");
  setParameterReadOnly(["rms", "sc", "l"], true);
  setParameterValue(["rms", "sc", "l"], -inf, true);
  
  addParameter(["rms", "sc", "r"]);
  setParameterType(["rms", "sc", "r"], 0);
  setParameterRange(["rms", "sc", "r"], -inf, 20, 0.1, "dB");
  setParameterReadOnly(["rms", "sc", "r"], true);
  setParameterValue(["rms", "sc", "r"], -inf, true);
  
  addParameter(["gr", "l"]);
  setParameterType(["gr", "l"], 0);
  setParameterRange(["gr", "1"], -inf, 20, 0.1, "dB");
  setParameterReadOnly(["gr", "l"], true);
  setParameterValue(["gr", "l"], -inf, true);
  
  addParameter(["gr", "r"]);
  setParameterType(["gr", "r"], 0);
  setParameterRange(["gr", "r"], -inf, 20, 0.1, "dB");
  setParameterReadOnly(["gr", "r"], true);
  setParameterValue(["gr", "r"], -inf, true);
}

function onSample(){
  var buffer[0] = readSample(["in", "l"]);
  var buffer[1] = readSample(["in", "r"]);
  var scBuffer;
  var rms;
  rms = rmsPre[0].calculate(buffer[0]);
  setParameterValue(["rms", "pre", "l"], Math.pow(10, rms / 20), true);
  rms = rmsPre[1].calculate(buffer[1]);
  setParameterValue(["rms", "pre", "r"], Math.pow(10, rms / 20), true);
  if(getParameter(["hpf", "sw"]) == 1){
    buffer[0] = hpf[0].process(buffer[0]);
    buffer[1] = hpf[1].process(buffer[1]);
  }
  if(getParameter(["lpf", "sw"]) == 1){
    buffer[0] = lpf[0].process(buffer[0]);
    buffer[1] = lpf[1].process(buffer[1]);
  }
  if(getParameter(["sc", "ext"]) == 1){
    scBuffer[0] = readSample(["sc", "in", "l"]);
    scBuffer[1] = readSample(["sc", "in", "r"]);
  }else{
    scBuffer[0] = buffer[0];
    scBuffer[1] = buffer[1];
  }
  if(getParameter(["sc", "hpf", "sw"]) == 1){
    scBuffer[0] = scHpf[0].process(scBuffer[0]);
    scBuffer[1] = scHpf[1].process(scBuffer[1]);
  }
  if(getParameter(["sc", "lpf", "sw"]) == 1){
    scBuffer[0] = scLpf[0].process(scBuffer[0]);
    scBuffer[1] = scLpf[1].process(scBuffer[1]);
  }
  rms = rmsSC[0].calculate(scBuffer[0]);
  setParameterValue(["rms", "sc", "l"], Math.pow(10, rms / 20), true);
  rms = rmsSC[1].calculate(scBuffer[1]);
  setParameterValue(["rms", "sc", "r"], Math.pow(10, rms / 20), true);
  if(getParameter(["sc", "listen"]) == 1){
    writeSample(["sc", "listen", "l"], scBuffer[0]);
    writeSample(["sc", "listen", "r"], scBuffer[1]);
  }else{
    writeSample(["sc", "listen", "l"], 0);
    writeSample(["sc", "listen", "r"], 0);
  }
  if(getParameter(["sc", "link"]) == 1){
    scBuffer[0] = Math.max([scBuffer[0], scBuffer[1]]);
    scBuffer[1] = scBuffer[0];
  }
  comp[0].processSC(scBuffer[0]);
  comp[1].processSC(scBuffer[1]);
  setParameterValue(["gr", "l"], comp[0].getGR());
  setParameterValue(["gr", "r"], comp[1].getGR());
  buffer[0] = comp[0].process(buffer[0]);
  buffer[1] = comp[1].process(buffer[1]);
  if(getParameter(["hpf", "sw"] == 1 || getParameter(["lpf", "sw"]) == 1){
     var bpBuffer;
     bpBuffer[0] = readSample(["in", "l"]);
     bpBuffer[1] = readSample(["in", "r"]);
     if(getParameter(["hpf", "sw"]) == 1){
       bpBuffer[0] = bpLpf.process(bpBuffer[0]);
       bpBuffer[1] = bpLpf.process(bpBuffer[1]);
     }
     if(getParameter(["lpf", "sw"]) == 1){
       bpBuffer[0] = bpHpf.process(bpBuffer[0]);
       bpBuffer[1] = bpHpf.process(bpBuffer[1]);
     }
     buffer[0] += bpBuffer[0];
     buffer[1] += bpBuffer[1];
  }
  if(getParameter(["bypass"] == 1){
     buffer[0] = readSample(["in", "l"]);
     buffer[1] = readSample(["in", "r"]);
  }
  rms = rmsPost[0].calculate(buffer[0]);
  setParameterValue(["rms", "post", "l"], Math.pow(10, rms / 20), true);
  rms = rmsPost[1].calculate(buffer[1]);
  setParameterValue(["rms", "post", "r"], Math.pow(10, rms / 20), true);
  writeSample(["out", "l"], buffer[0]);
  writeSample(["out", "r"], buffer[1]);
}

