'use strict';
/* globals _, engine */
window.initGame = () => {
  const command = '5 3 \n 1 1 s\n ffffff\n 2 1 w \n flfffffrrfffffff\n 0 3 w\n LLFFFLFLFL';

  let bounds = [],
    ghosts = [];
  const entities = {
    Ghost: function (vals) {
      this.x = vals.x;
      this.y = vals.y;
      this.o = vals.o;
      this.command = vals.command;
      this.report = () => {
        return 'I died going ' + this.o.toUpperCase() + ' from coordinates: ' + this.x + ', ' + this.y;
      };
    },
    Robo: function (commandValues) {
      this.x = commandValues.x;
      this.y = commandValues.y;
      this.o = commandValues.o.toLowerCase();
      this.command = commandValues.command.toLowerCase();
      this.report = () => {
        return `Position: ${this.x}, ${this.y} | Orientation: ${this.o.toUpperCase()}`;
      };
      this.ticked = () => {
        this.command = _.tail(this.command);
      };
      this.forward = () => {
        switch (this.o) {
        case 'n':
          this.y -= 1;
          break;
        case 'e':
          this.x += 1;
          break;
        case 's':
          this.y += 1;
          break;
        case 'w':
          this.x -= 1;
          break;
        }
        this.ticked();
      };
      this.rr = () => {
        switch (this.o) {
        case 'n':
          this.o = 'e';
          break;
        case 'e':
          this.o = 's';
          break;
        case 's':
          this.o = 'w';
          break;
        case 'w':
          this.o = 'n';
          break;
        }
        this.ticked();
      };
      this.rl = () => {
        switch (this.o) {
        case 'n':
          this.o = 'w';
          break;
        case 'e':
          this.o = 'n';
          break;
        case 's':
          this.o = 'e';
          break;
        case 'w':
          this.o = 's';
          break;
        }
        this.ticked();
      };
    }
  };
  const utils = {
    boundsCheck: function (robo) {
            // if we're not going forward it never matters
      if (robo.command[0] !== 'f') {
        return true;
      }
      switch (robo.o) {
      case 'n':
        return !(robo.y === 0);
      case 'e':
        return !(robo.x === bounds[0]);
      case 's':
        return !(robo.y === bounds[1]);
      case 'w':
        return !(robo.x === 0);
      }
    },
    performCommand : function (robo, command) {
      switch (command) {
      case 'f':
        robo.forward();
        break;
      case 'l':
        robo.rl();
        break;
      case 'r':
        robo.rr();
        break;
      }
    },
    iter: function (item, frag) {
      let li = document.createElement('li');
      li.textContent = item.report();
      frag.appendChild(li);
    }
  };

  const parseInput = function (input) {

    //
    // task #1 
    //
    // replace the 'parsed' variable below to be the string 'command' parsed into an object we can pass to genworld();
    // genworld expects an input object in the form { 'bounds': [3, 8], 'robos': [{x: 2, y: 1, o: 'W', command: 'rlrlff'}]}
    // where bounds represents the top right corner of the plane and each robos object represents the
    // x,y coordinates of a robot and o is a string representing their orientation. a sample object is provided below
    //

    const parsed = _.chain(input)
            .split('\n')
            .toArray()
            .map((item, index, collection) => {
              if (index === 0) {
                let splitBounds = item.split(' ');
                bounds = [parseInt(splitBounds[0], 10), parseInt(splitBounds[1], 10)];
                return { bounds };
              } else if (index % 2 === 0) {
                let prev = collection[index - 1].trim()
                        .split(' ');
                return {
                  x: parseInt(prev[0], 10),
                  y: parseInt(prev[1], 10),
                  o: prev[2],
                  command: item.trim()
                };
              }
            })
            .filter(undefined)
            .reduce((aggregate, item) => {
              if (item.bounds) {
                aggregate.bounds = item.bounds;
                return aggregate;
              }
              aggregate.robos.push(new entities.Robo(item));
              return aggregate;
            }, {
              robos: []
            })
            .value();
    return parsed;
  };

  const tickRobos = robos => {
    // 
    // task #2
    //
    // in this function, write business logic to move robots around the playfield
    // the 'robos' input is an array of objects; each object has 4 parameters.
    // This function needs to edit each robot in the array so that its x/y coordinates
    // and orientation parameters match the robot state after 1 command has been completed. 
    // Also, you need to remove the command the robot just completed from the command list.
    // example input:
    //
    // robos[0] = {x: 2, y: 2, o: 'N', command: 'frlrlrl'}
    //                   |- becomes -|
    // robos[0] = {x: 2, y: 1, o: 'N', command: 'rlrlrl'} 
    //
    // if a robot leaves the bounds of the playfield, it should be removed from the robos
    // array. It should leave a 'scent' in it's place. If another robot–for the duration
    // of its commandset–encounters this 'scent', it should refuse any commands that would
    // cause it to leave the playfield.

    // !== write robot logic here ==!

    let state = _.chain(robos)
            .reduce((aggregate, robo) => {
              const command = _.head(robo.command);
              if (utils.boundsCheck(robo)) {
                    // won't cause lost robo
                utils.performCommand(robo, command);
              } else if (_.filter(ghosts, {
                x: robo.x,
                y: robo.y
              }).length > 0) {

                // remove top command from stack
                robo.ticked();
              } else {
                    // this robo is definitely dead
                aggregate.ghosts.push(new entities.Ghost(robo));
                return aggregate;
              }
              aggregate.robos.push(robo);
              return aggregate;
            }, {
              robos: [],
              ghosts: []
            })
            .value();
    ghosts = ghosts.concat(state.ghosts);
        // return the mutated robos object from the input
    return state.robos;
  };
    // mission summary function
  const missionSummary = robos => {
    // task #3
    // summarize the mission and inject the results into the DOM elements referenced in readme.md

    let [roboDOM, ghostDOM] = [document.createDocumentFragment(), document.createDocumentFragment()];
    let aggro = [{ent: robos, list: roboDOM, dom: 'robots'}, 
      {ent: ghosts, list: ghostDOM, dom: 'lostRobots'}];
    aggro.map(pair => {
      pair.ent.forEach(item => {
        utils.iter(item, pair.list);
      });
      document.getElementById(pair.dom)
              .appendChild(pair.list);
    });
  };
  // leave this alone please
  window.rover = {
    parse: parseInput,
    tick: tickRobos,
    summary: missionSummary,
    command: command
  };
};

