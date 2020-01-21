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

//  new_input =[input]
//
//  if (typeof(c)=='string') {
//    c_lower = c.toLowerCase()
//    if (colors[c_lower] ){
//      new_input.unshift(colors[c_lower])
//      new_input.push(reset_color)
//    }
//
//  }
//
//  console.log(...new_input)

  if (typeof(c)=='string') {
    c_lower = c.toLowerCase()
    if (colors[c_lower] ){
      // console.log(`${colors[c_lower].slice(1,)}${input}${reset_color.slice(1,)}`)  // for testing only
      console.log(`${colors[c_lower]}${input}${reset_color}`)
    } else {
      console.log(input)
    }
  } else {
    console.log(input)
  }
  
//------- to make it so that it can accept any number of args:  wasn't working because i gotta
  //append the color code and the reset_color code to every input and so gotta consider:
  //1. was the 1st input even a real color?
  //2. was it a string, and if not stringify it
//   args = arguments
// 
//   if (args.length > 1) {
//     if (typeof(args[0]) == 'string') {
//       console.log('xxx')
//       a0_lower = args[0].toLowerCase()
//       //a0_lower = a0.toLowerCase()
//       if (colors[a0_lower]){
//         console.log('yyy')
//         args[0] = colors[a0_lower]
//         args[args.length+1] = reset_color
//         console.log('args changed:')
//         console.log(args)
//       }
//     }   
//   }
// 
//   console.log(...args)


}


// cprint('red',"Hello","my name" ,"is", "vince")
// cprint('god','damn it', 'haha')
// cprint('blue',1,2,3)
// cprint(1,2,3)


// cprint('red','helloooo how you be')
// console.log('2nd line')
// cprint('blue','god damn it')
// cprint('shit', 'hahaha')
// cprint('blue',3)
// cprint('whatever', 'normal color?')
// cprint(3,4)
// console.log(4)

module.exports = cprint
