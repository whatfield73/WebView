enyo.kind({
    name: "WebView",
    kind:"Control",
   events: {
	onSendHold: ""
	},

    
    components:[

   
	{kind: "onyx.Button", classes: "floating-menu",name: "backb", content: "Back", disabled: true, onclick: "goPrevious"}, {kind: "onyx.Button", classes: "floating-menu-right", content: "Forward", name: "forb", disabled: true, onclick: "goNext"}, {kind: "Scroller", classes: "enyo-fit", components: [
        {kind: "onyx.Spinner", name: "scrim2", classes: "onyx-light onyx-scrim", attributes: {"z-index": 10}, centered: true, floating: true, scrim: true, showing: false},{ 
     
                           name: "content", 
                            onclick: "catchtap",
				style: "padding: 8px 8px 8px 8px;",
                            content:"",
			    allowHtml: true,
			    onhold: "catchhold"
                }
                
        ]}
        
    ],
    
    
    create: function() {
        this.inherited(arguments);
	this.pages=[];
	this.base = "";
	this.method = "GET";
	this.postBody = "";
    this.currentPage=0;
     this.setupMenu=false;
        this.loadit();
       },
    
    
  
    goPrevious: function() {
        this.currentPage--;
        this.loadit();
	return true;
    },
    
    goNext: function() {
        this.currentPage++;
        this.loadit();
	return true;
    },
    
    
    loadit: function() {
        if(this.currentPage <= 0) {
            this.$.backb.setDisabled(true);
        } else {
            this.$.backb.setDisabled(false);
        }
        if(this.currentPage+1 >= this.pages.length) {
            this.$.forb.setDisabled(true);
        } else {
            this.$.forb.setDisabled(false);
        }
            
        //this.$.scroller.setScrollTop(0);
	if (this.pages[this.currentPage]){

        var file = this.pages[this.currentPage].src;
	this.base = this.pages[this.currentPage].src.slice(0, this.pages[this.currentPage].src.indexOf("/", 8)+1);
	 if (this.base == "") {
                this.base = file + "/";
            }

	this.$.scrim2.setShowing(true);	
	new enyo.Ajax({
	    cacheBust: false,
	    method: this.method,
	    postBody: this.postBody,
            url: ""+file, 
		    handleAs: "text"})
			.response(this, function(inSender, inValue){
		var i=0;
		this.method = "GET";
		this.postBody = "";
		this.$.scrim2.setShowing(false);
		var str = inValue.replace(/href=\"\//g, 'href="'+ this.base);   //update on site links with base uri
		str = str.replace(/src=\"\//g, 'src="' + this.base);
                this.$.content.setContent(str);
                this.$.content.render();
                this.processChapter();                
			})
			.error(this, function(inSender, inValue) {
				console.log("error " + inValue);
				this.$.scrim2.setShowing(false);
				this.method = "GET";
				this.postBody = "";
			})
			.go();
    }
	},
    call: function(src, base) {
    	this.secondbase = base;

if (this.$.forb.disabled === false) {
this.currentPage++;
this.pages[this.currentPage] = {"src": src};
if (this.pages.length > this.currentPage + 1) {
this.pages.splice(this.currentPage + 1, this.pages.length- this.currentPage);  // delete pages ahead of current page because we are starting a new branch in history
}
}
else {
this.currentPage = this.pages.length;
	this.pages[this.pages.length] = {"src": src};
}	
	this.loadit();
	},

    processChapter:function() {
        
         if (this.$.content.hasNode()) {
               var node = this.$.content.node;
               var nodes = node.children;
		var lengthn = nodes.length;
		var lengthn2 = lengthn;
               for (i=0; i<lengthn2; i++) {   //nodes.length
               if (nodes[i].nodeName == "SCRIPT") {
			if (nodes[i].src) {
			console.log("src found");
			if (nodes[i].src.match(/enyo.js/)) {
			this.enyoflag = true;
			}
			else {
			if (nodes[i].src.match(/package.js/) && this.enyoflag == true) {
			var tt = new enyo.loaderFactory(this.enyo.machine);
			tt.load(nodes[i].src);
			}
			else {
			
var r = document.createElement("script");
			
r.src = nodes[i].src;
			r.onLoad = function() {console.log("r onload");}, r.onError = function(e) {console.log(e);};
			var node1 = document.importNode(r);
			console.log(node1);
			node.appendChild(node1);
			}
			}
			}
                       console.log("found script");
			try {
                       with (node) {eval(nodes[i].innerText);}
				}
			catch(e) {
			console.log(e);
			}
                       }

               nodes[i].baseURI = this.base;
                       }

                       }
	        
        
        this.$.content.render();
    },
// process touch events for taps on links, etc.
catchtap: function(inSender, inEvent) { 


//console.log(inEvent.target.href);
var link = "";
if (inEvent.target.form && inEvent.target.type == "submit") {
this.method = inEvent.target.form.method;
if (this.method == "post") {
if (!inEvent.target.form.action.match("http")) {
link = this.pages[this.currentPage].src;
}
else {
link = inEvent.target.form.action;
}
this.postBody = "";
for (i=0; i<inEvent.target.form.length-1; i++) {
this.postBody = this.postBody + inEvent.target.form[i].name + "=" + inEvent.target.form[i].value;
if (inEvent.target.form.length-1 != i+1) {
this.postBody = this.postBody + "&";
}
}
}
else {
if (!inEvent.target.form.action.match("http")) {
link = this.pages[this.currentPage].src + "?";
}
else {
link = inEvent.target.form.action + "?";
}
for (i=0; i<inEvent.target.form.length-1; i++) {
link = link + inEvent.target.form[i].name + "=" + inEvent.target.form[i].value;
if (inEvent.target.form.length-1 != i+1) {
link = link + "&";
}
}
}
console.log(link);
console.log(this.postBody);
}

//  process touch event on link
else if(inEvent.target.href) {
if (inEvent.target.href.match(/file:/g)) {
	link = this.secondbase + inEvent.target.innerHTML;
	this.secondbase = link;
}
else if(inEvent.target.href.match("javascript")) {
try {
eval(inEvent.target.onclick);
}
catch(e) {
console.log(e);
}
return true;
}
else {	
var link = inEvent.target.href;
}
}
else {
//  process for image touch
if (inEvent.target.parentNode.href){
var link = inEvent.target.parentNode.href;
}
}
console.log("tapped");
inEvent.preventDefault();
if (link!=""){
this.call(link, this.secondbase);
}

return true;



},
catchhold: function(inSender, inEvent) {
var link = "";
if (inEvent.target.href.match(/file:/g)) {
	link = this.secondbase + inEvent.target.innerHTML;
}
else {
link = inEvent.target.href;
}
this.doSendHold({link: link});
return true;
}
});