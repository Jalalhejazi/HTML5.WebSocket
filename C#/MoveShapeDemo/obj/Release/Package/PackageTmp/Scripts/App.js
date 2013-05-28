$(function () {
    var moveShapeHub = $.connection.moveShapeHub,
        $shape = $("#shape"),
        // Send a maximum of 10 messages per second 
        // (mouse movements trigger a lot of messages)
        messageFrequency = 10,
        // Determine how often to send messages in
        // time to abide by the messageFrequency
        updateRate = 1000 / messageFrequency,
        shapeModel = {
            left: 0,
            top: 0
        },
        moved = false;

    moveShapeHub.client.updateShape = function (model) {
        shapeModel = model;
        // Slowly move the shape towards the new location (interpolate)
        // The updateInterval is used as the duration because by the time 
        // we get to the next location we want to be at the "last" location
        // We also clear the animation queue so that we start a new animation 
        // and don't lag behind.
        $shape.animate(shapeModel, { duration: updateRate, queue: false });
    };

    $.connection.hub.start().done(function () {
        $shape.draggable({
            drag: function () {
                shapeModel = $shape.offset();
                moved = true;
            }
        });

        // Start the client side server update interval
        setInterval(updateServerModel, updateRate);
    });

    function updateServerModel() {
        // Only update server if we have a new movement
        if (moved) {
            moveShapeHub.server.updateModel(shapeModel);
            moved = false;
        }
    }
});