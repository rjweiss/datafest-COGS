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

var cursor = db.finance.find()
while (cursor.hasNext()) {
	var doc = cursor.next();
	db.finance.update({_id : doc._id}, {$set : { date: new parseDate(doc.Date)}});
}
