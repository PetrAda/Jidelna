$(document).ready(function(){
	// zobrazim zpravu jidelny, pokud nejaka je a jeste nebyla zobrazena. Jestli byla zobrazena 
	// urcuju primarne pomoci localStorage s fallbackem na cookies
	var zobrazit = $('.plovouciOkno[data-iajs-zobrazit=1]').first();
	if(zobrazit.size() !== 0){
		var zarizeniId = zobrazit.attr('data-iajs-zarizeni');
		var klic = "zobrazeneJidelny-id-"+zarizeniId;
		var dateKlic = klic+"-date";
		if(typeof(Storage) !== "undefined"){
			// ukladam pomoci localStorage na dlouho
			var item = localStorage.getItem(klic);
			var datum = localStorage.getItem(dateKlic);
			var zhtml = zobrazit.find('div.modal-body').html();
			var ted = new Date();
			if(!item || item !== zhtml || datum !== ted.toDateString()){
				localStorage.setItem(klic, zhtml);
				localStorage.setItem(dateKlic, ted.toDateString());
				zobrazit.modal();
			}
		}else{
			if(!$.cookie(klic)){
				$.cookie(klic, true);
				zobrazit.modal();
			}
		}
	}
	
});