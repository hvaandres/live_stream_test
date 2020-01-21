/*
 *
 * Known bugs:  
 *   --path ./x/   saves files as x_bw.jpg!
 *   --path ../    caves files as .._bw.jpg!
 */
const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const os = require('os')
const argv = require('yargs')
      .usage(`CLI Usage: 
          --path [takes a full file name (w/ relative or absolute path), path only, relative or absolute]  
          --time [15m | 1h | 12h | 24h | 1w | 1m | 1y ]`)
      .argv


const hostname = os.hostname().toLowerCase()
const platform = process.platform.toLowerCase()

// The images contain a thich block border, of width 70.
const clip = { 
   x: 70, 
   y: 70, 
  width: 659,
  height: 450 
}
 


if (hostname.includes('vince')) {
  NODE_LIBRARY =  "/home/vince/Documents/CODING/HTML_CSS_JS_Javascript/NODE_LIBRARY/"
} else if (platform.includes('win')) {
  NODE_LIBRARY = "c:\\testing\\NODE_LIBRARY\\"
} else {
  NODE_LIBRARY = '/testing/NODE_LIBRARY/'
}


const dateStr = require(path.join(NODE_LIBRARY,'dateStr.js'))

CREDS = {username:'admin', password:'admin'}
USERNAME_SELECTOR = '#username'
PASSWORD_SELECTOR = '#password'
BUTTON_SELECTOR = '#content-wrap > form > table > tbody > tr:nth-child(4) > td > input[type=submit]'

// The webpage with the graphs. This actually generates the graph, after which we can go grab the png directly
bw_graph_url_web =  "https://10.6.254.37:8443/manage/ApplianceMonitoring.php?mon=GraphBandwidth"
cpu_graph_url_web = "https://10.6.254.37:8443/manage/ApplianceMonitoring.php?mon=GraphCpu"

bw_graph_url  = "https://10.6.254.37:8443/manage/images/bwidth-15m-AVERAGE.png"   // by default goes to 254.37, 15 min average
cpu_graph_url = "https://10.6.254.37:8443/manage/images/cpuall-15m-AVERAGE.png"

log_url = "https://10.6.254.37:8443/manage/Login.php"

dir_name = path.join( process.cwd(), '/graphs')
if (!fs.existsSync(dir_name)) {
  fs.mkdirSync(dir_name)
}

