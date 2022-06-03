;(function(window, angular) {

  'use strict';

  // Application module
  angular.module('app', [
    'app.common',
    'ui.router'
  ])

  /* Application config */
  .config([
    '$stateProvider', 
    '$urlRouterProvider', 
    function($stateProvider, $urlRouterProvider) {

      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: './html/home.html',
          controller: 'homeController'
        })
        .state('gallery', {
          url: '/gallery',
          templateUrl: './html/gallery.html',
          controller: 'galleryController'
        })
        .state('login', {
          url: '/login',
          templateUrl: './html/login.html',
          controller: 'loginController'
        })
        .state('register', {
          url: '/register',
          templateUrl: './html/register.html',
          controller: 'registerController'
        })
        .state('reservation', {
          url: '/reservation',
          templateUrl: './html/reservation.html',
          controller: 'reservationController'
        });
      
      $urlRouterProvider.otherwise('/');
    }
  ])

  // Home controller
  .controller('homeController', [
    '$scope',
    'http',
    function($scope, http) {
      
      // Set methods
      let methods = {

        // Initialize
        init: function() {

          // Get data
          methods.get().done( function() {

            // Show page
            $scope.methods.showPage();
          });
        },

        // Get data
        get: function() {

          // Define deferred objects completed
          let completed = new $.Deferred(),
              response  = { carousel    : new $.Deferred(),
                            services    : new $.Deferred(),
                            information : new $.Deferred()};
          
          // Set data
          $scope.data = {}

          // Each response keys
          $.each(Object.keys(response), function(i, key) {

            // Get data
            http.requiest(null, {
              url     : './data/' + key + '.json',
              dataType: "json"
            }).done(function(data) {

              // Set data, apply change, and resolve copleted
              $scope.data[key] = data;
              $scope.$applyAsync();
              response[key].resolve();
            });
          });

          // Wait for all completed
          $.when(
            response.carousel, 
            response.services, 
            response.information
          ).done( function() {
            completed.resolve();
          });

          // Return when completed
		      return $.when(completed).done().promise();
        }
      }

      // Initialize
      methods.init()
    }
  ])
  
  // Gallery controller
  .controller('galleryController', [
    '$scope',
    'http',
    function($scope, http) {
      
      // Set methods
      let methods = {

        // Initialize
        init: function() {

          // Get data
          methods.get().done( function() {

            // Show page
            $scope.methods.showPage();

            // Set dialog
            $scope.methods.modal('dialog');
          });
        },

        // Get data
        get: function() {

          // Define deferred objects completed
          let completed = new $.Deferred(),
              response  = { rooms   : new $.Deferred(),
                            common  : new $.Deferred(),
                            carousel: new $.Deferred()};
        
          // Set data
          $scope.data = {};
          
          // Each response keys
          $.each(Object.keys(response), function(i, key) {

            // Get data
            http.requiest(null, {
              url     : './data/' + key + '.json',
              dataType: "json"
            }).done(function(data) {
              if (key === 'rooms') {
                $.each([
                  'singleRoom',
                  'doubleRoom',
                  'family',
                  'suites',
                  'honey'
                ], function(i, k) {
                  $scope.data[k] = data.filter(function(i) {
                    return i.type == k;
                  });
                });
              } else $scope.data[key] = data;

              // Apply change, and resolve copleted
              $scope.$applyAsync();
              response[key].resolve();
            });
          });

          // Wait for all completed
          $.when( 
            response.rooms,
            response.common,
            response.carousel
          ).done( function() {
            completed.resolve();
          });

          // Return when completed
		      return $.when(completed).done().promise();
        }
      }

      // Initialize
      methods.init()
    }
  ])

  // Login controller
  .controller('loginController', [
    '$rootScope',
    '$scope',
    '$element',
    'util',
    'type',
    'http',
    function($rootScope, $scope, $element, util, type, http) {
      
      // Input changed
      $scope.methods.changed = function() {

        // Define accept button disabled variable, 
        // Get user property count, 
        // Define deferred objects completed 
        let isDisabled    = false,
            propCount     = Object.keys($scope.model).length,
            propCompleted = new $.Deferred(),
            completed     = new $.Deferred();

        // Each user properties
        $.each($scope.model, function (prop) {

          // When has property, then remove all white space, otherwise set to empty
          $scope.model[prop] = $scope.model[prop] === undefined ? '' : 
                               $scope.model[prop].split(' ').join('');
          
          // Check is not valid
          if ($scope.model[prop] === '' ||
             (prop === 'code' && $scope.model[prop] !== $scope.testCode)) {

            // Set accept button disabled to true
            isDisabled = true;
          }

          // Show/Hide input clear icon
          $element.find('.input-group#user-' + prop + ' .input-clear-icon')
            [util.addRemoveClass($scope.model[prop] !== '')]('show');
          
          // Check is completed
          if (!--propCount) propCompleted.resolve(isDisabled);
        });

        // When is all property completed
        $.when(propCompleted).done( function(isDisabled) {

          // Get accept, cancel button
          let acceptBtn = $element.find('button#accept'),
              cancelBtn = $element.find('button#cancel');

          // Add/remove accept, cancel button class btn-color
          if (isDisabled) {
            acceptBtn.addClass('btn-secondary')
                     .removeClass('btn-primary');
            cancelBtn.removeClass('btn-secondary')
                     .addClass('btn-primary');
          } else {
            acceptBtn.removeClass('btn-secondary')
                     .addClass('btn-primary');
            cancelBtn.addClass('btn-secondary')
                     .removeClass('btn-primary');
          }

          // Add/remove disabled
          acceptBtn.prop('disabled', isDisabled)

          // Resolve completed
          completed.resolve();
        });

        /* Return when completed */
				return $.when(completed).done().promise();
      };

      // Refresh code
      $scope.methods.refresh = function() {
        
        // Get test code
        $scope.testCode = $scope.methods.getCode();

        // Reset model user code, and apply change
        $scope.model.code = '';
        $scope.$applyAsync();

        // Call method input changed
        $scope.methods.changed();

        // Set input focus
        $element.find('input#code').focus();
      };

      // Show/Hide password
      $scope.methods.show = function(isChecked) {
        $element.find('input.input-password')
                [util.addRemoveClass(isChecked)]('show');
      };

      // Check user
      $scope.methods.check = function() {

        // Set arguments
        util.objectMerge({
            user: null,
            password: null
          }, $scope.model, true).done( function(args) {
        
          // Check user
          http.requiest({
            "moduleName":"user",
            "className":"User",
            "methodName":"getUser",
            "argsToClass":true,
            "args": args
          }).done(function(data) {

            // Check user
            if (!type.isNull(data)) {

              // Check has error
              if (util.isObjectHasKey(data, 'error')) {
                
                // Show error message
                $scope.methods.showMessage({
                  icon: "fas fa-exclamation-circle text-danger",
                  title: "error",
                  content: [{text:data['error'],ngClass:"fs-3",translate:false}],
                  btn: [{text:"ok",ngClass:"btn-primary"}]
                });
                
              } else {

                // Set user properties, apply change, and go to previous state
                $rootScope.user = data;
                $scope.$applyAsync();
                $scope.methods.prevState()
              }
            }
          });
        });
      };

      // Set methods
      let methods = {

        // Initialize
        init: function() {

          // Set model
          methods.set().done( function() {
            
            // Set events
            methods.events();

            // Show page
            $scope.methods.showPage();

            // Set message
            $scope.methods.modal('message');
          });
        },

        // Set model
        set: function() {
          
          // Define deferred object completed
          let completed = new $.Deferred();

          // Input models
          $scope.model = {
            user: '',
            password: '',
            code: ''
          };

          // Get test code
          $scope.testCode = $scope.methods.getCode();

          // Apply change, and resolve completed
          $scope.$applyAsync();
          completed.resolve();

          // Return when completed
		      return $.when(completed).done().promise();
        },

        // Set events
        events: function() {

          // Set input clear icon on click event
          $element.find('.input-clear-icon')
                  .on('click', function(event) {

            // Event prevent default
            event.preventDefault();

            // Get/Check current input clear icon element
            let element = $(event.target);
            if (!type.isNodElement(element)) return;

            // Get/Check proper input element
            let inputElement = element.closest('.input-group').find('input');
            if (!type.isNodElement(inputElement)) return;

            // Set proper input element focus
            inputElement.focus();

            // Get proper input element identifier
            let inputElementId  = inputElement.attr('id');

            // Clear value, and apply change
            $scope.model[inputElementId] = '';
            $scope.$applyAsync();

            // Call method input changed
            $scope.methods.changed();
          });

          // Key up event
          $(document).keyup(function (event) {

            // Get event key code
			  		let keyCode = event.keyCode || event.which;

            // Enter
			  		if (keyCode === 13) {
            
              // Event prevent default
              event.preventDefault()

              // Ge/Check input elements
              let inputElements	= $element.find('input, button')
                                          .not(':checkbox')
                                          .not(':disabled');
              if (type.isNodElement(inputElements)) {

                // Get/Check focused element
                let focusedElement = inputElements.filter(':focus');
                if (type.isNodElement(focusedElement)) {

                  // Get index of focused element, and define next input
                  let index     = inputElements.index(focusedElement),
                      nextInput = null;

                  // Check position of focused element, and set next element
                  if (inputElements.last().is(focusedElement))
                        nextInput = inputElements.first();
                  else  nextInput = $(inputElements.get(index+1));

                  // Set focus
                  nextInput.focus();
                }
              }

            // Initialize test code (ctrl-alt-c)
			  		} else if (event.ctrlKey  && 
                       event.altKey   && 
                       event.keyCode === 67) {
            
              // Event prevent default
              event.preventDefault()

              // Set user test code, and apply change
              $scope.model.code = $scope.testCode;
			  			$scope.$applyAsync();

              // Call method input changed
              $scope.methods.changed();
			  		}
          });
        }
      };

      // Initialize
      methods.init()
    }
  ])

  // Register controller
  .controller('registerController', [
    '$scope',
    'http',
    function($scope, http) {
      

      // Check registration properties
      $scope.methods.check = function() {
      };

      $scope.methods.registration = function() {
        
        // Define deferred object completed
        let completed = new $.Deferred();

        let args = JSON.parse(JSON.stringify($scope.model));
        args.password = $scope.model.password1
        args.gender = "F"
        delete args.password1
        delete args.password2
        args.birthday = moment(args.birthday, "YYYY-MM-DD").format("YYYY-MM-DD")

        // Get free rooms
        http.requiest({
          "moduleName":"register",
          "className":"Register",
          "methodName":"registration",
          "argsToClass":true,
          "args": args
        }).done(function(data) {
          completed.resolve(true)
        });

        // Return when completed
        return $.when(completed).done().promise();
      };


      // Set methods
      let methods = {

        // Initialize
        init: function() {

          // Set model
          methods.set().done( function() {
            
            // Show page
            $scope.methods.showPage();
          });
        },

        // Set model
        set: function() {
          
          // Define deferred object completed
          let completed = new $.Deferred();

          // Input models
          $scope.model = {
            prefixName: '',
            firstName: '',
            middleName: '',
            lastName: '',
            postfixName: '',
            gender: '',
            birthday: '',
            userEmail: '',
            loginName: '',
            password1: '',
            password2: ''
          };

          // Apply change, and resolve completed
          $scope.$applyAsync();
          completed.resolve();

          // Return when completed
		      return $.when(completed).done().promise();
        },
      }

      // Initialize
      methods.init()
    }
  ])

  // Reservation controller
  .controller('reservationController', [
    '$scope',
    '$element',
    'type',
    'util',
    'http',
    function($scope, $element, type, util, http) {
      
      // Search for free rooms
      $scope.methods.search = function() {

        // Get free rooms
        http.requiest({
          "moduleName":"reservation",
          "className":"Reservation",
          "methodName":"getRooms",
          "argsToClass":true,
          "args": methods.arguments()
        }).done(function(data) {

          // Check response valid
          if (util.isObjectHasKey(data, 'rows'))
                $scope.data.rooms = data['rows'];
          else  $scope.data.rooms = null;
          $scope.$applyAsync();
        });
      };

      // Changed
      $scope.methods.changed = function() {

        // Get date now, and set is valid to false
        let today   = moment().startOf('day'),
            isValid = false;
        
        // Get arrival day, and check valid
        let arrival = moment($scope.reservation.arrival);
        if (arrival.isValid()) {

          // When arrival is before today, then set to today
          if (arrival.diff(today, 'days') <= 0)
            arrival = moment(today)

          // Get leaving day, and check valid
          let leaving = moment($scope.reservation.leaving);
          if (leaving.isValid()) {

            // When leaving is before arrival, then set to arrival + 1 day
            if (arrival.diff(leaving, 'days') >= 0)
              leaving = moment(arrival).add(1,'days').startOf('day')

            // Set days
            $scope.reservation.arrival = arrival._d;
            $scope.reservation.leaving = leaving._d

            // Check number of adults
            if (!$scope.reservation.adults || 
                 $scope.reservation.adults < 1)
                 $scope.reservation.adults = 1
            
            // Check number of children
            if (!$scope.reservation.children ||
                 $scope.reservation.children < 0)
                 $scope.reservation.children = 0

            // Apply change
            $scope.$applyAsync();

            // Set is valid to true
            isValid = true;
          }
        }

        // When is valid, then search for room(s)
        if (isValid)
              $scope.methods.search();
        else  $scope.data.rooms = null;
      };

      // Booking
      $scope.methods.booking = function(event) {

        // Check is logged in
        if ($scope.user.id > 0) {

          // Set arguments
          let args = methods.arguments()

          // Set room identifier from reservation properties
          args['roomId'] = $(event.currentTarget).data('roomId')

          // Set guest id
          args['guest'] = $scope.user.id;

          // Booking
          methods.booking(args).done( function(success) {

            // Check is success
            if (success) {

              // Search for free rooms
              $scope.methods.search()
            }
          });
          
        } else {

          // Show message
          $scope.methods.showMessage({
            icon: "fas fa-exclamation-circle text-danger",
            title: "error",
            content: [{text:"notLoggedIn",ngClass:"fs-3"}],
            btn: [{text:"ok",ngClass:"btn-primary"}]
          });
        }
      };

      // Set methods
      let methods = {

        // Initialize
        init: function() {
          
          // Set model
          methods.set().done( function() {

            // Get data
            methods.get().done( function() {

              // Show page
              $scope.methods.showPage();

              // Set dialog
              $scope.methods.modal('dialog');

              // Set message
              $scope.methods.modal('message');
            });
          });
        },

        // Set model
        set: function() {

          // Set days default, get inputs, and define deferred object completed
          let today         = moment().startOf('day')._d,
              tomorrow      = moment().add(1,'days').startOf('day')._d,
              todayStr      = moment(today, "YYYY-MM-DD").format("YYYY-MM-DD"),
              tomorrowStr   = moment(tomorrow, "YYYY-MM-DD").format("YYYY-MM-DD"),
              arrival       = $element.find('input#arrival'),
              leaving       = $element.find('input#leaving'),
              completed     = new $.Deferred();

          // Set date input minimum values
          arrival.attr("min", todayStr);
          leaving.attr("min", tomorrowStr);

          // Input defaults
          $scope.reservation = {
            arrival: today,
            leaving: tomorrow,
            adults: 1,
            children: 0
          };
          
          // Run methods changed, and resolve completed
          $scope.methods.changed()
          completed.resolve();

          // Return when completed
		      return $.when(completed).done().promise();
        },

        // Get data
        get: function() {

          // Define deferred object completed
          let completed = new $.Deferred();
          
          // Set data
          $scope.data = {};

          // Get data
          http.requiest(null, {
            url     : './data/carousel.json',
            dataType: "json"
          }).done(function(data) {

            // Set data, apply change, and resolve copleted
            $scope.data.carousel = data;
            $scope.$applyAsync();
            completed.resolve();
          });

          // Return when completed
		      return $.when(completed).done().promise();
        },

        // Booking
        booking: function(args) {

          // Define deferred object completed
          let completed = new $.Deferred();

          // Get free rooms
          http.requiest({
            "moduleName":"reservation",
            "className":"Reservation",
            "methodName":"booking",
            "argsToClass":true,
            "args": args
          }).done(function(data) {

            // Check user
            if (!type.isNull(data)) {

              // Check has error
              if (util.isObjectHasKey(data, 'error')) {
                
                // Show error message
                $scope.methods.showMessage({
                  icon: "fas fa-exclamation-circle text-danger",
                  title: "error",
                  content: [{text:data['error'],ngClass:"fs-3",translate:false}],
                  btn: [{text:"ok",ngClass:"btn-primary"}]
                }); 
              }
            }
            completed.resolve(true)
          });

          // Return when completed
		      return $.when(completed).done().promise();
        },

        // Set arguments
        arguments: function() {
          return {
            arrival:  moment($scope.reservation.arrival, "YYYY-MM-DD").format("YYYY-MM-DD"),
            leaving:  moment($scope.reservation.leaving, "YYYY-MM-DD").format("YYYY-MM-DD"),
            adults:   $scope.reservation.adults,
            children: $scope.reservation.children
          }
        }
      }

      // Initialize
      methods.init()
    }
  ]);

})(window, angular);