/*
 * Last revised on:  2018 Jan 08, 16:45
 *
 #****************************************************************************
 #
 # (C) Copyright 2007 - 2020 SuperLumin Networks
 # All Rights Reserved.
 #
 # This program is an unpublished copyrighted work which is proprietary
 # to SuperLumin Networks, LLC. and contains confidential information that
 # is not to be reproduced or disclosed to any other person or entity without
 # prior written consent from SuperLumin Networks, LLC. in each and every
 # instance.
 #
 # WARNING:  Unauthorized reproduction of this program as well as
 # unauthorized preparation of derivative works based upon the
 # program or distribution of copies by sale, rental, lease or
 # lending are violations of federal copyright laws and state trade
 # secret laws, punishable by civil and criminal penalties.
 #
 #    Author:  Vince Payandeh
 #  Workfile:  test.js
 #
 # Required modules:  (See package.json)
 #***************************************************************************
 #
 #  1. Create project folder and cd into it   OR     $ git clone ....  
 #  2. git init; git remote add origin
 #  2. # npm init -y    # only did this at the outset, to create the project and the package.json
 #  3. npm install --save puppeteer         OR  --save-dev           IF already didn't have a package.jsong file
 #  4. npm install -g puppeteer-loadtest
 #  
 #  Running on Windows, either go to cmd.exe (located in C:\.   \System32\   which I added to the path in bashrc) and from Win Cli:
 #     > node test.js   --tabs 2  . . . 
 #  Or call it via linux bash:
 #     $ cmd.exe /c 'node test.js --tabs 2  .... '           OR even w/o quote
 #  Or call it on linux:
 #     $ node test.js --tabs-time 15s --tabs-no 10 --vid-len 10m --vid-quality 8 --proxy 10.6.254.37:8080 --graph --headless
 #     $ node test.js --tabs-time 15s --tabs-no 10 --overlap-time 6m --vid-quality 8 --proxy 10.6.254.37:8080 --graph --headless
 # 
 #         OR  using the 'test_from_tester.sh'
 #
 #     $ ./test_from_tester.sh -t 10 -T 22 -p 10.6.254.37:8080 -o 4m                # working on the rest of the arguments to work
 # 
 #  ----------loadtest---------
 #  $. \node_modules\.bin\puppeteer-loadtest --s=1 --c=10 --file=./test.js      
 #  OR  puppeteer-loadtest --s=1 --c=10 --file=./test.js         in Windows cmd.exe
 #       where 
 #       's' is sample size, that is how many times to repeat the code
 #       'c' number of concurrent runs 
 # 
 #    cmd.exe /c 'puppeteer-loadtest --s=1 --c=2 --file="test.js --tabs 5--vid-len=10m --vid-quality 8 "'
 #    
 # 
 #             
 */

const puppeteer = require('puppeteer')
const os1 = require('os')
const os2 = require('os-utils')
const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const exec = promisify(require('child_process').exec)
const argv = require('yargs')
      .usage(`Usage  (--tabs [tabs-num] OR --tabs-no [num]) \
             --tabs-time [num: time between tabs opening up] \
             --vid-len [ int:in minutes, | 5m | 200s | 3:30, if this given dont give overlap-time] \
             --overlap-time [ time, if this given dont give vid-len] \
             --usage-time [num: time interval between usage update in sec] \
             --usage-print  
             --headless 
             --vid-quality [num from 0-8, 0 being auto, increasing quality; OR "6M",4.3M...] \
             --proxy [proxy address]
             --no-graph   or  --graph      first one makes arg.graph to false, and 2nd to true! By default (w/o any, it is false,no graph)
             --chromium
             --clear-cache`)
      .argv
      //  --tabs== --tabs-no    --tabs-time   vid-len    use-time   use-print     vid-quality



const bandwidthGraph = require('./bandwidthGraph.js')

const hostname = os1.hostname().toLowerCase()
const platform = process.platform.toLowerCase()



if (hostname.includes('vince')) {
  NODE_LIBRARY =  "/home/vince/Documents/CODING/HTML_CSS_JS_Javascript/NODE_LIBRARY/"
} else if (platform.includes('win')) {
  NODE_LIBRARY = "c:\\testing\\NODE_LIBRARY\\"
} else {
  NODE_LIBRARY = '/testing/NODE_LIBRARY/'
}

