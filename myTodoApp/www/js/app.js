var app = angular.module('app', ['ionic']).config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('page9', {
    url: '/login',
    templateUrl: 'page9.html',
    controller: 'LoginCtrl'
  })

  .state('page11', {
    url: '/signup',
    templateUrl: 'page11.html',
    controller: 'SignupCtrl'
  })

  .state('page12', {
    url: '/home',
    templateUrl: 'page12.html',
    controller: 'HomeCtrl'
  });

  $urlRouterProvider.otherwise('/login');


}).run(function($ionicPlatform, $rootScope, $ionicLoading, $location, $timeout, SessionFactory) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  $rootScope.authktd = false;

  $rootScope.showLoading = function(msg) {
    $ionicLoading.show({
      template: msg || 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
  }

  $rootScope.hideLoading = function() {
    $ionicLoading.hide();
  };

  $rootScope.toast = function(msg) {
    $rootScope.showLoading(msg);
    $timeout(function() {
      $rootScope.hideLoading();
    }, 2999);
  };

  $rootScope.logout = function() {
    SessionFactory.deleteSession();
    $location.path('/login');
  }

}).factory('API', ['$http', function($http) {

  var _base = "http://localhost:3000";
  var _api = {

    login: function(user) {
      return $http.post(_base + '/api/auth/login', user);
    },
    signup: function(user) {
      return $http.post(_base + '/api/auth/signup', user);
    },
    getTodos: function(userid) {
      return $http.get(_base + '/api/data/getTodos/' + userid);
    },
    saveTodo: function(todo) {
      return $http.post(_base + '/api/data/saveTodo', todo);
    }

  };

  return _api;
}]).factory('SessionFactory', ['$window', function($window) {

  var _sessionFactory = {
    createSession: function(user) {
      return $window.localStorage.user = JSON.stringify(user);
    },
    getSession: function(user) {
      return JSON.parse($window.localStorage.user);
    },
    deleteSession: function() {
      delete $window.localStorage.user;
      return true;
    },
    checkSession: function() {
      if ($window.localStorage.user) {
        return true;
      } else {
        return false;
      }
    }
  };

  return _sessionFactory;

}]).controller('LoginCtrl', ['$rootScope', '$location', '$scope', 'API', 'SessionFactory', function($rootScope, $location, $scope, api, sf) {
  $scope.login = {
    username: '',
    password: ''
  }

  $scope.loginUser = function() {
    $rootScope.showLoading("Authenticating..");
    api.login($scope.login).success(function(data) {
      sf.createSession(data.data);
      $location.path('/home');
      $rootScope.hideLoading();
    }).error(function(data) {
      $rootScope.hideLoading();
      $rootScope.toast('Invalid Credentials');
    })
  }


}]).controller('SignupCtrl', ['$rootScope', '$location', '$scope', 'API', 'SessionFactory', function($rootScope, $location, $scope, api, sf) {

  $scope.reg = {
    username: '',
    password: ''
  }

  $scope.registerUser = function() {
    $rootScope.showLoading("Authenticating..");
    api.signup($scope.reg).success(function(data) {
      sf.createSession(data.data);
      $location.path('/home');
      $rootScope.hideLoading();
    }).error(function(data) {
      $rootScope.hideLoading();
      $rootScope.toast('Invalid Credentials');
    })
  }

}]).controller('HomeCtrl', ['$rootScope', '$scope', 'SessionFactory', 'API', '$ionicModal', function($rootScope, $scope, sf, api, $ionicModal) {

  $scope.todos = [];


  $rootScope.$on('load-todos', function(event) {
    $rootScope.showLoading('Fetching Todos..');
    var user = sf.getSession();

    api.getTodos(user._id).success(function(data) {
      $scope.todos = data.data;
      $rootScope.hideLoading();
    }).error(function(data) {
      $rootScope.hideLoading();
      $rootScope.toast('Oops.. Something went wrong');
    });
  });

  $rootScope.$broadcast('load-todos');

  $rootScope.createNew = function() {
    $scope.modal.show();
  }

  $ionicModal.fromTemplateUrl('modal2.html', function(modal) {
    $scope.modal = modal;
  }, {
    animation: 'slide-in-up',
    focusFirstInput: true
  });

}]).controller('NewTodoCtrl', ['$rootScope', '$scope', 'SessionFactory', 'API', function($rootScope, $scope, sf, api) {

  $scope.todo = {
    item: ''
  };

  $scope.create = function() {
    api.saveTodo({
      todo: $scope.todo.item,
      userid: sf.getSession()._id
    }).success(function(data) {
      $rootScope.hideLoading();
      $scope.modal.hide();
      $rootScope.$broadcast('load-todos');
    }).error(function(data) {
      $rootScope.hideLoading();
      $rootScope.toast('Oops.. Something went wrong');
    });
  }
}]);
