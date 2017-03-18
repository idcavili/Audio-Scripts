var Hpf = require("hpf");
var Lpf = require("lpf");
var Hsf = require("hishelf");
var Lsf = require("loshelf");
var Peq = require("peq");
var Rms = require("rms");

var hpf;
var lpf;
var hs;
var ls;
var lf;
var lmf;
var mf;
var hmf;
var hf;
var rmsPre;
var rmsPost;
function onInit(){
  addInput(["in","l"]);
  addInput(["in","r"]);
  addOutput(["out","l"]);
  addOutput(["out","r"]);
  //Bypass
  addParameter(["bypass"]);
  setParameterType(["bypass"], 1);
  setParameterStates(["bypass"], [0, 1], ["Unbypassed", "Bypassed"]);
  setParameterValue(["bypass"], 0, false);
  //Meter
  addParameter(["rms", "pre", "l"]);
  setParameterType(["rms", "pre", "l"], 0);
  setParameterRange(["rms", "pre", "l"], -inf, 10, 0.1, "dB");
  setParameterReadOnly(["rms", "pre", "l"], true);
  setParameterValue(["rms", "pre", "l"], -inf);
  addParameter(["rms", "pre", "r"]);
  setParameterType(["rms", "pre", "r"], 0);
  setParameterRange(["rms", "pre", "r"], -inf, 10, 0.1, "dB");
  setParameterReadOnly(["rms", "pre", "r"], true);
  setParameterValue(["rms", "pre", "r"], -inf);
  addParameter(["rms", "post", "l"]);
  setParameterType(["rms", "post", "l"], 0);
  setParameterRange(["rms", "post", "l"], -inf, 10, 0.1, "dB");
  setParameterReadOnly(["rms", "post", "l"], true);
  setParameterValue(["rms", "post", "l"], -inf);
  addParameter(["rms", "post", "r"]);
  setParameterType(["rms", "post", "r"], 0);
  setParameterRange(["rms", "post", "r"], -inf, 10, 0.1, "dB");
  setParameterReadOnly(["rms", "post", "r"], true);
  setParameterValue(["rms", "post", "r"], -inf);
  //HPF
  addParameter(["hpf", "bypass"]);
  setParameterType(["hpf", "bypass"], 1);
  setParameterStates(["hpf", "bypass"], [0, 1], ["Unbypassed", "Bypassed"]);
  setParameterValue(["hpf", "bypass"], 0, false);
  addParameter(["hpf", "freq"]);
  setParameterType(["hpf", "freq"], 0);
  setParameterRange(["hpf", "freq"], 20, 20000, 1, "Hz");
  setParameterCallback(["hpf", "freq"], setCoeff);
  setParameterValue(["hpf", "freq"], 20000, true);
  //LPF
  addParameter(["lpf", "bypass"]);
  setParameterType(["lpf", "bypass"], 1);
  setParameterStates(["lpf", "bypass"], [0, 1], ["Unbypassed", "Bypassed"]);
  setParameterValue(["lpf", "bypass"], 0, false);
  addParameter(["lpf", "freq"]);
  setParameterType(["lpf", "freq"], 0);
  setParameterRange(["lpf", "freq"], 20, 20000, 1, "Hz");
  setParameterCallback(["lpf", "freq"], setCoeff);
  setParameterValue(["lpf", "freq"], 20, true);
  //HS
  addParameter(["hs", "bypass"]);
  setParameterType(["hs", "bypass"], 1);
  setParameterStates(["hs", "bypass"], [0, 1], ["Unbypassed", "Bypassed"]);
  setParameterValue(["hs", "bypass"], 0, false);
  addParameter(["hs", "freq"]);
  setParameterType(["hs", "freq"], 0);
  setParameterRange(["hs", "freq"], 20, 20000, 1, "Hz");
  setParameterCallback(["hs", "freq"], setCoeff);
  setParameterValue(["hs", "freq"], 20, true);
  addParameter(["hs", "gain"]);
  setParameterType(["hs", "gain"], 0);
  setParameterRange(["hs", "gain"], -inf, 10, 0.1, "dB");
  setParameterCallback(["hs", "gain"], setCoeff);
  setParameterValue(["hs", "gain"], 0, true);
  //LS
  addParameter(["ls", "bypass"]);
  setParameterType(["ls", "bypass"], 1);
  setParameterStates(["ls", "bypass"], [0, 1], ["Unbypassed", "Bypassed"]);
  setParameterValue(["ls", "bypass"], 0, false);
  addParameter(["ls", "freq"]);
  setParameterType(["ls", "freq"], 0);
  setParameterRange(["ls", "freq"], 20, 20000, 1, "Hz");
  setParameterCallback(["ls", "freq"], setCoeff);
  setParameterValue(["ls", "freq"], 20, true);
  addParameter(["ls", "gain"]);
  setParameterType(["ls", "gain"], 0);
  setParameterRange(["ls", "gain"], -inf, 10, 0.1, "dB");
  setParameterCallback(["ls", "gain"], setCoeff);
  setParameterValue(["ls", "gain"], 0, true);
  //LF
  addParameter(["lf", "bypass"]);
  setParameterType(["lf", "bypass"], 1);
  setParameterStates(["lf", "bypass"], [0, 1], ["Unbypassed", "Bypassed"]);
  setParameterValue(["lf", "bypass"], 0, false);
  addParameter(["lf", "freq"]);
  setParameterType(["lf", "freq"], 0);
  setParameterRange(["lf", "freq"], 20, 20000, 1, "Hz");
  setParameterCallback(["lf", "freq"], setCoeff);
  setParameterValue(["lf", "freq"], 20, true);
  addParameter(["lf", "gain"]);
  setParameterType(["lf", "gain"], 0);
  setParameterRange(["lf", "gain"], -inf, 10, 0.1, "dB");
  setParameterCallback(["lf", "gain"], setCoeff);
  setParameterValue(["lf", "gain"], 0, true);
  addParameter(["lf", "q"]);
  setParameterType(["lf", "q"], 0);
  setParameterRange(["lf", "q"], 0, 1, 0.1, "");
  setParameterCallback(["lf", "q"], setCoeff);
  setParameterValue(["lf", "q"], 0.5, true);
  //LMF
  addParameter(["lmf", "bypass"]);
  setParameterType(["lmf", "bypass"], 1);
  setParameterStates(["lmf", "bypass"], [0, 1], ["Unbypassed", "Bypassed"]);
  setParameterValue(["lmf", "bypass"], 0, false);
  addParameter(["lmf", "freq"]);
  setParameterType(["lmf", "freq"], 0);
  setParameterRange(["lmf", "freq"], 20, 20000, 1, "Hz");
  setParameterCallback(["lmf", "freq"], setCoeff);
  setParameterValue(["lmf", "freq"], 20, true);
  addParameter(["lmf", "gain"]);
  setParameterType(["lmf", "gain"], 0);
  setParameterRange(["lmf", "gain"], -inf, 10, 0.1, "dB");
  setParameterCallback(["lmf", "gain"], setCoeff);
  setParameterValue(["lmf", "gain"], 0, true);
  addParameter(["lmf", "q"]);
  setParameterType(["lmf", "q"], 0);
  setParameterRange(["lmf", "q"], 0, 1, 0.1, "");
  setParameterCallback(["lmf", "q"], setCoeff);
  setParameterValue(["lmf", "q"], 0.5, true);
  //MF
  addParameter(["mf", "bypass"]);
  setParameterType(["mf", "bypass"], 1);
  setParameterStates(["mf", "bypass"], [0, 1], ["Unbypassed", "Bypassed"]);
  setParameterValue(["mf", "bypass"], 0, false);
  addParameter(["mf", "freq"]);
  setParameterType(["mf", "freq"], 0);
  setParameterRange(["mf", "freq"], 20, 20000, 1, "Hz");
  setParameterCallback(["mf", "freq"], setCoeff);
  setParameterValue(["mf", "freq"], 20, true);
  addParameter(["mf", "gain"]);
  setParameterType(["mf", "gain"], 0);
  setParameterRange(["mf", "gain"], -inf, 10, 0.1, "dB");
  setParameterCallback(["mf", "gain"], setCoeff);
  setParameterValue(["mf", "gain"], 0, true);
  addParameter(["mf", "q"]);
  setParameterType(["mf", "q"], 0);
  setParameterRange(["mf", "q"], 0, 1, 0.1, "");
  setParameterCallback(["mf", "q"], setCoeff);
  setParameterValue(["mf", "q"], 0.5, true);
  //HMF
  addParameter(["hmf", "bypass"]);
  setParameterType(["hmf", "bypass"], 1);
  setParameterStates(["hmf", "bypass"], [0, 1], ["Unbypassed", "Bypassed"]);
  setParameterValue(["hmf", "bypass"], 0, false);
  addParameter(["hmf", "freq"]);
  setParameterType(["hmf", "freq"], 0);
  setParameterRange(["hmf", "freq"], 20, 20000, 1, "Hz");
  setParameterCallback(["hmf", "freq"], setCoeff);
  setParameterValue(["hmf", "freq"], 20, true);
  addParameter(["hmf", "gain"]);
  setParameterType(["hmf", "gain"], 0);
  setParameterRange(["hmf", "gain"], -inf, 10, 0.1, "dB");
  setParameterCallback(["hmf", "gain"], setCoeff);
  setParameterValue(["hmf", "gain"], 0, true);
  addParameter(["hmf", "q"]);
  setParameterType(["hmf", "q"], 0);
  setParameterRange(["hmf", "q"], 0, 1, 0.1, "");
  setParameterCallback(["hmf", "q"], setCoeff);
  setParameterValue(["hmf", "q"], 0.5, true);
  //HF
  addParameter(["hf", "bypass"]);
  setParameterType(["hf", "bypass"], 1);
  setParameterStates(["hf", "bypass"], [0, 1], ["Unbypassed", "Bypassed"]);
  setParameterValue(["hf", "bypass"], 0, false);
  addParameter(["hf", "freq"]);
  setParameterType(["hf", "freq"], 0);
  setParameterRange(["hf", "freq"], 20, 20000, 1, "Hz");
  setParameterCallback(["hf", "freq"], setCoeff);
  setParameterValue(["hf", "freq"], 20, true);
  addParameter(["hf", "gain"]);
  setParameterType(["hf", "gain"], 0);
  setParameterRange(["hf", "gain"], -inf, 10, 0.1, "dB");
  setParameterCallback(["hf", "gain"], setCoeff);
  setParameterValue(["hf", "gain"], 0, true);
  addParameter(["hf", "q"]);
  setParameterType(["hf", "q"], 0);
  setParameterRange(["hf", "q"], 0, 1, 0.1, "");
  setParameterCallback(["hf", "q"], setCoeff);
  setParameterValue(["hf", "q"], 0.5, true);
  
  hpf[0] = new Hpf();
  hpf[1] = new Hpf();
  lpf[0] = new Lpf();
  lpf[1] = new Lpf();
  hs[0] = new Hsf();
  hs[1] = new Hsf();
  ls[0] = new Lsf();
  ls[1] = new Lsf();
  lf[0] = new Peq();
  lf[1] = new Peq();
  lmf[0] = new Peq();
  lmf[1] = new Peq();
  mf[0] = new Peq();
  mf[1] = new Peq();
  hmf[0] = new Peq();
  hmf[1] = new Peq();
  hf[0] = new Peq();
  hf[1] = new Peq();
  rmsPre[0] = new Rms();
  rmsPre[1] = new Rms();
  rmsPost[0] = new Rms();
  rmsPost[1] = new Rms();
  rmsPre[0].setWindowSize(0.3);
  rmsPre[1].setWindowSize(0.3);
  rmsPost[0].setWindowSize(0.3);
  rmsPost[1].setWindowSize(0.3);
}

