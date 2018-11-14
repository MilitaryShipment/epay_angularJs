var app = angular.module('Paperwork',['ApiService','FlowUpload','toastr','ngCookies'])
    .controller('uploadController',function(ApiService,$routeParams,$cookies,$location,toastr){
        var self = this;
        self.agentId = $routeParams.agentId;
        self.gbl = $routeParams.gbl;
        self.validGbl = false;
        self.getAgentPpwk = function(){
            ApiService.getPendingPpwk(self.agentId).then(function(data){
                if(data['error']){
                    swal({
                        title:'Uh oh!',
                        text:"Your request is malformed.\nPlease log in and try again.",
                        type:'error',
                    });
                    $location.path('/epay/login');
                    return;
                }
                self.agentPpwk = data;
                self.getAgent();
                for(var i = 0; i < self.agentPpwk.length; i++){
                    if(self.agentPpwk[i].gbl === self.gbl){
                        self.validGbl = true;
                        self.getShipmentPpwk();
                        break;
                    }
                }
                ApiService.getShipment(self.gbl).then(function(data){
                    if(data.dest_agent_id === self.agentId){
                        self.validGbl = true;
                        ApiService.getPendingDaPpwk(self.gbl).then(function(data){
                            if(data.length){
                                self.ppwk = {gbl:self.gbl};
                                self.ppwk.missing_items = data;
                            }
                        });
                    }else{
                        self.validGbl = false;
                    }
                    if(!self.validGbl){
                        swal("Uh oh!\nYou are not responsible for any paperwork on\n" + self.gbl);
                        var path = '/epay/' + self.agentId + '/paperwork';
                        $location.path(path);
                    }
                });
            });
        };
        self.getShipment = function(){
            ApiService.getShipment(self.gbl).then(function(data){
                if(data.dest_agent_id === self.agentId){}
            });
        }
        self.getShipmentPpwk = function(){
            ApiService.getPendingPaperwork(self.gbl).then(function(data){
                console.log(data);
                if(data['error']){
                    swal('Uh oh!\nThere was an unexpected error!');
                    var path = '/epay/' + self.agentId + '/paperwork';
                    $location.path(path);
                }
                self.ppwk = data[0];
                self.ppwk.missing_items = self.docsToArray(self.ppwk.missing_items);
            });
        };
        self.docsToArray = function(docStr){
            var str = docStr.trim();
            return str.split(' ');
        };
        self.buildFileName = function(file,docType,gbl){
            console.log(file);
            file.name = gbl + "_" + docType + "_" + self.agentId + ".pdf";
        };
        self.removeFile = function(file,docType,ppwkObj){
            toastr.success(file.msg);
            for(var i = 0; i < ppwkObj.flow.files.length;i++){
                if(ppwkObj.flow.files[i].uniqueIdentifier === file.uniqueIdentifier){
                    ppwkObj.flow.files.splice(i,1);
                }
            }
            var index = self.ppwk.missing_items.indexOf(docType);
            self.ppwk.missing_items.splice(index,1);
        };
        self.getAgent = function(){
            ApiService.getAgentInfo(self.agentId).then(function(data){
                self.agent = data;
            });
        };
        self.getAgentPpwk();
    });