if(window.history && window.history.pushState){
	window.onpopstate = function(event){
		window.location.href = event.state.url;
	};
}

$(document).ready(function(){

    var body = $('body');
    function LogoutTimer(){
        var alertTimer;
        var logoutTimer;

        // zrusi timery, pokud existuji
        this.cancel = function(){
            alertTimer && clearTimeout(alertTimer);
            logoutTimer && clearTimeout(logoutTimer);
        };
        // zrusi puvodni timery a nastavi je znovu.
        var reset = function(){
            this.cancel();
            alertTimer = setTimeout(function(){
                var d = new Date();
                d.setTime(d.getTime() + 300000); // + 5 minut
                window.alert('Za 5 minut ('+ d.toLocaleTimeString()+') budete automaticky odhlášen.\n\
 Pokud se ještě nechcete odhlásit, klikněte na libovolný odkaz na stránce.');
            }, 1510000); // 25 minut 10 sec
            logoutTimer = setTimeout(function(){
                $.getJSON(body.attr('data-basepath')+'/data/prihlasen', function(data){
                    if(data.prihlasen){
                        // jine okno mohlo refreshnout sessionu
                        reset();
                    }else{
                        window.location.href = $('body').attr('data-basepath')+'/odhlasit';
                    }
                });
            }, 1810000); // 30 minut 10 sec
        };
        this.reset = reset;
        this.isSet = function(){
            return alertTimer && logoutTimer;
        };
    }

	// nastavim varovani pred automatickym odhlasenim pokud ma body class
    var logoutTimer = new LogoutTimer();
	if(body.hasClass('loggedIn') > 0){
        logoutTimer.reset();
	}
	// vsechny elementy s atributem data-iajs-confirm budou zobrazovat potvrzovaci dialog
	body.on('click', '[data-iajs-confirm]', function(ev){
		if(!confirm($(this).attr('data-iajs-confirm'))){
			ev.preventDefault();
		}
	});
	
	// select prepinacJidelen se bude automaticky submitovat
	$('#prepinacJidelen').bind('change', function(e){
		$('#prepinacJidelen').parents('form').trigger('submit');
	});
	
	// elementy s tridou prepinac budou prepinat class zapnuto mezi svymi syny
	body.on('click', '.prepinac', function(ev){
		var nove = $(this).children('.zapnuto').next().first();
		$(this).children().removeClass('zapnuto');
		if(nove.size() !== 1){
			$(this).children().first().addClass('zapnuto');
		}else{
			nove.addClass('zapnuto');
		}
	});
	
	// funkce, ktera prijima uspesne ajaxove odpovedi
	var aktualizujSnippety = function(data){
		if(data.redirect){
			window.location.href = data.redirect;
		}
		if(data.url && window.history && window.history.pushState){
			window.history.pushState(data, "", data.url);
		}
		for(var index in data.snippets){
            var target = $('#'+index);
			target.html(data.snippets[index]);
			target.find('[data-tooltip="tooltip"]').tooltip();
			var popovers = target.find('[data-toggle="popover"]');
			popovers.popover();
			popovers.click(function(ev){ev.preventDefault();});
		}
	};

    // vsechny linky se tridou napovedaLink budou zpracovavany ajaxove
    body.on('click', 'a.napovedaLink', function(ev){
        $.get($(this).attr('data-iajs-napoveda-href'), null, function(data){
            if(logoutTimer.isSet()){
                logoutTimer.reset();
            }
            for (var id in data.snippets){
                var target = $('#'+id);
                target.html(data.snippets[id]);
                if(target.hasClass('modal')){
                    target.modal();
                }
            }
        });
        ev.preventDefault();
    });

	// vsechny linky s tridou ajax budou posilat ajaxovy get
	body.on('click','a.ajax',function(ev){
		$.ajax($(this).attr('href'), {
			dataType: 'json',
			success: function(data){
                if(logoutTimer.isSet()){
                    logoutTimer.reset();
                }
                aktualizujSnippety(data);
            },
			type: 'GET'
		});
		ev.preventDefault();
	});
	
	body.on('click', 'a.modalLink', function(ev){
		$.ajax($(this).attr('href'), {
			dataType: 'json',
			type: 'GET',
			success: function(data){
				// ajaxovy pozadavek prodluzuje timeout odhlaseni
				if(logoutTimer.isSet()){
					logoutTimer.reset();
				}
				for(var index in data.snippets){
					var obj = $('#'+index);
					obj.html(data.snippets[index]);
					if(obj.hasClass('modal')){
						obj.modal();
					}
					obj.find('[data-tooltip="tooltip"]').tooltip();
				}
			}
		});
		ev.preventDefault();
	});

	$('.numberListContainer').each(function(idx, el){
			var me = $(el);
			var input = me.children('input');
			var plus = me.children('.plus');
			var minus = me.children('.minus');
        	var max = parseInt(input.attr('max'));
        	var min = parseInt(input.attr('min'));
			var checkValid = function(){
				var val = parseInt(input.val());
                input.attr("data-placement", "right");
				if(isNaN(val)){
                    input.attr("data-persistence", "no");
					input.attr('data-message', "Neplatný vstup. Očekáváno číslo mezi "+min+" a "+max+".");
					if(input.val() === ''){
						setTimeout(function(){
						    if(input.val() === ''){
						        input.popover('show');
                            }
                        }, 4000);
					}else{
                    	input.popover('show');
                    }
				}else if(val > max){
                    input.attr("data-persistence", "no");
					input.attr("data-message", "Maximální počet porcí je "+max+".");
					input.popover('show');
				}else if(val < min){
                    input.attr("data-persistence", "no");
					input.attr('data-message', "Nelze objednat záporné množství porcí.");
					input.popover('show');
				}else if(input.attr('data-persistence') !== "persistent"){
					input.popover('hide');
				}
			};

			var resetGroup = function(){
                var group = $('input[data-group='+input.attr('data-group')+']');
                group.each(function(index, element){
                    if(!input.is(element) && $(element).val() > 0){
                        $(element).val(0);
                        $(element).attr("data-persistence", "no");
                        $(element).attr("data-placement", "right");
                        $(element).attr("data-message", "Automaticky odhlášeno, protože v jednom dni můžete mít přihlášen maximálně jeden druh.");
                        setTimeout(function(){$(element).popover("hide");}, 3000);
                        $(element).popover('show');
                    }
                });
			};

			var fixWidth = function(ev){
				var value = input.val();
				if(parseInt(value) > 99){
					input.css('width', '2.5em');
				}else{
					input.css('width', '2em');
				}
			};

			plus.click(function (ev) {
				var presah = parseInt(input.val()) === max;
				input.val(Math.min(parseInt(input.val()) + 1, parseInt(max)));
				checkValid();
                if(presah){
                    input.attr("data-message", "Nelze objednat více porcí než " + max);
                    input.attr("data-placement", "top");
                    input.attr("data-persistence", "persistent");
                    setTimeout(function(){input.popover("hide");}, 3000);
                    input.popover("show");
                }
				resetGroup();
                fixWidth(ev, this);
				ev.preventDefault();
            });

			minus.click(function (ev) {
				input.val(Math.max(input.val() - 1, min));
				checkValid();
				fixWidth(ev, this);
				ev.preventDefault();
			});

			input.popover({'content': function(){return input.attr('data-message');},
                'placement': function(){return input.attr('data-placement');},
			'trigger': 'manual',
			'container': 'body'});

			input.on('keyup', function(ev){checkValid(ev); resetGroup(ev); fixWidth(ev)});
			input.on('change', function(ev){checkValid(ev); resetGroup(ev); fixWidth(ev)});
		}
	);
	
	// vsechny formulare se tridou ajax budou odesilat pres ajax podle jejich method
	body.on('submit', 'form.ajax', function(ev){
		$.ajax($(this).attr('action'), {
			dataType: 'json',
			success: function(data){
				// ajaxovy pozadavek prodluzuje timeout odhlaseni
				if(logoutTimer.isSet()){
					logoutTimer.reset();
				}
				aktualizujSnippety(data);
			},
			type: $(this).attr('method'),
			data: $(this).serialize()
		});
		ev.preventDefault();
	});
	
	// povolit tooltipy pres js
	$('[data-tooltip="tooltip"]').tooltip();
	var popovers = $('[data-toggle="popover"]');
	popovers.popover();
	popovers.click(function(ev){ev.preventDefault();});
	
	// aby fungovaly spinnery jestli zrovna jede ajax
	var spinner = $('.ajaxSpinner');
	spinner.hide();
	var ajaxPracuje = false;
	$(document).ajaxStart(function(){spinner.show(); ajaxPracuje = true;});
	$(document).ajaxStop(function(){spinner.hide(); ajaxPracuje = false;});
	// ajax spinner obcas nebyl zrusen kvuli race condition v javascriptech. 
	// Toto je timeout tociciho se kolecka, kdyby nebylo korektne skryto pri startu.
	//  Mozna jde resit lepe necim jako load event.
	setTimeout(function(){if(!ajaxPracuje){spinner.hide();}}, 1000);

	$(".PrumerneHodnoceni").mouseover(function() {//skrývá a zobrazuje přesné získání průměrného hodnocení
	$(this).parent().children(".SpecifikaHodnoceni").show();
	}).mouseout(function() {
	$(this).parent().children(".SpecifikaHodnoceni").hide();
	});

	$(".HodnoticiSmajlik").mouseup(Zmen_hodnoceni);//přiřazuji spouštěče na smaklíky k funkci, která ohodnotí chod
	$(".PouzityHodnoticiSmajlik").mouseup(Zmen_hodnoceni);



	function Zmen_hodnoceni() {

		if($(this).attr("class")!=="HodnoticiSmajlik") return;
		const ja=$(this);//protoze se objekt zmenil
		const posledni= $(this).parent().parent().find(".PouzityHodnoticiSmajlik");
		posledni.removeClass('PouzityHodnoticiSmajlik').addClass('HodnoticiSmajlik');
		$(this).removeClass('HodnoticiSmajlik').addClass('PouzityHodnoticiSmajlik');//změním class smajlíka, který

		var output= {};

		output["objednavka"]=$(this).parent().parent().attr("data-objednavka");
		output["stravnik"]=$(this).parent().parent().attr("data-stravnik");
		output["hodnoceni"]=$(this).attr("data-hodnoceni");
		$.ajax($(this).parent().parent().attr('data-ajax-hodnoceni'),{
			data: JSON.stringify(output),
			dataType: 'json',
			success: function(data){
				console.log(data);
				if(logoutTimer.isSet()){
					logoutTimer.reset();
				}

				var input=JSON.parse(data);
				var Prumer=$(this).parents(".menu").find(".hodnoceni");
				Prumer.remove(Prumer.children(".PrumerneHodnoceni"));//odebereme smajlíka a box textu, nahradíme je
				Prumer.remove(Prumer.children(".SpecifikaHodnoceni"));
				Prumer.append(input[0]);
				Prumer.append(input[1]);
			},
			type: 'POST',
			cache:false,
			error: function(data){
				if(logoutTimer.isSet()){
					logoutTimer.reset();
				}
				//nedošlo k ohodnocení
				posledni.removeClass('HodnoticiSmajlik').addClass('PouzityHodnoticiSmajlik');
				ja.removeClass('PouzityHodnoticiSmajlik').addClass('HodnoticiSmajlik');
				console.log(data);
			}



		});


	};


});