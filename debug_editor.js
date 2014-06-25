//debug_editor模块用来管理项目的开发，调试和测试
//通常只有在开发模式下，才会启用该模块
//debug_editor 虽然调用的也是generator接口, 但是
(function(){
var mvc=[
        '<li class="dropup">',
         ' <a href="#" class="dropdown-toggle" data-toggle="dropdown">MVC <b class="caret"></b></a>',
'          <ul class="dropdown-menu">',
       ' <% _.each(_g.debug_editor.components,function(key){ %>',
 '           <li data-gC="<%=key%>" class="_gDebugComponent"><a href="#"><%=key%></a></li>',            
     '  <% }) %>',  
 '         </ul>',
  '      </li>'
].join("");
var widget=[
        '<li class="dropup">',
         ' <a href="#" class="dropdown-toggle" data-toggle="dropdown">Widget <b class="caret"></b></a>',
'          <ul class="dropdown-menu">',
       ' <% _.each(_g.debug_editor.widgets,function(key){ %>',
 '           <li data-gC="<%=key%>" class="_gDebugComponent"><a href="#"><%=key%></a></li>',            
     '  <% }) %>',  
 '         </ul>',
  '      </li>'
].join("");
var component=[
        '<li class="dropup">',
         ' <a href="#" class="dropdown-toggle" data-toggle="dropdown">Component <b class="caret"></b></a>',
'          <ul class="dropdown-menu">',
       ' <% _.each(_g.debug_editor.components,function(key){ %>',
 '           <li data-gC="<%=key%>" class="_gDebugComponent"><a href="#"><%=key%></a></li>',            
     '  <% }) %>',  
 '         </ul>',
  '      </li>'
].join("");
var gridbuttons=[
   '<button class="btn btn-primary" data-grid="12">12</button> ',
    '<button class="btn btn-primary" data-grid="6,6">6-6</button> ',
    '<button class="btn btn-primary" data-grid="4,4,4">4-4-4</button> ',
    '<button class="btn btn-primary" data-grid="3,3,3,3">3-3-3-3</button> ',
   '<button class="btn btn-primary" data-grid="2,10">2-10</button> ',
   '<button class="btn btn-primary" data-grid="3,9">3-9</button> ',
   '<button class="btn btn-primary" data-grid="4,8">4-8</button> ',
    '<button class="btn btn-primary" data-grid="7,5">7-5</button> ',
    '<button class="btn btn-primary" data-grid="8,4">8-4</button> ',
    '<button class="btn btn-primary" data-grid="9,3">9-3</button> ',
    '<button class="btn btn-primary" data-grid="10,2">10-2</button> ',
].join("");
var formbuttons=[
   '<button class="btn btn-primary" data-v="">normal</button> ',
    '<button class="btn btn-primary" data-v="form-inline">inline</button> ',
    '<button class="btn btn-primary" data-v="form-horizontal">horizontal</button> '
].join("");
var colorbuttons=[
   '<button class="btn btn-primary" data-v="0">style 1</button> ',
    '<button class="btn btn-primary" data-v="1">style 2</button> ',
        '<button class="btn btn-primary" data-v="2">style 3</button> '
].join("");
var buttonsizeT=[
   '<button class="btn btn-primary" data-v="normal">normal</button> ',
    '<button class="btn btn-primary" data-v="lg">large</button> ',
'<button class="btn btn-primary" data-v="sm">small</button> ',
'<button class="btn btn-primary" data-v="xs">extra small</button> '
].join("");
var gridElement=[
'<div class="row">',
   ' <% for(i=0;i<cols.length;i++){%>',
  '   <div class="col-xs-<%=Number(cols[i])%>" style="min-height: 20px;"></div>',
  '  <% }%>',
' </div>'
].join("");
var buttonGroupT=[
'<div class="btn-group <%=data.size?("btn-group-"+data.size):""%>">',
 //'<% for(i=0;i<count;i++){',
  '<button type="button" class="btn btn-default">1</button>',
 //'<% } %>',
'</div>'
].join("");
var _g_debug_editor={
    components:['awesomeIcons','bootstrapIcons','button','select','radio','checkbox','textarea','textinput','label','formgroup','form','section','container','grid'],
    widgets:['buttonDropDown','buttongroup','inputGroup','iconButton','accordion','tabs','slider','colorpicker','spinner'],
    init:function(){
        _g.debug.component=_.template(component,{});
        _g.debug.widget=_.template(widget,{});
        _g.debug_editor.initDropElement();
        //_g.debug_editor.setDropElement();
    },
    initDropElement:function(){
        //甚至当我们页面打开时自动就有drop area 
        _g.debug_editor.setDropElement('._gDebugEditorItem');
        $('body')
        .on('mouseover',function(){
            $(this).addClass('_gDebugHover');
            return false;
        })
        .on('mouseout',function(){
            $(this).removeClass('_gDebugHover');
            return false;
        })
        .on('mouseover','._gDebugEditorItem',function(){
             $(this).addClass('_gDebugHover');
             return false;
        })
        .on('mouseout','._gDebugEditorItem',function(){
             $(this).removeClass('_gDebugHover');
             return false;
        })
        .height(_g.device.screenSize().y);
        window.onresize=function(){
            $('body').height(_g.device.screenSize().y);
        }
    },
    render:function(){
        _g.debug_editor.setDragElement();
    },
    setDragElement:function(){
        $('._gDebugNav').find('._gDebugComponent,._gDebugT').draggable({ 
            appendTo: "body" ,
            helper: "clone",
            iframeFix: true
        });
    },
    chooseDialog:function(list,callback){
        var T=require('text!_g/templates/_gDebugChooseT.js');
        var dialog=bootbox.dialog({
            title: '<h3>choose<h3>',
            message: _.template(T,{data:list})
        })
        dialog.draggable();
        dialog.find('button').on('click',function(){
            var v=$(this).attr('data-v');
            if(v){
                if(callback) callback(v);
            }
            dialog.modal('hide');
        })         
    },
    setDropElement:function(elm){
        //开启让所有的元素都可以drop
        //如果没有elm 则定义页面上所有的元素
        if(!elm) elm='body';
        $(elm).droppable({
            accept: ":not(.ui-sortable-helper)",
            hoverClass: "_gTlayout",
            greedy: true,
            drop:function(event,ui){
                var cType=$(ui.draggable).attr('data-gC');
                var tType=$(ui.draggable).attr('data-gT');
                switch(cType){
                    case 'container': _g.debug_editor.drawContainer(this);break;
                    case 'section': _g.debug_editor.drawContainer(this,true);break;
                    case 'grid': _g.debug_editor.drawGrid(this);break;
                    case 'form': _g.debug_editor.drawForm(this);break;
                    case 'formgroup': _g.debug_editor.drawFormGroup(this);break;
                     case 'label': _g.debug_editor.drawLabel(this);break;
                     case 'textinput': _g.debug_editor.drawTextInput(this);break;
                      case 'textarea': _g.debug_editor.drawTextArea(this);break;
                      case 'checkbox': _g.debug_editor.drawCheckBox(this);break;
                      case 'radio': _g.debug_editor.drawRadio(this);break;
                      case 'select': _g.debug_editor.drawSelect(this);break;
                      case 'button':_g.debug_editor.drawButton(this);break;
                      case 'spinner': _g.debug_editor.drawSpinner(this);break;
                      case 'colorpicker': _g.debug_editor.drawColorPicker(this);break;
                      case 'buttongroup': _g.debug_editor.drawButtonGroup(this);break;
                      case 'bootstrapIcons': _g.debug_editor.drawBootstrapIconButton(this);break;
                      case 'awesomeIcons': _g.debug_editor.drawAwesomeIconsButton(this);break;
                      case 'buttonDropDown' : _g.debug_editor.drawButtonDropDown(this);break;
                      case 'slider': _g.debug_editor.drawSlider(this);break;
                      case 'iconButton': _g.debug_editor.drawIconButton(this);break;
                      case 'tabs': _g.debug_editor.drawTabs(this);break;
                      case 'accordion': _g.debug_editor.drawAccordion(this);break;
                      case 'inputGroup': _g.debug_editor.drawInputGroup(this);break;
                }
                if(tType) {
                    _g.debug.setT(tType,this);
                }
                //$(this).append($(ui.draggable).clone());
            }
        });
        $(elm).addClass('_gDebugEditorItem');
    },
    drawContainer:function(elm,full){
        var newElm;
        if(full) newElm=$('<div class="container-fluid" style="min-height:78px;"></div>');
        else newElm=$('<div class="container" style="min-height:78px;"></div>');
        $(elm).append(newElm);
        _g.debug_editor.setDropElement(newElm);
    },
    drawGrid:function(elm){
            var dialog=bootbox.dialog({
                title: '<h3>Grids<h3>',
                message: _.template(gridbuttons,{})
            })
            dialog.draggable();
            dialog.find('button').on('click',function(){
                var cols=$(this).attr('data-grid');
                cols=cols.split(',');
                var newElm=$(_.template(gridElement,{cols:cols}));
                $(elm).append(newElm);
                _g.debug_editor.setDropElement(newElm.children('div'));
                dialog.modal('hide');
                return false;
            })
    },
    drawLabel:function(elm,text){
        var newElm;
        newElm=$('<label>Label</label>');
        $(elm).append(newElm);   
    },
    drawTextInput:function(elm){
        var newElm;
        var T='<input type="text" class="form-control" placeholder="Password">';
        newElm=$(_.template(T,{data:{}}));
        $(elm).append(newElm); 
    },
    drawInputGroup:function(elm,text){
        _g.debug_editor.chooseDialog(['样式1','样式2','样式3','样式4'],function(value){
            if(!value) return false;
                var newElm;
                var T=require('text!_g/templates/inputGroups.js');
                newElm=$(_.template(T,{data:{widgetType:value}}));
                $(elm).append(newElm);   
        })
    },
    drawTextArea:function(elm,text){
        var newElm;
        newElm=$('<textarea class="form-control" rows="3"></textarea>');
        $(elm).append(newElm);
    },
    drawCheckBox:function(elm){
        var newElm;
        var T=require('text!_g/templates/_gDebugCheckBox.js');
        newElm=$(_.template(T,{}));
        $(elm).append(newElm); 
    },
    drawRadio:function(elm){
        var newElm;
        var T=require('text!_g/templates/_gDebugRadio.js');
        newElm=$(_.template(T,{}));
        $(elm).append(newElm); 
    },
    drawFormGroup:function(elm){
        var newElm;
        newElm=$('<div class="form-group" style="min-height:20px;"></div>');
        $(elm).append(newElm);
        _g.debug_editor.setDropElement(newElm);  
    },
    drawForm:function(elm){
        var dialog=bootbox.dialog({
            title: '<h3>Form<h3>',
            message: _.template(formbuttons,{})
        })
        dialog.draggable();
        dialog.find('button').on('click',function(){
            var v=$(this).attr('data-v');
            var T=require('text!_g/templates/_gDebugForm.js');
            var newElm=$(_.template(T,{formclass:v||""}));
            $(elm).append(newElm);
            _g.debug_editor.setDropElement(newElm);
            dialog.modal('hide');
            return false;
        })     
    },
    drawSelect:function(elm){
        var newElm;
        var mutiple=false;
        var T=require('text!_g/templates/_gDebugSelect.js');
        newElm=$(_.template(T,{data:{mutiple:mutiple}}));
        $(elm).append(newElm);         
    },
    drawButton:function(elm){
       _g.debug_editor.chooseButton(function(size){
        var newElm;
        var T=require('text!_g/templates/_gDebugButton.js');
        newElm=$(_.template(T,{data:{name:"button",size:size}}));
        $(elm).append(newElm);
       })         
    },
    drawSpinner:function(elm){
         _g.debug_editor.chooseDialog(['样式1','样式2'],function(value){
             if(!value)  return ;
            var newElm;
            newElm=_g.form.spinner({data:{size:'xs',widgetType:value}});
            $(elm).append(newElm);  
         })      
    }
    ,drawColorPicker:function(elm){
        var dialog=bootbox.dialog({
            title: '<h3>Form<h3>',
            message: _.template(colorbuttons,{})
        })
        dialog.draggable();
        dialog.find('button').on('click',function(){
            var v=$(this).attr('data-v');
            if(v){
                _g.generator.colorpicker(elm,{widgetType:(Number(v)+1)}); 
            }
            dialog.modal('hide');
        })       
    },
    drawButtonGroup:function(elm){
        _g.debug_editor.chooseDialog(['样式1','样式2','样式3'],function(value){
            if(!value) return false;
            var newElm;
            var T=require('text!_g/templates/buttonGroup.js');
            newElm=$(_.template(T,{data:{size:'xs',widgetType:value}}));
            $(elm).append(newElm);   
            _g.debug_editor.setDropElement(newElm);             
        })     
    }
    ,drawBootstrapIconButton:function(elm){
        require(['text!_g/templates/_gDebugBootstrapIcon.js'],function(T){
            var dialog=bootbox.dialog({
                title: '<h3>Bootstrap Icons<h3>',
                message: _.template(T,{})
            })
            dialog.draggable();
            dialog.find('.bootbox-body').css({
                'max-height':'500px',
                'overflow':'auto'
            })
            dialog.find('li').on('click',function(){
                var classname=$(this).children('.glyphicon').attr('class');
                if(classname){
                    var newElm;
                    var i='<i class="'+classname+'"></i>';
                    var T=require('text!_g/templates/_gDebugButton.js');
                    newElm=$(_.template(T,{data:{i:i}}));
                    $(elm).append(newElm); 
                }
                dialog.modal('hide');
            })
        })
    },
    drawAwesomeIconsButton:function(elm){
        require(['text!_g/templates/_gDebugAwesomeIcon.js'],function(T){
            var dialog=bootbox.dialog({
                title: '<h3>Awesome Icons<h3>',
                message: _.template(T,{})
            })
            dialog.draggable();
            dialog.find('.bootbox-body').css({
                'max-height':'500px',
                'overflow':'auto'
            })
            dialog.find('.fa-hover a').on('click',function(){
                var classname=$(this).find('i.fa').attr('class');
                if(classname){
                    var newElm;
                    var i='<i class="'+classname+'"></i>';
                    var T=require('text!_g/templates/_gDebugButton.js');
                    newElm=$(_.template(T,{data:{i:i}}));
                    $(elm).append(newElm); 
                }
                dialog.modal('hide');
                return false;
            })
        })        
    },
    chooseButton:function(callback){
        var T=buttonsizeT;
        var dialog=bootbox.dialog({
            title: '<h3>button Size<h3>',
            message: _.template(T,{})
        })
        dialog.draggable();
        dialog.find('button').on('click',function(){
            var v=$(this).attr('data-v');
            if(v){
                if(callback) callback(v);
            }
            dialog.modal('hide');
        })        
    },
    drawButtonDropDown:function(elm){
      _g.debug_editor.chooseDialog(['样式1','样式2'],function(value){
          if(!value) return false;
          _g.generator.buttonDropDown(elm,{
              widgetType:value,
              dropdownmenus:[
              {name:'test1',
               class:null,
               id:'test1'
              }
              , {name:'test2',
               class:null,
               id:'test2'
              }
              ]
          })
      })         
    }
    ,drawSlider:function(elm){
        _g.generator.slider(elm);  
    },
    drawIconButton:function(elm){
        _g.debug_editor.chooseDialog(['样式1','样式2'],function(value){
            if(!value) return ;
            var newElm;
            var T=require('text!_g/templates/iconButton.js');
            newElm=$(_.template(T,{data:{widgetType:Number(value)}}));
            $(elm).append(newElm);   
        })      
    },
    drawTabs:function(elm){
        _g.debug_editor.chooseDialog(['样式1','样式2'],function(value){
            if(!value) return ;
            var newElm;
            var T=require('text!_g/templates/tabs.js');
            newElm=$(_.template(T,{data:{widgetType:Number(value)}}));
            $(elm).append(newElm);            
        })
    },
    drawAccordion:function(elm){
           //if(!value) return ;
            var newElm;
            var T=require('text!_g/templates/accordion.js');
            newElm=$(_.template(T,{data:{widgetType:1}}));
            $(elm).append(newElm);         
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.debug_editor=_g_debug_editor;
}
else{
    var _gPaths=['_g/base','underscore'
    ,'text!_g/templates/_gDebugCheckBox.js'
    ,'text!_g/templates/_gDebugRadio.js'
    ,'text!_g/templates/_gDebugSelect.js'
    ,'text!_g/templates/_gDebugButton.js'
    ,'text!_g/templates/_gDebugForm.js'
    ,'text!_g/templates/_gDebugChooseT.js'
    ,'_g/form_widget/form'
    ,'text!_g/templates/tabs.js'
    ,'text!_g/templates/accordion.js'
    ,'text!_g/templates/iconButton.js'
    ,'text!_g/templates/buttonDropDown.js'
    ,'text!_g/templates/inputGroups.js'
    ,'text!_g/form_component/templates/textInput.js'
    ,'text!_g/templates/buttonGroup.js'
            ];
    if(typeof _gdebug_editor!="undefined"&&_gdebug_editor){

    }
    define(_gPaths,function(){
        if(!window._g) window._g={};
        window._g.debug_editor=_g_debug_editor;
        return window._g.debug_editor; 
    })
}
})(window);