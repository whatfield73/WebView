enyo.kind({
    name: "AjaxWebView",
    kind:"Control",
    
   
    
    components:[
{kind: "onyx.Scrim", name: "scrim2", classes: "onyx-scrim enyo-fit", floating: false, showing: false, components: [
   {kind: "onyx.Spinner"}
]},
	{kind: "onyx.Button", classes: "floating-menu",name: "backb", content: "Back", disabled: true, onclick: "goPrevious"}, {kind: "onyx.Button", classes: "floating-menu-right", content: "Forward", name: "forb", disabled: true, onclick: "goNext"}, {kind: "Scroller", classes: "enyo-fit", components: [
        { 
     
                           name: "content", 
                            onclick: "catchtap",
                            content:"",
			    allowHtml: true
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
	this.$.scrim2.showAtZIndex(10);	
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
		this.$.scrim2.hideAtZIndex(10);
		var str = inValue.replace(/href=\"\//g, 'href="'+ this.base);   //update on site links with base uri
		str = str.replace(/src=\"\//g, 'src="' + this.base);
                this.$.content.setContent(str);
                this.$.content.render();
                this.processChapter();                
			})
			.error(this, function(inSender, inValue) {
				console.log("error " + inValue);
				this.$.scrim2.hideAtZIndex(10);
			})
			.go();
    }
	},
    call: function(src, base) {
    	this.secondbase = base;
this.currentPage = this.pages.length;
	this.pages[this.pages.length] = {"src": src};
	
	this.loadit();
	},

    processChapter:function() {
        
      

      if (this.$.content.hasNode()) {
               var node = this.$.content.node;
               var nodes = node.children;
               for (i=0; i<nodes.length; i++) {
               if (nodes[i].nodeName == "SCRIPT") {
                       console.log("found script");
                       try {eval(nodes[i].innerText);}
                       catch(e){console.log(e);}
                       }

               nodes[i].baseURI = this.base;
                       }

                       }
	        
        
        this.$.content.render();
    },
// process touch events for taps on links, etc.
catchtap: function(inSender, inEvent) { 
if (inEvent.target.form && inEvent.target.type == "submit") {
this.method = inEvent.target.form.method;
if (this.method == "post") {
link = this.pages[this.currentPage].src;
this.postBody = "";
for (i=0; i<inEvent.target.form.length-1; i++) {
this.postBody = this.postBody + inEvent.target.form[i].name + "=" + inEvent.target.form[i].value;
if (inEvent.target.form.length-1 != i+1) {
this.postBody = this.postBody + "&";
}
}
}
else {
link = inEvent.target.form.action + "?";
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

if (link!=""){
this.newpage(link, this.secondbase);
}
console.log("tapped");
inEvent.preventDefault();
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
}
});