var OscClock = require("OscClock");
var sustain = 0;
var sostenuto = 0;
var highestVoice;
var lowestVoice;
var voiceAges[];
var keys[];
var voices[];

function killVoice(voice){
  voices[voice].vel = 0;
  pitchEnv[voice].setStage(4);
  filterEnv[voice].setStage(4);
  ampEnv[voice].setStage(4);
}
function changeVoice(voice, pitch, vel){
  voices[voice].vel = vel;
  voices[voice].key = pitch;
  voices[voice].targetPitch = microTune(pitch);
  if(getParameter("portamento", "sw") == 1){
    voices[voice].rate = (voices[voice].targetPitch - voices[voice].currentPitch) / portTime;
  }
  else{
    voices[voice].currentPitch = voices[voice].targetPitch;
  }
  if(getParameter("legato") == 0){
    pitchEnv[voice].setStage(0);
    filterEnv[voice].setStage(0);
    ampEnv[voice].setStage(0);
  }
}
function triggerVoice(voice, pitch, vel){
  voices[voice].vel = vel;
  voices[voice].key = pitch;
  voices[voice].targetPitch = microTune(ptich);
  if(getParameter("portamento", "sw") == 1){
    voices[voice].rate = (voices[voice].targetPitch - voices[voice].currentPitch) / portTime;
  }
  else{
    voices[voice].currentPitch = voices[voice].targetPitch;
  }
  pitchEnv[voice].setTime(0, getParameter("pitch", "time", "attack") + vel * getParameter("vel", "pitchAttack"));
  filterEnv[voice].setTime(0, getParameter("filter", "env", "time", "attack") + vel * getParameter("vel", "filterAttack"));
  ampEnv[voice].setTime(0, getParameter("amp", "attack") + vel * getParameter("vel", "ampAttack"));
  ampEnv[voice].setTime(0, getParameter("amp", "decay") + vel * getParameter("vel", "ampDecay"));
  ampEnv[voice].setLevel(0, getParameter("amp", "sustain") + vel * getParameter("vel", "ampSustain"));
  pitchEnv[voice].setStage(0);
  filterEnv[voice].setStage(0);
  ampEnv[voice].setStage(0);
}

function onSample(){
  var events = getEvents("in");
  for(i=0;i<events.length;i++){
    switch(events[i].type){
      case 0x80: //note off
        if(keys[events[i].data[0]] == 0){
          continue;
        }
        keys[events[i].data[0]] = 0;
        if(getParameter("voices") == 1){  //monophonic
          if(sustain == 1 || sostenuto == 1){
            continue;
          }
          var vel = 0;
          var pitch;
          switch(getParameter("voiceMode")){
            case HIGHEST:
            case NEWEST:
              for(j=events[i].data[0];j<=0;j--){
                if(keys[j] > 0){
                  pitch = j;
                  vel = keys[j];
                  break;
                }
              }
              break;
            case LOWEST:
              for(j=events[i].data[0];j>=127;j++){
                if(keys[j] > 0){
                  pitch = j;
                  vel = keys[j];
                  break;
                }
              }
              break;
          }
          if(vel > 0){
            changeVoice(0, pitch, vel);
          }
          else{
            killVoice(0);
          }
        }
        else{ //polyphonic
          if(sustain == 1){
            continue;
          }
          for(j=0;j<getParameter("voices");j++){
            if(voices[j].key == events[i].data[0]){
              if(voices[j].sostenuto == 1 && sostenuto == 1){
                break;
              }
              killVoice(j);
              updateHighLow();
              removeVoiceAge(j);
              numVoices--;
              break;
            }
          }
        }
       case 0x90: //note on
         if(keys[events[i].data[0]] > 0){
           continue;
         }
        var vel = events[i].data[1] << 7 & hrv;
        hrv = 0;
        keys[events[i].data[0]] = vel;
        if(getParameter("voices") == 1){ //monophonic
          var pitch = -1;
          switch(getParameter("voiceMode")){
            case HIGHEST:
              if(events[i].data[0] > voices[0].key){
                pitch = events[i].data[0];
                break;
            case LOWEST:
              if(events[i].data[0] < voices[0].key){
                pitch = events[i].data[0];
                break;
            case NEWEST:
              pitch = events[i].data[0];
           }
          
                
            
