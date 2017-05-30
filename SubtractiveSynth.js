var OscClock = require("OscClock");
var sustain = 0;
var sostenuto = 0;
var keys[];
var voices[];

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
            
