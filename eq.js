var hpf = require("hpf");
var lpf = require("lpf");
var hsf = require("hishelf");
var lsf = require("loshelf");
var peq = require("peq");
var rms = require("rms");

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
  setParameterValue(["hpf", "freq"], 20000, false);
  setParameterCallback(["hpf", "freq"], setCoeff);
  //LPF
  addParameter(["lpf", "bypass"]);
  setParameterType(["lpf", "bypass"], 1);
  setParameterStates(["lpf", "bypass"], [0, 1], ["Unbypassed", "Bypassed"]);
  setParameterValue(["lpf", "bypass"], 0, false);
  addParameter(["lpf", "freq"]);
  setParameterType(["lpf", "freq"], 0);
  setParameterRange(["lpf", "freq"], 20, 20000, 1, "Hz");
  setParameterValue(["lpf", "freq"], 20, false);
  setParameterCallback(["lpf", "freq"], setCoeff);
}
