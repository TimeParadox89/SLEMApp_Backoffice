var app = {
    pages: {
        MAIN: "main_page",
        READ: "wh_page",
        WRITE: "ms_page",
        HOME: "home",
        EMPVER: "configure_bracelet_page"
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
            default:
            //doNothing();
        }
        if (currentPage === app.pages.READ) {
            var tag = nfcEvent.tag;
            var stringPayload = ndef.textHelper.decodePayload(tag.ndefMessage[0].payload);
            app.display("You have read: " + stringPayload, "read_result");
            app.display("NFC read", "status_div");
        }
        else if (currentPage === app.pages.WRITE) {
            var message = ["erennio", "cretino"];

            var inputValue = $("#write_text_input").val();
            record = ndef.textRecord(inputValue);

            // put the record in the message array:
            message.push(record);
            app.display("NFC write", "status_div");

            // write the record to the tag:
            nfc.write(
                message, // write the record itself to the tag
                function () { // when complete, run app callback function:
                    app.display("Wrote '" + inputValue + "' to tag.", "write_result"); // write to the message div
                },
                // app function runs if the write command fails:
                function (reason) {
                    app.display("There was a problem " + reason, "write_result");
                }
            );
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
                }

            },
            contentType: "application/json",
            dataType: 'json'
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
                warehouseID: "e70d8391-1317-4c8b-b9d0-16bde0f872d1"
            }),
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("addUserDefault").innerHTML;
                    document.getElementById("addUserDefault").innerHTML = newDiv;
                } else {
                    $("#addUserDefault").hide();
                    $("#addUserResponse").show();
                }
            },
            contentType: "application/json",
            dataType: 'json'
        });
    },

    getUser: function (userID,myWhID) {

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
        x = document.getElementsByClassName("warehouseID");
        for (var i = 0; i < x.length; i++) {
            x[i].value = 'AAAAA';
        }
    },

    successSwap: function () {
        $(".defaultAdd").hide();
        $(".successResponse").show();
    },

    setWarehouseID: function (whid) {
        x = document.getElementsByClassName("warehouseID");
        for (var i = 0; i < x.length; i++) {
            x[i].value = whid;
        }
    }

};




/* scrivere due righe nel nfc
var message = [ ndef.textRecord("parola uno"),ndef.textRecord("parola due")];
        // write the record to the tag:
        nfc.write(
            message, // write the record itself to the tag
            function () { // when complete, run app callback function:
                app.display("tutto a posto ", "homeMainContent");
            },
            // app function runs if the write command fails:
            function (reason) {
                app.display("There was a problem " + reason, "homeMainContent");
            }
        );
*/