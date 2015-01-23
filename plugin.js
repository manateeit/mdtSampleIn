/**
 * Plugin Quotes Controller
 */
plugin.controller('quotesCntl', ['$scope', '$window', 'znData', '$routeParams', 'znModal','$templateCache', '$timeout', 'quotesCompanySvc', 'quotesDataShare','$location',
        function ($scope, $window, znData, $routeParams, znModal,$templateCache, $timeout, quotesCompanySvc, quotesDataShare, $location) {
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
    $scope.companyQuotes = [];
    
    $scope.showNewQuoteForm = 'false';
    $scope.showQuotes = 'true';
    $scope.showCompanyInfo = 'false';
    $scope.showNewQuoteForm = 'false';
    $scope.showNewQuoteItem = 'false';
    $scope.showCompanyEdit = 'false';
    $scope.showDashboard = true;
    
    $scope.quoteCnt = 0;
    $scope.quoteItems = [];
    $scope.quoteItem = {};
    $scope.newQuote = {};
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

        // reset quoteItem
        $scope.initializeCleanQuote = function (option) {
            if (option === 'set') {
                $scope.newQuote = {
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
                $scope.quoteItems = [];
                $scope.freshNewQuote = angular.copy($scope.newQuote);
            }
            if (option === 'reset') {
                $scope.newQuote = angular.copy($scope.freshNewQuote);
                $scope.quoteItems.splice(0,$scope.quoteItems.length);
            }
        };
        
        $scope.initializeCleanQuoteItem = function (option) {
            if (option === 'set') {
                $scope.quoteItem = {
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
                $scope.freshQuoteItem = angular.copy($scope.quoteItem);
            }
            if (option === 'reset') {
                $scope.quoteItem = angular.copy($scope.freshQuoteItem);
            }
        };
    
    $scope.initializeCleanQuoteItem('set');
    $scope.initializeCleanQuote('set');
    
   
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
            $scope.showNewQuoteForm = 'false';
            $scope.showNewQuoteForm = 'false';
            $scope.showNewQuoteItem = 'false';
            $scope.showCompanyEdit = 'false';
             $scope.showDashboard = false;

            $scope.initializeCleanQuote('reset');
            $scope.companyQuotes = [];
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
// Create a list of Quotes for this company 

            $scope.reFreshQuotes(companyIn.id);
   
        } // end of If check for same company clicked



    };  /* Close of set CompanyModel */

    $scope.reFreshQuotes = function (id) {
             $scope.companyQuotes = [];
             quotesCompanySvc.childAdded(id,function(addedChild) {
                $timeout(function() {
                    $scope.companyQuotes.push(addedChild);
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



//------------------------------------- New Quote  ------------------------------------------------------------------

    $scope.genQuoteNumber = function () { 
    
        var quoteNumber  = new Date();
        var dd = quoteNumber.getDate();
        var mm = quoteNumber.getMonth()+1;//January is 0!
        var yy = quoteNumber.getFullYear();
        var hours = quoteNumber.getHours();
        var minutes = quoteNumber.getMinutes();
        var seconds = quoteNumber.getSeconds();
            yy = yy.toString().substr(2,2);
        
        if(dd<10){
            dd='0'+dd;
        }
        if(mm<10){
            mm='0'+mm;
        }
            quoteNumber  = 'MDT - ' + mm + dd + yy + ' - ' + hours + minutes + seconds;
        return quoteNumber;
        
    };

    $scope.createCompanyNewQuote = function(currentCompany) {
        $scope.showCompanyInfo = 'false';
        $scope.showNewQuoteForm = 'true';
        $scope.newQuote.date = $scope.todaysDate();
        $scope.newQuote.number =  $scope.genQuoteNumber();
    };
     
     
    $scope.newQuoteSave = function () {
         
        $scope.showNewQuoteForm = 'false';
        $scope.showCompanyInfo = 'true';
        $scope.newQuote.number = $scope.newQuote.number.replace(/\s+/g, '');
        $scope.newQuote.selectedContact  = angular.copy($scope.contactlookup[$scope.selectedContact]);
        $scope.newQuote.selectedLocation = angular.copy($scope.locationlookup[$scope.selectedLocation]);
        quotesCompanySvc.childSave($scope.companyModel, $scope.newQuote, $scope.quoteItems);
       
        setTimeout(function(){
                $scope.reFreshQuotes($scope.companyModel.id);
             },100); 
     };
     
    $scope.newQuoteCancel = function () {
         
        $scope.showNewQuoteForm = 'false';
        $scope.showCompanyInfo = 'true';
        $scope.initializeCleanQuote('reset');
    
         
     };
     
    $scope.deleteCompanyQuote = function (item,row) {
            var companyId = $scope.companyModel.id + "/" + item;
        
           quotesCompanySvc.childDelete(companyId);
             setTimeout(function(){
                $scope.reFreshQuotes($scope.companyModel.id);
             },100); 
            
        };
    
    $scope.editCompanyQuote = function (item, row) { 
        
        quotesCompanySvc.childlookup($scope.companyModel.id,item,function(addedChild) {
            $timeout(function() {
                    $scope.newQuote = addedChild;
                    $scope.selectedContact = $scope.newQuote.contact.id;
                    $scope.selectedLocation = $scope.newQuote.location.id;
                    $scope.quoteItems = $scope.newQuote.quoteItems;
                    console.log($scope.newQuote);
                });
        });

        $scope.showCompanyInfo = 'false';
        $scope.showNewQuoteForm = 'true';
         
    };

    $scope.downloadCompanyQuote = function (customerId,quoteId){

            var firehostURL = "https://mdtechapp.firebaseapp.com/index.html#/quote/" + customerId + "/" + quoteId + "/";
            var myWindow = $window.open(firehostURL, "MsgWindow", "width=900, height=720", "true");
            myWindow.document.close();
            myWindow.focus();
    
        
        
    };
    


//------------------------------------- New Quote Item ----------------------------------------------------------------

    $scope.newQuoteItem = function () {
        $scope.showNewQuoteForm = 'false';
        $scope.showNewQuoteItem = 'true';
        $scope.quoteItemEdit = false;
        $scope.quoteItem  = angular.copy($scope.freshQuoteItem);
        $scope.carriers = angular.copy([]); 
    };

    $scope.newQuoteItemSave = function () { 
    
        $scope.showNewQuoteForm = 'true';
        $scope.showNewQuoteItem = 'false';
        
        var material = angular.copy($scope.newQuote.material);
        $scope.newQuote.material = angular.copy(material);
        
    
        if ($scope.quoteItemEdit)
        {   
            $scope.quoteItems[$scope.quoteItemEditRow] = $scope.quoteItem;
            $scope.quoteItemEdit = false;
        }else {
            $scope.quoteItems.push($scope.quoteItem);
        }
        
        $scope.quoteItem = angular.copy($scope.freshQuoteItem);
      
    };

    $scope.newQuoteItemCancel = function () { 
        $scope.showNewQuoteForm = 'true';
        $scope.showNewQuoteItem = 'false';
        $scope.quoteItemCnt --;
     };

    $scope.deleteQuoteItem = function (item) {$scope.quoteItems.splice(item,1);};
    
    
    $scope.editQuoteItem = function(item) {
        $scope.quoteItem = angular.copy($scope.quoteItems[item]);
        $scope.quoteItemEdit = true;
        $scope.quoteItemEditRow = item;
        $scope.showNewQuoteForm = 'false';
        $scope.showNewQuoteItem = 'true';
    };
  
    $scope.calculatePackaging = function () {
        
      var motValue  = Number($scope.quoteItem.mot.value);
      var packCost =  Number($scope.quoteItem.packagingCost);
      var packaging = packCost/motValue;
      
      $scope.quoteItem.packaging = packaging.toFixed(5);
        
        
    };



    $scope.calculateColorCon = function () {

         
         var colorConCost = Number($scope.quoteItem.colorConCost);
         var colorConLetDown = Number($scope.quoteItem.colorConLetDown);
         var motValue  = Number($scope.quoteItem.mot.value);
         
         if (colorConLetDown === null) {colorConLetDown = 0}
         if (colorConCost === null) {colorConCost = 0}
         
         var bottom = motValue * colorConLetDown;
         var colorCon = colorConCost/bottom;
         
         if (isNaN(colorCon)) { colorCon = 0 }
         
         
         //onsole.log("Color Con Cost: " + $scope.quoteItem.colorConCost );
         //onsole.log("color let down: " +  $scope.quoteItem.colorConLetDown );
         //onsole.log("mot value: " + $scope.quoteItem.mot.value);
    
         //onsole.log(colorCon.toFixed(5));
         $scope.quoteItem.colorCon =   colorCon.toFixed(5);
     };    
            


    $scope.getLanes = function() {
        //onsole.log("Getting Lanes");
       var params = { workspaceId:3482, formId: 10318, field91846: $scope.quoteItem.mot.name, limit: 10000};
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
            var formparams2 = { workspaceId:3482, formId: 10318, id: $scope.quoteItem.lane.id, limit: 10};
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
         var transportation = parseInt($scope.quoteItem.carrier.value) / parseInt($scope.quoteItem.mot.value);
         $scope.quoteItem.transportation =   transportation.toFixed(5);
     };

    $scope.calculateTotal = function ()  { 
            var  supplier = Number($scope.quoteItem.supplier);
            var  colorCon =  Number($scope.quoteItem.colorCon);
            var  transportation =  Number($scope.quoteItem.transportation);
            var  packaging =  Number($scope.quoteItem.packaging);
            var  warehousing =  Number($scope.quoteItem.warehousing);
            var  tollprocessing =  Number($scope.quoteItem.tollprocessing);
            var  repCost  =  Number($scope.quoteItem.repCost);            
            var  total =  supplier + colorCon + transportation + packaging + warehousing + tollprocessing + repCost;
        $scope.quoteItem.total = total.toFixed(5);
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

           $scope.allQuotes = [];
             quotesCompanySvc.queryAll(function(addedChild) {
                $timeout(function() {
                    $scope.allQuotes.push(addedChild);
                    ////onsole.log($scope.allQuotes);
                });
            });
        
}])
/*
*
//------------------------------------- New Quote CNTL ----------------------------------------------------------------
*
*/
.controller('quotesDashboardCntl', ['$scope', 'quotesCompanySvc', function ($scope, quotesCompanySvc) {
        

        
}])
/*
*
//------------------------------------- quotes Data ServiceL ----------------------------------------------------------------
*
*/
.service('quotesDataShare', [ function () {  
    this.companyIn = '';
    
}])
.service('quotesCompanySvc', ['quotesDataShare', function(quotesDataShare) {  
            return {
                childAdded: function childAdded(id,cb) {
                    var fbUrl = 'https://mdtquotes.firebaseio.com/' + id;
                    var companyRef = new Firebase(fbUrl);
                    companyRef.on('child_added', function (snapshot) {
                        cb.call(this, snapshot.val());
                    });
                },
                childDelete: function childDelete(childDeleteId) {
                    var fbUrl = 'https://mdtquotes.firebaseio.com/' + childDeleteId ;
                    var companyRef = new Firebase(fbUrl);
                    companyRef.remove();
                },
                childSave: function childSave(companyModel, newQuote, quoteItems) {
                    var fbUrl = 'https://mdtquotes.firebaseio.com/' + companyModel.id + '/';
                    var companyRef = new Firebase(fbUrl);
                    
                    
                    var recordObj = {
                            date: newQuote.date,
                            number: newQuote.number,
                            company : companyModel,
                            contact : newQuote.selectedContact,
                            location :newQuote.selectedLocation,
                            term : newQuote.term,
                            shipMonth : newQuote.shipmonth,
                            shipYear: newQuote.shipyear,
                            shipVia: newQuote.shipvia,
                            FOB: newQuote.FOB,
                            quoteItems : quoteItems,
                            comments: newQuote.comments
                    };
                    
                    var objArry = Object.keys(recordObj);
                    for(var i=0; i< objArry.length; ++i)
                    {
                     if (typeof recordObj[objArry[i]] === 'undefined') { recordObj[objArry[i]] = "" }   
                    }
                    companyRef.child(newQuote.number).set(recordObj);  
                },
            childlookup: function childlookup (id,recordid,cb) {
                    var fbUrl = 'https://mdtquotes.firebaseio.com/' + id + "/" + recordid;
                    var companyRef = new Firebase(fbUrl);
                    companyRef.on('value', function (snapshot) {
                        cb.call(this, snapshot.val());
                    });
                },
            queryAll: function queryAll(id,cb) {
                    var fbUrl = 'https://mdtquotes.firebaseio.com/';
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
    .register('quotes', {
        route: '/quotes',
        controller: 'quotesCntl',
        template: 'quotes-main',
        title: 'MDT Quotes',
        pageTitle: false,
        fullPage: true,
        topNav: true,
        order: 300,
        icon: 'icon-truck'
    });

