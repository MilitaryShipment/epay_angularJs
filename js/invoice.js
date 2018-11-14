var app = angular.module('Invoicing',['ApiService','Ach','autocomplete','toastr','ui.select','ngSanitize'])
    .controller('InvoiceController',function($routeParams,ApiService,AchService,$q,$location,$timeout,toastr,PreviewService,$window,NotificationService,$scope,$sce){
      $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
      }
        var self = this;
        self.agentId = $routeParams.agentId;
        self.gbl = $routeParams.gbl;
        self.roles = [];
        self.lineItems = [];
        self.lineItemCodes = [];
        self.lineItemDescriptions = [];
        self.previewUrl = null;
        self.achInfo = null;
        self.paymentSpeeds = [
            'Fast Pay 2% - 10 Days',
            'Fast Pay 3% - 5 Days',
            'Fast Pay 5% - Next Business Day',
            'Net 30'
        ];
        self.discounts = [
            '301A',
            '301B',
            '301C',
            '301D',
            '301E',
            '301F',
            '301G'
        ];
        self.saved = false;
        self.preferredSpeed = self.paymentSpeeds[3];
        self.invoiceExists = function(role){
            return new Promise(function(resolve, reject){
                ApiService.invoiceExists(self.gbl,role).then(function(data){
                    if(data){
                        resolve(role);
                    }else{
                        reject(role);
                    }
                });
            });
        };
        self.overFlowExists = function(gbl){
            return new Promise(function(resolve,reject){
                ApiService.getShipment(gbl).then(function(data){
                    if(data['error']){
                        reject(data['error']);
                    }else{
                        resolve(data);
                    }
                });
            });
        };
        self.getShipment = function(){
            self.getAgent();
            ApiService.getShipment(self.gbl).then(function(data){
                if(data['error']){
                    swal("Uh oh!\nWe have no record of\n" + self.gbl);
                    var path = '/epay/' + self.agentId + '/shipments';
                    $location.path(path);
                }
                self.shipment = data;
                self.shipment.pickup_date = new Date(self.shipment.pickup_date);
                self.parseRoles2();
                if(!self.roles.length){
                    for(var i = 0; i < 5; i++){
                        var oldGbl = self.gbl;
                        var testGbl = self.gbl + (i+10).toString(36);
                        self.overFlowExists(testGbl).then(function(data){
                            self.shipment = data;
                            self.gbl = self.shipment.gbl_dps;
                            self.parseRoles2();
                            if(!self.roles.length){
                                swal("Uh oh!\nWe have no record of your association with\n" + oldGbl);
                                var path = '/' + self.agentId + '/shipments';
                                $location.path(path);
                            }
                        },function(err){});
                    }
                }
                if(isExpired(self.shipment)){
                    var path = '/' + self.agentId + '/snooze';
                    $location.path(path);
                }
                ApiService.getPendingShipPpwk(self.gbl).then(function(data){
                    if(data.length){
                        ApiService.isPaperworkPending(self.gbl).then(function(data){
                            if(data === 'missing'){
                                swal("Uh oh!\nPlease upload the required support documents for \n" + self.gbl + "\nbefore you invocie.");
                                var path = '/' + self.agentId + '/upload/' + self.gbl;
                                $location.path(path);
                            }
                        });
                    }
                    ApiService.getInvoiceLineItems(self.gbl,self.agentId).then(function(data){
                        if(data.length){
                            self.deleteInvoice();
                            for(var i = 0; i < data.length; i++){
                                data[i].payment_amount = parseFloat(data[i].payment_amount);
                                data[i].line_item_description = {description:data[i].line_item_description,group:''};
                            }
                            self.lineItems = data;
                            self.docId = self.lineItems[0].client_doc_id;
                            self.custId = self.lineItems[0].client_cust_num;
                        }
                        console.log(self.lineItems);
                    });
                });
                self.verifyDaPpwk();
                self.getCodes();
                self.cleanName();
            });
        };
        self.parseRoles2 = function(){
            self.availableRoles = identifyRoles(self.agentId,self.shipment);
            self.roles = self.availableRoles.slice();
        };
        self.parseRoles = function(){
            self.availableRoles = identifyRoles(self.agentId,self.shipment);
            self.roles = self.availableRoles.slice();
            console.log(self.availableRoles);
            console.log(self.roles);
            for(var i = 0; i < self.availableRoles.length; i++){
                self.invoiceExists(self.availableRoles[i]).then(function(data){
                    var index = self.availableRoles.indexOf(data);
                    self.availableRoles.splice(index,1);
                    if(!self.availableRoles.length){
                        swal('This Invoice has already been created. No Updating No Editing Allowed.');
                        var path = '/' + self.agentId + '/shipments';
                        $location.path(path);
                    }
                }).catch(function(err){ console.log(err); });
            }
        };
        self.getAgent = function(){
            ApiService.getAgentInfo(self.agentId).then(function(data){
                if(data['error']){
                    var path = '/login';
                    $location.path(path);
                }
                self.agent = data;
                // ApiService.getVendorData(self.agent.vendorid_number).then(function(data){
                //     if(data['error']){
                //         NotificationService.InvalidVendorId(self.agent.vendorid_number,self.agent.agentid_number).then(function(data){
                //             console.log(data);
                //             var path = '/epay/' + self.agent.agentid_number + '/shipments';
                //             swal('An Internal error has occurred. Please try again later.');
                //             $location.path(path);
                //         });
                //     }
                // });
                self.getAchInfo();
            });
        };
        self.getAchInfo = function(){
            ApiService.getAchInfo(self.agent.vendorid_number).then(function(data){
                self.achInfo = data;
                if(!self.achInfo){
                    AchService.vendorId = self.agent.vendorid_number;
                    $("#achModal").modal({keyboard:false,backdrop:'static'});
                }
            });
        };
        self.getCodes = function(){
            ApiService.getInvoiceLineItemCodes().then(function(data){
                self.lineItemPool = data;
                for(var i = 0; i < data.length; i++){
                    if(data[i].type === 'ALL'){
                        self.lineItemDescriptions.push({description:data[i].agent_description,group:''});
                        self.lineItemCodes.push(data[i].code);
                    }else if(self.roles.indexOf(data[i].type) !== -1){
                        if(!search('description',data[i].agent_description,self.lineItemDescriptions)){
                            self.lineItemDescriptions.push({description:data[i].agent_description,group:''});
                            self.lineItemCodes.push(data[i].code);
                        }
                    }
                }
                self.lineItemDescriptions.push({description:'Misc charge or credit',group:'IF NOT NOTED ABOVE, ENTER USING MISC'});
                if(!self.lineItems.length){
                    self.lineItems.push({line_item_code:'',line_item_quantity:1});
                }
                console.log(self.lineItemDescriptions);
            });
        }
        self.addItem = function(){
            self.lineItems.unshift({line_item_code:'',line_item_quantity:1});
        };
        self.removeItem = function(index){
            self.lineItems.splice(index,1);
        };
        self.appendRole = function(role){
            var index = self.roles.indexOf(role);
            if(index == -1){
                self.roles.push(role);
            }else{
                self.roles.splice(index,1);
            }
            self.lineItemCodes = [];
            self.lineItemDescriptions = [];
            self.getCodes();
        }
        self.verifyCodeUse = function(){
            for(var i = 0; i < self.lineItemCodes.length;i++){
                var uses = 0;
                for(var j = 0; j < self.lineItems.length;j++){
                    if(self.lineItems[j].code === self.lineItemCodes[i].code){
                        uses++;
                        if(uses > 1){
                            self.lineItems[j].error = true;
                        }else{
                            self.lineItems[j].error = false;
                        }
                    }
                }
            }
        };
        self.save = function(final){
            var promises = [];
            for(var i = 0; i < self.lineItems.length;i++){
                var lineItem = {
                    client_doc_id:self.docId,
                    agent_id:self.agentId,
                    preferred_payment_speed:self.preferredSpeed,
                    line_item_no: i + 1,
                    gbl_dps:self.gbl,
                    client_cust_num:self.custId,
                    vendorId:self.agent.vendorid_number,
                    line_item_description:self.lineItems[i].line_item_description.description,
                    payment_amount:self.lineItems[i].payment_amount,
                    line_item_quantity:1
                };
                var index = self.lineItemDescriptions.map(function(e){return e.description}).indexOf(lineItem.line_item_description);
                console.log(index);
                if(index >= self.lineItemCodes.length || index === -1){
                    lineItem.line_item_code = 'XX99';
                }else{
                    lineItem.line_item_code = self.lineItemCodes[index];
                }
                var discIndex = self.discounts.indexOf(lineItem.line_item_code);
                if(discIndex !== -1){
                    lineItem.payment_amount = -Math.abs(self.lineItems[i].payment_amount)
                }
                for(var j = 0; j < self.roles.length;j++){
                    if(self.roles[j] === 'Origin Agent'){
                        lineItem.OA = 1;
                    }
                    if(self.roles[j] === 'Destination Agent'){
                        lineItem.DA = 1;
                    }
                    if(self.roles[j] === 'Hauling Agent'){
                        lineItem.HA = 1;
                    }
                }
                var promise = ApiService.createInvoiceLineItem(lineItem);
                promises.push(promise);
            }
            $q.all(promises).then(function(data){
                console.log(data);
                if(final){
                    self.saved = true;
                    toastr.success('Your invoice has been Saved and is awaiting review!','Congrats!');
                    ApiService.finalizeInvoice(self.gbl,self.agentId).then(function(data){
                        // console.log(data);
                        var base = 'http://epay.militaryshipment.com';
                        PreviewService.previewUrl = base + data.webPath;
                        var path = '/preview/' + self.agentId + '/' + self.gbl;
                        $location.path(path);
                        // window.location.href = base + data.webPath;
                    });
                }
            });
        };
        self.viewPdf = function(){
            self.save(false);
            self.previewUrl = null;
            $timeout(function(){
                ApiService.previewInvoicePdf(self.gbl,self.agentId).then(function(data){
                    var base = 'http://epay.militaryshipment.com';
                    self.previewUrl = base + data;
                });
            },1000);
        };
        self.deleteInvoice = function(){
            ApiService.deleteInvoice(self.gbl,self.agentId).then(function(data){
                console.log(data);
            });
        };
        self.cleanName = function(){
            var name = self.shipment.full_name;
            res = name.split(',');
            res[1] = res[1].toLowerCase().replace(/\b[a-z]/g, function(letter) {
                return letter.toUpperCase();
            });
            self.displayName = res[0] + ', ' + res[1];
        };
        self.verifyDaPpwk = function(){
            if(self.roles.indexOf('Destination Agent') > -1){
                ApiService.getPendingDaPpwk(self.gbl).then(function(data){
                    if(data.length){
                        swal("Uh oh!\nPlease upload the required support documents for \n" + self.gbl + "\nbefore you invocie.");
                        var path = '/epay/' + self.agentId + '/upload/' + self.gbl;
                        $location.path(path);
                    }
                });
            }
        };
        self.addMisc = function(update,index){
            self.lineItems[index].line_item_description.description = update;
            self.lineItemDescriptions.push({description:'Misc charge or credit',group:'IF NOT NOTED ABOVE, ENTER USING MISC'});
        };
        self.getShipment();
    });

