var phase = 0;
var twoPi = 6.28318531;
var rate;
module.exports = function(){
  return{
    setFreq:function(freq){
      this.rate = twoPi * freq / system.fs;
     },
     getPhase:function(){
      return this.phase;
     },
     setPhase:function(phase){
      this.phase = Math.floor(phase / this.rate) * this.rate:
     },
     getNextValue:function(){
      if(this.phase == this.twoPi){
        this.phase = 0;
       }
       else{
        this.phase += this.rate;
       }
      return this.phase;
     }
    }
   }
