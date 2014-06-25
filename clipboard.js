//处理剪贴板的js module 
(function(){
var _g_clipboard={
    init:function(opts){
        if(!_g.browserSupport({
            msie:11
        })){
            opts.onError(-1);
            return ;
        }

        _g.clipboard.callback=opts.callback;
        if(opts.onError) _g.clipboard.onError=opts.onError;

        if (($.browser.safari || !window.Clipboard)&&!$.browser.chrome) {
          $(document).on("keydown", function(event){
            if ((event.ctrlKey&&_g_device.windows())||(_g_device.mac()&&event.metaKey))
            {
              // judge can Ctrl V
                if(!_g.clipboard.testAccessible()||!_g.clipboard._enabled) return ;

                 // Firefox allows images to be pasted into contenteditable elements
                 if($(".clipboard_area").length == 0)
                 {
                   _g.clipboard.pasteCatcher = document.createElement("div");
                   _g.clipboard.pasteCatcher.setAttribute("contenteditable", "true");
                   _g.clipboard.pasteCatcher.setAttribute("class","clipboard_area");
                   _g.clipboard.pasteCatcher.setAttribute("style","position: absolute; z-index: 9999999; top: 50%; left: 50%; height: 10px; width: 10px;opacity:0;pointer-events: none;");
                   // We can hide the element and append it to the body,
                   //_g.clipboard.pasteCatcher.style.opacity = 0;
                   document.body.appendChild(_g.clipboard.pasteCatcher);
                 }
                 // as long as we make sure it is always in focus
                 _g.clipboard.pasteCatcher.focus();
                 setTimeout(function(){_g.clipboard._checkInput()},1);
            }
          })
        } 

        window.addEventListener("paste", _g.clipboard._pasteHandler);
    },
    _enabled:true,
    enable:function(){
        _g.clipboard._enabled=true;
    },
    disable:function(){
        _g.clipboard._enabled=false;
    },
    testAccessible:function(){
        //用来检测clipboard事件的发生是否被许可
        //这个函数更多的是用来进行自定义的
        return true;
    },
    _pasteHandler:function(e) {
      // judge can Ctrl V
       if(!_g.clipboard.testAccessible()||!_g.clipboard._enabled) return ;
       // We need to check if event.clipboardData is supported (Chrome)
       else {
          if (e.clipboardData) {
          // Get the items from the clipboard
               var items = e.clipboardData.items;
               if (items) {
                 // Loop through all items, looking for any kind of image
                 for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") !== -1) {
                       // We need to represent the image as a file,
                       var blob = items[i].getAsFile();
                        if(_g.clipboard.callback) _g.clipboard.callback(blob);
                    }
                    else{
                         if(_g.clipboard.onError){
                            _g.clipboard.onError(1);//格式目前还不支持
                        }                       
                    }
                 }
                } else {
               }
            }
        }
    },
    _checkInput:function(pasteCatcher) {
       // Store the pasted content in a variable
       var child = $(_g.clipboard.pasteCatcher).children('img');
     
        
       if (child.length>0) {
          // If the user pastes an image, the src attribute
          // will represent the image as a base64 encoded string.
          var src=child[0].src;
          if(src) _g.clipboard._createImage(src);
       }
       $('.clipboard_area').html("");
    },
    _createImage:function(source) {
        if(source.indexOf("data:image/png;base64")==0){
            var blob= _g.fileapi.b64toBlob({
                b64Data:source.split(',')[1],
                type:'image/png'
            })
            if(_g.clipboard.callback)  _g.clipboard.callback(blob);
        }
        else{
            console.log(source);
            if(_g.clipboard.onError){
                _g.clipboard.onError(1);//格式目前还不支持
            }
           // if(source.indexOf("http://")==0){
                // _g.fileapi.imageUrltoBlob(source,{
                    // callback:function(d){
                        // _g.clipboard.callback(d);
                    // }
                // })
           // }
        }
   }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.clipboard=_g_clipboard;
}
else{
    define(['_g/base','_g/device','_g/file'],function(){
        window._g.clipboard=_g_clipboard;
        return window._g.clipboard; 
    })
}
})(window);