var Comp = require("comp");
var Hpf = require("hpf");
var Lpf = require("lfp");
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
  
}
