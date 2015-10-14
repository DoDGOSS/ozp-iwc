var ozpIwc = ozpIwc || {};
ozpIwc.transport = ozpIwc.transport || {};
ozpIwc.transport.participant = ozpIwc.transport.participant || {};
ozpIwc.wiring = ozpIwc.wiring || {};
/**
 * @module ozpIwc.transport
 * @submodule ozpIwc.transport.participant
 */


ozpIwc.transport.participant = (function (log, participant, transport, util, wiring) {

    var debuggerGen = function (Base) {
        /**
         * An abstract Debugger participant. Used by a factory to generate transport specific debuggers.
         *
         * @class Debugger
         * @namespace ozpIwc.transport.participant
         * @constructor
         * @abstract
         *
         */
        var Debugger = util.extend(Base, function (config) {
            Base.apply(this, arguments);
            this.name = "DebuggerParticipant";
            this.router = config.router;
            this.peer = this.router.peer;
        });

        //----------------------------------------------------------------
        // Private Methods
        //----------------------------------------------------------------
        /**
         * A utility for the debugger to respond to whom sent it a packet.
         * @method debuggerResponse
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.Transport.PacketContext} packet
         */
        var debuggerResponse = function (participant, packet) {
            packet = packet || {};
            packet.src = packet.src || "$transport";
            packet.response = packet.response || "ok";
            packet = participant.fixPacket(packet);
            participant.sendToRecipient(packet);
        };

        //----------------------------------------------------------------
        // dst: $transport, resource: traffic
        //----------------------------------------------------------------
        /**
         * Handler method for $transport packets of resource "traffic".
         * @method handleTrafficPacket
         * @private
         * @static
         * @param participant
         * @param packet
         */
        var handleTrafficPacket = function (participant, packet) {
            switch (packet.action.trim().toLowerCase()) {
                case "start":
                    enableLogging(participant, packet);
                    break;

                case "stop":
                    disableLogging(participant, packet);
                    break;
            }
        };


        //----------------------------------------------------------------
        // dst: $transport, resource: traffic, action: start
        //----------------------------------------------------------------
        var logging = {
            enabled: false,
            watchList: [],
            eventHandler: undefined,
            notifyListeners: function (participant, event) {
                for (var i in logging.watchList) {
                    debuggerResponse(participant, {
                        response: "changed",
                        replyTo: logging.watchList[i].msgId,
                        entity: event
                    });
                }
            }
        };

        /**
         *
         * Starts the debugger participant sending packet logs.
         * @method enableLogging
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var enableLogging = function (participant, packet) {
            logging.watchList[packet.msgId] = packet;

            if (!logging.enabled) {
                logging.enabled = true;
                logging.eventHandler = function(event){
                    logging.notifyListeners(participant,event);
                };
                participant.peer.on("receive", logging.eventHandler);
                participant.peer.on("send", logging.eventHandler);
            }

            debuggerResponse(participant, {replyTo: packet.msgId});
        };

        /**
         * Stops the debugger participant from sending packet logs.
         * @method disableLogging
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var disableLogging = function (participant, packet) {
            packet = packet || {};
            packet.entity = packet.entity || {};
            if (packet.entity.msgId && logging.watchList[packet.entity.msgId]) {
                delete logging.watchList[packet.entity.msgId];
            }
            if(logging.enabled && logging.watchList.length === 0){
                logging.enabled = false;
                participant.peer.off("receive", logging.eventHandler);
                participant.peer.off("send", logging.eventHandler);
            }

            debuggerResponse(participant, {replyTo: packet.msgId});

        };

        //----------------------------------------------------------------
        // dst: $transport, resource: apis
        //----------------------------------------------------------------
        /**
         * Routing of $transport packets for the resource "apis"
         * @method handleApiPacket
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleApiPacket = function (participant, packet) {
            switch (packet.action.trim().toLowerCase()) {
                case "getendpoints":
                    handleEndpointGather(participant, packet);
                    break;
            }
        };

        //----------------------------------------------------------------
        // dst: $transport, resource: apis, action: getEndpoint
        //----------------------------------------------------------------
        /**
         * A handler for the $transport packet action "getEndpoints" on resource "apis"
         * @method handleEndpointGather
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleEndpointGather = function (participant, packet) {
            // Wait until the initial endpoint gather has resolved to get endpoint paths.
            var promise = wiring.endpointInitPromise || Promise.resolve();
            promise.then(function () {
                var data = [];
                for (var i in wiring.apis) {
                    var api = wiring.apis[i];
                    for (var j in api.endpoints) {
                        var ep = api.endpoints[j];
                        var endpoint = ozpIwc.api.endpoint(ep.link);
                        data.push({
                            'name': api.name,
                            'rel': endpoint.name,
                            'path': endpoint.baseUrl
                        });
                    }
                }
                debuggerResponse(participant, {replyTo: packet.msgId, entity: data});
            });
        };


        //----------------------------------------------------------------
        // dst: $transport, resource: metrics
        //----------------------------------------------------------------
        /**
         * Routing of $transport packets for the resource "metrics"
         * @method handleMetricPacket
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleMetricPacket = function (participant, packet) {
            switch (packet.action.trim().toLowerCase()) {
                case "getall":
                    handleMetricGather(participant, packet);
                    break;
            }
        };
        //----------------------------------------------------------------
        // dst: $transport, resource: metrics, action: getAll
        //----------------------------------------------------------------
        /**
         * A handler for the $transport packet action "getAll" on resource "metrics"
         * @method handleEndpointGather
         * @private
         * @static
         * @param {Debugger} participant
         * @param {ozpIwc.transport.PacketContext} packet
         */
        var handleMetricGather = function (participant, packet) {
            var metrics = wiring.metrics.allMetrics();
            for (var i in metrics) {
                metrics[i].value = metrics[i].get();
            }
            debuggerResponse(participant, {replyTo: packet.msgId, entity: metrics});
        };

        //----------------------------------------------------------------------
        // Public Properties
        //----------------------------------------------------------------------

        /**
         * Handles $transport packets from the participant.
         * @method handleTransportPacket
         * @override
         * @param {Object} packet
         * @param {Event} event
         */
        Debugger.prototype.handleTransportPacket = function (packet, event) {
            if (typeof(packet.resource) !== "string") {
                transport.participant.SharedWorker.prototype.handleTransportPacket.call(this, packet);
                return;
            }

            switch (packet.resource.trim().toLowerCase()) {
                case "metrics":
                    handleMetricPacket(this, packet);
                    break;
                case "traffic":
                    handleTrafficPacket(this, packet);
                    break;
                case "apis":
                    handleApiPacket(this, packet);
                    break;
                default:
                    break;
            }
        };

        return Debugger;
    };

    participant.SWDebugger = debuggerGen(participant.SharedWorker);
    participant.PMDebugger = debuggerGen(participant.PostMessage);

    return participant;
}(ozpIwc.log, ozpIwc.transport.participant || {}, ozpIwc.transport, ozpIwc.util, ozpIwc.wiring));