app.controller('SnoozeController',function($routeParams,ApiService){
    var self = this;
    self.agentId = $routeParams.agentId;
    self.getAgent = function(){
        ApiService.getAgentInfo(self.agentId).then(function(data){
            console.log(data);
            self.agent = data;
        });
    };
    self.getAgent();
});

app.controller('PreviewController',function($routeParams,ApiService,PreviewService,$location){
    var self = this;
    self.agentId = $routeParams.agentId;
    self.gbl = $routeParams.gbl;
    self.thisUrl = '/invoice/' + self.agentId + '/' + self.gbl;
    self.getUrl = function(){
        self.pdfUrl = PreviewService.previewUrl;
        console.log(PreviewService.previewUrl);
    };
    self.goBack = function(){
        $location.path('/invoice/' + self.agentId + '/' + self.gbl);
    }
    self.getAgent = function(){
        ApiService.getAgentInfo(self.agentId).then(function(data){
            if(data['error']){
                var path = '/epay/login';
                $location.path(path);
            }
            self.agent = data;
        });
    }
    self.getUrl();
    self.getAgent();
});

app.factory('PreviewService',function(){
    return {
        previewUrl:'',
    };
});

app.factory('NotificationService',function($http){
    return {
        InvalidVendorId:function(vendorId,agentId){
            var url = '/tasks/notify.php?msg=InvalidVendor&id=' + vendorId + '&agent=' + agentId;
            return $http.get(url).then(function(response){
                return response.data;
            },function(err){
                return err;
            });
        }
    }
});



