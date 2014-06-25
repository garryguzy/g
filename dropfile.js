//html5 dropfile module 
(function(){
var _g_dropfile={
    bindDragAndDrop:function(opts){
        if(!_g.browserSupport({
            msie:10
        })){
            opts.onError(-1);
            return ;
        }
        var defaults={
            types:['Audio','Image','Video', 'Zip']
        }
        var options=opts?($.extend(true,{},opts,defaults)):defaults;
        if(!opts.el) return false;

        var el = $(opts.el)[0],
            $drop_area = $(el).find(".drop-image-area"),
            $drop_text = $(el).find(".drop-image-text");

        var outter = $(opts.outter)[0];
        if(!outter)
            outter = $(".doc-layout")[0];
        if(!outter)
            outter = $(".ui-layout")[0];

        function _checktypes(file,types){
            var returned=false;
            for(i=0;i<types.length;i++){
                if (file.type.indexOf((types[i].toLowerCase())) != -1){
                    returned=types[i];//返回该素材所对应的类型，这是一个大类别，比如音频，视频或者其他
                }
            }
            return returned;
        }
        function _handleFile(file,x,y){
                console.log(x+' '+y);
                var filetype=_checktypes(file,options.types);
                if (filetype) {
                    //alert('请拖拽图片~');
                    var type=file.type;
                    var filename=file.name;
                    console.log(file.type);
                    var readers= new FileReader();
                    readers.onload = function(e) {
                           if(options.callback) options.callback({
                                type:type,
                                filetype:filetype,
                                data:$.browser.msie?e.target.result:(typeof event!="undefined")?event.target.result:e.originalTarget.result,
                                filename:filename,
                                x:x,
                                y:y
                            });
                    }
                    readers.readAsDataURL(file);
                }
                else{
                    console.log(file.type);
                    if(options.onError) options.onError(1);//表示有不支持的格式上传
                }            
        }
        function _handleDrop(e) {
            e.stopPropagation();
            e.preventDefault();

            var readers = [];
            var filename
            for(var i=0; i<e.dataTransfer.files.length; i++)
            {
                _handleFile(e.dataTransfer.files[i],e.pageX,e.pageY);
            }
            if(options.onDrop) options.onDrop();
        }
        if(typeof el.draggable !="undefined")
        {
            var showDrag = false,
                _timeout = -1;

            $drop_text.css("background", "rgba(245,245,245,0.3)");
            el.addEventListener('dragenter', function(e) {
                if(options.onDrag) options.onDrag(e);
                $drop_text.text("请释放鼠标");
                showDrag = true;
                e.stopPropagation();
                e.preventDefault();
                console.log('dragenter');
            }, false);
            el.addEventListener('dragover', function(e) {
                showDrag=true;
                e.stopPropagation();
                e.preventDefault();
                console.log('dragover');
            }, false);
            el.addEventListener('dragleave', function(e) {
                console.log('dragleave');
                e.stopPropagation();
                e.preventDefault();
                showDrag = false;
                clearTimeout( _timeout );
                _timeout = setTimeout( function(){
                    if( !showDrag ){ if(options.onDragLeave) options.onDragLeave(e); }
                }, 200 );
            }, false);

            outter.addEventListener('dragover', function(e) {
                showDrag = true;
                e.stopPropagation();
                e.preventDefault();
            }, false);
            outter.addEventListener('dragenter', function(e) {
                if(options.onDrag) options.onDrag(e);
                $drop_text.text("请将素材拖放到此区域");
                $drop_area.show();
                $drop_text.show();
                showDrag = true;
                e.stopPropagation();
                e.preventDefault();
                console.log('dragenter');
            }, false);
            outter.addEventListener('dragleave', function(e) {
                showDrag = false;
                //$(".drop-image-area").hide();
                clearTimeout( _timeout );
                _timeout = setTimeout( function(){
                    if( !showDrag ){ if(options.onDragLeave) options.onDragLeave(e); }
                }, 200 );
            }, false);
            outter.addEventListener('drop', function(e) {
                showDrag = false;
                clearTimeout( _timeout );
                _timeout = setTimeout( function(){
                    if( !showDrag ){ if(options.onDragLeave) options.onDragLeave(e); }
                }, 200 );
                e.stopPropagation();
                e.preventDefault();
                return true;
            }, false);
            outter.addEventListener('dragend', function(e) {
                showDrag = false;
                clearTimeout( _timeout );
                _timeout = setTimeout( function(){
                    if( !showDrag ){ if(options.onDragLeave) options.onDragLeave(e); }
                }, 200 );
                e.stopPropagation();
                e.preventDefault();
                return true;
            }, false);

            el.addEventListener('dragend', function(e) {
                showDrag = false;
                console.log('dragend');
                if(options.onDragLeave) options.onDragLeave(e);
                e.stopPropagation();
                e.preventDefault();
            }, false);
            el.addEventListener('drop', _handleDrop, false);
        }
        else{
            if(options.onError) options.onError(-1);
        }
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.dropfile=_g_dropfile;
}
else{
    define(['_g/base'],function(){
        window._g.dropfile=_g_dropfile;
        return window._g.dropfile; 
    })
}
})(window);