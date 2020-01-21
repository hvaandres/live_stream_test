/* #list of functions in this module
 *  cprint      color print,    cprint('red','sentence to print')
 *  dateStr     my favorite string representation of time: 20191125T1535
 *  execCB      --
 *  execSync    Synchronous execution of a command
 *  getSysProxy
 *  randChoice
 *  randInt
 */
const {promisify} = require('util')                                 // This will run commands asynchronously
const execSynchronously = promisify(require('child_process').exec)  // Will be a synchronous execution of the command
const path = require('path')



// ################################################################################################
// ##########                                  #cprint                                    #########
// ################################################################################################
// 
function cprint(c,input) {
  // Will only accept 2 arguments. NOT like a consoe.log that can take any number of args
  colors = {
    black : "\x1b[30m",
    red : "\x1b[31m",
    green : "\x1b[32m",
    yellow : "\x1b[33m",
    blue : "\x1b[34m",
    magenta : "\x1b[35m",
    cyan : "\x1b[36m",
    white : "\x1b[37m",
  }

  reset_color = '\x1b[0m'

  if (typeof(c)=='string') {
    c_lower = c.toLowerCase()
    if (colors[c_lower] ){
      //console.log(`${colors[c_lower].slice(1,)}${input}${reset_color.slice(1,)}`)   // For testing only
      console.log(`${colors[c_lower]}${input}${reset_color}`)
    } else {
      console.log(input)
    }
  } else {
    console.log(input)
  }
  
}



// ################################################################################################
// ##########                               #dateStr                                      #########
// ################################################################################################
Number.prototype.pad = function(size){
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



// ################################################################################################
// ##########                               #execCB                                      ##########
// ################################################################################################
// function execCB (error, stdout, stderr) {
//   return {stdout,stderr,error}
// }



// ################################################################################################
// ##########                               #execSync                                     #########
// ################################################################################################
async function execSync(cmd) {
  const {stdout, stderr} = await execSynchronously(cmd)
  return {stdout,stderr}
}



// ################################################################################################
// ##########                              #getSysProxy                                  ##########
// ################################################################################################

async function getSysProxy() {
  platform = process.platform.toLowerCase()
  if (platform.includes('win')) { 
    cmd = `reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" | find /i "proxyserver"`
    const {stdout, stderr} = await execSync(cmd)
    out = stdout.slice( stdout.search(/[0-9]/) ).trim().split(':')
    return out
  } else if (platform.includes('linux')){
    
  }
}



// ################################################################################################
// ##########                           #randChoice                                      ##########
// ################################################################################################
/*
 * randChoice( some_array, [n])
 */
function randChoice() {
  arr = arguments[0]
  
  // if only an array is sent, it is assumed you wanna pick 1 item only from the array
  if (arguments.length==1){
    n = 1
  } else if (arguments.length > 2 || arguments.length == 0) {
    throw new Error('Wrong number of arguments. must be 1 or 2.')
  }

  if (n < 1) {
    throw new Error('Second argument is number of choices to make. Must be a positive non-zero integer.')
  }

  if (n==1) 
    return arr[randInt(arr.length - 1)]
  else {
    out = []
    indices = 0
    for (i=0; i<n; i++) {
      pass 
    } 
  }
}



// ################################################################################################
// ##########                              #randInt                                      ##########
// ################################################################################################
/*
 * 
 * USAGE:
 *      randInt(5)      a random integer between 0 and 5 inclusive
 *      randInt(3,6)    a random integer between 3 and 6 inclusive
 *      randInt(6,3)    same as randInt(3,6)
 *      randInt(4,4)    return 4
 *
 */
function randInt() {
  if (arguments.length == 1) {
    n = arguments[0]
    return Math.floor( Math.random() * (n+1))
    
  } else if ( arguments.length == 2 ) {
    a = arguments[0]
    b = arguments[1]

    if (a>b) {
      tmp = a
      a = b
      b = tmp
    } else if (a==b) {
      return a
    }

    return a + (Math.floor( (b-a+1) * Math.random() ))
  } else {
    throw new Error('Wrong number of arguments (must be 1 or 2)')
  }
}










// Equivalent of python's  "if __name__=='__main__'", this only runs if ran by itself
// if (typeof require !== 'undefined' && require.main === module) {
//     console.log(dateStr())
// }


// ################################################################################################
// ##########                            #export statements                               #########
// ################################################################################################
//                    d88888b db    db d8888b.  .d88b.  d8888b. d888888b .d8888. 
//                    88'     `8b  d8' 88  `8D .8P  Y8. 88  `8D `~~88~~' 88'  YP 
//                    88ooooo  `8bd8'  88oodD' 88    88 88oobY'    88    `8bo.   
//                    88~~~~~  .dPYb.  88~~~   88    88 88`8b      88      `Y8b. 
//                    88.     .8P  Y8. 88      `8b  d8' 88 `88.    88    db   8D 
//                    Y88888P YP    YP 88       `Y88P'  88   YD    YP    `8888Y'
//                    
// Can export in 2 diff ways:
//     method 1:
//              exports.cprint = cprint             // Note it is "exports" with "s" at the end
//              exports.dateStr = dateStr 
//     method 2:
//              module.exports = {cprint:cprint, dateStr:dateStr, ...}
//              OR w/ the new syntax:
//              module.exports = {cprint, dateStr, ...}
// Can import by:
//     cosnt myUtils = require('..path to this file...')
//   and then 
//     cprint = myUtils.cprint
//   OR
//     const {cprint, dateStr} = myUtils


module.exports = {
  cprint, 
  dateStr, 
  execSync, 
  getSysProxy,
  randChoice,
  randInt,
}




