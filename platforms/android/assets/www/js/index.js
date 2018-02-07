var TOKEN_ID = "";
var app = {
    pages: {
        MAIN: "main_page",
        READ: "wh_page",
        WRITE: "ms_page",
        HOME: "home",
        EMPVER: "configure_bracelet_page",
        ADDUSER: "add_employee_page",
        ADDLOCATION: "add_location_page",
        CONFLOCATION: "configure_location_page",
        ADDORDER: "add_order_page",
        CONFORDER: "configure_order_page",
        WRITEORDER: "write_order_page"
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
        //app.onNfc = app.doNothingOnNfc;

        switch (currentPage) {
            case app.pages.HOME:
                var tag = nfcEvent.tag;
                var managerID = ndef.textHelper.decodePayload(tag.ndefMessage[0].payload);
                var myWarehouseID = ndef.textHelper.decodePayload(tag.ndefMessage[1].payload);
                var myTokenID = ndef.textHelper.decodePayload(tag.ndefMessage[2].payload);
                app.setToken(myTokenID);
                app.getUser(managerID, myWarehouseID);
                break;
            case app.pages.ADDUSER:
                if ($("#addUserConfiguration").is(":visible")) {
                    app.writeUserToNFC($('#fiscalcode').val(), $('#warehouseID').val());
                }
                break;
            case app.pages.EMPVER:
                if ($("#verifyUserResponse").is(":visible")) {
                    app.writeUserToNFC($('#fiscalcodeSelect').find(":selected").val(), $('#warehouseID').val());
                }
                break;
            case app.pages.ADDLOCATION:
                if ($("#addLocationConfiguration").is(":visible")) {
                    app.writeToNFC($('#locationID').val(), $('#warehouseID').val());
                }
                break;
            case app.pages.CONFLOCATION:
                if ($("#verifyLocationResponse").is(":visible")) {
                    app.writeToNFC($('#locationIDSelect').find(":selected").val(), $('#warehouseID').val());
                }
                break;
            case app.pages.ADDORDER:
                if ($("#addOrderConfiguration").is(":visible")) {
                    app.writeToNFC($('#addOrderID').val(), $('#warehouseID').val());
                }
                break;
            case app.pages.WRITEORDER:
                if ($("#writeOrderResponse").is(":visible")) {
                    app.writeToNFC($('#writeOrderSelect').find(":selected").val(), $('#warehouseID').val());
                }
                break;
            default:
                //doNothing();
                break;
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
                    if (!$("#errorBox").is(":visible")) {
                        newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i> The user is not in the database </center></div>' + document.getElementById("addLocationDefault").innerHTML;
                        document.getElementById("addLocationDefault").innerHTML = newDiv;
                    }
                }
            },
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.error + '</center></div>' + document.getElementById("addLocationDefault").innerHTML;
                    document.getElementById("addLocationDefault").innerHTML = newDiv;

                } else {
                    document.getElementById("locationID").value = response.ID;
                    $("#addLocationResponse").show();
                    $("#addLocationDefault").hide();
                    app.disableInput();
                }

            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json',
            beforeSend: function (xhr, settings) { xhr.setRequestHeader('Authorization', 'Bearer ' + TOKEN_ID); }
        });
    },

    getLocation: function (locID, WhID) {

        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/' + WhID + '/location/' + locID + '/',
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("verifyLocationDefault").innerHTML;
                    document.getElementById("verifyLocationDefault").innerHTML = newDiv;
                } else {
                    var currentPage = $.mobile.activePage.attr('id');
                    switch (currentPage) {
                        case app.pages.ADDLOCATION:
                            //controlla se è ruolo amministratore accede altrimenti no
                            $("#verifyLocationDefault").hide();
                            $("#verifyLocationResponse").show();
                            app.disableInput();
                            break;
                        case app.pages.CONFLOCATION:
                            //if ($("#verifyLocationDefault").is(":visible")) {
                            document.getElementById(locID).innerHTML = response.name;
                            //}
                            break;
                        default:
                        //doNothing();
                    }
                }
            },
            error: function (response) {
                newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + "Ops! There is a problem" + '</center></div>' + document.getElementById("addUserDefault").innerHTML;
                document.getElementById("addUserDefault").innerHTML = newDiv;
            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json',
            beforeSend: function (xhr, settings) { xhr.setRequestHeader('Authorization', 'Bearer ' + TOKEN_ID); }
        });
    },

    getLocations: function () {
        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/' + $('#warehouseID').val() + '/location/list/',
            error: function (xhr, data) {
                if (xhr.status == 404) {
                    if (!$("#errorBox").is(":visible")) {
                        newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i> The user is not in the database </center></div>' + document.getElementById("verifyLocationDefault").innerHTML;
                        document.getElementById("verifyLocationDefault").innerHTML = newDiv;
                    }
                }
            },
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("verifyLocationDefault").innerHTML;
                    document.getElementById("verifyLocationDefault").innerHTML = newDiv;
                } else {
                    var sel = document.getElementById('locationIDSelect');
                    var tmp = new Array();
                    tmp = response;
                    for (i = 0; i < tmp.length; i++) {
                        var opt = document.createElement('option');
                        opt.id = tmp[i].ID;
                        opt.value = tmp[i].ID;
                        sel.appendChild(opt);
                        app.getLocation(tmp[i].ID, $('#warehouseID').val());
                    }
                }
            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json',
            beforeSend: function (xhr, settings) { xhr.setRequestHeader('Authorization', 'Bearer ' + TOKEN_ID); }
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
                roleID: $('#roleSelect').find(":selected").val(),
                warehouseID: $('#warehouseID').val(),
                mail: $('#email').val()
            }),
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.error + '</center></div>' + document.getElementById("addUserDefault").innerHTML;
                    document.getElementById("addUserDefault").innerHTML = newDiv;
                } else {
                    $("#addUserDefault").hide();
                    $("#addUserResponse").show();
                    app.disableInput();
                    app.getAccessToken();
                }
            },
            error: function (response) {
                newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + "Ops! There is a problem" + '</center></div>' + document.getElementById("addUserDefault").innerHTML;
                document.getElementById("addUserDefault").innerHTML = newDiv;
            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json',
            beforeSend: function (xhr, settings) { xhr.setRequestHeader('Authorization', 'Bearer ' + TOKEN_ID); }
        });

    },

    getAccessToken: function () {
        var win = window.open("http://petprojects.altervista.org/Authentication/", "_blank", "location=no");

        win.addEventListener("loadstop", function () {

            // Clear out the name in localStorage for subsequent opens.
            win.executeScript({ code: "localStorage.setItem( 'tokenID', '' );" });

            // Start an interval
            var loop = setInterval(function () {

                // Execute JavaScript to check for the existence of a name in the
                // child browser's localStorage.
                win.executeScript(
                    {
                        code: "localStorage.getItem( 'tokenID' )"
                    },
                    function (values) {
                        var tokenid = values[0];

                        // If a name was set, clear the interval and close the InAppBrowser.
                        if (tokenid) {
                            clearInterval(loop);
                            win.close();
                            TOKEN_ID = tokenid;
                            document.getElementById("token").value = tokenid;
                            document.getElementById("tokenConfigure").value = tokenid;
                        }
                    }
                );
            });
        });

    },

    getUser: function (userID, myWhID) {
        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/' + myWhID + '/employee/' + userID + '/',
            error: function (xhr, data) {
                if (xhr.status == 404) {
                    if (!$("#errorBox").is(":visible")) {
                        newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i> The user is not in the database </center></div>' + document.getElementById("homeLoginContent").innerHTML;
                        document.getElementById("homeLoginContent").innerHTML = newDiv;
                    }
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
            dataType: 'json',
            beforeSend: function (xhr, settings) { xhr.setRequestHeader('Authorization', 'Bearer ' + TOKEN_ID); }
        });
    },

    getUsers: function () {
        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/' + $('#warehouseID').val() + '/employee/list/',
            error: function (xhr, data) {
                if (xhr.status == 404) {
                    if (!$("#errorBox").is(":visible")) {
                        newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i> The user is not in the database </center></div>' + document.getElementById("verifyUserDefault").innerHTML;
                        document.getElementById("verifyUserDefault").innerHTML = newDiv;
                    }
                }
            },
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
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json',
            beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + TOKEN_ID); }
        });
    },

    addOrder: function () {
        $.ajax({
            type: 'POST',
            url: 'http://petprojects.altervista.org/' + $('#warehouseID').val() + '/outbound/',
            data: JSON.stringify({
                toWarehouseID: $('#warehouseSelect').find(":selected").val(),
                date: app.getTodayDate(),
            }),
            success: function (response) {
                if (response.error == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.error + '</center></div>' + document.getElementById("addOrderDefault").innerHTML;
                    document.getElementById("addOrderDefault").innerHTML = newDiv;
                } else {
                    $("#addOrderDefault").hide();
                    $("#addOrderResponse").show();
                    $("#orderIDdiv").show();
                    document.getElementById('addOrderID').value = response.OrderID;
                }
            },
            error: function (response) {
                newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + "Ops! There is a problem" + '</center></div>' + document.getElementById("addOrderDefault").innerHTML;
                document.getElementById("addOrderDefault").innerHTML = newDiv;
            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json',
            beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + TOKEN_ID); }
        });
    },

    getOrders: function () {
        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/' + $('#warehouseID').val() + '/outbound/list/',
            error: function (xhr, data) {
                if (xhr.status == 404) {
                    if (!$("#errorBox").is(":visible")) {
                        newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i> The order list is not in the database </center></div>' + document.getElementById("addOrderDefault").innerHTML;
                        document.getElementById("addOrderDefault").innerHTML = newDiv;
                    }
                }
            },
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("verifyLocationDefault").innerHTML;
                    document.getElementById("verifyLocationDefault").innerHTML = newDiv;
                } else {
                    var currentPage = $.mobile.activePage.attr('id');

                    switch (currentPage) {
                        case app.pages.CONFORDER:
                            var sel = document.getElementById('orderSelect');
                            var tmp = new Array();
                            tmp = response;
                            for (i = 0; i < tmp.length; i++) {
                                var opt = document.createElement('option');
                                opt.id = tmp[i].order.ID;
                                opt.value = tmp[i].order.ID;
                                //opt.innerText = tmp[i].date;
                                sel.appendChild(opt);
                                app.getOrderByDate(tmp[i].order.ID, tmp[i].date);
                            }
                            break;
                        case app.pages.WRITEORDER:
                            var sel = document.getElementById('writeOrderSelect');
                            var tmp = new Array();
                            tmp = response;
                            for (i = 0; i < tmp.length; i++) {
                                var opt = document.createElement('option');
                                opt.id = "write" + tmp[i].order.ID;
                                opt.value = tmp[i].order.ID;
                                sel.appendChild(opt);
                                app.getOrderByDate(tmp[i].order.ID, tmp[i].date);
                            }
                            break;
                        default:
                            break;
                    }
                }
            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json',
            beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + TOKEN_ID); }
        });
    },

    getOrderByDate: function (orderID, orderDate) {

        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/' + $('#warehouseID').val() + '/outbound/' + orderID + '/',
            error: function (xhr, data) {
                if (xhr.status == 404) {
                    if (!$("#errorBox").is(":visible")) {
                        newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i> The order is not in the database </center></div>' + document.getElementById("verifyOrderDefault").innerHTML;
                        document.getElementById("verifyOrderDefault").innerHTML = newDiv;
                    }
                }
            },
            success: function (response) {
                var currentPage = $.mobile.activePage.attr('id');
                switch (currentPage) {
                    case app.pages.CONFORDER:
                        document.getElementById(orderID).innerHTML = orderDate + " Order: " + response.to.ID;
                        break;
                    case app.pages.WRITEORDER:
                        document.getElementById("write" + orderID).innerHTML = orderDate + " Order: " + response.to.ID;
                        break;
                    default:
                    //doNothing();
                }
            },
            accept: "application/json",
            dataType: 'json',
            beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + TOKEN_ID); }
        });
    },

    getProducts: function () {

        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/' + $('#warehouseID').val() + '/equipment_material/list/',
            error: function (xhr, data) {
                if (xhr.status == 404) {
                    if (!$("#errorBox").is(":visible")) {
                        newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i> The product list is not in the database </center></div>' + document.getElementById("configureOrderDefault").innerHTML;
                        document.getElementById("configureOrderDefault").innerHTML = newDiv;
                    }
                }
            },
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("configureOrderDefault").innerHTML;
                    document.getElementById("configureOrderDefault").innerHTML = newDiv;
                } else {
                    var tmp = new Array();
                    tmp = response;
                    for (i = 0; i < tmp.length; i++) {
                        app.getProductByWarehouse(tmp[i].serial.ID);
                    }
                }
            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json',
            beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + TOKEN_ID); }
        });
    },

    getProductByWarehouse: function (serialID) {

        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/' + $('#warehouseID').val() + '/equipment_material/' + serialID + '/',
            error: function (xhr, data) {
                if (xhr.status == 404) {
                    if (!$("#errorBox").is(":visible")) {
                        newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i> The product is not in the database </center></div>' + document.getElementById("verifyOrderDefault").innerHTML;
                        document.getElementById("verifyOrderDefault").innerHTML = newDiv;
                    }
                }
            },
            success: function (response) {
                var currentPage = $.mobile.activePage.attr('id');
                switch (currentPage) {
                    case app.pages.CONFORDER:
                        if (response.status == "Available") {
                            if (document.getElementById(response.product.ID) == null) {
                                var sel = document.getElementById('productSelect');
                                var opt = document.createElement('option');
                                opt.id = response.product.ID;
                                opt.value = response.product.ID;
                                sel.appendChild(opt);
                                app.getProductDetails(response.product.ID);
                            }
                        }
                        break;
                    default:
                    //doNothing();
                }
            },
            accept: "application/json",
            dataType: 'json',
            beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + TOKEN_ID); }
        });
    },

    getProductDetails: function (productID) {

        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/catalog/' + productID + '/',
            error: function (xhr, data) {
                if (xhr.status == 404) {
                    if (!$("#errorBox").is(":visible")) {
                        newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i> The product is not in the database </center></div>' + document.getElementById("verifyOrderDefault").innerHTML;
                        document.getElementById("verifyOrderDefault").innerHTML = newDiv;
                    }
                }
            },
            success: function (response) {
                var currentPage = $.mobile.activePage.attr('id');
                switch (currentPage) {
                    case app.pages.CONFORDER:
                        document.getElementById(productID).innerText = response.name + " - " + response.model;
                        break;
                    default:
                    //doNothing();
                }
            },
            accept: "application/json",
            dataType: 'json',
            beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + TOKEN_ID); }
        });
    },

    addProductToOrder: function () {
        $.ajax({
            type: 'POST',
            url: 'http://petprojects.altervista.org/' + $('#warehouseID').val() + '/outbound/' + $('#orderSelect').find(":selected").val() + '/batch/',
            data: JSON.stringify({
                productID: $('#productSelect').find(":selected").attr("id"),
                quantity: $('#quantityConfigureOrder').val()
            }),
            error: function (xhr, data) {
                if (xhr.status == 404) {
                    if (!$("#errorBox").is(":visible")) {
                        newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i> The order already contains this product </center></div>' + document.getElementById("configureOrderDefault").innerHTML;
                        document.getElementById("configureOrderDefault").innerHTML = newDiv;
                    }
                }
            },
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.error + '</center></div>' + document.getElementById("configureOrderDefault").innerHTML;
                    document.getElementById("configureOrderDefault").innerHTML = newDiv;

                } else {
                    $("#configureOrderResponse").show();
                    document.getElementById("quantityConfigureOrder").value = "";
                    app.disableInput();
                }

            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json',
            beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + TOKEN_ID); }
        });
    },

    getWarehouse: function (whID) {
        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/warehouse/' + whID + '/',
            error: function (xhr, data) {
                if (xhr.status == 404) {
                    if (!$("#errorBox").is(":visible")) {
                        newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i> The user is not in the database </center></div>' + document.getElementById("addOrderDefault").innerHTML;
                        document.getElementById("addOrderDefault").innerHTML = newDiv;
                    }
                }
            },
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("verifyLocationDefault").innerHTML;
                    document.getElementById("verifyLocationDefault").innerHTML = newDiv;
                } else {
                    var currentPage = $.mobile.activePage.attr('id');
                    switch (currentPage) {
                        case app.pages.ADDORDER:
                            if ($("#addOrderDefault").is(":visible")) {
                                document.getElementById(whID).innerHTML = response.name + " - " + response.city + ", " + response.prov + ", " + response.country;
                            }
                            break;
                        default:
                        //doNothing();
                    }
                }
            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json',
            beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + TOKEN_ID); }
        });
    },

    getWarehouses: function () {
        $.ajax({
            type: 'GET',
            url: 'http://petprojects.altervista.org/warehouse/list/',
            error: function (xhr, data) {
                if (xhr.status == 404) {
                    if (!$("#errorBox").is(":visible")) {
                        newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i> The user is not in the database </center></div>' + document.getElementById("addOrderDefault").innerHTML;
                        document.getElementById("addOrderDefault").innerHTML = newDiv;
                    }
                }
            },
            success: function (response) {
                if (response.status == "error") {
                    newDiv = '<div id="errorBox" class="errorBox"><center><i class="fa fa-times-circle"></i>' + response.message + '</center></div>' + document.getElementById("verifyLocationDefault").innerHTML;
                    document.getElementById("verifyLocationDefault").innerHTML = newDiv;
                } else {
                    var sel = document.getElementById('warehouseSelect');
                    var tmp = new Array();
                    tmp = response;
                    for (i = 0; i < tmp.length; i++) {
                        var opt = document.createElement('option');
                        opt.id = tmp[i].ID;
                        opt.value = tmp[i].ID;
                        sel.appendChild(opt);
                        app.getWarehouse(tmp[i].ID);
                    }
                }
            },
            contentType: "application/json",
            accept: "application/json",
            dataType: 'json',
            beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer ' + TOKEN_ID); }
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
                app.getLocations();
                break;
            case app.pages.ADDORDER:
                app.getWarehouses();
                break;
            case app.pages.CONFORDER:
                app.getOrders();
                app.getProducts();
                break;
            case app.pages.WRITEORDER:
                app.getOrders();
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
                app.getAccessToken();
                if ($('#fiscalcodeSelect').find(":selected").val() != "doNothing") {
                    $("#verifyUserDefault").hide();
                    $("#verifyUserResponse").show();
                } else {
                    alert("Select an employee first");
                }
                break;
            case app.pages.CONFLOCATION:
                if ($('#locationIDSelect').find(":selected").val() != "doNothing") {
                    $("#verifyLocationDefault").hide();
                    $("#verifyLocationResponse").show();
                } else {
                    alert("Select a location first");
                }
                break;
            case app.pages.CONFORDER:
                if (($('#orderSelect').find(":selected").val() != "doNothing") && ($('#productSelect').find(":selected").val() != "doNothing")) {
                    $("#configureOrderResponse").show();
                } else {
                    alert("Select an order and a product first");
                }
                break;
            case app.pages.ADDORDER:
                $("#addOrderConfiguration").show();
                $("#addOrderResponse").hide();
                break;
            case app.pages.WRITEORDER:
                if ($('#writeOrderSelect').find(":selected").val() != "doNothing") {
                    $("#writeOrderDefault").hide();
                    $("#writeOrderResponse").show();
                } else {
                    alert("Select an order first");
                }
                break;
            default:
                break;
        }
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
                document.getElementById('roleSelect').setAttribute("disabled", "disabled");
                $("#roleSelect").parent().addClass("ui-state-disabled");
                document.getElementById('email').setAttribute("disabled", "disabled");
                $("#email").parent().addClass("ui-state-disabled");
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
                document.getElementById('roleSelect').removeAttribute("disabled")
                $("#roleSelect").parent().removeClass("ui-state-disabled");
                document.getElementById('email').removeAttribute("disabled")
                $("#email").parent().removeClass("ui-state-disabled");
                break;
            case app.pages.EMPVER:
                $("#verifyUserDefault").show();
                $("#verifyUserResponse").hide();
                break;
            case app.pages.ADDLOCATION:
                document.getElementById('nameLocation').removeAttribute("disabled");
                $("#nameLocation").parent().removeClass("ui-state-disabled");
                break;
            case app.pages.CONFLOCATION:
                $("#verifyLocationDefault").show();
                $("#verifyLocationResponse").hide();
                break;
            case app.pages.ADDORDER:
                $("#addOrderDefault").show();
                $("#addOrderConfiguration").hide();
                $("#addOrderResponse").hide();
                $("#orderIDdiv").hide();
                break;
            case app.pages.WRITEORDER:
                $("#writeOrderDefault").show();
                $("#writeOrderResponse").hide();
                break;
            default:
                break;
        }
    },

    clearInput: function (nextPage) {
        var errorBox = document.getElementById('errorBox');
        if (errorBox != null) errorBox.parentNode.removeChild(errorBox);

        switch (nextPage) {
            case app.pages.ADDUSER:
                $("#firstname").val("");
                $("#lastname").val("");
                $("#birthdate").val("");
                $("#fiscalcode").val("");
                $("#email").val("");
                $("#token").val("");
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
                $("#tokenConfigure").val("");
                break;
            case app.pages.CONFLOCATION:
                document.getElementById("locationIDSelect").innerHTML = '<option value="doNothing" selected> -- Select a Location -- </option>';
                break;
            case app.pages.CONFORDER:
                document.getElementById("orderSelect").innerHTML = '<option value="doNothing" selected> -- Select an Order -- </option>';
                document.getElementById("productSelect").innerHTML = '<option value="doNothing" id="productSelectStandard" selected> -- Select a Product -- </option>';
                break;
            case app.pages.ADDORDER:
                document.getElementById("warehouseSelect").innerHTML = '<option value="doNothing" selected> -- Select a Warehouse -- </option>';
                break;
            case app.pages.WRITEORDER:
                document.getElementById("writeOrderSelect").innerHTML = '<option value="doNothing" selected> -- Select an Order -- </option>';
                break;
            default:
                break;
        }
    },

    writeToNFC: function (value1, value2) {
        var message = [ndef.textRecord(value1), ndef.textRecord(value2)];
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
    },

    writeUserToNFC: function (value1, value2) {
        var message = [ndef.textRecord(value1), ndef.textRecord(value2), ndef.textRecord(TOKEN_ID)];
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
    },

    getTodayDate: function () {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        today = yyyy + '-' + mm + '-' + dd;

        return today;
    },

    setToken: function (value) {
        TOKEN_ID = value;
    }

};