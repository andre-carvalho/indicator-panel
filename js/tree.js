var treeview = {

    jsonEntryData: null,
    selectedNode: null,
    csvName: null,

    makeJsonEntryData: (d) => {
        treeview.jsonEntryData = treeview.nodesFromModel(d);
        return treeview;
    },

    nodesFromModel: (obj) => {
        let node = { "key": "", "children": [] };
        for (let prop in obj) {
            if (Object.prototype.toString.call(obj[prop]) == "[object Array]" && obj[prop].length) {
                obj[prop].forEach(element => {
                    node["children"].push(treeview.nodesFromModel(element));
                });
            } else {
                if (prop == "key") {
                    node["key"] = obj[prop];
                }
                if (prop == "description") {
                    node["description"] = obj[prop];
                }
            }
        }
        if (!node["children"].length) delete node.children;
        return node;
    },

    display: () => {
        let w = $('#treeview').width();
        let h = $('#treeview').height();

        let margin = { top: 10, right: 10, bottom: 10, left: 80 },
            width = w - margin.right - margin.left,
            height = h - margin.top - margin.bottom;
        treeview.i = 0;

        treeview.duration = 750;
        treeview.tree = d3v3.layout.tree()
            .size([height, width]);

        treeview.diagonal = d3v3.svg.diagonal()
            .projection(function (d) { return [d.y, d.x]; });

        treeview.svg = d3v3.select("#treeview").append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        treeview.initRoot(height);

    },

    initRoot: (height) => {
        treeview.root = treeview.jsonEntryData;

        treeview.root.x0 = height / 2;
        treeview.root.y0 = 0;

        treeview.collapse =
            (d) => {
                if (d.children) {
                    d._children = d.children;
                    d._children.forEach(treeview.collapse);
                    d.children = null;
                }
            };

        treeview.root.children.forEach(treeview.collapse);
        treeview.update(treeview.root);

        d3v3.select(self.frameElement).style("height", height);
    },

    update: (source) => {

        // store selected node
        treeview.csvName = ((source.depth >= 1) ? (source.parent.key + "-") : ("")) + source.key;
        treeview.selectedNode = source;

        // Compute the new tree layout.
        var nodes = treeview.tree.nodes(treeview.root).reverse(),
            links = treeview.tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function (d) { d.y = d.depth * 180; });

        // Update the nodes…
        var node = treeview.svg.selectAll("g.node")
            .data(nodes, function (d) { return d.id || (d.id = ++treeview.i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
            .on("click", treeview.click);

        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeEnter.append("title")
            .text(function (d) { return d.description; });

        nodeEnter.append("text")
            .attr("x", function (d) { return d.children || d._children ? -10 : 10; })
            .attr("dy", ".35em")
            .attr("text-anchor", function (d) { return d.children || d._children ? "end" : "start"; })
            .text(function (d) { return d.key; })
            .style("fill-opacity", 1e-6);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(treeview.duration)
            .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.select("circle")
            .attr("r", 4.5)
            .style("fill", function (d) {
                let color = d._children ? "lightsteelblue" : "#fff";
                color = d.key==treeview.selectedNode.key ? "#f00" : color;
                return color;
            });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(treeview.duration)
            .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        var link = treeview.svg.selectAll("path.link")
            .data(links, function (d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                var o = { x: source.x0, y: source.y0 };
                return treeview.diagonal({ source: o, target: o });
            });

        // Transition links to their new position.
        link.transition()
            .duration(treeview.duration)
            .attr("d", treeview.diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(treeview.duration)
            .attr("d", function (d) {
                var o = { x: source.x, y: source.y };
                return treeview.diagonal({ source: o, target: o });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    },

    // Toggle children on click.
    click: (d) => {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        /*
        treeview.root.children.forEach(function(node) {
            console.log(node, d, node === d);
            //collapse(node);
        });*/
        treeview.update(d);
    }
};