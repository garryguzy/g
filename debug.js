//debug模块用来管理项目的开发，调试和测试
//通常只有在开发模式下，才会启用该模块
(function(){
var debug_button='<button class="btn btn-xs _gDebugButton" style="position: fixed;z-index: 10000000;right: 0;bottom: 0px;"><i class="fa fa-jsfiddle"></i></button>';
var debug_nav=[
'<nav class="navbar navbar-default navbar-fixed-bottom _gDebugNav" role="navigation" style="height:50px;z-index: 10000000;z-index: 10000000;margin: 0;width: 100%;background: #f0efef;top:initial;">',
'  <div class="container-fluid">',
 '   <div class="navbar-header">',
  '    <a class="navbar-brand" href="#">Debug</a>',
'    </div>',
 '   <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">',
  '    <ul class="nav navbar-nav _gDebug_items">',
        '<li class="dropup">',
         ' <a href="#" class="dropdown-toggle" data-toggle="dropdown">帮助 <b class="caret"></b></a>',
'          <ul class="dropdown-menu">',
       ' <% _.each(_g.debug.help,function(value,key){ %>',
 '           <li data-gH="<%=key%>" class="_gDebugHelp <%=value.name%>"><a href="#"><%=key%></a></li>',            
     '  <% }) %>',
 '         </ul>',
  '      </li>',
        '<li class="dropup">',
         ' <a href="#" class="dropdown-toggle" data-toggle="dropdown">Template <b class="caret"></b></a>',
'          <ul class="dropdown-menu">',
       ' <% _.each(_g.debug.template,function(value,key){ %>',
 '           <li data-gT="<%=key%>" class="_gDebugT <%=value.debug?"active":""%>"><a href="#"><%=key%></a></li>',            
     '  <% }) %>',
     '<li data-gT="new" class="_gDebugT"><a href="#">new...</a></li>',  
 '         </ul>',
  '      </li>',
        '<li class="dropup">',
         ' <a href="#" class="dropdown-toggle" data-toggle="dropdown">Data <b class="caret"></b></a>',
'          <ul class="dropdown-menu">',
       ' <% _.each(_g.debug.data,function(value,key){ %>',
 '           <li data-gD="<%=key%>" class="_gDebugData"><a href="#"><%=key%></a></li>',            
     '  <% }) %>',
 '         </ul>',
  '      </li>',
        '<li class="dropup">',
         ' <a href="#" class="dropdown-toggle" data-toggle="dropdown">Less <b class="caret"></b></a>',
'          <ul class="dropdown-menu">',
       ' <% _.each(_g.debug.less,function(value,key){ %>',
 '           <li data-gL="<%=key%>" class="_gDebugLess"><a href="#"><%=value.name%></a></li>',            
     '  <% }) %>',
 '         </ul>',
  '      </li>',
        '<li class="dropup">',
         ' <a href="#" class="dropdown-toggle" data-toggle="dropdown">JS <b class="caret"></b></a>',
'          <ul class="dropdown-menu">',
           ' <% _.each(_g.debug.js,function(value,key){ %>',
     '           <li data-gJ="<%=key%>" class="_gDebugJS"><a href="#"><%=value.name%></a></li>',            
         '  <% }) %>',
 '         </ul>',
  '      </li>',
  '<%=_g.debug.component||""%>',
  '<%=_g.debug.widget||""%>',
        '<li class="dropup">',
         ' <a href="#" class="dropdown-toggle" data-toggle="dropdown">MVC <b class="caret"></b></a>',
'          <ul class="dropdown-menu">',
'<li data-gMVC="new-list" class="_gDebugMVC"><a href="#">new LIST...</a></li>',
'<li data-gMVC="new-tree" class="_gDebugMVC"><a href="#">new TREE...</a></li>',
'<li data-gMVC="new-advancelist" class="_gDebugMVC"><a href="#">new Advance LIST...</a></li>',
 '         </ul>',
  '      </li>',
   '   </ul>',
   '<ul class="nav navbar-nav navbar-right">',  
   '<li><a href="#" class="close"><i class="fa fa-times"></i></a></li>',
   '   </ul>',
'    </div><!-- /.navbar-collapse -->',
 ' </div><!-- /.container-fluid -->',
'</nav>'
].join("");
var template_debugT=[
    '名称:<%=template.name%><br>',
    '原始Url:<%=template.url%><br>',
    '测试Url:<%=template.debug_url||""%><br>',
    '模板:<br><textarea class="_gDebug_T" style="height:200px;width:550px;"><%=template.template%></textarea>',
    '数据:<br><textarea class="_gDebug_D" style="height:200px;width:550px;"><%=template.data%></textarea>',
'<% if(template.new){%>',
'<br>container(插入位置):<input class="_gDebug_Container" name="container" style="width:400px;"/>',
'<% } %>'
].join("");
var debug_buttons=function(callback){
    return {
    insert:{
               label: "调试",
               className: "btn btn-primary",
               callback: callback             
            },
        no: {
            label: "取消",
            className: "btn"
        }                
    }
}
var _g_debug={
    init:function(){
        //debug初始化
       // if(typeof _gDebug!="undefined"&&_gDebug){
       _g.debug.enabled=true;//开启_g.debug只是表示debug模式的只读模式，并不会接受外部的定义data ，或template ,需要_gDebug来启动静态调试模式
       $('body').append(debug_button); 
      // $('body').append(debug_nav); 
       if(typeof _gDebug!="undefined"&&_gDebug){
           //我们需要对用户提供的这些data参数和template参数进行dict转换以方便查询
           if(_gDebug.data) _g.debug.user_data=_g.array.toDict(_gDebug.data,'name');
           if(_gDebug.template) {
               _g.debug.user_template=_g.array.toDict(_gDebug.template,'name');
               _.each(_g.debug.user_template,function(value,key){
                   value.template=require(value.url);
               })
           }
           if(_gDebug.less){
               _.each(_gDebug.less,function(i){
                   var lessjson=JSON.parse(require(i.url));
                   _.each(lessjson,function(value,key){
                       value.name=i.name+'/'+key;
                       _g.debug.less[key]=value;
                   })
               })           
           }
           if(_gDebug.help){
               _g.debug.help=_g.array.toDict(_gDebug.help,'name');
               _.each(_g.debug.help,function(value,key){
                   value.template=require(value.url);
               })
           }
       }    
       $('._gDebugButton').on('click',function(){
           _g.debug.render();
           return false;
       })
        //}
    },
    enable_editor:function(){
        require(['_g/debug_editor','_g/generator'],function(){
            _g.generator.init();
            _g.debug_editor.init();
        })
    },
    data:{},
    template:{},
    less:{},
    js:{},
    user_data:{},
    user_template:{},
    query_user_data:function(name){
        //使用调试数据的基本环境是在 _gDebug环境下
        if(_g.debug.user_data[name]){
            return _g.debug.user_data[name].url;
        }
        else return null;
    },
    query_user_template:function(name){
        //同上
        if(_g.debug.user_template[name]){
            return _g.debug.user_template[name].template;
        }
        else return null;
    },
    set_template:function(name,data){
        if(_g.debug.enabled){
            if(!_g.debug.template[name]) _g.debug.template[name]={};
            if($('body').children('._gDebugNav').length) _g.debug.render();
            return ('data-gTemplate='+name);
        }
        else return "";
    },
    render:function(){
        $('body').children('._gDebugNav').remove();
        $('body').append(_.template(debug_nav,{}));
        $('._gDebugNav').find('._gDebugT').on('mouseover',function(){
            var T=$(this).attr('data-gT');
            $('[data-gtemplate="'+T+'"]').addClass('_gTlayout');
        })
        .on('mouseout',function(){
            var T=$(this).attr('data-gT');
            $('[data-gtemplate="'+T+'"]').removeClass('_gTlayout');
        })
        $('._gDebugNav').find('._gDebugLess').on('mouseover',function(){
            var T=$(this).attr('data-gL');
            _g.debug.lessOver(T);
        })
        .on('mouseout',function(){
            var T=$(this).attr('data-gL');
            _g.debug.lessOut(T);
        })
        $('._gDebugNav').find('._gDebugLess').on('click',function(){
            var gd=$(this).attr('data-gL');
            var url=_g.debug.less[gd].url;
            require([url],function(){
                var dialog=bootbox.dialog({
                    title: '<h3>'+gd+'<h3>',
                    message: '<textarea style="height:400px;width:550px;">'+require(url)+'</textarea>'
                })
                dialog.draggable();               
            })
            return false;
        })
        $('._gDebugNav').find('._gDebugData').on('click',function(){
            var gd=$(this).attr('data-gd');
            var dialog=bootbox.dialog({
                title: '<h3>'+(_g.debug.user_data[gd]?_g.debug.user_data[gd].url:gd)+'<h3>',
                message: '<textarea style="height:400px;width:550px;">'+(_g.debug.data[gd].data?JSON.stringify(_g.debug.data[gd].data):"")+'</textarea>'
            })
            dialog.draggable();
            return false;
        })
        $('._gDebugNav').find('._gDebugHelp').on('click',function(){
            var gd=$(this).attr('data-gH');
            var dialog=bootbox.dialog({
                title: '<h3>'+gd+'<h3>',
                message: '<textarea style="height:400px;width:550px;">'+(_g.debug.help[gd].template)+'</textarea>'
            })
            dialog.draggable();
            return false;
        })
        $('._gDebugNav').find('._gDebugT').on('click',function(){
            var name=$(this).attr('data-gt');
            _g.debug.setT(name);
            return false;
        })
        $('._gDebugNav').find('.close').on('click',function(){
            $('._gDebugNav').remove();
        })
        $('._gDebugNav').find('.help').on('click',function(){
            var dialog=bootbox.dialog({
                title: '<h3>帮助<h3>',
                message: '<textarea style="height:400px;width:550px;">'+(_g.debug.help||"")+'</textarea>'
            })  
            dialog.draggable();    
              return false;    
        })
        if(_g.debug_editor) _g.debug_editor.render();
    },
    lessOver:function(T){
        _.each(_g.debug.less[T].el,function(i){
            $(i).addClass('_gTlayout');
        })
    }
    ,lessOut:function(T){
        _.each(_g.debug.less[T].el,function(i){
            $(i).removeClass('_gTlayout');
        })
    }
    ,replaceT:function(name,T,D){
        //在页面中找到name所对应的模板，并替换掉
        $('[data-gtemplate="'+name+'"]').each(function(){
            if(!_g.debug.user_template[name]) _g.debug.user_template[name]={};
            _g.debug.user_template[name].template=T;
            _g.debug.user_template[name].url="手动";
            var el=_g.renderT(T,JSON.parse(D),null,name,true);
            $(this).replaceWith(el);
        })
    }
    ,setT:function(name,container){
            if(name=="new"){
                var data={
                    name:name,
                    url:"",
                    debug_url:null,
                    template:"",
                    "new":true,
                    data:""
                }                
            }
            else var data={
                name:name,
                url:name,
                debug_url:_g.debug.user_template[name]?_g.debug.user_template[name].url:null,
                template:_g.debug.user_template[name]?_g.debug.user_template[name].template:_g.debug.template[name].template,
                data:(_g.debug.template[name].data?JSON.stringify(_g.debug.template[name].data):"")
            }
            var dialog=bootbox.dialog({
                title: '<h3>'+name+'<h3>',
                message: _.template(template_debugT,{template:data}),
                buttons:(name=="new"||_g.debug.template[name].debug)?debug_buttons(function(){
                    var T=dialog.find('textarea._gDebug_T').val();
                    var D=dialog.find('textarea._gDebug_D').val();
                    D=D?D:"{}";
                    if(name=="new"){
                        var containervalue=dialog.find('[name=container]').val();
                        container=containervalue?containervalue:container;
                        if(!container) return false;
                        var el=_g.renderT(T,JSON.parse(D),null,'newT_'+_g.uuid());
                        $(container).append(el);
                    }
                    else _g.debug.replaceT(name,T,D);
                }):null
            })
            dialog.draggable();
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.debug=_g_debug;
}
else{
    var _gPaths=['_g/base','underscore'];
    if(typeof _gDebug!="undefined"&&_gDebug){
        if(_gDebug.template){
            for(i=0;i<_gDebug.template.length;i++){
                _gPaths.push((_gDebug.template[i].url));
            }
        }
        if(_gDebug.less){
            for(i=0;i<_gDebug.less.length;i++){
                _gPaths.push((_gDebug.less[i].url));
            }
        }
        if(_gDebug.help){
            for(i=0;i<_gDebug.help.length;i++){
                _gPaths.push((_gDebug.help[i].url));
            }
        }
    }
    console.log(_gPaths);
    define(_gPaths,function(){
        if(!window._g) window._g={};
        window._g.debug=_g_debug;
        return window._g.debug; 
    })
}
})(window);