//const dateStr = require(path.join(NODE_LIBRARY,'dateStr'))
// const dateStr = require(path.join(NODE_LIBRARY,'myUtils')).dateStr
// const cprint = require(path.join(NODE_LIBRARY,'cprint'))
// const getSysProxy = require(path.join(NODE_LIBRARY,'myUtils')).getSysProxy

const {
  dateStr,
  cprint,
  execSync,
  getSysProxy,
} = require(path.join(NODE_LIBRARY, 'myUtils'))

//const getCurrProxy = require(path.join(NODE_LIBRARY, 'myUtils')).getCurrProxy

//console.log(argv)
//console.log(`typeof argv.cpu-print: ${argv.usagePrint ? typeof(argv['use-print']) : 'no use-print sent'}`)


byte2GB = 1024 * 1024 * 1024
cpu_usage_init = 0
mem_usage_init = 0


os2.cpuUsage( (v)=> {
  cpu_usage_init  = parseFloat((v*100).toFixed(2))
  mem_usage_init = parseFloat( ((os1.totalmem()-os1.freemem()) / byte2GB ).toFixed(2))
})


// async function execSync(cmd) {
//   const {stdout, stderr} = await exec(cmd)
//   cprint('blue', 'in execSync, shell_out=' +stdout)
//   return stdout
// }




if (platform.includes('win')) {
  path_chrome = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  path_chromium1 = "C:\\testing\\live_stream_test\\node_modules\\puppeteer\\.local-chromium\\win64-686378\\chrome-win\\chrome.exe"
  cmd = `reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" | find /i "proxyserver"`
  // system_proxy = ''
  // cprint('red', 'hereeeeeeee')
  // app1 = exec(cmd, (error,stdout,stderr)=>{
  //   cprint('red','in execSyn stdout was:\n'+stdout)
  //   test_proxy = stdout
  //   cprint('red', 'in execSync: test_proxy:' + test_proxy)
  // })
  //test_proxy = await execSync(cmd)
  //cprint('blue','right outisde execSynd: test_proxy:'+test_proxy)

} else {
  path_chrome = '/usr/bin/google-chrome-stable'
  path_chromium1 = '/usr/bin/chromium-browser'
}

// FROM: https://stackoverflow.com/questions/50607866/setting-specific-chrome-flags-in-puppeteer-enable-and-disable?rq=1
//   Chrome's launch arguments|parameters, switches
//   args:  [ '--no-sandbox', '--disable-accelerated-2d-canvas', '--disable-gpu', '--disable-setuid-sandbox']    <----- for linux especially
//      "--disable-plugins'
//      "--disable-features=LookalikeUrlNavigationSuggestionsUI'
//      "--flag-switches-begin", 
//      "--enable-webgl-draft-extensions",
//      "--enable-features=SharedArrayBuffer", 
//      "--disable-features=AsmJsToWebAssembly",
//      "--flag-switches-end"
//
//
//            ???
//      --disable-sofware-rasterizer      //Disables the use of a 3D software rasterizer
//      --force-gpu-mem-available-mb      // Sets the total amount of memory that may be allocated for GPU  resources ↪
//      --force-gpu-rasterization         // Always use the Skia GPU bakend for drawing layer
//                                        //     tiles. Only valid with GPU
//      --gpu-preferences                 //passes encoded GPUPreferences to GPU process 
//      --bypass-app-banner-engagement-checks    // causes the user engagement checks for showing app banners to be bypasses. Intended for 
//                                         //    developers whoe wish to test that ther site otherwise meet the criteria needed
//      --sync-short-nudge-delay-for-test  // This flag significantly shortens the delay between nudge cycles. Its primary purpose is to speed up 
//                                         //integration tests. The normal delay allows coalescing and prevention of server overload, so don't use 
//                                         // this unless you're really sure that it's what you wan
//      --disable-best-effort-tasks        // Delays execution of TaskPriority::BEST_EFFORT tasks until shutdown. This optimization may cause other problems since
//                                         // some tasks aren't launched when they're supposed to. So its experimental
//      --disable-2d-canvas-clip-aa      // Disable antialiasing on 2d canvas clips  
//      --disable-2d-canvas-image-chromium // Disables Canvas2D rendering into a scanout buffer  for overlay support.
//

