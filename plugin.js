/**
 * Plugin SampleIn Controller
 */
plugin.controller('sampleinCntl', ['$scope', '$window', 'znData', '$routeParams', 'znModal','$templateCache', '$timeout', 'sampleinCompanySvc', 'sampleinDataShare','$location',
        function ($scope, $window, znData, $routeParams, znModal,$templateCache, $timeout, sampleinCompanySvc, sampleinDataShare, $location) {
    // Current Workspace ID from Route


// ------------------------------------------------------ Setup items -------------------------------------------------------------------------------------    

    var mparms = { workspaceId:3482,formId: 9302, limit: 500};
        znData('FormRecords').get(mparms, function (records) {
                $scope.materials = records;
                
                });


    $scope.workspaceId = null;
    $scope.CompanySet="false";
    $scope.ContactSet="false";
    $scope.LocationSet="false";
    $scope.orderByField = 'date';
    $scope.reverseSort = false;
    
    $scope.varC = "contact";
    $scope.varL = "location";
    $scope.contactlookup = {};
    $scope.locationlookup = {};
    $scope.companySamplein = [];
    
    $scope.showNewSampleInForm = 'false';
    $scope.showSamplein = 'true';
    $scope.showCompanyInfo = 'false';
    $scope.showNewSampleInForm = 'false';
    $scope.showNewSampleInItem = 'false';
    $scope.showCompanyEdit = 'false';
    $scope.showDashboard = true;
    
    $scope.SampleInCnt = 0;
    $scope.SampleInItems = [];
    $scope.SampleInItem = {};
    $scope.newSampleIn = {};
    var  itemsArry = [];
    
    $scope.todaysDate = function() {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!

            var yyyy = today.getFullYear();
            if(dd<10){
                dd='0'+dd;
            }
            if(mm<10){
                mm='0'+mm;
            }
            today = mm+'/'+dd+'/'+yyyy;
            return today;
        };

        // reset SampleInItem
        $scope.initializeCleanSampleIn = function (option) {
            if (option === 'set') {
                $scope.newSampleIn = {
                    date : $scope.todaysDate ,
                    number: '',
                    selectedContact: '',
                    selectedLocation: '',
                    term: '',
                    shipmonth: '',
                    shipyear: '',
                    shipvia: '',
                    FOB: '',

                    comments: ''
                };
                $scope.SampleInItems = [];
                $scope.freshNewSampleIn = angular.copy($scope.newSampleIn);
            }
            if (option === 'reset') {
                $scope.newSampleIn = angular.copy($scope.freshNewSampleIn);
                $scope.SampleInItems.splice(0,$scope.SampleInItems.length);
            }
        };
        
        $scope.initializeCleanSampleInItem = function (option) {
            if (option === 'set') {
                $scope.SampleInItem = {
                    itemNumber: '',
                    description: '',
                    mot: '',
                    lane: '',
                    carrier: '',
                    supplier: '',
                    colorCon: '',
                    colorConCost: '',
                    colorConLetDown: '',
                    colorSupplier: '',
                    repCost: '',
                    transportation:'',
                    packaging:'',
                    packagingCost: '',
                    packagingSupplier: '',
                    packagingType: '',
                    warehousing:'',
                    tollprocessing:'',
                    total:''
                };

                $scope.carriers = [];
                $scope.freshSampleInItem = angular.copy($scope.SampleInItem);
            }
            if (option === 'reset') {
                $scope.SampleInItem = angular.copy($scope.freshSampleInItem);
            }
        };
    
    $scope.initializeCleanSampleInItem('set');
    $scope.initializeCleanSampleIn('set');
    
   
    $scope.months = ["Jan","Feb","Mar","Apr","May", "Jun","Jul","Aug","Sep","Oct","Nov","Dec" ];
    $scope.shipviaoptions = ["OTR","IMDL","BT"];
   
    $scope.modeOfTransport = [  
     {name: 'OTR', value: 42000, desc: '42,000 lbs per truckload'},
     {name: 'IMDL', value: 40000, desc: '40,000 lbs per truckload' },
     {name: 'BT', value: 46000, desc: '46,000 lbs per truckload'}
    ];
    
    $scope.packagingTypes = [
        {name: 'Bulk Bag', value: 7, desc: "Bulk Bag - $7"},    
        {name: 'New Gaylord', value: 24, desc: "New Gaylord - $24"},    
        {name: 'Used Gaylord', value: 12, desc: "Used Gaylord- $12"}
    ];
    
    $scope.years = [];
    var tmpDate = new Date();
    var thisYear = tmpDate.getFullYear() - 1;
    for (var i = 1; i <= 10; i++) {$scope.years.push(thisYear + i);}
    $scope.terms = ["CIA","COD","NET 10","NET 30", "NET 45", "NET 60"];


    $scope.rows = ["1"];
    $scope.counter = 1;
    $scope.companyModel =[];
    
/** Get the Color and Packaging Suppliers    field71088: 'suppler' **/    

var getSuppliersLists = function () {
            var ccParams = { workspaceId:3482,formId: 7870,field71088: 'suppler'};
                znData('FormRecords').get(ccParams, function (records) {
                    //onsole.log("Getting Color Suppliers");
                    
                    ////onsole.log($scope.colorSuppliers);
                    var tempArrayColor = [];
                    var tempArrayPack = [];
                    for (var index in records)
                    {
                        ////onsole.log(records[index].name);
                        for (var i in records[index].field105650)
                        {
                           if (records[index].field105650[i] === "ColorConcentrate") {
                               //onsole.log(records[index].name + "Pushing on Array");
                               tempArrayColor.push(records[index]);
                               }
                           if (records[index].field105650[i] === "Packaging") {
                               //onsole.log(records[index].name + "Pushing on Array");
                               tempArrayPack.push(records[index]);
                               }
                        }
                    }
                    $scope.colorSuppliers = tempArrayColor;
                    $scope.packSuppliers = tempArrayPack;
                    });
            
};


getSuppliersLists();
    
    
    
    
// ------------------------------------------------------ Setup items ---------------------------------------------------------------------------    

    $scope.isCompanyAddress = function(billingAddress) {
        if (billingAddress === null) return false;
        return true;
    };

// ------------------------------------------------------ When Company is clicked from the side menu ---------------------------------------------
    $scope.setCompanyModel = function(companyIn) {
        ////onsole.log(companyIn);
        if (companyIn.id !== $scope.companyModel.id) {
            $scope.showCompanyInfo = "true";
            $scope.showNewSampleInForm = 'false';
            $scope.showNewSampleInForm = 'false';
            $scope.showNewSampleInItem = 'false';
            $scope.showCompanyEdit = 'false';
             $scope.showDashboard = false;

            $scope.initializeCleanSampleIn('reset');
            $scope.companySamplein = [];
            $scope.companyModel = angular.copy(companyIn);
         
/* Create the list of Contacts with the Selected Company. */
            var ContactParms = {workspaceId:3482,formId: 7872,field71141: $scope.companyModel.id};
            znData('FormRecords').query(ContactParms, function (results) {
                
                $scope.companyContacts = results;
                for (var i = 0, len = $scope.companyContacts.length; i < len; i++) {
                    $scope.contactlookup[$scope.companyContacts[i].id] = $scope.companyContacts[i];
                }
                
            });
        
            $scope.selectedContact = null;
            $scope.selectContact = function(row) {
                if ($scope.selectedContact === row) {
                    $scope.selectedContact = null;
                } else {
                    $scope.selectedContact = row;
                }
            };
    
/* Create the list of Locations with the Selected Company. */
            var locationParms = {workspaceId:3482, formId: 7878, field71200:$scope.companyModel.id };
            znData('FormRecords').query(locationParms, function (results) {
                $scope.companyLocations = results;
                for (var i = 0, len = $scope.companyLocations.length; i < len; i++) {
                    $scope.locationlookup[$scope.companyLocations[i].id] = $scope.companyLocations[i];
                }
            });
        
            $scope.selectedLocation = null;
            $scope.selectLocation = function(row) {
                if ($scope.selectedLocation === row) {
                    $scope.selectedLocation = null;
        
                } else {
                    $scope.selectedLocation = row;
                     
                }
            };
// Create a list of Samples In for this company 

            $scope.reFreshSamplesIn(companyIn.id);
   
        } // end of If check for same company clicked



    };  /* Close of set CompanyModel */

    $scope.reFreshSamplesIn = function (id) {
            $scope.companySamplesin = [];
             sampleinCompanySvc.childAdded(id,function(addedChild) {
                $timeout(function() {
                    $scope.companySamplesIn.push(addedChild);
                });
            });
            
            
    };
    
    $scope.isActive = function(companyIn){
        if (companyIn == $scope.companyModel.name) {return "active" }else {return ""}
    };

//-------------------------------------------Get a list of Company from the Companies Table ---------------------------------

    if ($routeParams.workspace_id) {
        // Set Selected Workspace ID
        $scope.workspaceId = $routeParams.workspace_id;
    }
 
    var companyParams = { workspaceId:3482,formId: 7870,field71088: 'customer'};
    znData('FormRecords').get(companyParams, function (records) {$scope.companies = records;});


//-----------------------------------------------------------------------------------------------------------------------------


   /* Setting the class on the selected row.. */
    $scope.getClassLocation = function(row,type) {
        if ($scope.selectedLocation === row) {
            return "background-color: #3a7297 !important; color: white;";
        } else {
            return "" ;
        }
    };

    $scope.getClassContact = function(row) {
        if ($scope.selectedContact === row) {
            return "background-color: #3A7297 !important; color: white;";
        } else {
            return "" ;
        }
    };



//------------------------------------- New SampleIn  ------------------------------------------------------------------

    $scope.genSampleInNumber = function () { 
    
        var SampleInNumber  = new Date();
        var dd = SampleInNumber.getDate();
        var mm = SampleInNumber.getMonth()+1;//January is 0!
        var yy = SampleInNumber.getFullYear();
        var hours = SampleInNumber.getHours();
        var minutes = SampleInNumber.getMinutes();
        var seconds = SampleInNumber.getSeconds();
            yy = yy.toString().substr(2,2);
        
        if(dd<10){
            dd='0'+dd;
        }
        if(mm<10){
            mm='0'+mm;
        }
            SampleInNumber  = 'MDT - ' + mm + dd + yy + ' - ' + hours + minutes + seconds;
        return SampleInNumber;
        
    };

    $scope.createCompanyNewSampleIn= function(currentCompany) {
        $scope.showCompanyInfo = 'false';
        $scope.showNewSampleInForm = 'true';
        $scope.newSampleIn.date = $scope.todaysDate();
        $scope.newSampleIn.number =  $scope.genSampleIneNumber();
    };
     
     
    $scope.newSampleinSave = function () {
         
        $scope.showNewSampleInForm = 'false';
        $scope.showCompanyInfo = 'true';
        $scope.newSampleIn.number = $scope.newSampleIn.number.replace(/\s+/g, '');
        $scope.newSampleIn.selectedContact  = angular.copy($scope.contactlookup[$scope.selectedContact]);
        $scope.newSampleIn.selectedLocation = angular.copy($scope.locationlookup[$scope.selectedLocation]);
        sampleinCompanySvc.childSave($scope.companyModel, $scope.newSampleIn, $scope.SampleInItems);
       
        setTimeout(function(){
                $scope.reFreshSamplesIn($scope.companyModel.id);
             },100); 
     };
     
    $scope.newSampleInCancel = function () {
         
        $scope.showNewSampleInForm = 'false';
        $scope.showCompanyInfo = 'true';
        $scope.initializeCleanSampleIn('reset');
    
         
     };
     
    $scope.deleteCompanySampleIn = function (item,row) {
            var companyId = $scope.companyModel.id + "/" + item;
        
           sampleinCompanySvc.childDelete(companyId);
             setTimeout(function(){
                $scope.reFreshSamplesIn($scope.companyModel.id);
             },100); 
            
        };
    
    $scope.editCompanySampleIn = function (item, row) { 
        
        sampleinCompanySvc.childlookup($scope.companyModel.id,item,function(addedChild) {
            $timeout(function() {
                    $scope.newSampleIn = addedChild;
                    $scope.selectedContact = $scope.newSampleIn.contact.id;
                    $scope.selectedLocation = $scope.newSampleIn.location.id;
                    $scope.SampleInItems = $scope.newSampleIn.SampleInItems;

                });
        });

        $scope.showCompanyInfo = 'false';
        $scope.showNewSampleInForm = 'true';
         
    };

    $scope.downloadCompanySampleIn = function (customerId,SampleInId){

            var firehostURL = "https://mdtechapp.firebaseapp.com/index.html#/samplein/" + customerId + "/" + SampleInId + "/";
            var myWindow = $window.open(firehostURL, "MsgWindow", "width=900, height=720", "true");
            myWindow.document.close();
            myWindow.focus();
    
        
        
    };
    


//------------------------------------- New SampleIn Item ----------------------------------------------------------------

    $scope.newSampleInItem = function () {
        $scope.showNewSampleInForm = 'false';
        $scope.showNewSampleInItem = 'true';
        $scope.SampleInItemEdit = false;
        $scope.SampleInItem  = angular.copy($scope.freshSampleInItem);
        $scope.carriers = angular.copy([]); 
    };

    $scope.newSampleInItemSave = function () { 
    
        $scope.showNewSampleInForm = 'true';
        $scope.showNewSampleInItem = 'false';
        
        var material = angular.copy($scope.newSampleIn.material);
        $scope.newSampleIn.material = angular.copy(material);
        
    
        if ($scope.SampleInItemEdit)
        {   
            $scope.SampleInItems[$scope.SampleInItemEditRow] = $scope.SampleInItem;
            $scope.SampleInItemEdit = false;
        }else {
            $scope.SampleInItems.push($scope.SampleInItem);
        }
        
        $scope.SampleInItem = angular.copy($scope.freshSampleInItem);
      
    };

    $scope.newSampleInItemCancel = function () { 
        $scope.showNewSampleInForm = 'true';
        $scope.showNewSampleInItem = 'false';
        $scope.SampleInItemCnt --;
     };

    $scope.deleteSampleInItem = function (item) {$scope.SampleInItems.splice(item,1);};
    
    
    $scope.editSampleInItem = function(item) {
        $scope.SampleInItem = angular.copy($scope.SampleInItems[item]);
        $scope.SampleInItemEdit = true;
        $scope.SampleInItemEditRow = item;
        $scope.showNewSampleInForm = 'false';
        $scope.showNewSampleInItem = 'true';
    };
  
    $scope.calculatePackaging = function () {
        
      var motValue  = Number($scope.SampleInItem.mot.value);
      var packCost =  Number($scope.SampleInItem.packagingCost);
      var packaging = packCost/motValue;
      
      $scope.SampleInItem.packaging = packaging.toFixed(5);
        
        
    };



    $scope.calculateColorCon = function () {

         
         var colorConCost = Number($scope.SampleInItem.colorConCost);
         var colorConLetDown = Number($scope.SampleInItem.colorConLetDown);
         var motValue  = Number($scope.SampleInItem.mot.value);
         
         if (colorConLetDown === null) {colorConLetDown = 0}
         if (colorConCost === null) {colorConCost = 0}
         
         var bottom = motValue * colorConLetDown;
         var colorCon = colorConCost/bottom;
         
         if (isNaN(colorCon)) { colorCon = 0 }
                  $scope.SampleInItem.colorCon =   colorCon.toFixed(5);
     };    
            


    $scope.getLanes = function() {
        //onsole.log("Getting Lanes");
       var params = { workspaceId:3482, formId: 10318, field91846: $scope.SampleInItem.mot.name, limit: 10000};
       znData('FormRecords').get(params, function (records) {$scope.frieghtOffers = records; });
    };

    $scope.getCarriers = function () {
            $scope.carriers = [];   
        var myarr = [];
        var formparams1 = { workspaceId:3482, formId: 10318, limit: 500};
            znData('FormFields').get(formparams1, function (records) {
                records.splice(0,3); 
                $scope.carriersBase = records;
                var tempObj ={};
                for (var index in records) {
                    tempObj = { 'id' : 'field' + records[index].id, 'name' : records[index].label} ;
                    myarr.push(tempObj);
                }
            var formparams2 = { workspaceId:3482, formId: 10318, id: $scope.SampleInItem.lane.id, limit: 10};
             znData('FormRecords').get(formparams2, function (records) {
             var tempObj ={};
             var tempfield = null;
             var tempval = null;
         
             for (var index in myarr) {
                 if (records[myarr[index].id])
                 {
                     tempfield = myarr[index].name;
                     tempval = records[myarr[index].id];
                     tempObj = { key:tempfield, value: tempval , unit: '$'};
                     $scope.carriers.push(tempObj);
                 } else {
                     
                  tempfield = myarr[index].name;
                  tempObj = { key:tempfield, value: 'Not Available', unit: '.'};
                  $scope.carriers.push(tempObj);   
                 }
             }
        });    
      });
    };
    
    $scope.calculateTransport = function () {
         var transportation = parseInt($scope.SampleInItem.carrier.value) / parseInt($scope.SampleInItem.mot.value);
         $scope.SampleInItem.transportation =   transportation.toFixed(5);
     };

    $scope.calculateTotal = function ()  { 
            var  supplier = Number($scope.SampleInItem.supplier);
            var  colorCon =  Number($scope.SampleInItem.colorCon);
            var  transportation =  Number($scope.SampleInItem.transportation);
            var  packaging =  Number($scope.SampleInItem.packaging);
            var  warehousing =  Number($scope.SampleInItem.warehousing);
            var  tollprocessing =  Number($scope.SampleInItem.tollprocessing);
            var  repCost  =  Number($scope.SampleInItem.repCost);            
            var  total =  supplier + colorCon + transportation + packaging + warehousing + tollprocessing + repCost;
        $scope.SampleInItem.total = total.toFixed(5);
    };
 
 
 
 /*   $scope.deleteFreight = function () {
      
       var formparams2 = { workspaceId:3482, formId: 10318, limit: 400};
             znData('FormRecords').get(formparams2, function (records) {
                 
                 for (var index in records) {
                 
                               var formparams3 = { workspaceId:3482, formId: 10318, id: records[index].id};
                    
                    znData('FormRecords').delete(formparams3, function () {
                        //onsole.log('Record : '+ records[index].id + '  removed from Freight Offers', 'saved');
                    });
                 
                 }
             });
  };
  
*/ 


    $scope.editCompanyInfo = function() {

        formId = 7870;
        recordId = $scope.companyModel.id;
        $location.search('record', formId + '.' + recordId);       
    
    };
    

    $scope.refreshCompanyData = function (companyIn) {
    
    var companyParams = { workspaceId:3482,formId: 7870,id: companyIn.id, field71088: 'customer'};
    znData('FormRecords').get(companyParams, function (record) {
            $scope.companyModel = record;
            });
    };
    
    
    $scope.editContactData = function(contactId) {
        formId = 7872;
        recordId = contactId;
        $location.search('record', formId + '.' + recordId);       
    };
    
    $scope.crContactData = function() {
        console.log("enter");
       formId = 7872;
       $location.search('record', formId + '.add'); 
       console.log("exit");
    };
    
    $scope.refreshContactData = function() {
/* Create the list of Contacts with the Selected Company. */
            var ContactParms = {workspaceId:3482,formId: 7872,field71141: $scope.companyModel.id};
            znData('FormRecords').query(ContactParms, function (results) {
                
                $scope.companyContacts = results;
                for (var i = 0, len = $scope.companyContacts.length; i < len; i++) {
                    $scope.contactlookup[$scope.companyContacts[i].id] = $scope.companyContacts[i];
                }
                
            });
        
            $scope.selectedContact = null;
            $scope.selectContact = function(row) {
                if ($scope.selectedContact === row) {
                    $scope.selectedContact = null;
                } else {
                    $scope.selectedContact = row;
                }
            };
    

      
        
    };
    
    $scope.editLocationData = function(locationId) {
        formId = 7878;
        recordId = locationId;
        $location.search('record', formId + '.' + recordId);       
    };
    
    $scope.createLocationData = function() {
        formId = 7878;
        $location.search('record', formId + '.add'); 
    };
    
    $scope.refreshLocationData = function() {
/* Create the list of Locations with the Selected Company. */
            var locationParms = {workspaceId:3482, formId: 7878, field71200:$scope.companyModel.id };
            znData('FormRecords').query(locationParms, function (results) {
                $scope.companyLocations = results;
                for (var i = 0, len = $scope.companyLocations.length; i < len; i++) {
                    $scope.locationlookup[$scope.companyLocations[i].id] = $scope.companyLocations[i];
                }
            });
        
            $scope.selectedLocation = null;
            $scope.selectLocation = function(row) {
                if ($scope.selectedLocation === row) {
                    $scope.selectedLocation = null;
        
                } else {
                    $scope.selectedLocation = row;
                     
                }
            };  
      
        
    };

           $scope.allSamplesin = [];
             sampleinCompanySvc.queryAll(function(addedChild) {
                $timeout(function() {
                    $scope.allSamplesin.push(addedChild);
                });
            });
        
}])
/*
*
//------------------------------------- New SampleIn CNTL ----------------------------------------------------------------
*
*/
.controller('sampleinsDashboardCntl', ['$scope', 'sampleinCompanySvc', function ($scope, sampleinCompanySvc) {
        

        
}])
/*
*
//------------------------------------- SampleIn Data ServiceL ----------------------------------------------------------------
*
*/
.service('sampleinDataShare', [ function () {  
    this.companyIn = '';
    
}])
.service('sampleinCompanySvc', ['sampleinDataShare', function(sampleinDataShare) {  
            return {
                childAdded: function childAdded(id,cb) {
                    var fbUrl = 'https://mdtsamplein.firebaseio.com/' + id;
                    var companyRef = new Firebase(fbUrl);
                    companyRef.on('child_added', function (snapshot) {
                        cb.call(this, snapshot.val());
                    });
                },
                childDelete: function childDelete(childDeleteId) {
                    var fbUrl = 'https://mdtsamplein.firebaseio.com/' + childDeleteId ;
                    var companyRef = new Firebase(fbUrl);
                    companyRef.remove();
                },
                childSave: function childSave(companyModel, newSampleIn, SampleInItems) {
                    var fbUrl = 'https://mdtsamplein.firebaseio.com/' + companyModel.id + '/';
                    var companyRef = new Firebase(fbUrl);
                    
                    
                    var recordObj = {
                            date: newSampleIn.date,
                            number: newSampleIn.number,
                            company : companyModel,
                            contact : newSampleIn.selectedContact,
                            location :newSampleIn.selectedLocation,
                            term : newSampleIn.term,
                            shipMonth : newSampleIn.shipmonth,
                            shipYear: newSampleIn.shipyear,
                            shipVia: newSampleIn.shipvia,
                            FOB: newSampleIn.FOB,
                            SampleInItems : SampleInItems,
                            comments: newSampleIn.comments
                    };
                    
                    var objArry = Object.keys(recordObj);
                    for(var i=0; i< objArry.length; ++i)
                    {
                     if (typeof recordObj[objArry[i]] === 'undefined') { recordObj[objArry[i]] = "" }   
                    }
                    companyRef.child(newSampleIn.number).set(recordObj);  
                },
            childlookup: function childlookup (id,recordid,cb) {
                    var fbUrl = 'https://mdtsamplein.firebaseio.com/' + id + "/" + recordid;
                    var companyRef = new Firebase(fbUrl);
                    companyRef.on('value', function (snapshot) {
                        cb.call(this, snapshot.val());
                    });
                },
            queryAll: function queryAll(id,cb) {
                    var fbUrl = 'https://mdtsamplein.firebaseio.com/';
                    var companyRef = new Firebase(fbUrl);
                    companyRef.on('child_added', function (snapshot) {
                        cb.call(this, snapshot.val());
                    });
                },
            };

}])
/**
 * Plugin Registration
 */
.register('samplein', {
	route: '/samplein',
	controller: 'sampleinCntl',
	template: 'samplein-main',
	title: 'samplein Plugin',
	pageTitle: false,
	type: 'fullPage',
	topNav: true,
	order: 300,
	icon: 'icon-puzzle'
});

