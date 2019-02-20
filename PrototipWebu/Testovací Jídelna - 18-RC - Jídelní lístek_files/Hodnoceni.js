

$(document).ready(function(){

	$(".PrumerneHodnoceni").mouseover(function() { //ukazuje box textu
	$(this).parent().children(".CelkoveHodnoceni").show();
	}).mouseout(function() {
	$(this).parent().children(".CelkoveHodnoceni").hide();
	});

	$(".HodnoticiSmajlik").mouseup(Zmen_hodnoceni);//přiřazuji spouštěče na smaklíky k funkci, která ohodnotí chod
	$(".PouzityHodnoticiSmajlik").mouseup(Zmen_hodnoceni);
	
	function Zmen_hodnoceni() {//zatím jen grtaficky upraví stránku
		if($(this).attr("class")=="PouzityHodnoticiSmajlik") end;
		var posledni= $(this).parent().parent().find(".PouzityHodnoticiSmajlik");
		posledni.removeClass('PouzityHodnoticiSmajlik').addClass('HodnoticiSmajlik');
		$(this).removeClass('HodnoticiSmajlik').addClass('PouzityHodnoticiSmajlik');
		var Prumer=$(this).parents(".menu").find(".hodnoceni");
	};

});