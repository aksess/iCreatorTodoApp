var express = require('express');
var router = express.Router();
var db = require('diskdb');

// Config DiskDB
db = db.connect('mydata', ['users', 'todos']);

router.post('/api/auth/login', function(req, res) {
  var user = req.body;

  // validate incoming data
  if (!(user && user.username && user.password))  {
    _401(res); // send a 401 Error
    return;
  }

  // validate user
  var dbUser = db.users.findOne(user);

  if (!dbUser) {
    _401(res); // send a 401 Error
    return;
  } else {
    _200(res, dbUser); // send the saved user object with a 200 response 
  }

});

router.post('/api/auth/signup', function(req, res) {
  var user = req.body;
  
  // validate incoming data
  if (!(user && user.username && user.password)) {
    _401(res); // send a 401 Error
    return;
  }

  // Save user
  var dbUser = db.users.save(user);

  if (!dbUser) {
    _401(res); // send a 401 Error
    return;
  } else {
    _200(res, dbUser); // send the user object with a 200 response 
  }

});

router.get('/api/data/getTodos/:_id', function(req, res) {
  var _id = req.params._id;
  // validate incoming data
  if (!_id) {
    _401(res); // send a 401 Error
    return;
  }

  // Fetch user
  var todos = db.todos.find({
    userid: _id
  });

  _200(res, todos); // send the todos object with a 200 response 

});

router.post('/api/data/saveTodo', function(req, res) {
  var todo = req.body;
  console.log(todo)
  // validate incoming data
  if (!(todo && todo.userid && todo.todo)) {
    _401(res); // send a 401 Error
    return;
  }

  // Save Todo
  var dbTodo = db.todos.save(todo);

  if (!dbTodo) {
    _401(res); // send a 401 Error
    return;
  } else {
    _200(res, dbTodo); // send the saved Todo object with a 200 response 
  }

});

function _401(res) {
  res.status(401);
  res.json({
    "status": 401,
    "message": "Invalid Data"
  });
}

function _200(res, data) {
  res.status(200);
  res.json({
    "status": 200,
    "message": "Success",
    "data": data
  });
}

module.exports = router;
