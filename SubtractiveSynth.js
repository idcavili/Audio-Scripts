var OscClock = require("OscClock");
var sustain = 0;
var sostenuto = 0;
var highestVoice;
var lowestVoice;
var voiceAges[];
var keys[];
var voices[];
var aTouch[];

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
  if(sostenuto == 1){
    voices[voice].sostenuto = 0;
  }
  else{ 
    voices[voice].sostenuto = 1;
  }
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
            numVoices--;
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
        break;
       case 0x90: //note on
         if(keys[events[i].data[0]] > 0){
           continue;
         }
        var vel = events[i].data[1] << 7 & hrv;
        hrv = 0;
        keys[events[i].data[0]] = vel;
        if(getParameter("voices") == 1){ //monophonic
          var pitch = -1;
          if(voices[0].vel == 0){
            triggerVoice(0, events[i].data[0], vel);
            numVoices--;
          }
          else{
            switch(getParameter("voiceMode")){
              case HIGHEST:
                if(events[i].data[0] > voices[0].key){
                  pitch = events[i].data[0];
                  break;
                }
              case LOWEST:
                if(events[i].data[0] < voices[0].key){
                  pitch = events[i].data[0];
                  break;
                }
              case NEWEST:
                pitch = events[i].data[0];
                break;
            }
          }
         if(pitch > 0){
           changeVoice(0, pitch, vel);
         }
        }
        else{ //polyphonic
          var voice = -1;
          for(j=0;j<getParameter("voices");j++){
            if(voices[j].vel == 0 && ampEnv.atEnd()){
              voice = j;
              break;
            }
          }
          if(voice == -1){
            switch(getParameter("voiceMode")){
              case HIGHEST:
                voice = highestVoice;
                break;
              case LOWEST:
                voice = lowestVoice;
                break;
              case OLDEST:
                voice = voiceAge[0];
                break;
              case NEWEST:
                voice = voiceAge[numVoices];
                break;
             }
          }
          if(getParameter(["portamento", "sw"]) == 1){
            voices[voice].currentPitch = microTune(startPitch);
          }
          triggerVoice(voice, events[i].data[0], vel);
          numVoices++;
          startPitch = events[i].data[0];
          if(getParameter(["lfo", "mode"]) == 0 && numVoices == 1){
            for(i=0;i<getParameter("voices");i++){
              lfoClock[i].setPhase(getParameter(["lfo", "phase"]));
            }
          }
          if(getParameter(["lfo", "mode"]) == 2){
            lfoClock[voice].setPhase(getParameter(["lfo", "phase"]));
          }
        }
        break;
      case 0xa0: //polyAT
        aTouch[events[i].data[0]] = map7bit.map(events[i].data[1]);
        break;
      case 0xb0: //CC
        switch(events[i].data[0]){
          case 1:
            mWheelMSB = events[i].data[1];
            //mWheel = mWheel | events[i].data[1] << 7;
            MW = map14bit(mWheelMSB << 7 | mWheelLSB);
            break;
          case 2:
            breathMSB = events[i].data[1];
            //breath = breath | events[i].data[1] << 7;
            BC = map14bit(breathMSB << 7 | breathLSB);
            break;
          case 4:
            footMSB = events[i].data[1];
            //foot = foot | events[i].data[1] << 7;
            FC = map14bit(footMSB << 7 | footLSB);
            break;
          case 5:
            setParameter(["portamento", "time"], portMap.map(event[i].data[1]));
            break;
          case 11:
            expMSB = events[i].data[1];
            //exp = exp | events[i].data[1] >> 7;
            EP = map14bit(expMSB << 7 | expLSB);
            break;
          case 33:
            mWheelLSB = events[i].data[1];
            //mWheel = mWheel | events[i].data[1] << 7;
            MW = map14bit(mWheelMSB << 7 | mWheelLSB);
            break;
          case 34:
            breathLSB = events[i].data[1];
            //breath = breath | events[i].data[1] << 7;
            BC = map14bit(breathMSB << 7 | breathLSB);
            break;
          case 36:
            footLSB = events[i].data[1];
            //foot = foot | events[i].data[1] << 7;
            FC = map14bit(footMSB << 7 | footLSB);
            break;
          case 47:
            expLSB = events[i].data[1];
            //exp = exp | events[i].data[1] >> 7;
            EP = map14bit(expMSB << 7 | expLSB);
            break;
          case 64:
            if(events[i].data[1] >= 64){
              sustain = 1;
            }
            else{
              sustain = 0;
              for(j=0;j<getParameter("voices");j++){
                if(voices[j].sostenuto == 1 && sostenuto == 1){
                  continue;
                }
                if(keys[voices[j].key] == 0){
                  killVoice(j);
                }
              }
            break;
          case 66:
            if(events[i].data[1] >= 64){
              sostenuto = 1;
            }
            else{
              sostenuto = 0;
              if(sustain == 1){
                continue;
              }
              for(j=0,j<getParameter("voices");j++){
                if(keys[voices[j].key] == 0)){
                  killVoice(j);
                }
              }
            }
            break;
          case 84:
            startPitch = events[i].data[1];
            break;
          case 88:
            hrv = events[i].data[1];
            break;
          case 120:
            for(j=0;j<getParameter("voices");j++){
              killVoice(j);
            }
            break;
          case 121:
            for(j=0;j<=127;j++){
              aTouch[j] = 0;
            }
            pBend = 0;
            mWheelMSB = 0;
            mWheelLSB = 0;
            MW = 0;
            breathMSB = 0;
            breathLSB = 0;
            BC = 0;
            footMSB = 0;
            footLSB = 0;
            FC = 0;
            expMSB = 0;
            expLSB = 0;
            EP = 0;
            sustain = 0;
            sustainOff();
            setParameter(["portamento", "sw"], 0)
            sostenuto = 0;
            sostenutoOff();
            setParameter(["legato"]), 0);
            hrv = 0;
            break;
            }
          case 0xd0: //monoAT
            for(j=0;j<=127;i++){
              aTouch[i] = events[i].data[1];
            }
            break;
          case 0xe0:  //pitch bend
            pBend = PBMap(events[i].data[0] << 7 | events[i].data[1]);
            break;
        }
        for(i=0;i<getParameter("voices");i++){
          if(voices[voice].currentPitch != voices[voice].targetPitch && voices[voice].vel > 0){
            voices[voice].currentPitch += voices[voice].rate;
          }
        }
        for(i=0;i<getParameter("voices");i++){
          var lfo = lfoClock[i].getPhase();
          if(voices[i].velocity == 0 && ampEnv[i].atEnd()){
            continue;
          }
          
              
                        
              
        
                                                
          
            