//  args: [ 
//    '--disable-plugins',
//    '--process-per-site',
//    '--disable-gpu-driver-bug-workarounds',  // FROM:https://superuser.com/questions/645918/how-to-run-google-chrome-with-nvidia-card-optimus
//    '--disable-software-rasterizer',
//    '--force-gpu-mem-available-mb',
//    '--force-gpu-rasterization',
//    '--gpu-preferences',
//    '--bypass-app-banner-engagement-checks',
//    '--sync-short-nudge-delay-for-test',
//    '--disable-best-effort-tasks',
//    '--disable-2d-canvas-clip-aa',
//    '--disable-2d-canvas-image-chromium',
//  ]
//


const launch_args = {
  headless: argv.headless ? true : false,
  executablePath: argv.chromium ? path_chromium1 : path_chrome,
  devtools:false,
  timeout: 0,     
  args: [ 
    '--disable-plugins',
    '--process-per-site',
    '--disable-gpu-driver-bug-workarounds',
    '--disable-software-rasterizer',
    '--force-gpu-mem-available-mb',
    '--force-gpu-rasterization',
    '--gpu-preferences',
    '--bypass-app-banner-engagement-checks',
    '--sync-short-nudge-delay-for-test',
    '--disable-best-effort-tasks',
    '--disable-2d-canvas-clip-aa',
    '--disable-2d-canvas-image-chromium',
  ]
}

launch_args.args = [
  '--no-sandbox',
  '--ignore-certificate-errors',
]

console.log(launch_args)


// function execCB (error, stdout, stderr) {
//   if (error) {
//     cprint('red',`ERROR : ${error}`)     
//     return
//   }
//   cprint('red', 'in execCB')
//   cprint('red', 'stdout: ' + stdout);
//   argv.proxy = stdout
// }
// 
// function getCurrProxy() {
//   cprint('red','in getCurrProxy')
//   cmd = `reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" | find /i "proxyserver"`
//   app = execSyn(cmd, execCB)
//   console.log("app.constructor.name:"+app.constructor.name)
// }


// --------------- cache-related -----------------
system_default_proxy = "10.6.254.37:8080"   // TODO dynamically get it
if (argv.proxy) {
  if (! argv.proxy.includes(':')){ // by default goes through 8080 port, unless specified
    argv.proxy = argv.proxy + ":8080"
  }
} else {
  argv.proxy = system_default_proxy
}
launch_args.args.push('--proxy-server=' + argv.proxy)


//cprint('red',argv.proxy) 

// If no proxy sent get the system's proxy via windows CLI command:
// --------- clearing the cache ------
if (argv.clearCache) {
  if (argv.proxy) {
    cmd = `ssh root@{argv.proxy} 'rm /var/log/sln/iproxy/stats/*.rrd && /opt/sln/iproxy/bin/sln-iproxy-rrdcreate && touch /var/opt/sln/iproxy/cache/.cacheClear && systemctl restart iproxy'`
    app = execSync(cmd, execCB)
  } else {
    cprint('red','WARNING: no proxy was sent in order to clear its cache!')
  }
}






const site1 = "https://ampdemo.azureedge.net/azuremediaplayer.html?url=%2F%2Famssamples.streaming.mediaservices.windows.net%2F49b57c87-f5f3-48b3-ba22-c55cfdffa9cb%2FSintel.ism%2Fmanifest&muted=true&aes=true"


const browsers_no = 1
const tabs_no = (argv.tabs || argv.tabsNo) ? (argv.tabs || argv.tabsNo) : 1
const time_interval_between_tabs = argv.tabsTime ? parseTime(argv.tabsTime) : 30 * 1000 // in ms, time between 2 consequetive tabs opening
const cpu_usage_interval = argv.usageTime ? argv.usageTime*1000 : 500 // in ms  // if sent as cli arg, user sends as 'seconds'
const print_cpu_usage = argv.usagePrint ? argv.usagePrint : false


function parseTime(t) { 
  if (typeof(t) == "string") {
    t = t.toUpperCase()
    
    if (t.includes('M')) {
      m = t.replace('M','')
      s = '0'
    } else if (t.includes('S')) {
      m = '0'
      s = t.replace('S','')
    } else if (t.includes(':')) {
      s_ = t.split(':')
      m = t_[0]
      s = t_[1]
    } else if (t.includes('.')) {
      // a float number given, assumed to be 'minutes' (just like normal number assumed to be min)
      m = t
      s = '0'
    }

    m = parseFloat(m)
    s = parseFloat(s)
    out = parseFloat(m) * 60 * 1000 + parseFloat(s) * 1000 

  } else if (typeof(t) == "number") { // assumed to be in minutes
    m = t 
    s = 0
  }
  out = m * 60 * 1000 + s * 1000
  return out
}