function setCoeff(path, value){
  switch(path[0]){
    case "hpf":
      hpf.setCoeff(value);
      break;
    case "lpf":
      lpf.setCoeff(value);
      break;
    case "hs":
      hs.setCoeff(getParameter(["hs", "freq"]), getParameter(["hs", "gain"]));
      break;
    case "ls":
      ls.setCoeff(getParameter(["ls", "freq"]), getParameter(["ls", "gain"]));
      break;
    case "lf":
      lf.setCoeff(getParameter(["lf", "freq"]), getParameter(["lf", "q"]), getParameter(["lf", "gain"]));
      break;
    case "lmf":
      lf.setCoeff(getParameter(["lmf", "freq"]), getParameter(["lmf", "q"]), getParameter(["lmf", "gain"]));
      break;
    case "mf":
      mf.setCoeff(getParameter(["mf", "freq"]), getParameter(["mf", "q"]), getParameter(["mf", "gain"]));
      break;
    case "hmf":
      hmf.setCoeff(getParameter(["hmf", "freq"]), getParameter(["hmf", "q"]), getParameter(["hmf", "gain"]));
      break;
    case "hf":
      hf.setCoeff(getParameter(["hf", "freq"]), getParameter(["hf", "q"]), getParameter(["hf", "gain"]));
      break;
    }
          
}

