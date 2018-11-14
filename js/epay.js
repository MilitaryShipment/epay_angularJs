(function(){
    var app = angular.module('Epay',['ApiService','FlowUpload','toastr','ngCookies'])
        .controller('LoginController',function(ApiService,$cookies,$location){
            var self = this;
            self.errorMsg = '';
            self.login = function(){
                ApiService.authenticateEpayUser(self.username,self.password,self.agentId).then(function(data){
                    console.log(data);
                    if(data.id && self.agentId === data.agent_number){
                        var expireDate = new Date();
                        expireDate.setDate(expireDate.getDate() + 10000);
                        $cookies.put('authID',data.id,{'expires':expireDate});
                        var locale = '/' + data.agent_number + '/paperwork';
                        $location.path(locale);
                    }else{
                        self.errorMsg = 'Bad Credentials....Please try again';
                    }
                });
            };
        })
        .controller('RemittanceController',function(ApiService,$routeParams){
            var self = this;
            self.agentId = $routeParams.agentId;
            self.gbl = $routeParams.gbl;
            self.getAgentInfo = function(){
                ApiService.getAgentInfo(self.agentId).then(function(data){
                    self.agent = data;
                    console.log(self.agent);
                });
            }
            self.getRemittance = function(){
                ApiService.getRemittance(self.agentId,self.gbl).then(function(data){
                    console.log(data);
                    self.remittance = data;
                });
            };
            self.getAgentInfo();
            self.getRemittance();
        })
        .controller('ShipmentController',function(ApiService,$routeParams,$cookies,$location){
            var self = this;
            self.agentId = $routeParams.agentId;
            self.checkCookies = function(){
                var cookie = $cookies.get('authID');
                if(!cookie){
                    $location.path('/login');
                }
            };
            self.getAgentInfo = function(){
                ApiService.getAgentInfo(self.agentId).then(function(data){
                    self.agent = data;
                });
            };
            self.getShipments = function(){
                ApiService.getShipments(self.agentId,"active").then(function(data){
                    self.shipments = data;
                    console.log(self.shipments);
                    for(var i = 0; i < self.shipments.length; i++){
                        self.shipments[i].pickup_date = Date.parse(self.shipments[i].pickup_date);
                    }
                });
            };
            self.checkCookies();
            self.getAgentInfo();
            self.getShipments();
        })
        .controller('PpwkController',function(ApiService,$routeParams,$cookies,$location,toastr){
            var self = this;
            self.agentId = $routeParams.agentId;
            self.checkCookies = function(){
                var cookie = $cookies.get('authID');
                if(!cookie){
                    $location.path('/login');
                }
            };
            self.getAgentInfo = function(){
                ApiService.getAgentInfo(self.agentId).then(function(data){
                    self.agent = data;
                });
            };
            self.getPendingPpwk = function(){
                ApiService.getPendingPpwk(self.agentId).then(function(data){
                    console.log(data);
                    self.ppwk = data;
                    for(var i = 0; i < self.ppwk.length; i++){
                        self.ppwk[i].missing_items = self.docsToArray(self.ppwk[i].missing_items);
                    }
                    console.log(self.ppwk);
                });
            };
            self.buildFileName = function(file,docType,gbl){
                console.log(file);
                // file.name = gbl + "_" + docType + ".pdf";
                file.name = gbl + "_" + docType + "_" + self.agentId + ".pdf";
            };
            self.removeFile = function(file,docType,ppwkObj){
                toastr.success(file.msg);
                for(var i = 0; i < ppwkObj.flow.files.length;i++){
                    if(ppwkObj.flow.files[i].uniqueIdentifier === file.uniqueIdentifier){
                        ppwkObj.flow.files.splice(i,1);
                    }
                }
                for(i = 0; i < self.ppwk.length; i++){
                    if(self.ppwk[i].gbl === ppwkObj.gbl){
                        for(var j = 0; j < self.ppwk[i].missing_items.length;j++){
                            if(self.ppwk[i].missing_items[j] === docType){
                                self.ppwk[i].missing_items.splice(j,1);
                            }
                        }
                    }
                }
            };
            self.docsToArray = function(docStr){
                var str = docStr.trim();
                return str.split(' ');
            };
            self.checkCookies();
            self.getAgentInfo();
            self.getPendingPpwk();
        })
        .controller('ClaimsController',function(ApiService,$routeParams,$cookies,$location){
            var self = this;
            self.loading = false;
            self.agentId = $routeParams.agentId;
            self.option = $routeParams.option;
            self.inspectGbl = null;
            self.checkCookies = function(){
                var cookie = $cookies.get('authID');
                if(!cookie){
                    $location.path('/login');
                }
            };
            self.getAgentInfo = function(){
                ApiService.getAgentInfo(self.agentId).then(function(data){
                    self.agent = data;
                });
            };
            self.getClaims = function(){
                self.loading = true;
                ApiService.getClaims(self.agentId,self.option).then(function(data){
                    console.log(data);
                    self.loading = false;
                    self.claims = data;
                });
            };
            self.getDocs = function(gbl){
                self.inspectGbl = gbl;
                ApiService.getClaimDocs(self.agentId,gbl).then(function(data){
                    self.docs = data;
                    console.log(data);
                });
            };
            self.checkCookies();
            self.getAgentInfo();
            self.getClaims();
        })
        .controller('BlackOutController',function(ApiService,$routeParams,$location,$cookies){
            var self = this;
            self.agentId = $routeParams.agentId;
            self.newBlackout = {};
            self.checkCookies = function(){
                var cookie = $cookies.get('authID');
                if(!cookie){
                    $location.path('/login');
                }
            };
            self.getAgentInfo = function(){
                ApiService.getAgentInfo(self.agentId).then(function(data){
                    self.agent = data;
                });
            };
            self.getBlackOuts = function(){
                ApiService.getBlackouts(self.agentId,"all").then(function(data){
                    self.blackouts = data;
                    for(var i = 0; i < self.blackouts.length;i++){
                        self.blackouts[i].blackout_end_date = Date.parse(self.blackouts[i].blackout_end_date);
                        self.blackouts[i].blackout_start_date = Date.parse(self.blackouts[i].blackout_start_date);
                    }
                });
            };
            self.buildGblocList = function(){
                ApiService.getGblocList().then(function(data){
                    self.gblocs = data;
                });
            };
            self.buildAreaList = function(){
                ApiService.getAreaList(self.newBlackout.gbloc).then(function(data){
                    console.log(data);
                    self.areas = data;
                });
            };
            self.buildTypes = function(){
                ApiService.getBlackOutTypes().then(function(data){
                    self.types = data;
                });
            }
            self.getBaseName = function(){
                ApiService.getBaseName(self.newBlackout.gbloc,self.newBlackout.area).then(function(data){
                    self.newBlackout.base_name = data;
                });
            };
            self.addBlackout = function(){
                self.getBaseName();
                var blackout = self.newBlackout;
                var startDate = self.newBlackout.blackout_start_date;
                var endDate = self.newBlackout.blackout_end_date;
                blackout.blackout_start_date = Date.parse(startDate)/1000;
                blackout.blackout_end_date = Date.parse(endDate)/1000;
                self.newBlackout = {};
                ApiService.addBlackout(self.agentId,blackout).then(function(data){
                    console.log(data);
                    data.blackout_end_date = Date.parse(data.blackout_end_date);
                    data.blackout_start_date = Date.parse(data.blackout_start_date);
                    self.blackouts.push(data);
                });
            };
            self.checkCookies();
            self.getAgentInfo();
            self.getBlackOuts();
        })
        .controller('WebUserConroller',function(ApiService,$routeParams,$cookies,$location){
            var self = this;
            self.agentId = $routeParams.agentId;
            self.newUser = {};
            self.editUser = {};
            self.checkCookies = function(){
                var cookie = $cookies.get('authID');
                if(!cookie){
                    $location.path('/login');
                }
            };
            self.getAgentInfo = function(){
                ApiService.getAgentInfo(self.agentId).then(function(data){
                    self.agent = data;
                    self.newUser.company_name = self.agent.agent_name;
                    self.newUser.agent_number = self.agent.agentid_number;
                });
            };
            self.getWebUsers = function(){
                ApiService.getWebUsers(self.agentId).then(function(data){
                    console.log(data);
                    self.users = data;
                });
            };
            self.addUser = function(){
                ApiService.addWebUser(self.newUser).then(function(data){
                    console.log(data);
                    self.newUser = {};
                    self.newUser.company_name = self.agent.agent_name;
                    self.newUser.agent_number = self.agent.agentid_number;
                });
            };
            self.updateUser = function(){
                ApiService.updateWebUser(self.editUser).then(function(data){
                    console.log(data);
                });
            }
            self.checkCookies();
            self.getAgentInfo();
            self.getWebUsers();
        })
})();
