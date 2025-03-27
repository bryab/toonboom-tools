/// <reference types="tba-types/Harmony/24"/>

function StackNodes() {
  scene.beginUndoRedoAccum("Arrange selected nodes in a stack.");
  var nodes = selection.selectedNodes();
  NodeUtils.sortNodesByY(nodes);
  NodeUtils.arrangeTable(nodes, { num_cols: 1, spacing_y: 10 });
  scene.endUndoRedoAccum();
}

function AlignHorizontal() {
  scene.beginUndoRedoAccum("Align selected nodes horizontally");
  var modules = selection.selectedNodes();
  if (modules.length < 2) {
    return;
  }
  var all_y: number[] = [];
  modules.forEach(function (nodePath) {
    all_y.push(node.coordY(nodePath) + node.height(nodePath) / 2);
  });
  const sum = all_y.reduce(function (a, b) {
    return a + b;
  });
  const avg = sum / all_y.length;

  modules.forEach(function (nodePath) {
    NodeUtils.move(
      nodePath,
      node.coordX(nodePath),
      avg - node.height(nodePath) / 2
    );
  });
  scene.endUndoRedoAccum();
}

function LinkToMultiLayerWrite() {
  const nodes = selection.selectedNodes();

  if (!nodes.length) {
    return;
  }

  let mlw = NodeUtils.findNode(
    (nodePath) => (node.type(nodePath) as string) == "MultiLayerWrite", // FIXME node.type return type should just be string
    node.root(),
    false
  );

  scene.beginUndoRedoAccum("Connect to MLW");

  if (!mlw) {
    const coord = NodeUtils.coordNear(nodes[0]);
    mlw = node.add(
      node.root(),
      "Multi-Layer-Write",
      "MultiLayerWrite",
      coord.x,
      coord.y,
      0
    );
  }

  for (const nodePath of nodes) {
    for (let i = 0; i < node.numberOfOutputPorts(nodePath); i++) {
      let found = false;
      for (let l = 0; l < node.numberOfOutputLinks(nodePath, i); l++) {
        if (node.dstNode(nodePath, i, l) == mlw) {
          found = true;
        }
      }
      if (!found) {
        WriteUtils.ConnectToMLW(nodePath, i, mlw);
      }
    }
  }

  scene.endUndoRedoAccum();
}

namespace WriteUtils {
  export function ConnectToMLW(srcNode: string, outPort: number, mlw: string) {
    const srcName = node.getName(srcNode);
    let create_comp = false;
    let group = node.parentNode(srcNode);
    MessageLog.trace(`Node: ${srcNode} Group: ${group}`);

    while (group != "Top") {
      create_comp = true;
      MessageLog.trace(`Wiring out of group: ${group}`);
      const out_node = node.getGroupOutputModule(
        group,
        "Multi-Port_Out",
        0,
        0,
        0
      );
      const multi_out_port = node.numberOfInputPorts(out_node);
      MessageLog.trace(
        `Linking from ${srcNode}:${outPort} to ${out_node}:${multi_out_port}`
      );
      node.link(srcNode, outPort, out_node, multi_out_port);
      srcNode = group;
      outPort = multi_out_port;
      group = node.parentNode(srcNode);
    }

    if (create_comp) {
      const coord = NodeUtils.coordNear(srcNode);
      const comp = node.add(
        node.root(),
        srcName,
        "COMPOSITE",
        coord.x,
        coord.y,
        0
      );
      node.link(srcNode, outPort, comp, 0);
      srcNode = comp;
      outPort = 0;
    }
    const mlw_port = node.numberOfInputPorts(mlw);

    node.link(srcNode, outPort, mlw, mlw_port);
  }
}

namespace NodeUtils {
  type NodeCallback = (nodePath: string) => boolean | void;

  export function findNode(
    filter: (nodePath: string) => boolean,
    root?: string,
    recurse = true
  ): string {
    let found: string = null;

    forEachNodeAlt(
      (nodePath) => {
        if (filter(nodePath)) {
          found = nodePath;
          return true;
        }
      },
      root,
      recurse
    );

    return found;
  }

  export function forEachNodeAlt(
    callback: (nodePath: string) => boolean,
    root?: string,
    recurse = true
  ): boolean {
    const groups: string[] = [];

    /**
     * First search everything in this group.
     * Only recurse after that.
     */

    let found = false;

    forEachNode(
      (nodePath) => {
        if (callback(nodePath)) {
          found = true;
        } else if (recurse && node.isGroup(nodePath)) {
          groups.push(nodePath);
        }
      },
      root,
      false
    );

    if (found) return true;

    if (recurse) {
      for (let groupName of groups) {
        // MessageLog.trace(`Recursing into... ${groupName}`);
        const found = forEachNodeAlt(callback, groupName, true);
        if (found) {
          return true;
        }
      }
    }

    return false;
  }

