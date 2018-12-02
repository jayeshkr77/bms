 $("#login-button").click(function(event){
	event.preventDefault();
	var username = $('input[type="text"]').val();
	var password = $('input[type="password"]').val();

	if(username != '' && password != '')
		$.post('/login', {username: username, password: password}, function(success){
			console.log(success)

			if(!success.err){
				$('form').fadeOut(500);
				$('.wrapper').addClass('form-success');
				window.location.href='/'
			}else{
				$('form').before('<h3>'+success.msg+'</h3>')
			}
		})
	else
	$('form').before('<h3>Please Enter Credentials</h3>')
	
});