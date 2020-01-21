const path = require('path')


Number.prototype.pad = function(size) {
    // pads 0's to bring the size to at least 'size', and by default size=2
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

function dateStr() {
  const d = new Date() 
  date_arr = [  d.getFullYear(),
               (d.getMonth()+1).pad(),
               (d.getDate()).pad(),'T',
               (d.getHours()).pad() ,
               (d.getMinutes()).pad() ,
               (d.getSeconds()).pad(),
               //`VP.W${vp.width}.H${vp.height}_CP.X${clip.x}.Y${clip.y}.W${clip.width}.H${clip.height}`,
             ]

  date_str = date_arr.join('') 
  return date_str
}

// Equivalent of python's  "if __name__=='__main__'", this only runs if ran by itself
if (typeof require !== 'undefined' && require.main === module) {
    console.log(dateStr())
}

module.exports = dateStr














