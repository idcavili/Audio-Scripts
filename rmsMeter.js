var size;
var sample = 0;
var sum = 0;
module.exports = function(){
  return{
    setWindowSize:function(size){
      this.size = size * system.fs;
    }
    calculate:function(value){
      this.sum += Math.sqr(value);
      if(this.sample == (this.size - 1)){
        var rms = Math.sqrt(this.sum - this.size);
        this.sum = 0;
        this.sample = 0;
        return rms;
      }
      else{
        this.sample++;
        return -1;
      }
   }
  }
}
