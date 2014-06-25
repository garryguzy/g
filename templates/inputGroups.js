 <div class="input-group c-input-group-<%=data.widgetType%>">
   <% if(data.widgetType==1){%>
      <span class="input-group-addon _g-input-group-prev">@</span>
      <input type="text" class="form-control" placeholder="Username"><span class="input-group-addon _g-input-group-next">@</span>
    <% } %>
    <% if(data.widgetType==2){%>
         <div class="input-group _g-input-group-2">
            <span class="input-group-btn _g-input-group-prev">         
                <button class="btn btn-default" type="button">Go!</button>       
            </span> 
            <input type="text" class="form-control”>
          <span class="input-group-btn _g-input-group-next">
            <button class="btn btn-default" type="button">Go!</button> 
          </span>
         </div>
    <% } %>
    <% if(data.widgetType==3){%>
         <div class="input-group">
              <div class="input-group-btn _g-input-group-prev">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Action <span class="caret"></span></button>
                <ul class="dropdown-menu">
                  <li><a href="#">Action</a></li>
                  <li><a href="#">Another action</a></li>
                  <li><a href="#">Something else here</a></li>
                  <li class="divider"></li>
                  <li><a href="#">Separated link</a></li>
                </ul>
              </div><!-- /btn-group -->
              <input type="text" class="form-control">
              <div class="input-group-btn _g-input-group-next">
                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Action <span class="caret"></span></button>
                <ul class="dropdown-menu">
                  <li><a href="#">Action</a></li>
                  <li><a href="#">Another action</a></li>
                  <li><a href="#">Something else here</a></li>
                  <li class="divider"></li>
                  <li><a href="#">Separated link</a></li>
                </ul>
              </div><!-- /btn-group -->
            </div><!-- /input-group -->
    <% } %>
    <% if(data.widgetType==4){%>
         <div class="input-group">
              <div class="input-group-btn _g-input-group-prev">
                <button type="button" class="btn btn-default">Action</button>
                   <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                    <span class="caret"></span>
                    <span class="sr-only">Toggle Dropdown</span>
                  </button>
                <ul class="dropdown-menu">
                  <li><a href="#">Action</a></li>
                  <li><a href="#">Another action</a></li>
                  <li><a href="#">Something else here</a></li>
                  <li class="divider"></li>
                  <li><a href="#">Separated link</a></li>
                </ul>
              </div><!-- /btn-group -->
              <input type="text" class="form-control">
              <div class="input-group-btn _g-input-group-next">
                <button type="button" class="btn btn-default">Action</button>
                   <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                    <span class="caret"></span>
                    <span class="sr-only">Toggle Dropdown</span>
                  </button>
                <ul class="dropdown-menu">
                  <li><a href="#">Action</a></li>
                  <li><a href="#">Another action</a></li>
                  <li><a href="#">Something else here</a></li>
                  <li class="divider"></li>
                  <li><a href="#">Separated link</a></li>
                </ul>
              </div><!-- /btn-group -->
            </div><!-- /input-group -->
    <% } %>
 </div>