// ---- determining video length ------
vid_length = 10 * 60 * 1000 // default value, in ms//
vl = argv.vidLen
ot = argv.overlapTime
if (vl && ot) {
  cprint('red'," ******** WARNING! vid-len and overlap-time are mutually exclusive *******")
  cprint('red',"\t Ignoring overlap time and just gonig by video length")
  vid_length = parseTime(vl)
} else if (vl){
  vid_length = parseTime(vl)
} else if (ot) {
  ot_ = parseTime(ot)
  vid_length = (tabs_no - 1) * time_interval_between_tabs + (tabs_no * 3000) + ot_  // allow a 3s delay in opening each tab
}



// ---- determining video quality ------
vid_quality = {"Auto"   : "li[aria-label='Auto']",
              "6Mbps"   : "li[aria-label='816p-6Mbps']",
              "4.7Mbps" : "li[aria-label='816p-4.7Mbps']", 
              "3.4Mbps" : "li[aria-label='544p-3.4Mbps']", 
              "2.2Mbps" : "li[aria-label='408p-2.2Mbps']", 
              "1.5Mbps" : "li[aria-label='408p-1.5Mbps']", 
              "995Kbps" : "li[aria-label='272p-995.1Kbps']",
              "645Kbps" : "li[aria-label='272p-645.3Kbps']",
              "395Kbps" : "li[aria-label='136p-395.4Kbps']",
	     }

if (argv.vidQuality) {
  if (typeof(argv.vidQuality) == 'boolean') {
    cprint('red'," *********** WARNING ********* No video quality was actually send. Highest quality selected.")
    q_str = "6Mbps"
  } else if (typeof(argv.vidQuality) == 'string') {
      if (argv.vidQuality.toUpperCase() == 'AUTO') {
        q_str = "Auto"
      } else {
        q_str = argv.vidQuality.toUpperCase() + "bps"
     }
  } else if (typeof(argv.vidQuality) == "number") {
      switch(argv.vidQuality) {
	case 0:"Auto"
          q_str = "Auto"
	  break
	case 1:
          q_str = "395Kbps"
	  break
	case 2:
          q_str = "645Kbps"
	  break
	case 3:
          q_str = "995Kbps"
	  break
	case 4:
          q_str = "1.5Mbps"
	  break
	case 5:
          q_str = "2.2Mbps"
	  break
	case 6:
          q_str = "3.4Mbps"
	  break
	case 7:
          q_str = "4.7Mbps"
	  break
	case 8:
          q_str = "6Mbps"
	  break
        default:
          q_str = "6Mbps"
      }
  }
} else {
    q_str = "6Mbps"
}
sel = vid_quality[q_str]


all_args = { headless : launch_args.headless,  
             browsers_no, 
             tabs_no, 
             time_interval_between_tabs, 
             vid_length, 
             cpu_usage_interval, 
             print_cpu_usage,
             vid_quality : q_str,
             graph: argv.graph ? true : false,
             proxy: argv.proxy,
}
            
console.log(`\n\nAll settings:\n${JSON.stringify(all_args, null,'\t')}\n\n`)
console.log(`Total memory available: ${os1.totalmem() / byte2GB } GB`)





let cpu_usage_all = {}
let cpu_usage_avg = {}
let mem_usage_all = {}
let mem_usage_avg = {}

//process.argv[2] ? console.log(process.argv.slice(2)) : console.log('no arguments sent')




/******************************************************************************
 *                                #helpers
 *****************************************************************************/
function timeStamp(){
  return new Date().toLocaleString()
}


function doSetTimeout(i){
  setTimeout( ()=> {
    cprint('green', `----- Closing tab ${i+1},\t\t${timeStamp()}`)
    pages[i].close()
  },vid_length)
}


function average(arr) {
  //console.log(`   Inside average, arr= ${arr},\t\ttype of firstel:${arr.map( x=> {console.log(x.constructor.name);return x})}`)
  if (arr.length<1) {
    return 0
  }
  sum =  arr.reduce( (accumulator,currentVal) => {return accumulator + currentVal} )
  //console.log(`\t   sum :${sum }`)

  return parseFloat( (sum /arr.length).toFixed(2))
}


