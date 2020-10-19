// only works for ASCII characters
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// only works for ASCII characters
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

// var SERVICE_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
// var TX_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';
// var RX_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';

var SERVICE_UUID = '0000ea01-0000-1000-8000-00805f9b34fb';
var TX_UUID      = '0000ea02-0000-1000-8000-00805f9b34fb';
var RX_UUID      = '0000ea03-0000-1000-8000-00805f9b34fb';


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        sendButton.addEventListener('click', this.updateCharacteristicValue, false);
    },
    onDeviceReady: function() {
        var property = blePeripheral.properties;
        var permission = blePeripheral.permissions;

        blePeripheral.onWriteRequest(app.didReceiveWriteRequest);
        blePeripheral.onBluetoothStateChange(app.onBluetoothStateChange);

        // 2 different ways to create the service: API calls or JSON
        //app.createService();
        app.createServiceJSON();

    },
    createService: function() {
        // https://learn.adafruit.com/introducing-the-adafruit-bluefruit-le-uart-friend/uart-service
        // Characteristic names are assigned from the point of view of the Central device

        var property = blePeripheral.properties;
        var permission = blePeripheral.permissions;

        Promise.all([
            blePeripheral.createService(SERVICE_UUID),
            blePeripheral.addCharacteristic(SERVICE_UUID, TX_UUID, property.WRITE, permission.WRITEABLE),
            blePeripheral.addCharacteristic(SERVICE_UUID, RX_UUID, property.READ | property.NOTIFY, permission.READABLE),
            blePeripheral.publishService(SERVICE_UUID),
            blePeripheral.startAdvertising(SERVICE_UUID, 'UART')
        ]).then(
            function() { console.log ('Created UART Service'); },
            app.onError
        );

        blePeripheral.onWriteRequest(app.didReceiveWriteRequest);
    },
    createServiceJSON: function() {
        // https://learn.adafruit.com/introducing-the-adafruit-bluefruit-le-uart-friend/uart-service
        // Characteristic names are assigned from the point of view of the Central device

        var property = blePeripheral.properties;
        var permission = blePeripheral.permissions;

        var uartService = {
            uuid: SERVICE_UUID,
            characteristics: [
                {
                    uuid: TX_UUID,
                    properties: property.WRITE,
                    permissions: permission.WRITEABLE,
                    descriptors: [
                        {
                            uuid: '2901',
                            value: 'Transmit'
                        }
                    ]
                },
                {
                    uuid: RX_UUID,
                    properties: property.READ | property.NOTIFY,
                    permissions: permission.READABLE,
                    descriptors: [
                        {
                            uuid: '2901',
                            value: 'Receive'
                        }
                    ]
                }
            ]
        };

        Promise.all([
            blePeripheral.createServiceFromJSON(uartService),
            blePeripheral.startAdvertising(uartService.uuid, 'UART')
        ]).then(
            function() { console.log ('Created UART Service'); },
            app.onError
        );
    },
    updateCharacteristicValue: function() {
        var input = document.querySelector('input');
        var bytes = stringToBytes(input.value);

        var success = function() {
            outputDiv.innerHTML += messageInput.value + '<br/>';
            console.log('Updated RX value to ' + input.value);
        };
        var failure = function() {
            console.log('Error updating RX value.');
        };
        
        console.log("sending values: " + input.value);
        blePeripheral.setCharacteristicValue(SERVICE_UUID, RX_UUID, bytes).
            then(success, failure);

    },
    didReceiveWriteRequest: function(request) {
        var message = bytesToString(request.value);
        console.log(message);
        // warning: message should be escaped to avoid javascript injection
        outputDiv.innerHTML += '<i>' + message + '</i><br/>';
    },
    onBluetoothStateChange: function(state) {
        console.log('Bluetooth State is', state);
        outputDiv.innerHTML += 'Bluetooth  is ' +  state + '<br/>';
    }
};

// app.initialize();


var vueApp = new Vue({
    el: '#vueApp',
    data: {
      tabs: 
      [
        {
          tabId: "Win", 
          show: true, 
          btns: [
            {
              title: "Mute All",
              text: "",
              action: "Mute / Unmute", 
              icon: "mic-mute-fill.svg",
              badge: "All", 
              btn_outline: "btn-outline-primary" 
            },
            {
              title: "Mute (except host)",
              text: "Mute/unmute audio for everyone except host",
              action: "Mute / Unmute", 
              icon: "mic-mute.svg",
              badge: "Except Host", 
              btn_outline: "btn-outline-primary"
            },
            {
              title: "Raise Hand",
              text: "",
              action: "Raise Hand", 
              icon: "hand-index.svg", 
              btn_outline: "btn-outline-danger"
            },
            {
              title: "Start / Stop Video",
              text: "",
              action: "Start / Stop", 
              icon: "camera-video-off.svg", 
              btn_outline: "btn-outline-primary"
            },
            {
              title: "Speaker / Gallery",
              text: "",
              action: "Speaker / Gallery", 
              icon: "people-fill.svg", 
              btn_outline: "btn-outline-primary"
            },
            {
              title: "Recording",
              text: "",
              action: "Recording", 
              icon: "file-earmark-arrow-down.svg",
              badge: "Local", 
              btn_outline: "btn-outline-primary"
            },
            {
              title: "Recording",
              text: "",
              action: "Recording", 
              icon: "cloud-arrow-up.svg",
              badge: "Cloud", 
              btn_outline: "btn-outline-primary"
            },
            {
              title: "Pause / Resume Recording",
              text: "",
              action: "Pause / Resume Recording", 
              icon: "pause-fill.svg", 
              btn_outline: "btn-outline-primary"
            }
          ]
        },
        {
          tabId: "Mac",
          show:false, 
          btns: []
        }, 
        {
          tabId: "iPad", 
          show:false, 
          btns: []
        }, 
        {
          tabId: "Andriod", 
          show:false, 
          btns: []
        }
      ]
    },
    methods: {
      showTab(tabObj) {
        console.debug("show tab: " + tabObj.tabId);
        for (tab in this.tabs) {
          if (tab.tabId == tabObj.tabId) {
            tab.show = true;
          } else {
            tab.show = false;
          }
        }
      },
    }
  })