function identifyRoles(agentId,shipmentObj){
    var roleKeys = ['orig_agent_id','dest_agent_id','hauler_agent_id','hauler_carrier_id'];
    var roleValues = ['Origin Agent', 'Destination Agent', 'Hauling Agent','Hauling Carrier'];
    var roles = [];
    for(var i = 0; i < roleKeys.length; i++){
        if(shipmentObj[roleKeys[i]] === agentId){
            roles.push(roleValues[i]);
        }
    }
    return roles;
}
function isExpired(shipmentObj){
    var nullStr = '1900-01-01 00:00:00.0000000';
    var warehouse = shipmentObj.delivery_warehouse_date;
    var residence = shipmentObj.delivery_residence_date;
    var rdd = new Date(shipmentObj.required_delivery_date);
    var now = new Date();
    if((residence !== nullStr) && (residence !== null) && ((now - rdd) / (1000 * 3600 * 24 * 365) > 1)){
        return true;
    }
    return false;
}
function search(key,value,array){
    var success = false;
    for(var i = 0; i < array.length; i++){
        if(array[i][key] === value){
            return true;
        }
    }
    return false;
}



/*        self.getShipment = function(){
 ApiService.getShipment(self.gbl).then(function(data){
 if(data['error']){
 swal("Uh oh!\nWe have no record of\n" + self.gbl);
 var path = '/epay/' + self.agentId + '/shipments';
 $location.path(path);
 }
 self.shipment = data;
 if(isExpired(self.shipment)){
 var path = '/' + self.agentId + '/snooze';
 $location.path(path);
 }
 ApiService.getPendingShipPpwk(self.gbl).then(function(data){
 if(data.length){
 ApiService.isPaperworkPending(self.gbl).then(function(data){
 console.log(data);
 if(data === 'missing'){
 swal("Uh oh!\nPlease upload the required support documents for \n" + self.gbl + "\nbefore you invocie.");
 var path = '/epay/' + self.agentId + '/upload/' + self.gbl;
 $location.path(path);
 }
 });
 }
 });
 self.availableRoles = identifyRoles(self.agentId,self.shipment);
 self.roles = self.availableRoles.slice();
 for(var i = 0; i < self.availableRoles.length; i++){
 self.invoiceExists(self.availableRoles[i]).then(function(data){
 var index = self.availableRoles.indexOf(data);
 self.availableRoles.splice(index,1);
 if(!self.availableRoles.length){
 swal('This Invoice has already been created. No Updating No Editing Allowed.');
 var path = '/epay/' + self.agentId + '/shipments';
 $location.path(path);
 }
 },function(data){});//invoice does not exist
 }
 self.getAgent();
 self.getCodes();
 });
 };
*
* */
