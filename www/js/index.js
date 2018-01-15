var app = {
    pages: {
        MAIN: "main_page",
        READ: "wh_page",
        WRITE: "ms_page"
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
        app.clearAll();
        app.onNfc = app.doNothingOnNfc;

        app.display("NFC contact", "status_div");

        if (currentPage === app.pages.READ) {
            var tag = nfcEvent.tag;
            var stringPayload = ndef.textHelper.decodePayload(tag.ndefMessage[0].payload);
            app.display("You have read: " + stringPayload, "read_result");
            app.display("NFC read", "status_div");
        }
        else if (currentPage === app.pages.WRITE) {
            var message = [];

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
            error: function (returnval) {
                document.getElementById(addLocationResponse).innerHTML = '<div class="errorBox"><center><i class="fa fa-times-circle"></i>' + returnval + '</center></div>';
            },

            success: function (response) {
                if (response.status == "error") {
                    newDiv='<div class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>'+ document.getElementById("addLocationDefault").innerHTML;
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
                //app.display(response.status, "responde_add_div");
                $("#addUserDefault").hide();
                $("#addUserResponse").show();

            },
            contentType: "application/json",
            dataType: 'json'
        });
    },

    navigateTo: function (location) {
        $.mobile.navigate('#' + location);
        $('.defaultAdd').show();
        $('.successResponse').hide();
    },

    implementMe: function () {
        x = document.getElementsByClassName("defaultAdd");  // Find the elements
        for (var i = 0; i < x.length; i++) {
            x[i].innerHTML = '<div class="errorBox"><center><i class="fa fa-times-circle"></i>You have to implement me</center></div>';    // Change the content
        }
        x = document.getElementsByClassName("warehouseID");  // Find the elements
        for (var i = 0; i < x.length; i++) {
            x[i].value = 'AAAAA';    // Change the content
        }
    },

    successSwap: function () {
        $(".defaultAdd").hide();
        $(".successResponse").show();
    }

};