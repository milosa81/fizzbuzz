var fizzBuzzGame = function() {
    var won = 0;
    d3.select('svg').remove();

    d3.selection.prototype.moveToFront = function() {
        return this.each(function() {
            this.parentNode.appendChild(this);
        });
    };

    var fizzesAndBuzzes = [];

    var fizzBuzz = function(count) {
        var arr = [];
        for (var i = 1; i <= count; i += 1) {
            if ((i % 3 === 0) && (i % 5 === 0)) {
                var fizzbuzz = {};
                fizzbuzz.label = 'FizzBuzz';
                fizzbuzz.value = i;
                arr.push(fizzbuzz);
                fizzesAndBuzzes.push(i);
            } else if (i % 3 === 0) {
                var fizz = {};
                fizz.label = 'Fizz';
                fizz.value = i;
                arr.push(fizz);
                fizzesAndBuzzes.push(i);
            } else if (i % 5 === 0) {
                var buzz = {};
                buzz.label = 'Buzz';
                buzz.value = i;
                arr.push(buzz);
                fizzesAndBuzzes.push(i);
            } else {
                var obj = {};
                obj.label = i;
                obj.value = i;
                arr.push(obj);
            }
        }
        return arr;
    }(100);

    var randomNum = fizzesAndBuzzes[Math.floor(Math.random() * fizzesAndBuzzes.length)];
    //var randomNum = 100;

    var width = 800,
        height = 700;

    var rScale = d3.scale.linear()
        .domain([1, 100])
        .range([10, 30]);

    fizzBuzz.forEach(function(item) {
        item.radius = rScale(item.value);
    });

    var force = d3.layout.force()
        .gravity(0.06)
        .charge(function(d, i) {
            return d.radius * -1;
        })
        .nodes(fizzBuzz)
        .size([width, height]);


    var root = fizzBuzz[0];

    var drag = d3.behavior.drag()
        .origin(function(d) {
            return d;
        })
        .on("dragstart", dragstarted)
        .on("drag", dragged)
        .on("dragend", dragended);


    force.start();

    var svg = d3.select('#map')
        .append('svg')
        .attr({
            "width": width,
            "height": height
        });

    svg.append('text').text('FIZZ BUZZ THE GAME: find number ' + randomNum)
        .attr({
            "class": "title",
            "x": width / 2,
            "y": 50,
            "text-anchor": "middle"
        });
    /*
    svg.append('text').text('HOW TO PLAY: Keep clicking on circles unil you hit the right number.')
        .attr({
            "class": "desc",
            "x": width / 2,
            "y": 640,
            "text-anchor": "middle"
        });
*/
    svg.append('foreignObject')
        .attr("width", 800)
        .attr("height", 60)
        .attr("transform", "translate(0, 640)")
        .append("xhtml:body")
        .style("font", "12px 'Open Sans'")
        .html("<center>HOW TO PLAY: Find the right circle before the time runs out. You have 60 seconds & 5 attempts. <br /> HINT: Fizz labeled circles are dividable by 3, Buzz by 5 and FizzBuzz labeled by 3 & 5. <br /> Created by <a href='https://twitter.com/igorcuckovic' target='_blank'>Igor Čučković</a>. Based on <a href='http://en.wikipedia.org/wiki/Fizz_buzz' target='_blank'>Fizz Buzz</a>.<center>")
        .attr({

        });
    //http://en.wikipedia.org/wiki/Fizz_buzz

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll(".node")
        .data(fizzBuzz)
        .enter().append("g")
        .attr("class", "node").call(drag);

    var circles = node.append('circle')
        .attr('class', 'circle')
        .style('fill', function(d, i) {
            return d3.rgb(200, 255 - (i * 2.55), 20);
        })
        .attr('r', function(d, i) {
            return rScale(d.value);
        });


    var labels = node.append('text')
        .text(function(d, i) {
            return d.label;
        }).attr('class', 'nodetext')
        .attr({
            "alignment-baseline": "middle",
            "text-anchor": "middle"
        });




    force.on('tick', function() {
        var q = d3.geom.quadtree(fizzBuzz),
            i = 0,
            n = fizzBuzz.length;

        while (++i < n) q.visit(collide(fizzBuzz[i]));

        svg.selectAll("circle")
            .attr("cx", function(d) {
                return d.x;
            })
            .attr("cy", function(d) {
                return d.y;
            });

        //svg.selectAll("text") nodetext
        svg.selectAll(".nodetext")
            .attr("x", function(d) {
                return d.x;
            })
            .attr("y", function(d) {
                return d.y;
            });

    });

    function collide(node) {
        var r = node.radius + 16,
            nx1 = node.x - r,
            nx2 = node.x + r,
            ny1 = node.y - r,
            ny2 = node.y + r;
        return function(quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== node)) {
                var x = node.x - quad.point.x,
                    y = node.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = node.radius + quad.point.radius;
                if (l < r) {
                    l = (l - r) / l * 0.5;
                    node.x -= x *= l;
                    node.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        };
    }
    ///

    node.on("mouseover", function(d) {

        d3.select(this).moveToFront();
        node.classed("node-active", function(o) {

        });


        d3.select(this).classed("node-active", true);

    });

    var counter = 0;
    node.on("click", function(d) {

        counter += 1;

        var color = d3.select(this).select("circle");

        var text = d3.select(this).select("text").text(function(d) {
            return d.value;
        });


        d3.selectAll('.attempt').remove();



        if (randomNum !== d.value) {
            svg.append('text').text(counter + ". miss")
                .attr({
                    "class": "attempt",
                    "x": width / 2,
                    "y": 100,
                    "text-anchor": "middle"
                });

            //attempts fail
            if ((counter === 5) && (won === 0)) {

                clearInterval(intervalVar);
                node.attr('pointer-events', 'none');
                var button = svg.append("g")
                    .attr("transform", "translate(" + [width / 2 - 150, height / 2 - 30] + ")");

                button.append('rect')
                    .attr({
                        "class": "button",
                        "rx": 5,
                        "ry": 5,
                        "width": 300,
                        "height": 60,
                        "fill": "#cccccc"
                    });

                button.append('text')
                    .text("You have run out of attempts.")
                    .attr('class', 'replay')
                    .attr({
                        "dx": 30,
                        "dy": 25
                    });

                button.append('text')
                    .text("Play it again?")
                    .attr('class', 'replay')
                    .attr({
                        "dx": 90,
                        "dy": 45
                    });

                button.on("mouseover", function() {
                    d3.select(this).select("rect").attr("fill", "#999999");
                });

                button.on("mouseout", function() {
                    d3.select(this).select("rect").attr("fill", "#cccccc");
                });

                button.on("click", function() {
                    fizzBuzzGame();
                });
            };

        } else if (randomNum === d.value) {
            won = 1;
            console.log(won);
            d3.select('.title').text("Number was found in " + seconds + " seconds!")
            node.attr('pointer-events', 'none');

            clearInterval(intervalVar);

            var button = svg.append("g")
                .attr("transform", "translate(" + [width / 2 - 130, height / 2 - 30] + ")");

            button.append('rect')
                .attr({
                    "class": "button",
                    "rx": 5,
                    "ry": 5,
                    "width": 280,
                    "height": 50,
                    "fill": "#cccccc"
                });

            button.append('text')
                .text("Congratulations! Play it again!")
                .attr('class', 'replay')
                .attr({
                    "dx": 15,
                    "dy": 30
                });

            button.on("mouseover", function() {
                d3.select(this).select("rect").attr("fill", "#999999");
            });

            button.on("mouseout", function() {
                d3.select(this).select("rect").attr("fill", "#cccccc");
            });

            button.on("click", function() {
                fizzBuzzGame();
            });
        }
    });

    node.on("mouseout", function(d) {

        node.classed("node-active", false);
        var text = d3.select(this).select("text").text(function(d) {
            return d.label;
        });

    });


    function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        //force.stop();
        d3.select(this).classed("dragging", true);
        force.start();
    };

    function dragged(d) {
        d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);

    };

    function dragended(d) {
        d3.select(this).classed("dragging", false);
    };

    // time
    var seconds = 0;

    var vis = d3.select("svg")
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .attr("class", "clock");


    var intervals = function() {


        seconds += 1;

        if (seconds > 60) {
            console.log("game over");
            clearInterval(intervalVar);
            node.attr('pointer-events', 'none');
            var button = svg.append("g")
                .attr("transform", "translate(" + [width / 2 - 98, height / 2 - 30] + ")");

            button.append('rect')
                .attr({
                    "class": "button",
                    "rx": 5,
                    "ry": 5,
                    "width": 200,
                    "height": 60,
                    "fill": "#cccccc"
                });

            button.append('text')
                .text("Time run out.")
                .attr('class', 'replay')
                .attr({
                    "dx": 40,
                    "dy": 25
                });

            button.append('text')
                .text("Play it again?")
                .attr('class', 'replay')
                .attr({
                    "dx": 40,
                    "dy": 45
                });

            button.on("mouseover", function() {
                d3.select(this).select("rect").attr("fill", "#999999");
            });

            button.on("mouseout", function() {
                d3.select(this).select("rect").attr("fill", "#cccccc");
            });

            button.on("click", function() {
                fizzBuzzGame();
            });
        };

        var totalSeconds = 60;

        circleFuction(seconds, totalSeconds, 280, "seconds");


    };




    var circleFuction = function(current, total, radius, what) {


        d3.select("g ." + what).remove();

        var group = vis.append("g").attr("class", what);



        var r = radius;
        var p = Math.PI * 2;


        var data = d3.range(total),
            data1 = d3.range(current),
            angle = d3.scale.ordinal().domain(data).rangeBands([0, 2 * Math.PI]),
            angle1 = d3.scale.ordinal().domain(data1).rangeBands([0, (2 * Math.PI) * current / total]);

        var arc1 = d3.svg.arc()
            .innerRadius(r - 5)
            .outerRadius(r)
            .startAngle(function(d) {
                return angle1(d);
            })
            .endAngle(function(d) {
                return angle1(d) + angle1.rangeBand() / 1.1;
            });

        group.selectAll("path")
            .data(data1)
            .enter().append("path")
            .attr("d", arc1)
            .attr("class", function() {
                return "red";
            });

        var arc = d3.svg.arc()
            .innerRadius(r - 5)
            .outerRadius(r)
            .startAngle(function(d) {
                return angle(d);
            })
            .endAngle(function(d) {
                return angle(d) + angle.rangeBand() / 1.1;
            });

        group.selectAll("path")
            .data(data)
            .enter().append("path")
            .attr("d", arc)
            .attr("class", function() {
                return "grey";
            });
    };




    var intervalVar = setInterval(intervals, 1000);
};

fizzBuzzGame();