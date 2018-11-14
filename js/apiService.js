(function(){
    const BASEURL = 'http://api.militaryshipment.com/';
    var app = angular.module('ApiService',[])
        .factory('ApiService',function($http){
            return {
                getAgentInfo:function(agentId){
                    var url = BASEURL + "agents/get/" + agentId;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getCogInfo:function(cogId){
                    var url = BASEURL + 'cog/get/' + cogId;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getShipments:function(agentId,option){
                    var url = BASEURL + "agents/get/" + agentId + "/shipments/" + option;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getEpayImages:function(agentId,option){
                    var url = BASEURL + "agents/get/" + agentId + '/epayImages/' + option;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getRemittance:function(agentId,gbl){
                    var url = BASEURL + "agents/get/" + agentId + "/remittance/" + gbl;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return response.data;
                    });
                },
                getPendingPpwk:function(agentId){
                    var url = BASEURL + "agents/get/" + agentId + "/paperwork/";
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getClaims:function(agentId,option){
                    var url = BASEURL + "agents/get/" + agentId + "/claims/" + option;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getClaimDocs:function(agentId,gbl){
                    var url = BASEURL + "agents/get/" + agentId + "/docs/" + gbl;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getBlackouts:function(agentId,option){
                    var url = BASEURL + "agents/get/" + agentId + "/blackouts/" + option;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getWebUsers:function(agentId){
                    var url = BASEURL + "agents/get/" + agentId + "/users/";
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getContracts:function(agentId){
                    var url = BASEURL + 'agents/get/' + agentId + '/contracts';
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                addBlackout:function(agentId,blackout){
                    var url = BASEURL + "agents/add/" + agentId + "/blackout/";
                    return $http.post(url,blackout).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getGblocList:function(){
                    var url = BASEURL + "util/get/gblocs";
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getAreaList:function(gbloc){
                    var url = BASEURL + "util/get/areas/" + gbloc;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getBlackOutTypes:function(){
                    var url = BASEURL + "util/get/type_blackout/";
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getBaseName:function(gbloc,area){
                    var url = BASEURL + "util/get/basename/" + gbloc + "/" + area;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                authenticateEpayUser:function(username,password,agentId){
                    var url = BASEURL + "auth/authenticate/epay";
                    return $http.post(url,{username:username,password:password,agentId:agentId}).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                authenticateEmployee:function(username,password){
                    var url = BASEURL + 'auth/authenticate/employee';
                    return $http.post(url,{username:username,password:password}).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getShipment:function(gbl){
                    var url = BASEURL + 'shipments/get/' + gbl;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getAchInfo:function(vendorId){
                    var url = BASEURL + 'vendors/get/' + vendorId + '/ach';
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getInvoiceLineItemCodes:function(){
                    var url = BASEURL + 'util/get/invoiceCodes';
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getVendorData:function(vendorId){
                    var url = BASEURL + 'vendors/get/' + vendorId;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                createInvoiceLineItem:function(fields){
                    var url = BASEURL + 'invoice/create/';
                    return $http.post(url,fields).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getInvoiceLineItems:function(gbl,agentId){
                    var url = BASEURL + 'invoice/get/' + gbl + '/' + agentId;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                buildInvoicePdf:function(gbl,agentId){
                    var url = BASEURL + 'invoice/get/pdf/' + gbl + '/' + agentId;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                previewInvoicePdf:function(gbl,agentId){
                    var url = BASEURL + 'invoice/get/preview/' + gbl + '/' + agentId;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                deleteInvoice:function(gbl,agentId){
                    var url = BASEURL + 'invoice/delete';
                    return $http.post(url,{gbl_dps:gbl,agent_id:agentId}).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                updateAchInfo:function(vendorId,accountNum,routingNum){
                    var url = BASEURL + 'util/put/ACH';
                    var fields = {vendorId:vendorId,accountNum:accountNum,routingNum:routingNum};
                    return $http.post(url,fields).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },getPendingShipPpwk:function(gbl){
                    var url = BASEURL + 'shipments/get/' + gbl + '/pendingPpwk';
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getPendingDaPpwk:function(gbl){
                    var url = BASEURL + 'shipments/get/' + gbl + '/daPpwk';
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                invoiceExists:function(gbl,role){
                    var url = BASEURL + 'invoice/exists/' + gbl + '/' + role;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                addWebUser:function(user){
                    var url = BASEURL + 'auth/add/';
                    return $http.post(url,user).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                updateWebUser:function(user){
                    var url = BASEURL + 'auth/update/';
                    return $http.post(url,user).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                getPendingPaperwork:function(gbl){
                    var url = BASEURL + 'shipments/get/' + gbl + '/pendingPpwk';
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                isPaperworkPending:function(gbl){
                    var url = BASEURL + 'util/get/isUploadPending/' + gbl;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                },
                finalizeInvoice:function(gbl,agentId){
                    var url = BASEURL + 'invoice/update/' + gbl + '/' + agentId;
                    return $http.get(url).then(function(response){
                        return response.data;
                    },function(err){
                        return err;
                    });
                }
            };
        });
})();
