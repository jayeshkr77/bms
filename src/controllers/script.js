

$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();

  $('#sidebar ul li').click(sideClick);

  var child = $('#sidebar ul').children()
  switch(window.location.pathname){
    case '/':
      $('#sidebar ul li').removeClass('selected');
      $(child[0]).addClass('selected');
      break;
    case '/new-transaction':
      $('#sidebar ul li').removeClass('selected');
      $(child[1]).addClass('selected');
      break;
    case '/dashboard':
      $('#sidebar ul li').removeClass('selected');
      $(child[2]).addClass('selected');

  }
})

function toggleSidebar(){

  if($('#sidebar').width() == 0)
    $('#sidebar').css('width', '260px');
  else
    $('#sidebar').css('width', '0px');
}

function sideClick(){
  //add CSS
  $('#sidebar ul li').removeClass('selected');
  $(this).addClass('selected');
  
  var tab = $(this).first().text()

  switch(tab){
    case 'Home':
      window.location.href='/'
      break;
    case 'New Transaction':
      window.location.href='/new-transaction'
      break;
    case 'Analytics':
      window.location.href='/dashboard'
      break;
  }
}
 