async function start(args) {  
 
  time_selectors = { 
    "15m" : "input[value='Last 15 Minutes']",
    "1h"  : "input[value='Last Hour']",
    "12h" : "input[value='Last 12 Hours']",
    "24h" : "input[value='Last 24 Hours']",
    "1w"  : "input[value='Last Week']",
    "1m"  : "input[value='Last Month']",
    "1y"  : "input[value='Last Year']",
  }


  // Setting the values for time selection AND path selection. Set defaults first
  time = "15m"      // will be overwritten if args.time exists
  file_name_base = "graph_" + dateStr() + "_"
  file_name_end_bw = "_bw.jpg"
  file_name_end_cpu = "_cpu.jpg"

  if (typeof(args) != "undefined") { // if args sent

    if (args.path){
    //console.log(path.sep)
    //console.log(path.basename(args.path))
    //console.log(path.dirname(args.path))
      if (args.path.endsWith( path.sep ) ) { // dir given only
        dir_name = args.path
      } else if (path.basename(args.path) == args.path) {    // filename given only
        file_name_bw = args.path + file_name_end_bw
        file_name_cpu = args.path + file_name_end_cpu
      } else {  // if path includes both directory AND file name
        dir_name = path.dirname(args.path)
        file_name_bw = path.basename(args.path) + file_name_end_bw
        file_name_cpu = path.basename(args.path) + file_name_end_cpu
      }    
    }

    if (args.time) {
      if (time_selectors[args.time]) {
        time = args.time
      }
    }

    if (args.proxy) {
      proxy = args.proxy
      if (proxy.includes(':')) { // if the proxy has ':', the port after it must be the secure reverse service port and not the gui port. 
        // and if not, just add gui port to it
        proxy = proxy.substring(0, proxy.indexOf(':')) + ':8443'
      } else {
        proxy = proxy + ':8443'
      }

      bw_graph_url_web =  "https://" + proxy +  "/manage/ApplianceMonitoring.php?mon=GraphBandwidth"
      cpu_graph_url_web = "https://" + proxy +  "/manage/ApplianceMonitoring.php?mon=GraphCpu"

      bw_graph_url = "https://" + proxy + "/manage/images/bwidth-15m-AVERAGE.png"
      cpu_graph_url = "https://" + proxy + "/manage/images/cpuall-15m-AVERAGE.png"
        
    }

  }

  if (typeof(file_name_bw)=="undefined") { //either only path was sent or nothing at all
    file_name_bw = file_name_base + time + file_name_end_bw
    file_name_cpu = file_name_base + time + file_name_end_cpu
  }


  full_file_path_bw = path.join(dir_name, file_name_bw)
  full_file_path_cpu = path.join(dir_name, file_name_cpu)
  //console.log(`dir_name: ${dir_name}, file_name_bw: ${file_name_bw}`)
  //console.log(`full_file_path_bw: ${full_file_path_bw}`)

  //console.log(args)
  //console.log('file_name_bw= ', file_name_bw)
  //console.log('full_file_path_bw= ', full_file_path_bw)
  //console.log('bw_graph_url is: ------> ' + bw_graph_url)


  launch_args = {
    headless:true,
  }

  const browser = await puppeteer.launch(launch_args)
  const pages = await browser.pages()
  page = pages[0]

  await page.goto(bw_graph_url_web)
  
  //await page.waitForNavigation()
  //await page.waitFor(10 * 1000)
  url = page.url()
  if ( url.includes('Login.php')) {
    await page.waitForSelector(USERNAME_SELECTOR)

    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(CREDS.username);
    
    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(CREDS.password);
    
    await page.click(BUTTON_SELECTOR);
    // await page.waitForNavigation()

    // DIDN"T WORK
    //await Promise.all([await page.click(BUTTON_SELECTOR), await page.waitForNavigation()

    // think no need for this:
    //await page.goto(bw_graph_url_web)
  } 


  // Even though I want to grab the actual 'png' image url, in order for it to actually be generated, we
  // need to go to webpage, click on the time button we want. And then I'll grab the screenshot from the png.
  selector = time_selectors[time]   // selector for the button that says 'Last 15 Minutes', or 'Last Hour', etc.

  await page.waitForSelector(selector, {timeout:60000,visible:true})
    .then(()=>{}, async ()=> {await page.waitForSelector(selector)})

  // Clicking on the object w/ that selector : 2 methdos
  // method 1: page.click(selector)     but throws timeout error once in a while
  //await page.click(selector)
  // method 2
  await page.evaluate( (sel) => {
    const el= document.querySelector(sel)
    el.click()
  },selector )

  await page.waitFor(2000)

  // Now that the png is generated, actually to the image and take  screenshot
  await page.goto(bw_graph_url)
  //console.log('bw_graph_url_web again: ' + bw_graph_url_web)
  //console.log('bw_graph_url again: ' + bw_graph_url)
  await page.screenshot({
    path: full_file_path_bw,
    clip: clip
  }).then( 
      //()=>console.log(`graphCPUBandwidth: ${full_file_path_bw} taken\t${dateStr()}`),
      ()=>console.log(`\t${file_name_bw} taken\t${dateStr()}`),
      (e)=>console.log(`*****graphCPUBandwidth: Something went wrong generating ${full_file_path_bw}:${dateStr()}\n${e}\n`) 
    )





  // getting cpu screenshot
  await page.goto(cpu_graph_url_web)
  await page.waitForSelector(selector, {timeout:60000,visible:true})
    .then(()=>{}, async ()=> {await page.waitForSelector(selector)})

  // Clicking on the object w/ that selector : 2 methdos
  // method 1: page.click(selector)     but throws timeout error once in a while
  //await page.click(selector)
  // method 2
  await page.evaluate( (sel) => {
    const el= document.querySelector(sel)
    el.click()
  },selector )
  await page.waitFor(2000)

  // ------ no actually take screenshot of png
  await page.goto(cpu_graph_url)
  //console.log('cpu_graph_url_web again: ' + cpu_graph_url_web)
  //console.log('cpu_graph_url again: ' + cpu_graph_url)
  await page.screenshot({
    path: full_file_path_cpu,
    clip: clip
  }).then( 
      //()=>console.log(`\tgraphCPUBandwidth: ${full_file_path_cpu} taken\t${dateStr()}`),
      ()=>console.log(`\t${file_name_cpu} taken\t${dateStr()}`),
      (e)=>console.log(`*****graphCPUBandwidth: Something went wrong generating ${full_file_path_cpu}:${dateStr()}\n${e}\n`) 
    )




 
  await browser.close()
    //.then( () => console.log('graphCPUBandwidth ran successfully '+dateStr()), ()=>'!!graphCPUBandwidth:not closing browser '+dateStr())
    .catch( (e)=> console.log(`*****Oops something went wrong closing the tab (graphCPUBandwidth.js):\n${e}`) ) 
}


// Equivalent of python's  "if __name__=='__main__'", this only runs if ran by itself
if (typeof require !== 'undefined' && require.main === module) {
  if (typeof(argv) == "undefined") start()
  else start(argv) 
}


//export graphCPUBandwidth  //ES6 syntax, needs babel.
module.exports = start // older syntax