function onlyUnique(value,index,self) {
  return self.indexOf(value) === index
}


function getUniques(arr) {
  return arr.filter(onlyUnique)
}


function printCpuUsageAverages() {
  //console.log(`cpu_usage_all as json: ${JSON.stringify(cpu_usage_all, null,'\t')}`)
  //console.log(`cpu_usage_all as json: ${JSON.stringify(mem_usage_all, null,'\t')}`)

  let cpu_usage_all_arr = []
  let mem_usage_all_arr = []
  for (var x of Object.keys(cpu_usage_all)) {
    //console.log(`cpu_usage_all[${x}]= ${cpu_usage_all[x]},   type:${cpu_usage_all[x].constructor.name}`)
    cpu_usage_all_arr = cpu_usage_all_arr.concat(cpu_usage_all[x])
    mem_usage_all_arr = mem_usage_all_arr.concat(mem_usage_all[x])
    //console.log(`   cpu_usage_all_arr= ${cpu_usage_all_arr}`)
    cpu_usage_avg[x] = average( cpu_usage_all[x] )
    mem_usage_avg[x] = average( mem_usage_all[x] )
  }

 cpu_usage_avg['overall'] = average(cpu_usage_all_arr)
 mem_usage_avg['overall'] = average(mem_usage_all_arr)
 
 
 console.log("\n\n===== Average CPU usage per number of open tabs: =====")
 console.log(cpu_usage_avg)
 //m = Math.min( cpu_usage_init, min(cpu_usage_avg) )
 //cprint('red',`${[max(cpu_usage_avg), cpu_usage_init, min(cpu_usage_avg), m,  max(cpu_usage_avg)-m]}`)
 //console.log(`\nMax cpu usage for this process: ${max(cpu_usage_avg) - m }`)

 console.log("\n\n===== Average MEM usage per number of open tabs: =====")
 console.log(mem_usage_avg)
 //m = Math.min( mem_usage_init, min(mem_usage_avg) )
 //console.log(`\nMax mem usage for this process: ${max(mem_usage_avg) - m }`)
 return cpu_usage_avg
}
  

function getObjCount(arr) {
  return arr.filter(Boolean).length
}

function max(obj) {
  m = 0
  for (key in obj) {
    if (obj[key] > m)
      m = obj[key]
  }
  return m
}

function min(obj) {
  m = 100
  for (key in obj) {
    if (obj[key] < m)
      m = obj[key]
  }
  return m
}



/******************************************************************************
 *                                #start()
 *****************************************************************************/
