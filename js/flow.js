angular.module("FlowUpload",['flow'])
    .config(['flowFactoryProvider',function(flowFactoryProvider){
        flowFactoryProvider.defaults = {
            target:'/API/ng_flowFileUpload/upload.php',
            permanentErrors:[404,500,501],
            maxChunkRetries: 5,
            chunkRetryInterval: 5000,
            simultaneousUploads: 10
        };
        flowFactoryProvider.on('catchAll',function(event){
            console.log(event);
        });
    }])
    .controller('flowController',function(){
        var self = this;
        self.proof = 'Pudding';
        self.files = new Flow();
        self.addFile = function(file){
            self.files.files.push(file);
        };
        self.removeFile = function(id){
            self.files.files.splice(id,1);
        };
    });
