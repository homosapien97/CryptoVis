/**
 * Created by anish on 11/13/16.
 */

/*
 * {
 "name": "";
 "start_year": 0;
 "end_year": 0;
 "description": "";
 "events": [];
 "children": [];
 }
 * */

var px_per_year = .6;

function draw_timeline(context, root_x = 100, root_y = 25) {

    var YEAR_OFFSET = 100
    // If you ever change that starting year... well, you'd better update the random offsets in this function
    var number_of_years = 2016 + YEAR_OFFSET;
    var major_tick_height = 30;

    // Styles
    var main_line_attr = {"stroke": "#FF0000", "stroke-width": 6};
    var major_tick_attr = {"stroke": "#FF0000", "stroke-width": 6};

    var year_label_offset_y = 30;
    var year_label_attr = {"fill": "#000",
        "font-size": "16px", "font-family": "Arial, Helvetica, sans-serif",
        "text-anchor": "middle"};

    var line = context.path("M " + root_x + " " + root_y + " l " + px_per_year * number_of_years + " 0");
    line.attr(main_line_attr);

    for (var qqq = 0; qqq < number_of_years; qqq++) {
        if (qqq % 100 === 0) {
            context.path("M " + (root_x + (qqq * px_per_year))+ " " +
                (root_y - (major_tick_height / 2)) + " l 0 " + major_tick_height).attr(major_tick_attr);
            context.text((root_x + (qqq * px_per_year)), root_y + year_label_offset_y,
                        qqq - YEAR_OFFSET).attr(year_label_attr);
        }
    }
}

function draw_tree(tree, context, root_x = 100, root_y = 100) {

    var px_per_branch = 35;
    var default_fill_opacity = .4;
    var hover_fill_opacity = .75;

    var branch_name_offset_x = 5;
    var branch_name_offset_y = 20;
    var branch_name_attr = {"fill": "#000",
        "font-size": "32px", "font-family": "Arial, Helvetica, sans-serif",
        "text-anchor": "start"};
    var branch_name_attr_animation = {"fill": "#000"};

    var temp_namebox_div;
    var namebox_offset_y = -30;
    var namebox_draw_attr = {"fill": "#000",
        "font-size": "32px", "font-family": "Arial, Helvetica, sans-serif",
        "text-anchor": "middle"};

    console.log("Drawing "+tree.name);

    var path_ = context.path("M " + root_x + " " + root_y + " l " +
        (tree.end_year - tree.start_year) * px_per_year + " 0").attr({"stroke": "#FF0000", "stroke-width": 6});
    path_.mouseover(function (event) {
        // Put a little div at the mouse to tell them the branch name
        temp_namebox_div = context.text(event.offsetX, event.offsetY + namebox_offset_y,
            tree.name).attr(namebox_draw_attr);
    });
    path_.mousemove(function (event) {
        temp_namebox_div.remove();
        temp_namebox_div = context.text(event.offsetX, event.offsetY + namebox_offset_y,
            tree.name).attr(namebox_draw_attr);
    });
    path_.mouseout(function () {
        temp_namebox_div.remove();
    });

    for (var ee = 0; ee < tree.events.length; ee++) {
        var curr_event = tree.events[ee];
        var draw_x = 0;

        if (curr_event.name === "start") {
            draw_x = (tree.start_year * px_per_year);
            draw_x = root_x;
        } else if (curr_event.name === "end") {
            draw_x = root_x + (tree.end_year - tree.start_year) * px_per_year;
        } else {
            draw_x = root_x + (curr_event.year - tree.start_year) * px_per_year;
        }

        // Draw events

        var event_circle = context.circle(draw_x, root_y, 10).attr(
            {stroke: "#00FF00", fill: "#00FF00","fill-opacity": .4});
        event_circle.data("event_id", curr_event.id_);

        SLIDEOFF = "right";

        event_circle.mouseover(function (event) {

            this.animate({"fill-opacity": hover_fill_opacity});
            $("#slider_container").removeAttr("right left");
            $("#infobox_container").load("infofiles/infofile" + this.data("event_id")+".html");

            if (event.offsetX < ($("#canvas").width() / 2)) {

                console.log("Moving the div to the right of the canvas!");
                SLIDEOFF = "right";
                $("#slider_container").animate({left: $("#canvas").width()}, 0);
                $("#slider_container").animate({left: $("#canvas").width() - INFO_BOX_WIDTH});
            } else {
                // The box should slide in from the left of the screen
                console.log("Moving the div to the left of the canvas!");
                SLIDEOFF = "left";
                $("#slider_container").animate({left: -1 * INFO_BOX_WIDTH}, 0);
                $("#slider_container").animate({left: 0});
            }
        });
        event_circle.mouseout(function (event) {

            console.log("SLIDEOFF IS " + SLIDEOFF);

            this.animate({"fill-opacity": default_fill_opacity});

            if (SLIDEOFF === "right") {
                $("#slider_container").animate({left: $("#canvas").width()});
            } else {
                $("#slider_container").animate({left: -1 * INFO_BOX_WIDTH});
            }
        });
    }

    for (var qq = 1; qq < tree.children.length + 1; qq++) {
        var curr_branch = tree.children[qq -1];
        context.path("M " + (root_x + (curr_branch.start_year - tree.start_year)*px_per_year)+" "+root_y+" l 0 "+
                    qq * px_per_branch).attr({"stroke": "#FF0000", "stroke-width": 6});
        draw_tree(curr_branch, context, (root_x + (curr_branch.start_year - tree.start_year)*px_per_year),
                    root_y + qq * px_per_branch);
    }

    var branch_namebox = context.text(root_x + branch_name_offset_x, root_y + branch_name_offset_y, tree.name);
    branch_namebox.attr(branch_name_attr);
    branch_namebox.mouseover(function () {
        this.animate(branch_name_attr_animation)
    });
}
function sort_tree(tree) {
    tree.children.sort(compare_by_children);
    for (var ii = 0; ii < tree.children.length; ii++) {
        sort_tree(tree.children[ii]);
    }
    console.log("Sorted version of " + tree.name);
    console.log(tree);
}
function compare_by_children(a, b) {
    if (get_leaves(a) > get_leaves(b)) {
        return 1;
    } else if (get_leaves(a) < get_leaves(b)) {
        return -1
    } else {
        return 0;
    }
}
function get_leaves(tree) {
    var total_leaves = 0;
    if (tree.children.length === 0) {
        return 1;
    } else {
        // This random +1 is to account for the fact that the current node itself is a leaf
        total_leaves += 1;
        for (var patch = 0; patch < tree.children.length; patch++) {
            total_leaves += get_leaves(tree.children[patch]);
        }
    }
    return total_leaves;
}

