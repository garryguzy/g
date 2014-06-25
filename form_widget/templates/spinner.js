<div id="<%=data.id%>" class="spinner _g-spinner-<%=data.widgetType%>">
    <input type="text" class="input-mini spinner-input">
    <% if(data.widgetType==2){%>
    <div class="btn-group <%=data.size?("btn-group-"+data.size):""%>">
        <button type="button" class="btn btn-default dropdown-toggle btn-link" data-toggle="dropdown">
          Dropdown
          <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li><a href="#">Dropdown link</a></li>
          <li><a href="#">Dropdown link</a></li>
        </ul>
    </div>
    <% } %>
    <div class="spinner-buttons btn-group btn-group-vertical">
        <button type="button" class="btn spinner-up">
            <i class="fa fa-chevron-up"></i>
        </button>
        <button type="button" class="btn spinner-down">
            <i class="fa fa-chevron-down"></i>
        </button>
    </div>
</div>