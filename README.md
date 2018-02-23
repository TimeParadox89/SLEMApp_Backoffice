# SLEMapp Backoffice

A Backoffice application to manage the main functionality of the "State and Location of Equipment and Material" app. 

This has been build and designed for [Android](https://www.android.com).
It requires NFC to login to the application and it helps to write on the NFC the information for the end-users, the employee or the orders and locations.

## Getting Started

This is an application developed through the [Apache Cordova](https://cordova.apache.org) framework, tested via [Adobe PhoneGapp](https://phonegap.com) for the net functionality in-browser.
The user interface is implemented through [JQuery mobile](https://jquerymobile.com).
The Api call to the [SLEM-Api](https://github.com/albvol/SLEM-Api) are implemented via Ajax.

### NFC

The nfc plugin used is the [PhoneGapp-NFC](https://github.com/chariotsolutions/phonegap-nfc)

### Installing

1. Once Apache Cordova is installed, just download the entire project.

2. Download and install the [SLEM-Api](https://github.com/albvol/SLEM-Api), and configure it.

3. Change the URL in the API calls in www\js\index.js

4. Change the OAuth URL request.

5. Build and run on your Android Device.

## SLEM Ecosystem

* [SLEMapp](https://github.com/TimeParadox89/SLEMapp) - The SLEM application
* [SLEMapp Backoffice](https://github.com/TimeParadox89/SLEMApp_Backoffice) - The Backoffice Application
* [SLEM WriteToNFC](https://github.com/TimeParadox89/SLEMApp-WriteToNFC) - The first access application
* [SLEM-Api](https://github.com/albvol/SLEM-Api) -  The SLEM Api system

## Contributors

[Iannotta Erennio](https://github.com/TimeParadox89) , 
[Pappalardo Francesca](https://github.com/kikkatigre).
