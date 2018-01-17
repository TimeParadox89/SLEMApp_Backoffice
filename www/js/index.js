var app = {
    pages: {
        MAIN: "main_page",
        READ: "wh_page",
        WRITE: "ms_page",
        HOME: "home",
        EMPVER: "configure_bracelet_page",
        ADDUSER: "add_employee_page",
        ADDLOCATION: "add_location_page",
        CONFLOCATION: "configure_location_page"
    },

    initialize: function () {
        app.bindEvents();
    },

    /*
    bind any events that are required on startup to listeners:
     */
    bindEvents: function () {
        document.addEventListener('deviceready', app.onDeviceReady, false);
    },

    /*
    app runs when the device is ready for user interaction:
     */
    onDeviceReady: function () {
        nfc.addNdefListener(
            app.onNfc, // tag successfully scanned
            function (status) { // listener successfully initialized

            },
            function (error) { // listener fails to initialize
                app.display("NFC reader failed to initialize " + JSON.stringify(error), "init_nfc_negative_result");
            }
        );
    },

    doNothingOnNfc: function (nfcEvent) {
        //do nothing function used when an nfc event is fired and no code has to be executed
    },

    /*
    called when a device is close to a nfc tag
     */
    onNfc: function (nfcEvent) {
        var currentPage = $.mobile.activePage.attr('id');
        app.onNfc = app.doNothingOnNfc;

        switch (currentPage) {
            case app.pages.HOME:
                var tag = nfcEvent.tag;
                var managerID = ndef.textHelper.decodePayload(tag.ndefMessage[0].payload);
                var myWarehouseID = ndef.textHelper.decodePayload(tag.ndefMessage[1].payload);
                app.getUser(managerID, myWarehouseID);
                break;
            case app.pages.ADDUSER:
                if ($("#addUserConfiguration").is(":visible")) {
                    //app.writeToNFC();
                }
                break;
            default:
            //doNothing();
        }

    },

    display: function (message, messageDivId) {
        var messageDiv = document.getElementById(messageDivId);
        messageDiv.innerHTML = message;
    },

    displayClass: function (message, messageDivClass) {
        var messageDiv = document.getElementsByClassName(messageDivClass);
        messageDiv[0].innerHTML = message;
    },

    /*
    clears the message div:
     */

    clearAll: function () {
        var messageReadDiv = document.getElementById("read_result");
        var messageWriteDiv = document.getElementById("write_result");
        messageReadDiv.innerHTML = "";
        messageWriteDiv.innerHTML = "";
    },

    addLocation: function () {
        $.ajax({
            type: 'POST',
            url: 'http://petprojects.altervista.org/SLEM/api/location/new/',
            data: JSON.stringify({
                locationID: $('#locationID').val(),
                name: $('#nameLocation').val(),
                warehouseID: "e70d8391-1317-4c8b-b9d0-16bde0f872d1"
            }),
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("addLocationDefault").innerHTML;
                    document.getElementById("addLocationDefault").innerHTML = newDiv;

                } else {
                    $("#addLocationResponse").show();
                    $("#addLocationDefault").hide();
                    app.disableInput();
                }

            },
            contentType: "application/json",
            dataType: 'json'
        });
    },

    getLocation: function (locID, WhID) {

        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/SLEM/api/location/get/',
            data: {
                locationID: locID,
                warehouseID: WhID
            },
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("verifyLocationDefault").innerHTML;
                    document.getElementById("verifyLocationDefault").innerHTML = newDiv;
                } else {
                    $("#verifyLocationDefault").hide();
                    $("#verifyLocationResponse").show();
                    
                }
            }
        });
    },

    addUser: function () {
        $.ajax({
            type: 'POST',
            url: 'http://petprojects.altervista.org/SLEM/api/employee/new/',
            data: JSON.stringify({
                ID: $('#fiscalcode').val(),
                name: $('#firstname').val(),
                surname: $('#lastname').val(),
                birthDate: $('#birthdate').val(),
                roleID: $('#roleid').val(),
                warehouseID: $('#warehouseID').val()
            }),
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("addUserDefault").innerHTML;
                    document.getElementById("addUserDefault").innerHTML = newDiv;
                } else {
                    $("#addUserDefault").hide();
                    $("#addUserResponse").show();
                    app.disableInput(app.pages.ADDUSER);
                }
            },
            error: function (response) {
                newDiv = '<div class="errorBox"><center><i class="fa fa-times-circle"></i>' + "sto in error" + '</center></div>' + document.getElementById("addUserDefault").innerHTML;
                document.getElementById("addUserDefault").innerHTML = newDiv;
            },
            contentType: "application/json",
            dataType: 'json'
        });

    },


    getUser: function (userID, myWhID) {
        newDiv = "CACCHIO";
        document.getElementById("homeLoginContent").innerHTML = newDiv;
        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/SLEM/api/employee/get/',
            data: {
                ID: userID,
                warehouseID: myWhID
            },
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("homeLoginContent").innerHTML;
                    document.getElementById("homeLoginContent").innerHTML = newDiv;
                } else {
                    var currentPage = $.mobile.activePage.attr('id');
                    switch (currentPage) {
                        case app.pages.HOME:
                            //controlla se è ruolo amministratore accede altrimenti no
                            $('#homeMainContent').show();
                            $('#homeLoginContent').hide();
                            app.setWarehouseID(myWhID);
                            break;
                        case app.pages.EMPVER:
                            $("#verifyUserDefault").hide();
                            $("#verifyUserResponse").show();

                            //deve autorizzarmi a scrivere il braccialetto.
                            break;
                        default:
                        //doNothing();
                    }
                }
            }
        });
    },

    navigateTo: function (location) {
        $.mobile.navigate('#' + location);
        $('.defaultAdd').show();
        $('.successResponse').hide();
    },

    implementMe: function () {
        x = document.getElementsByClassName("defaultAdd");
        for (var i = 0; i < x.length; i++) {
            x[i].innerHTML = '<div class="errorBox"><center><i class="fa fa-times-circle"></i>You have to implement me</center></div>';
        }
    },

    swapDivByClass: function (div1, div2) {
        $("." + div1).hide();
        $("." + div2).show();
    },

    setWarehouseID: function (whid) {
        x = document.getElementsByClassName("warehouseID");
        for (var i = 0; i < x.length; i++) {
            x[i].value = whid;
        }

        document.getElementById("helloMr").innerHTML += "Hello, Angela";
    },

    verifyUser: function () {
        app.getUser($('#fiscalcodeVerify').val(), $('#warehouseID').val());
    },

    verifyLocation: function () {
        app.getLocation($('#locationIDVerify').val(), $('#warehouseID').val());
    },

    disableInput: function () {
        var currentPage = $.mobile.activePage.attr('id');

        switch (currentPage) {
            case app.pages.ADDUSER:
                document.getElementById('firstname').setAttribute("disabled", "disabled");
                $("#firstname").parent().addClass("ui-state-disabled");
                document.getElementById('lastname').setAttribute("disabled", "disabled");
                $("#lastname").parent().addClass("ui-state-disabled");
                document.getElementById('birthdate').setAttribute("disabled", "disabled");
                $("#birthdate").parent().addClass("ui-state-disabled");
                document.getElementById('fiscalcode').setAttribute("disabled", "disabled");
                $("#fiscalcode").parent().addClass("ui-state-disabled");
                document.getElementById('roleid').setAttribute("disabled", "disabled");
                $("#roleid").parent().addClass("ui-state-disabled");
                break;
            case app.pages.ADDLOCATION:
                document.getElementById('nameLocation').setAttribute("disabled", "disabled");
                $("#nameLocation").parent().addClass("ui-state-disabled");
                document.getElementById('locationID').setAttribute("disabled", "disabled");
                $("#locationID").parent().addClass("ui-state-disabled");
                break;

            default:
                break;
        }
    },

    enableInput: function () {
        var currentPage = $.mobile.activePage.attr('id');

        switch (currentPage) {
            case app.pages.ADDUSER:
                document.getElementById('firstname').removeAttribute("disabled");
                $("#firstname").parent().removeClass("ui-state-disabled");
                document.getElementById('lastname').removeAttribute("disabled")
                $("#lastname").parent().removeClass("ui-state-disabled");
                document.getElementById('birthdate').removeAttribute("disabled")
                $("#birthdate").parent().removeClass("ui-state-disabled");
                document.getElementById('fiscalcode').removeAttribute("disabled")
                $("#fiscalcode").parent().removeClass("ui-state-disabled");
                document.getElementById('roleid').removeAttribute("disabled")
                $("#roleid").parent().removeClass("ui-state-disabled");
                break;
            case app.pages.ADDLOCATION:
                document.getElementById('nameLocation').removeAttribute("disabled");
                $("#nameLocation").parent().removeClass("ui-state-disabled");
                document.getElementById('locationID').removeAttribute("disabled")
                $("#locationID").parent().removeClass("ui-state-disabled");
                break;
            default:
                break;
        }
    },

    clearInput: function (nextPage) {

        switch (nextPage) {
            case app.pages.ADDUSER:
                $("#firstname").val("");
                $("#lastname").val("");
                $("#birthdate").val("");
                $("#fiscalcode").val("");
                $("#roleid").val("");
                break;
            case app.pages.ADDLOCATION:
                $("#nameLocation").val("");
                $("#locationID").val("");
                break;
            default:
                break;
        }


    }

};