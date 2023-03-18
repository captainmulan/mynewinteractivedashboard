const express = require('express'); 
const path = require('path'); 
const app = express(); 

app.use(express.static(__dirname+'/dist/my-new-project-1')); 

app.get('/*',function(req,res){ 
	res.sendFile(path.join(__dirname + '/dist/my-new-project-1/index.html')); 
}); 
	
app.listen(process.env.PORT || 8080);