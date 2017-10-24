var onlineTester =angular.module("onlineTester",[]);
onlineTester.controller("testing", function($scope, $http,$location) {

  /*Start of code to check whether user is logined or not */
  $http({
    method : 'GET',
    url : "http://localhost:8888/getLoginInfo",
    withCredentials: true,
    headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
  }).then(function (response) {
    if(response.data.redirect == "start") {
      if($location.absUrl().split("/").pop() != "start.html") {
        window.location.href = "start.html";
      }
    }
    else {
      if($location.absUrl().split("/").pop() != "index.html") {
        window.location.href = "index.html";
      }
    }
  }, function (error) {
    alert("Something Went wrong");
  });
/*End of code to check whether user is logined or not */


/*start of code if user entered Details*/
$scope.start = function() {
  var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
  if($scope.email == "" || $scope.email == undefined) {
    alert("Enter Email ID");
  }
  else if(!pattern.test($scope.email)) {
    alert("Enter proper email id");
  }
  else {
    $http({
       method : 'POST',
       url : "http://localhost:8888/emailDetails",
       data: {email:$scope.email},
       withCredentials: true,
       headers : {'Content-Type' : "application/json"},
     }).then(function (response) {
       if(response.data == "Email Added Successfully") {
         window.location.href = "start.html";
       }
       else {
         alert(response.data);
       }
     }, function (error) {
       alert("Something Went wrong");
     });
  }
}
/*End of code if user entered Details*/


/* Start of Code to show Timer */
  var interval;
  $scope.showTimer = function() {
    $http({
      method : 'GET',
      url : "http://localhost:8888/getTimer",
      withCredentials: true,
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
    }).then(function (response) {
      $scope.timer = response.data;
      if(response.data == "0:00") {
        alert("Oh! Time Out");
        $scope.submitQuestion();
      }
    }, function (error) {
      alert("Something Went wrong");
    });
  }
  if($location.absUrl().split("/").pop() != "index.html") {
    interval = setInterval($scope.showTimer,1000);
  }
/* End of Code to show Timer */

/* Start of code to list down questions*/
  $scope.answers = {};
  $scope.questionList = function() {
    $http({
      method : 'GET',
      url : "http://localhost:8888/questionList",
      withCredentials: true,
      headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
    }).then(function (response) {
      $scope.questions = response.data;
    }, function (error) {
      alert("Something Went wrong");
    });
  }
  $scope.questionList();
/* End of code to list down questions*/

/* Start of code to show score and right answer*/
  $scope.submitQuestion = function() {
    clearInterval(interval);
    $scope.queAns = [];
    angular.forEach($scope.questions, function(key, value) {
      $scope.queAns.push({"no": $scope.questions[value].no, "answer": $scope.answers[value]});
    });
    $scope.rightAns = [];
   $http({
      method : 'POST',
      url : "http://localhost:8888/answerList",
      data: {packet:$scope.queAns},
      withCredentials: true,
      headers : {'Content-Type' : "application/json"},
    }).then(function (response) {
      $scope.rightAns = response.data.ans;
      $scope.score = response.data.score;
      $("input").attr('disabled','true');
    }, function (error) {
      alert("Something Went wrong");
    });
  }
/* End of code to show score and right answer*/

/* Start of code for logout functionality */
  $scope.logout = function() {
    $http({
       method : 'GET',
       url : "http://localhost:8888/logout",
       withCredentials: true,
       headers : {'Content-Type' : "application/x-www-form-urlencoded"},
     }).then(function (response) {
       if(response.data.redirect == "index") {
         alert("You are logged out.");
         if($location.absUrl().split("/").pop() != "index.html") {
           window.location.href = "index.html";
         }
       }
     }, function (error) {
       alert("Something Went wrong");
     });
  }
/* End of code for logout functionality */
});
