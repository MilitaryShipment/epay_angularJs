var app = angular.module('EpayBase',['ngRoute','Epay','Invoicing','ApiService','Paperwork','Agent'])
    .config(['$routeProvider',function($routeProvider){
        $routeProvider
            .when('/',{templateUrl:'views/epayLogin.html'})
            .when('/login',{templateUrl:'views/epayLogin.html'})
            .when('/invoice/:agentId/:gbl',{templateUrl:'views/invoice.html'})
            .when('/:agentId/blackouts',{templateUrl:'views/epayblackouts.html'})
            .when('/:agentId/shipments',{templateUrl:'views/epayShipments.html'})
            .when('/:agentId/users',{templateUrl:'views/epayUsers.html'})
            .when('/:agentId/paperwork',{templateUrl:'views/epayPaperwork.html'})
            .when('/:agentId/remittance/:gbl',{templateUrl:'views/remittance.html'})
            .when('/:agentId/claims/:option',{templateUrl:'views/epayClaims.html'})
            .when('/:agentId/:gbl/',{templateUrl:'views/invoice_complete.html'})
            .when('/:agentId/:gbl',{templateUrl:'views/invoice.html'})
            .when('/:agentId/info',{templateUrl:'views/epayAgencyInfo.html'})
            .when('/:agentId/snooze',{templateUrl:'views/invoice_too_late.html'})
            .when('/:agentId/upload/:gbl',{templateUrl:'views/uploadPpwk.html'})
            .otherwise({redirectTo:'/'});
    }])
    .controller('HomeController',function($scope,$location,ApiService){
      var self = this;
      self.findInvoice = function(agentId){
          swal({
              title:'E-Invoice',
              text:'Please enter a Government Bill of Lading Number below',
              type:'input',
              showCancelButton:true,
              closeOnConfirm:true,
              animation:'slide-from-top',
              inputPlaceHolder:'GBL'
          },function(inputValue){
              if(inputValue){
                  $scope.$apply(function(){
                      var path = '/invoice/' + agentId + '/' + inputValue;
                      $location.path(path);
                  });
              }
          });
      }
    });
