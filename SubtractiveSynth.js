var OscClock = require("OscClock");
var sustain = 0;
var sostenuto = 0;
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

function onSample(){
  var events = getEvents("in");
  for(i=0;i<events.length;i++){
    switch(events[i].type){
      case 0x80: //note off
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
            if(voices[j].vel > 0 && voices[j].key == events[i].data[0] && voices[j].sostenuto == 0){
              killVoice(j);
              updateHighLow();
              removeVoiceAge(j);
              numVoices--;
              break;
            }
          }
            
