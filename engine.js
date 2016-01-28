// ~~~~~~!!!! please do not edit any code below this comment !!!!!!~~~~~~~;
window.onload = function () {
    window.initGame();
    var canvas = document.getElementById('playfield')
        .getContext('2d'),
        width = document.getElementById('playfield')
        .width * 2,
        height = document.getElementById('playfield')
        .height * 2,
        fontSize = 18,
        gridText = [],
        gameWorld = [],
        gridText = [],
        gameWorld = [];
    canvas.font = 'bold ' + fontSize + 'px monospace';
    canvas.fillStyle = 'black';
    canvas.textAlign = 'center';
    var genworld = function (parsedCommand) {
        //build init world array
        gameWorld = [];
        var bounds = parsedCommand.bounds,
            robos = parsedCommand.robos;
        var row = [];
        for (var i = 0; i < bounds[0]; i++) {
            row.push('.');
        }
        for (var i = 0; i < bounds[1]; i++) {
            var test = [].concat(row);
            gameWorld.push(test);
        }
        var placeRobos = function (robos) {
            for (var i in robos) {
                var robo = robos[i];
                var activeRow = gameWorld[robo.y];
                if (activeRow) {
                    activeRow[robo.x] = robo.o;
                }
            }
        };
        placeRobos(parsedCommand.robos);
        render(gameWorld, parsedCommand.robos);
        var movedRobos = window.rover.tick(robos);
        window.setTimeout(function () {
            genworld(parsedCommand);
        }, 1000);
    };
    //render block
    var render = function (gameWorld, robos) {
        canvas.clearRect(0, 0, width, height);
        for (var i = 0; i < gameWorld.length; i++) {
            var blob = gameWorld[i].join('');
            canvas.fillText(blob, 250, i * fontSize + fontSize);
        }
    };
    // wireup init functions for display
    genworld(window.rover.parse(window.rover.command));
};