async function start(browser) {
  if (platform.includes('win')) {
    //cmd = `reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" | find /i "proxyserver"`
    //tmp = await execSync(cmd)
    test_proxy = await getSysProxy()
    //cprint('blue','right outside "if" clause: test_proxy:'+test_proxy[0]) ---> 10.6.254.37
    //cprint('blue','right outside "if" clause: port:'+test_proxy[1])       ---> 8080

  }
  console.log('line after all that jazz')

  pages = []
  const incognito_context = await browser.createIncognitoBrowserContext()

  // for error 'Protocol Error: Target.close', during page.close 
  // Inspired by: https://github.com/GoogleChrome/puppeteer/issues/2269
  // incognito_context.on('targetdestroyed', async () => console.log('Target destroyed (incognito_context.on("targetdestroyed",.))'))   
  // incognito_context.on('targetdestroyed', () => console.log('Target destroyed (incognito_context.on("targetdestroyed",..)).')) // This worked
  /* throws undefined  so cpu_usage_all[undefined] --->
  if (!cpu_usage_all[incognito_context.pages().length]) {
    cpu_usage_all[incognito_context.pages().length] = []
  }   */
  cpu_usage_all[0]=[]
  mem_usage_all[0]=[]

  getCpuUsage = setInterval( () => {
    os2.cpuUsage( (v)=> {
      v = parseFloat((v*100).toFixed(2))
      //console.log(`~~${getObjCount(pages)}`)
      cpu_usage_all[getObjCount(pages)].push(v)
      // m = parseFloat( (process.memoryUsage().rss / 1024 / 1024).toFixed(2) )
      m = parseFloat( ((os1.totalmem()-os1.freemem()) / byte2GB ).toFixed(2))
      mem_usage_all[getObjCount(pages)].push(m)
      m_free = (os1.freemem() / byte2GB).toFixed(2)
      //if --usage-print,  print #memory and #cpu memtrix
      if (print_cpu_usage)  
          console.log('\t* CPU%: '+ v +'\t\t' +'MEM: '+ m +' GB\t\t' + 'Free MEM: ' + m_free + ' GB\t\t' + timeStamp())
    })

  }, cpu_usage_interval)

  //close the non-in-cognito and unnecessary browser page that opens by default when creating the browser
  //let browser_pages = await browser.pages()
  //browser_pages[0].close()

  for (let i=0; i<tabs_no; i++) {
    let page = await incognito_context.newPage()

    // To avoid problems with Target.closed or Connection.closed errors
    // page.on('close', ()=>console.log('Page already closed!'))
    
    await page.setCacheEnabled(false); 
    pages.push(page)
    cpu_usage_all[i+1] = []
    mem_usage_all[i+1] = []
    /*
    if (!cpu_usage_all[i+1]) {
      cpu_usage_all[i+1]=[]
    }
    if (!mem_usage_all[i=1]) {
      mem_usage_all[i+1]=[]
    }
    */
    cprint('green', `+++ Opening tab ${i+1},\t\t${timeStamp()}`)

    // Take a screenshot
    
    if (argv.graph){
      graph_name = `graph_${dateStr()}_${argv.proxy.replace(":","-")}_${q_str}_opening_tab${i+1}of${tabs_no}`
      done = await bandwidthGraph({path:graph_name, time:'15m', proxy:argv.proxy})
    }
    //  .then( async ()=>{
    //    console.log('      confirmed. screenshot taken     ' + timeStamp())
    //  })
    

    // await page.setViewport({width:320, height:240})


    await page.goto(site1, {timeout:90000})
      .then( 
        ()=>{},   // resolved
        (result_rejection)=>{
          cprint('red', `ERROR: timeout ,goto site (in consumer block) (tab ${i+1})`)
          console.log(result_rejection)
        }
      )
      .catch((e)=>{
        cprint('red',`ERROR: timeout ,goto site (in .catch block) (tab ${i+1})`)
        console.log(e)
      })

    //??? what if error is caught here, do we continue? cuz if yes, then we gotta have more errors.
    //We gott somehow stop moving forwar and closing the tab even! or something
    
    
    // DO I NEED THIS???? if I already have waitForSelector?
    //await page.waitFor(3000)

    // click on the video quality (also change font to red)
    /*
     click_result = await page.evaluate((sel) => {
       const el = document.querySelector(sel)
       //el.style.color = 'red' 
       //el.click()
       //return el
     }, sel)
    */
     //new Promise( (resolve,reject) => {
     //  click_result = await page.evaluate( (sel) => {
     //    cosnt el = document.querySelector(sel)

    /* WRONG: 
     const the_el = await page.evaluate(async (sel) => {
       const el = document.querySelector(sel)
       return el
       //el.style.color = 'red' 
       //el.click()
       //return el
     }, sel)
     the_el.style.color = 'red'
     the_el.click()
    */

    /* WRONG
    //const el = await page.$(sel)
    //el.then(el.evaluate( el=>el.click())).catch(err=> console.log(`XXXXXX Failed to click on the selection\nError:\n${err}`))
    */


    /* The following once created an error:  ERROR: evaluate is not a function
     *
    const el = await page.$(sel)

    try {
      el_click = await el.evaluate( el=>el.click())
    } catch (err) {
      console.log(`XXXXXX Failed to click on the selection\nError:\n${err}`)
    }
    //el_click.catch( err => console.log(`XXXXXX Failed to click on the selection\nError:\n${err}`))
    */
    


    //  This works. Problem is that whne tabs open fast (small time interval between tab) i get
    //  error here. it does force wait the program. So the next one has await. Also w/o try and
    //  insteadh .catch block 
    // try {
    //
    //   page.evaluate( (sel) => {
    //     const el = document.querySelector(sel)
    //     el.style.color = 'red'
    //     el.click()
    //   }, sel)
    // } catch (erclearcache 10.6.254.37
    //
    //   console.log(`XXXXXX Failed to click on the selection\nError:\n${err}`)
    // }   

    
    // Using combination of 2 awaits. Without 1st one I think there is still chance that when I hit
    // the 'document.querySelector', the DOM is not fully loaded and selector is unavailable.
    // Using awaits to ensure we don't move forward.
    await page.waitFor(5000)
    await page.waitForSelector(sel,{timeout:60000})
      .then((response)=>{}, async (response)=> {
        await page.waitForSelector(sel)
          .then(()=>{}, (response)=>{cprint('red', `ERROR: timeout for the 2nd time,waitForSelector (in consumer block) (tab ${i+1})`)})
          .catch((e)=>{
            cprint('red',`ERROR: timeout for the 2nd time,waitForSelector (in .catch block) (tab ${i+1})`)
            console.log(e)
          })
      })
      .catch((e)=>{
        cprint('red',`ERROR: timeout for the 1st time waitForSelector (tab ${i+1})`)
        console.log(e)
      })


    await page.evaluate( (sel) => {
      const el = document.querySelector(sel)
      el.style.color = 'red'
      el.click()
    }, sel)
      .then(()=>{}, (e)=>cprint('red', `ERROR during querySelector (then block) (tab ${i+1})`))
      .catch((e)=>cprint('red',`ERROR during queyrSelector (catch block) (tab ${i+1})`))
     

    
    // Wait before going to the next tab (i.e. for continuing with the for loop)
    await page.waitFor(time_interval_between_tabs)

    // Set a timeout for the window to be closed 

    mySetTimeout1 = () => {
      //=============== WORKS ==================
      setTimeout( async () => {
      // console.log("************    INSIDE mySetTimeout1 **********")
        cprint('green',`----- Closing tab ${i+1},\t\t${timeStamp()}`)
        
        if (argv.graph){
          graph_name = `graph_${dateStr()}_${argv.proxy.replace(":","-")}_${q_str}_closing_tab${i+1}of${tabs_no}`
          bandwidthGraph({path:graph_name, time:'15m', proxy:argv.proxy})
        }

        // Below, when closing a tab I can get either of the 2 following error:
        //   Protocol error Target.closed. No target with given id found, at connection.js:74 
        //      ---> browser.on('targetdestroyed',..)
        //   Portocol error. Connection closed. Most likely the page has been closed, at puppeteer/lib/helper.js:270
        //      ---> 
        await pages[i].close()   // I think its better to await the closure of the tab
        pages[i] = ''

        //If on last tab, also schedule closing the browser
        if (i == tabs_no -1) {
         // setTimeout( () => {
            //incognito_context.close()
            //browser.close()
            
            ///??? what errors can i get here?
            closeBrowser(browser)  
            clearInterval(getCpuUsage)
          //}, 3000)
        }

      }, vid_length )
    }




    mySetTimeout2 = () => {
      //=============== WORKS ==================
      setTimeout(async () => {
      // console.log("************    INSIDE mySetTimeout2 **********")
        cprint('green',`----- Closing tab ${i+1},\t\t${timeStamp()}`)
        graph_name = `graph_${dateStr()}_${argv.proxy.replace(":","-")}_${q_str}_closing_tab${i+1}of${tabs_no}`
        done = await bandwidthGraph({path:graph_name, time:'15m', proxy:argv.proxy})
          .then( async ()=>{
        console.log('      confirmed. screenshot taken     ' + timeStamp())
        //console.log(`i=${i}`)
        //await pages[i].waitFor(3000)
        //console.log('waited 10s,   '+timeStamp())
          await pages[i].close()
            .then(()=> console.log(`\tconfirmed Page ${i} closed ${timeStamp()}`) , () => cprint('red','ERROR closing page') )
            .catch( (e)=> cprint('red',`Oops something went wrong closing the tab (test.js):\n${e}`) ) 
        }, () => cprint('red','oops s.th went wrong when waiting for bandwidthGraph (then block) (in test.js)'))
          .catch(()=>cprint('red','ooops s.th went wrong when witing for bandwidthGraph (catch block) (in test.js)'))
        pages[i] = ''
        // the last page is closing the browser???
        // setTimeout( ()=> {
        //   console.log(`----------- Closing the browser -------------${timeStamp()}`)
        //   printCpuUsageAverages()
        //   console.log(`browser ip before close:${browser.process().pid}`)
        //   browser.close()
        //   console.log(`----------- Browser closed -------------${timeStamp()}`)
        // },3000)
        
      },vid_length)
    }




    mySetTimeout3 = () => {
      setTimeout( () => {
      //=============== WORKS!!!! ==================
      // console.log("************    INSIDE mySetTimeout3 **********")
        graph_name = `graph_${dateStr()}_${argv.proxy.replace(":","-")}_${q_str}_closing_tab${i+1}of${tabs_no}`
        bandwidthGraph({path:graph_name, time:'15m', proxy:argv.proxy})
          //.then(()=> console.log(`\t confirmed. screenshot taken \t${timeStamp()}`), 
          //      (e)=>console.log(`\t XXX something went wrong while taking the screenshot \t\n\tResult:\n${e}`)
          //)
          //.catch((e)=>console.log(`\t XXX something went wront while taking a screenshot (catch block):\nERROR:\n${e}`))
        
          //console.log(`i=${i}`)
          //await pages[i].waitFor(3000)
          //console.log('waited 10s,   '+timeStamp())
        
        cprint('green', `----- Closing tab ${i+1},\t\t${timeStamp()}`)
        pages[i].close()
            .then(()=>{ 
              // console.log(`\tconfirmed tab ${i+1} closed ${timeStamp()}`)
              // if (i==tabs_no) 
              //   incognite_context.close()
            }, 
              () => cprint('red','ERROR closing page') 
            )
          .catch( (e)=> {
            cprint('red',`Oops something went wrong closing the tab (test.js):\n${e}`) 
          })
        pages[i] = ''
      },vid_length)
    }


    mySetTimeout1()




    
    // if the last tab is opened, schedule closing down the entire incognito context
    /*
    if (i == tabs_no -1) {
      setTimeout( () => {
        //incognito_context.close()
        clearInterval(getCpuUsage)
      }, vid_length+3000)
    }
    */

  } // End of for loop for tabs
} // end of start() definition






