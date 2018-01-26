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
                    app.writeToNFC($('#fiscalcode').val(), $('#warehouseID').val());
                }
                break;
            case app.pages.EMPVER:
                if ($("#verifyUserResponse").is(":visible")) {
                    app.writeToNFC($('#fiscalcodeSelect').find(":selected").val(), $('#warehouseID').val());
                }
                break;
            case app.pages.ADDLOCATION:
                //implementare bisogna aggiungere il campo locationID disabled, lo vado a modificare in fase di aggiunta con response.ID
                break;
            case app.pages.CONFLOCATION:
                if ($("#verifyLocationResponse").is(":visible")) {
                    app.writeToNFC($('#locationIDVerify').val(), $('#warehouseID').val());
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
            url: 'http://petprojects.altervista.org/' + $('#warehouseID').val() + '/location/',
            data: JSON.stringify({
                name: $('#nameLocation').val(),
            }),
            error: function (xhr, data) {
                if (xhr.status == 404) {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i> The user is not in the database </center></div>' + document.getElementById("homeLoginContent").innerHTML;
                    document.getElementById("homeLoginContent").innerHTML = newDiv;
                }
            },
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.error + '</center></div>' + document.getElementById("addLocationDefault").innerHTML;
                    document.getElementById("addLocationDefault").innerHTML = newDiv;

                } else {
                    $("#addLocationResponse").show();
                    $("#addLocationDefault").hide();
                    app.disableInput();
                }

            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json'
        });
    },

    getLocation: function (locID, WhID) {

        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/' + WhID + '/location/' + locID,
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("verifyLocationDefault").innerHTML;
                    document.getElementById("verifyLocationDefault").innerHTML = newDiv;
                } else {
                    $("#verifyLocationDefault").hide();
                    $("#verifyLocationResponse").show();
                    app.disableInput();
                }
            },
            error: function (response) {
                newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + "Ops! There is a problem" + '</center></div>' + document.getElementById("addUserDefault").innerHTML;
                document.getElementById("addUserDefault").innerHTML = newDiv;
            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json'
        });
    },

    getLocations: function () {
        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/31814799-B4B5-4D67-B5F4-989245BD8DDD/location/list/', //' + $('#warehouseID').val() + '
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("verifyLocationDefault").innerHTML;
                    document.getElementById("verifyLocationDefault").innerHTML = newDiv;
                } else {
                    var sel = document.getElementById('fiscalcodeSelect');
                    var tmp = new Array();
                    tmp = response;
                    for (i = 0; i < tmp.length; i++) {
                        var opt = document.createElement('option');
                        opt.innerHTML = tmp[i].ID;
                        opt.value = tmp[i].ID;
                        sel.appendChild(opt);
                    }
                }
            },
            error: function (response) {
                newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + "Ops! There is a problem" + '</center></div>' + document.getElementById("addUserDefault").innerHTML;
                document.getElementById("addUserDefault").innerHTML = newDiv;
            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json'
        });
    },

    addBatch: function () {
        $.ajax({
            type: 'POST',
            url: 'INSERIRE L?URL DAL DATABASE',
            data: JSON.stringify({
                productID: $('#productid').val(),
                quantity: $('#quantity').val(),
                location: $('#batchLocation').val(),
                warehouseID: "INSERIRE DAL DBBBBBBBBBBBBBBBB"
            }),
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("addBatchDefault").innerHTML;
                    document.getElementById("addBatchDefault").innerHTML = newDiv;
                } else {
                    $("addBatchResponse").show();
                    $("addBatchDefault").hide();
                    app.disableInput();
                }
            },
            contentType: "application/json",
            dataType: 'json'
        });
    },

    getBatch: function (prodID, whId) {
        $.ajax({
            type: 'GET',
            url: 'INSERIEEEEEEEEEEE',
            data: {
                productID: prodID,
                warehouseID: whID
            },
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("verifyBatchDefault").innerHTML;
                    document.getElementById("verifyBatchDefault").innerHTML = newDiv;
                } else {
                    $("#verifyBatchDefault").hide();
                    $("#verifyBatchResponse").show();


                }

            }
        });
    },

    addUser: function () {
        $.ajax({
            type: 'POST',
            url: 'http://petprojects.altervista.org/employee/',
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
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.error + '</center></div>' + document.getElementById("addUserDefault").innerHTML;
                    document.getElementById("addUserDefault").innerHTML = newDiv;
                } else {
                    $("#addUserDefault").hide();
                    $("#addUserResponse").show();
                    app.disableInput();
                }
            },
            error: function (response) {
                newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + "Ops! There is a problem" + '</center></div>' + document.getElementById("addUserDefault").innerHTML;
                document.getElementById("addUserDefault").innerHTML = newDiv;
            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json'
        });

    },


    getUser: function (userID, myWhID) {
        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/' + myWhID + '/employee/' + userID + '/',
            error: function (xhr, data) {
                if (xhr.status == 404) {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i> The user is not in the database </center></div>' + document.getElementById("homeLoginContent").innerHTML;
                    document.getElementById("homeLoginContent").innerHTML = newDiv;
                }
            },
            success: function (response) {
                var currentPage = $.mobile.activePage.attr('id');
                switch (currentPage) {
                    case app.pages.HOME:
                        //controlla se è ruolo amministratore accede altrimenti no
                        $('#homeMainContent').show();
                        $('#homeLoginContent').hide();
                        document.getElementById("helloMr").innerHTML += "Hello, " + response.surname;
                        document.getElementById("logoutButton").style.display = "block";
                        app.setWarehouseID(myWhID);
                        break;
                    case app.pages.EMPVER:
                        if ($("#verifyUserDefault").is(":visible")) {
                            document.getElementById(userID).innerHTML = response.surname + " " + response.name;
                        }
                        break;
                    default:
                    //doNothing();
                }
            },
            accept: "application/json",
            dataType: 'json'
        });
    },

    getUsers: function () {
        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/' + $('#warehouseID').val() + '/employee/list/',
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("verifyLocationDefault").innerHTML;
                    document.getElementById("verifyLocationDefault").innerHTML = newDiv;
                } else {
                    var sel = document.getElementById('fiscalcodeSelect');
                    var tmp = new Array();
                    tmp = response;
                    for (i = 0; i < tmp.length; i++) {
                        var opt = document.createElement('option');
                        //opt.innerHTML = tmp[i].ID;
                        opt.id = tmp[i].ID;
                        opt.value = tmp[i].ID;
                        sel.appendChild(opt);
                        app.getUser(tmp[i].ID, $('#warehouseID').val());
                    }
                }
            },
            error: function (response) {
                newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + "Ops! There is a problem" + '</center></div>' + document.getElementById("addUserDefault").innerHTML;
                document.getElementById("addUserDefault").innerHTML = newDiv;
            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json'
        });
    },

    navigateTo: function (location) {
        $.mobile.navigate('#' + location);
        app.enableInput(location);

        switch (location) {
            case app.pages.EMPVER:
                app.getUsers();
                break;
            case app.pages.CONFLOCATION:
                app.getLocationsList();
                break;
            default:
        }
    },

    implementMe: function () {
        x = document.getElementsByClassName("defaultAdd");
        for (var i = 0; i < x.length; i++) {
            x[i].innerHTML = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>You have to implement me</center></div>';
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
    },

    enableWrite: function () {
        var currentPage = $.mobile.activePage.attr('id');

        switch (currentPage) {
            case app.pages.EMPVER:
                if ($('#fiscalcodeSelect').find(":selected").val() != "doNothing") {
                    $("#verifyUserDefault").hide();
                    $("#verifyUserResponse").show();
                } else {
                    alert("Select an employee");
                }
                break;
            default:
                break;
        }
    },

    verifyLocation: function () {
        app.getLocation($('#locationIDVerify').val(), $('#warehouseID').val());
    },

    logout: function () {
        $('#homeMainContent').hide();
        $('#homeLoginContent').show();
        document.getElementById("helloMr").innerHTML = "";
        document.getElementById("logoutButton").style.display = "none";
        app.setWarehouseID("");
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
            case app.pages.CONFLOCATION:
                document.getElementById('locationIDVerify').setAttribute("disabled", "disabled");
                $("#locationIDVerify").parent().addClass("ui-state-disabled");
                break;
            default:
                break;
        }
    },

    enableInput: function (currentPage) {

        app.clearInput(currentPage);

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
            case app.pages.CONFLOCATION:
                document.getElementById('locationIDVerify').removeAttribute("disabled")
                $("#locationIDVerify").parent().removeClass("ui-state-disabled");
                break;
            default:
                break;
        }
    },

    clearInput: function (nextPage) {
        var errorBox = document.getElementById('errorBox');
        if ( errorBox != null) errorBox.parentNode.removeChild(errorBox);

        switch (nextPage) {
            case app.pages.ADDUSER:
                $("#firstname").val("");
                $("#lastname").val("");
                $("#birthdate").val("");
                $("#fiscalcode").val("");
                $("#roleid").val("");
                $('#addUserDefault').show();
                $('#addUserResponse').hide();
                break;
            case app.pages.ADDLOCATION:
                $("#nameLocation").val("");
                $("#locationID").val("");
                $('#addLocationDefault').show();
                $('#addLocationResponse').hide();
                $('#addLocationConfiguration').hide();
                break;
            case app.pages.EMPVER:
                document.getElementById("fiscalcodeSelect").innerHTML = '<option value="doNothing" selected> -- Select an Employee -- </option>';
                break;
            default:
                break;
        }


    },

    writeToNFC: function (value1, value2) {
        var message = [value1, value2];
        // write the record to the tag:
        nfc.write(
            message, // write the record itself to the tag
            function () { // when complete, run app callback function:
                alert("Device scritto correttamente");
            },
            // app function runs if the write command fails:
            function (reason) {
                alert("There is a problem: " + reason);
            }
        );
    }

};