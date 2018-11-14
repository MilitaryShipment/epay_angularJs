var app = angular.module('Agent',['ApiService'])
    .controller('AgentUpdateController',function(ApiService,$routeParams,$cookies,$location){
        var self = this;
        self.agentId = $routeParams.agentId;
        self.getAgent = function(){
            ApiService.getAgentInfo(self.agentId).then(function(data){
                self.agent = data;
                self.getCog();
            });
        };
        self.getCog = function(){
            ApiService.getCogInfo(self.agent.common_owner_groupid).then(function(data){
                self.cog = data;
            });
        };
        self.getContracts = function(){
            ApiService.getContracts(self.agentId).then(function(data){
                console.log(data);
                self.contracts = data;
            });
        };
        self.checkCookies = function(){
            var cookie = $cookies.get('authID');
            if(!cookie){
                $location.path('/epay/login');
            }
        };
        self.checkCookies();
        self.getAgent();
        self.getContracts();
    });