  export function forEachNode(
    callback: NodeCallback,
    groupName?: string,
    recurse = true
  ) {
    if (groupName === undefined) groupName = node.root();
    const num_children = node.numberOfSubNodes(groupName);
    for (let i = 0; i < num_children; i++) {
      const child = node.subNode(groupName, i);
      if (callback(child)) return;
      if (recurse && node.isGroup(child)) forEachNode(callback, child);
    }
  }

  export function coordNear(srcnode: string): Point2d {
    const offset_x = 0;
    const offset_y = 50;
    return new Point2d(
      node.coordX(srcnode) + offset_x,
      node.coordY(srcnode) + offset_y
    );
  }

  export function sortNodesByY(nodes: string[]) {
    return nodes.sort(function (a, b) {
      const y1 = node.coordY(a);
      const y2 = node.coordY(b);
      if (y1 < y2) return -1;
      if (y1 > y2) return 1;
      return 0;
    });
  }

  export function arrangeTable(
    nodes: string | string[],
    options?: TableOptions
  ): void {
    const opt: TableOptions = {
      num_cols: 0,
      num_rows: 0,
      up: false,
      spacing_x: 10,
      spacing_y: 400,
    };

    if (options === undefined) {
      options = opt;
    } else {
      for (let key in opt) {
        if (options.hasOwnProperty(key)) {
          opt[key] = options[key];
        }
      }
    }

    const start = _getTransform(nodes[0]);
    let row = 0;
    let col = 1;
    let offset_x = start.width;
    let offset_y = 0;

    if (opt.up) {
      opt.spacing_y *= -1;
    }

    if (opt.num_cols && opt.num_rows) {
      opt.num_rows = 0;
    } else if (opt.num_rows) {
      opt.num_cols = Math.ceil(nodes.length / opt.num_rows);
    }

    for (let i = 1; i < nodes.length; i++) {
      const nodePath = nodes[i];
      const transform = _getTransform(nodePath);

      if (opt.num_cols && col >= opt.num_cols) {
        row++;
        col = 0;
        offset_x = 0;
        if (opt.up) offset_y -= transform.height;
        else offset_y += transform.height;
      }

      move(
        nodePath,
        start.x + col * opt.spacing_x + offset_x,
        start.y + row * opt.spacing_y + offset_y
      );
      col++;
      offset_x += transform.width;
    }
  }

  interface TableOptions {
    num_cols?: number;
    num_rows?: number;
    up?: boolean;
    spacing_x?: number;
    spacing_y?: number;
  }

  function _getTransform(nodePath: string | string[]) {
    if (Array.isArray(nodePath)) {
      let group_x = null;
      let group_y = null;
      let group_extent_x = null;
      let group_extent_y = null;
      nodePath.forEach(function (sub_nodePath) {
        const transform = _getTransform(sub_nodePath);
        if (group_x == null || transform.x < group_x) group_x = transform.x;
        if (
          group_extent_y == null ||
          transform.x + transform.width > group_extent_x
        )
          group_extent_x = transform.x + transform.width;
        if (group_y == null || transform.y < group_y) group_y = transform.y;
        if (
          group_extent_y == null ||
          transform.y + transform.height > group_extent_y
        )
          group_extent_y = transform.y + transform.height;
      });

      return {
        x: group_x,
        y: group_y,
        width: group_extent_x - group_x,
        height: group_extent_y - group_y,
      };
    }
    return {
      x: node.coordX(nodePath),
      y: node.coordY(nodePath),
      width: node.width(nodePath),
      height: node.height(nodePath),
    };
  }

  export function move(nodePath: string, x: number, y: number) {
    if (Array.isArray(nodePath)) moveAll(nodePath, x, y);
    else node.setCoord(nodePath, x, y);
  }

  export function moveAll(modules: string[], x: number, y: number) {
    const transform = _getTransform(modules);

    modules.forEach(function (nodePath) {
      const sub_transform = _getTransform(nodePath);
      const diff_x = sub_transform.x - transform.x;
      const diff_y = sub_transform.y - transform.y;
      node.setCoord(nodePath, x + diff_x, y + diff_y);
    });
  }
}
