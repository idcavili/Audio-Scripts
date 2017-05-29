var OscClock = require("OscClock");

function onSample(){
  var events = getEvents("in");
  for(i=0;i<events.length;i++){
    switch events[i].type{
      case 0x80:
        
