var slope;
var intercept;
module.exports = function(){
  return{
    setRange:function(inMin, inMax, outMin, outMax){
      this.slope = (outMax - outMin) / (inMax - inMin);
      this.intercept = outMax - inMax;
     }
     map:function(value){
      return value * this.slope + this.intercept;
     }
   }
}
