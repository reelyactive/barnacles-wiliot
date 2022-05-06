/**
 * Copyright reelyActive 2022
 * We believe in an open Internet of Things
 */


const mqtt = require('mqtt');


const WILIOT_RELAY_TYPE = 'wiliot';
const WILIOT_CLOUD_HOST = 'ssl://mqttv2.wiliot.com';
const TOPIC_ROOT = 'data-prod/';
const DEFAULT_GATEWAY_TYPE = 'pareto-anywhere';
const DEFAULT_GATEWAY_NAME = 'ParetoAnywhere';
const DEFAULT_PRINT_ERRORS = false;


/**
 * BarnaclesWiliot Class
 * Relays payloads from barnacles to the Wiliot Cloud via MQTT.
 */
class BarnaclesWiliot {

  /**
   * BarnaclesWiliot constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    let self = this;
    options = options || {};

    this.ownerId = options.ownerId;
    this.gatewayId = options.gatewayId;
    this.accessToken = options.accessToken;
    this.gatewayType = options.gatewayType || DEFAULT_GATEWAY_TYPE;
    this.gatewayName = options.gatewayName || DEFAULT_GATEWAY_NAME;
    this.topic = TOPIC_ROOT + this.ownerId + '/' + this.gatewayId;
    this.client = createMqttClient(self);
    this.printErrors = options.printErrors || DEFAULT_PRINT_ERRORS;
  }

  /**
   * Handle an outbound event.
   * @param {String} name The outbound event name.
   * @param {Object} data The outbound event data.
   */
  handleEvent(name, data) {
    let self = this;

    switch(name) {
      case 'relay':
        return handleRelay(self, data);
    }
  }

}


/**
 * Handle the given relay data by forwarding to the Wiliot Cloud.
 * @param {BarnaclesWiliot} instance The BarnaclesWiliot instance.
 */
function createMqttClient(instance) {
  let options = {
      username: instance.ownerId,
      password: instance.accessToken
  };
  let client = mqtt.connect(WILIOT_CLOUD_HOST, options);

  client.on('connect', () => {
    console.log('barnacles-wiliot connected to Wiliot Cloud MQTT broker');
  });

  client.on('error', (error) => {
    if(instance.printErrors) {
      console.log('barnacles-wiliot:', error);
    }
  });

  return client;
}


/**
 * Handle the given relay data by forwarding to the Wiliot Cloud.
 * @param {BarnaclesWiliot} instance The BarnaclesWiliot instance.
 * @param {Object} relay The relay data.
 */
function handleRelay(instance, relay) {
  if(!relay.hasOwnProperty('type') || (relay.type !== WILIOT_RELAY_TYPE)) {
    return;
  }

  let message = {
      gatewayId: instance.gatewayId,
      gatewayType: instance.gatewayType,
      gatewayName: instance.gatewayName,
      timestamp: Date.now(),
      packets: []
  };

  // TODO: use timestamp from relay data
  packets.push({ timestamp: Date.now(), payload: relay.payload });

  instance.client.publish(instance.topic, message);
}


module.exports = BarnaclesWiliot;
