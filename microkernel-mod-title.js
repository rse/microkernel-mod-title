/*
**  Microkernel -- Microkernel for Server Applications
**  Copyright (c) 2015-2016 Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  external requirements  */
const os = require("os")

/*  the Microkernel module  */
class Module {
    get module () {
        return {
            name:  "microkernel-mod-title",
            tag:   "TITLE",
            group: "BOOT",
            after: [ "CTX", "LOGGER", "OPTIONS" ]
        }
    }
    latch (kernel) {
        kernel.latch("options:options", (options) => {
            options.push({
                name: "title-tag", type: "string", "default": "",
                help: "Set an identifying process title tag." })
        })
    }
    prepare (kernel) {
        let proginfo = kernel.rs("ctx:info")
        let procmode = kernel.rs("ctx:procmode")
        let proctag  = kernel.rs("options:options").title_tag

        /*  give initial startup hint  */
        if (procmode === "standalone" || procmode === "master") {
            kernel.sv("log", "title", "info",
                `starting application ${proginfo.app}`)
            kernel.sv("log", "title", "info",
                `running on platform ${proginfo.runtime} with engine ${proginfo.engine}`)
            let platform = os.platform()
            let arch     = os.arch()
            let release  = os.release().replace(/.*?(\d+\.\d+).*/, "$1")
            let cpus     = os.cpus().length
            let host     = os.hostname()
            kernel.sv("log", "title", "info",
                `executing under OS ${platform}/${arch} ${release} with ${cpus} CPUs of host ${host}`)
            let info = `operating under ${procmode.toUpperCase()} role`
            if (proctag !== "")
                info += ` and "${proctag}" tag`
            kernel.sv("log", "title", "info", info)
        }
    }
    start (kernel) {
        /*  provide a meaningful process title  */
        let proginfo = kernel.rs("ctx:info")
        let proctag  = kernel.rs("options:options").title_tag
        let title = proginfo.app
        if (proctag !== "")
            title += ` [${proctag}]`
        title = kernel.hook("title:title", "pass", title)
        process.title = title
    }
}

/*  export the Microkernel module  */
module.exports = Module