function onSample(){
  var buffer[0] = readSample("in", "l");
  var buffer[1] = readSample("in", "r");
  var rms = rmsPre[0].calculate(buffer[0]);
  if(rms => 0){
    setParameterValue("rms", "pre", "l", Math.pow(10, rms / 20), false);
  }
  var rms = rmsPre[1].calculate(buffer[1]);
  if(rms => 0){
    setParameterValue("rms", "pre", "r", Math.pow(10, rms / 20), false);
  }
  if(getParameter(["hpf", "bypass"]) == 0){
    buffer[0] = hpf[0].process(buffer[0]);
    buffer[1] = hpf[1].process(buffer[1]);
  }
  if(getParameter(["lpf", "bypass"]) == 0){
    buffer[0] = lpf[0].process(buffer[0]);
    buffer[1] = lpf[1].process(buffer[1]);
  }
  if(getParameter(["hs", "bypass"]) == 0){
    buffer[0] = hs[0].process(buffer[0]);
    buffer[1] = hs[1].process(buffer[1]);
  }
  if(getParameter(["ls", "bypass"]) == 0){
    buffer[0] = ls[0].process(buffer[0]);
    buffer[1] = ls[1].process(buffer[1]);
  }
  if(getParameter(["lf", "bypass"]) == 0){
    buffer[0] = lf[0].process(buffer[0]);
    buffer[1] = lf[1].process(buffer[1]);
  }
  if(getParameter(["lmf", "bypass"]) == 0){
    buffer[0] = lmf[0].process(buffer[0]);
    buffer[1] = lmf[1].process(buffer[1]);
  }
  if(getParameter(["mf", "bypass"]) == 0){
    buffer[0] = mf[0].process(buffer[0]);
    buffer[1] = mf[1].process(buffer[1]);
  }
  if(getParameter(["hmf", "bypass"]) == 0){
    buffer[0] = hmf[0].process(buffer[0]);
    buffer[1] = hmf[1].process(buffer[1]);
  }
  if(getParameter(["hf", "bypass"]) == 0){
    buffer[0] = hf[0].process(buffer[0]);
    buffer[1] = hf[1].process(buffer[1]);
  }
  if(getParameter(["bypass"]) == 1){
    buffer[0] = readSample(["in", "l"]);
    buffer[1] = readSample(["in", "r"]);
  }
  var rms = rmsPost[0].calculate(buffer[0]);
  if(rms => 0){
    setParameterValue(["rms", "post", "l"], Math.pow(10, rms / 20), false);
  }
  var rms = rmsPost[1].calculate(buffer[1]);
  if(rms => 0){
    setParameterValue(["rms", "post", "r"], Math.pow(10, rms / 20), false);
  }
  writeSample(["out", "l"], buffer[0]);
  writeSample(["out", "r"], buffer[1]);
}

