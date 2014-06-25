<div class="<%=data.widgetType==3?"btn-group-vertical":"btn-group"%> _g-btn-group-<%=data.widgetType%>">
  <button type="button" class="btn btn-default">1</button>
  <button type="button" class="btn btn-default">2</button>
   <% if(data.widgetType==2){%>
  <div class="btn-group">
    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
      Dropdown
      <span class="caret"></span>
    </button>
    <ul class="dropdown-menu">
      <li><a href="#">Dropdown link</a></li>
      <li><a href="#">Dropdown link</a></li>
    </ul>
  </div>
  <% } %>
</div>