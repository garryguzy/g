//html5 file api only for ie10+ , chrome ,safari , firefox 
(function(){
var _g_fileapi={
    sendBinary:function(opts){
       if(!opts||(!opts.dataUrl&&!opts.blob)||!opts.url) return false;
       if(opts.blob) var file=opts.blob;
       else{
          opts.b64Data=opts.dataUrl.split(',')[1];
          var file=_g.fileapi.b64toBlob(opts);        
       }
       var formdata = new FormData();  
        formdata.append((opts.filekey||"file"), file);
        formdata.append("Filename",opts.filename||'blob');
        if(opts.upload_type) formdata.append("type",opts.upload_type);
        if(opts.width) formdata.append("width",opts.width);
        if(opts.height) formdata.append('height',opts.height);
        $.ajax({
           url: opts.url,
           type: "POST",
           data: formdata,
           processData: false,
           contentType: false,
        }).done(function(respond){
           if(opts.callback) opts.callback(respond);
        }).fail(function(respond){
            if(opts.onFail) opts.onFail(respond);
        });
   },
   b64toBlob:function(opts) {
        contentType = opts.type||'image/png';
        sliceSize = opts.sliceSize || 512;
    
        var byteCharacters = atob(opts.b64Data);
        var byteArrays = [];
    
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
    
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
    
            var byteArray = new Uint8Array(byteNumbers);
    
            byteArrays.push(byteArray);
        }
    
        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    },
    blobtoUrl:function(blob){
        var DOMURL = self.URL || self.webkitURL || self;
        var blobUrl = DOMURL.createObjectURL(blob);
        return blobUrl;
    },
    base64urltoBase64:function(url){
        return url.split(',')[1];
    },
    blobtoBase64:function(blob,callback){
       var reader = new FileReader();
       reader.onload = function(e){
           var data=(typeof event!="undefined")?event.target.result:e.originalTarget.result;
           if(callback) callback(data); //event.target.results contains the base64 code to create the image.
       };
       reader.readAsDataURL(blob);//Convert the blob from clipboard to base64
    },
    fileUrltoBlob:function(url,opts){
        var xhr = new XMLHttpRequest();
        xhr.open('GET',url, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
          if (this.status == 200) {
            var myBlob = this.response;
            if(opts.onSuccess){
                opts.onSuccess(myBlob);
            }
            // myBlob is now the blob that the object URL pointed to.
          }
          else{
             if(opts.onFail){
                 opts.onFail(myBlob);
             }
          }
        };
        xhr.send();
    },
    imageUrltoBlob:function(url,opts){
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var DOMURL = self.URL || self.webkitURL || self;
        var img = new Image();
        var $this=this;
        img.onload = function() {
            canvas.width=image.width;
            canvas.height=image.height;
            ctx.drawImage(img, 0, 0);
            if(opts.callback) opts.callback(canvas);
        };
        img.src = url;
        img.crossOrigin = "Anonymous";
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.fileapi=_g_fileapi;
}
else{
    define(['_g/base'],function(){
        window._g.fileapi=_g_fileapi;
        return window._g.fileapi; 
    })
}
})(window);