var monosub_tree =
{
    "name": "Caesar Cipher",
    "start_year": -100,
    "end_year": 50,
    "description": "The description for Caesar Ciphers",
    "events":
    [
        {
            "name": "start",
            "description": "Some description for Caesar Ciphers",
            "id_": 4
        },
        {
            "name": "end",
            "description": "The end of the Caesar Cipher?"
        }
    ],
    "children":
    [
        {
            "name": "Monosubstitution Cipher",
            'id_': 0,
            "start_year": 20,
            "end_year": 1600,
            "description": "Example dexcription",
            "events":
            [
                {
                    "name": "start",
                    "description": "It got invented!",
                    'id_': 1
                },
                {
                    "name": "Frequency Analysis Invented",
                    "description": "Freq Analysis Invention placeholder",
                    "year": 800,
                    'id_': 2
                },
                {
                    "name": "end",
                    "description": "Talk about the end of freq anal",
                    "id_": 3
                }
            ],
            "children":
            [
                {
                    "name": "Nomenclators",
                    "start_year": 1500,
                    "end_year": 1600,
                    "description": "Placeholder desc for nomenclators",
                    "events":
                    [
                        {
                            "name": "start",
                            "description": "The invention of nomenclators"
                        },
                        {
                            "name": "end",
                            "description": "The end of nomenclators"
                        }
                    ],
                    "children": []
                },
                {
                    "name": "Null Ciphers",
                    "start_year": 1500,
                    "end_year": 1800,
                    "description": "Placeholder for null cipher",
                    "events":
                    [
                        {
                            "name": "start",
                            "description": "Null ciphers were invented!"
                        },
                        {
                            "name": "end",
                            "description": "These never really ended..."
                        }
                    ],
                    "children": []
                },
                {
                    "name": "Vigne're Cipher",
                    "start_year": 1400,
                    "end_year": 1920,
                    "description": "Placeholder desc for Vignere cipher",
                    "events":
                    [
                        {
                            "name": "start",
                            "description": "Invention of the Vigne're Cipher"
                        },
                        {
                            "name": "end",
                            "description": "The breaking of the Vigne're Cipher"
                        }
                    ],
                    "children":
                    [
                        {
                            "name": "Engima",
                            "start_year": 1700,
                            "end_year": 1945,
                            "description": "Description for Enigma",
                            "events":
                            [
                                {
                                    "name": "start",
                                    "description": "The invention of the Enigma"
                                },
                                {
                                    "name": "end",
                                    "description": "The end of the Enigma"
                                }
                            ],
                            "children":
                            [
                                {
                                    "name": "Lorenz Encryption",
                                    "start_year": 1800,
                                    "end_year": 1945,
                                    "description": "Description for Lorenz Crypto",
                                    "events":
                                    [
                                        {
                                            "name": "start",
                                            "description": "Invention!"
                                        },
                                        {
                                            "name": "end",
                                            "description": "The fall of the Lorenz Cipher"
                                        }
                                    ],
                                    "children": []
                                }
                            ]
                        },
                        {
                            "name": "Purple",
                            "start_year": 1875,
                            "end_year": 1946,
                            "description": "Description for Purple",
                            "events":
                            [
                                {
                                    "name": "start",
                                    "description": "The invention of Purple"

                                },
                                {
                                    "name": "end",
                                    "description": "The end of the Purple"
                                }
                            ],
                            "children": []
                        }
                    ]
                }
            ]
        }
    ]
};