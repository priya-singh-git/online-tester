var http = require('http');
var fs = require('fs');
var express = require('express');
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true
};
app.set('views',__dirname+'/views');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(session({secret: 'nodejssession',resave: true,saveUninitialized: true , cookie: {maxAge: 1 * 60 * 1000}}));

/*Start of code for sql connection*/
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "onlinetest"
});

con.connect(function(err) {
  if(err) throw err;
  console.log("Connected!");
});
/*end of code for sql connection*/

/*Start of code to check wheather user is logined or not */
var sess;
global.login = 0;
global.question = [];
app.get('/getLoginInfo', function(req,res) {
  res.setHeader("Content-Type", "text/html");
  sess = req.session;
  if(sess.email) {
    if(global.login == 0) {
      var timer2 = "1:01";
    }
    else {
      timer2 = global.timer;
    }
    global.login = 1;
    var interval = setInterval(function() {
      var timer = timer2.split(':');
      //by parsing integer, I avoid all extra string processing
      var minutes = parseInt(timer[0], 10);
      var seconds = parseInt(timer[1], 10);
      --seconds;
      minutes = (seconds < 0) ? --minutes : minutes;
      if (minutes < 0) clearInterval(interval);
      seconds = (seconds < 0) ? 59 : seconds;
      seconds = (seconds < 10) ? '0' + seconds : seconds;
      //minutes = (minutes < 10) ?  minutes : minutes;
      console.log(minutes + ':' + seconds);
      global.timer = minutes + ':' + seconds;
      timer2 = minutes + ':' + seconds;
    }, 1000);
    res.send({redirect:'start'});
  }
  else {
    res.send({redirect:'index'});
  }
});
/*End of code to check wheather user is logined or not */

/*Start of code for timer*/
app.get("/getTimer", function(req, res) {
  console.log(global.timer);
  res.send(global.timer);
})
/*End of code for timer*/

/*start of code to get user details and enter in sql*/
app.post("/emailDetails", function(req, res) {
  var data = req.body.email;
  sess = req.session;
  sess.email = data;
  var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
  if(pattern.test(data)) {
    con.query("SELECT COUNT(*) as count FROM userdetails WHERE emailID = '"+data+"'", function(err, result) {
      if(err) throw err;
      if(result[0].count == 0) {
        var sql = "INSERT INTO userdetails VALUES (NULL,'"+data+"')";
        con.query(sql, function(err, result) {
          if(err) throw err;
          fs.readFile('question.json', 'utf8',function(err, data) {
            if(err) {
              return console.error(err);
            }
            var arr = []
            while(arr.length < 10) {
              var randomnumber = Math.ceil(Math.random()*24);
              if(arr.indexOf(randomnumber) > -1) continue;
              arr[arr.length] = randomnumber;
            }
            var data = JSON.parse(data);
            var jsonList = [];
            for(var i = 0; i < arr.length;i++) {
              jsonList.push(data.questions[arr[i]-1]);
            }
            global.question = jsonList;
            res.send("Email Added Successfully");
          });

        });
      }
      else {
        res.send("Email Id already exist");
      }
    })
  }
  else {
    res.send("Enter proper Email ID");
  }
});
/*End of code to get user details and enter in sql*/
/*start of code to get question List*/
app.get('/questionList', function(req, res) {
  console.log("hi");
  console.log(global.question);
  res.send(global.question);
});
/*End of code to get question List*/

/*start of code to send ans list and score*/
app.post('/answerList',function(req, res) {
  var clientData = req.body.packet;
  console.log(clientData);
  fs.readFile('question.json', 'utf8',function(err, data) {
    if (err) {
        return res.send(err.stack);
    }
    var data = JSON.parse(data);
    var ansList = data.answers;
    var score = 0;
    var ans = [];
    for(var i =0; i< clientData.length; i++ ) {
      var clientAns = clientData[i].answer;
      var clientKey = clientData[i].no;
      for(var j =0; j< ansList.length; j++) {
        if(clientKey == ansList[j].key) {
          ans.push(ansList[j].value);
          if(clientAns == ansList[j].value) {
            score = score +1;
          }
        }
      }
    }
    res.send({ans: ans, score: score});
  });
});
/*End of code to send ans list and score*/

/*start of code for logout function*/
app.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      global.login = 0;
      res.redirect("getLoginInfo");
    }
  })
})
/*End of code for logout function*/

/*start of code to create server*/
var server = app.listen(8888, function() {
  var host = server.address.host;
  var port = server.address.port;
  console.log("Reading File");
});
/*End of code to create server*/
