function parseDate(str) {
       var date = str;
       try {
               date = new ISODate(str);
       }
       catch (e) {
               try {
                       
                       date = new ISODate(date.getFullYear() + "-" + (date.getMonth()+1) + date.getDate())
               }
               catch (e) {
		       try
			{
				date = new Date(str);
			}
			catch(e){
				print("could not parse: " + str);
			}                      
               }
       }
       if (date.toString() == "Invalid Date") {
               print("invalid date: " + str);
       }
       return date;
}

var cursor = db.bills.find();

while (cursor.hasNext()) {
	var doc = cursor.next();
	var actions = doc.actions;
	var cosponsors = doc.cosponsors;
	var history = doc.history;
	var summary = doc.summary;

	for (var i=0; i<actions.length; i++) {
		actions[i].acted_at = new parseDate(actions[i].acted_at);
	}
	db.bills.update({_id : doc._id}, {$set : { actions : actions }});

	for (var i=0; i<cosponsors.length; i++) {
		cosponsors[i].sponsored_at = new parseDate(cosponsors[i].sponsored_at);
	}
	db.bills.update({_id : doc._id}, {$set : { cosponsors : cosponsors }});

	history.house_passage_result_at = new parseDate(history.house_passage_result_at);
	history.house_cloture_result_at = new parseDate(history.house_cloture_result_at);
	history.senate_cloture_result_at = new parseDate(history.senate_cloture_result_at);
	history.senate_passage_result_at = new parseDate(history.senate_passage_result_at);
	db.bills.update({_id : doc._id}, {$set : { history : history }});

	try
	{
		summary.date = new parseDate(summary.date);
		db.bills.update({_id : doc._id}, {$set : { summary : summary }});
	}
	catch(e) 
	{
		print("summary parse failure: " + summary)
	}
	db.bills.update({_id : doc._id}, {$set : { introduced_at: new parseDate(doc.introduced_at)}});
	db.bills.update({_id : doc._id}, {$set : { status_at: new parseDate(doc.status_at)}});
	db.bills.update({_id : doc._id}, {$set : { updated_at: new parseDate(doc.updated_at)}});
}