/******************************************************************************
 *                                #main()
 *****************************************************************************/
async function main() {
  try {
    const browser = await puppeteer.launch(launch_args)
    // for error 'Protocol Error: Target.close', during page.close 
    // Inspired by: https://github.com/GoogleChrome/puppeteer/issues/2269
    //browser.on('targetdestroyed', async () => console.log('Target destroyed. Pages count: '))   
    const version = await browser.version()                   //  chrome/77.0.3844.0 (shipped with puppeteer) didn't work 
    console.log(`Browser version: ${version}`)
    console.log(`browser pid: ${browser.process().pid}`)


    for (b=0; b<browsers_no; b++) {
      setTimeout( () => start(browser) , 1000)
      time2close_browser = vid_length+ (tabs_no+1 ) *time_interval_between_tabs  + 10000
      console.log(`==> browser will close in about ${time2close_browser/1000} s`)

      /*
      setInterval( () => { 
        cpu = os2.cpuUsage( (v)=> { return v} )
        //console.log(`* cpu: ${cpu}\t\t${timeStamp()}`)
      },cpu_usage_interval)
      */



      /*  This works but prefer to have browser closure be scheduled during closure or last tab
      if (b==browsers_no-1) {
        setTimeout( ()=> {
          console.log(`----------- Closing the browser -------------${timeStamp()}`)
          printCpuUsageAverages()
          console.log(`browser ip before close:${browser.process().pid}`)
          browser.close()
            .then((result)=>console.log(`---- Browser successfully closed\n${result}`),
                  (result)=>console.log(`-----Error closing the browser:\n${result}`)
            )
            .catch((e) => console.log('Error closing the browser:'+e))

        }, time2close_browser)
      }
      */



      //TODO technically I should close the multiple browser windows using the same method I used for
      //closing multiple pages
      }
  } catch (e) {
    cprint('red','ERROR in running the main')
    cprint('red',e)
  }
}


function closeBrowser(browser) {
        setTimeout( ()=> {
          cprint('green',`----------- Closing the browser -------------${timeStamp()}`)
          printCpuUsageAverages()
          //console.log(`browser ip before close:${browser.process().pid}`)
          browser.close()
            .then(()=>cprint('green',`\t---- Browser successfully closed`),
                  ()=>cprint('red',`ERROR closing the browser`)
            )
            .catch((e) => cprint('red','Error closing the browser:'+e))

        },5000)

}





main()
