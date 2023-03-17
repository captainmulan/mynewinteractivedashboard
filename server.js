const express = require('express');
const app = express();

app.use(express.static('./dist/my-new-project-1'));

app.get('/*', function(req, res) {
  res.sendFile('index.html', {root: 'dist/my-new-project-1/'});
});

app.listen(process.env.PORT || 8080);