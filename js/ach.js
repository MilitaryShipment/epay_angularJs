var app = angular.module('Ach',['ApiService'])
    .controller('AchController',function(ApiService,AchService){
        var self = this;
        self.accountNum = 0;
        self.routingNum = 0;
        self.save = function(){
            console.log(AchService.vendorId);
            ApiService.updateAchInfo(AchService.vendorId,self.accountNum,self.routingNum).then(function(data){
                console.log(data);
            });
        }
    })
    .service('AchService',function(){
        var self = this;
        self.vendorId = null;
    });