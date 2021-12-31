module.exports = {
    init : new Date(),
    code : -1,
    scCount: 1,
    jsPath: null,
    setPrefix: function (p) {
        this.pfx = p;
        
        if(!this.init)
            this.init = new Date();
        
        if(!this.scCount)
            this.scCount = 1;

    },
    setPath: function (p) {
        this.jsPath = p;
    },
    spad : function (num, size, c) {
        num = num.toString();
        while (num.length < size) num = c + num;
        return num;
    },
    log : function (data) {
        function pad(num, size) {
            num = Number(num / 1000).toFixed(3);
            num = num.toString();
            while (num.length < size) num = " " + num;
            return num;
        }
        var now = new Date();
        var elapsedSeconds = now.getTime() - this.init.getTime();
        var ts = '[' + this.spad(this.pfx,10," ") + ' - '+ pad(elapsedSeconds,6) +'] ';
        console.log(ts+data);
    },
    delay : function (t) {
        return new Promise((resolve) => {
            var timeout = t*1000;
            var n = 5;
            this.log(`Waiting ${t} secs...`);
            const timer = setInterval(()=>{
                this.log(`Still waiting ${n}/${t}`);
                n += 5;
            }, 5000);
            setTimeout(()=>{clearInterval(timer);}, timeout+100);
            setTimeout(resolve, timeout);
        });
    },
    sc : async function (page) {
        var scPath = this.jsPath
                     +"/sc/"
                     +this.pfx
                     +"-"
                     +this.spad(this.scCount,2,"0")
                     +".png";
        await page.screenshot({ path: scPath });
        this.log(`Saved new screenshot at <...${scPath.slice(-60)}>`);
        this.scCount += 1;
    }

}
