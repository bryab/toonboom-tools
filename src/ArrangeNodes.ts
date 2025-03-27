/// <reference types="tba-types/Harmony/24"/>

function StackNodes() {
  scene.beginUndoRedoAccum("Arrange selected nodes in a stack.");
  var nodes = selection.selectedNodes();
  Utils.sortNodesByY(nodes);
  Utils.arrangeTable(nodes, { num_cols: 1, spacing_y: 10 });
  scene.endUndoRedoAccum();
}

namespace Utils {
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

      _move(
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

  function _move(nodePath: string, x: number, y: number) {
    if (Array.isArray(nodePath)) _moveAll(nodePath, x, y);
    else node.setCoord(nodePath, x, y);
  }

  function _moveAll(modules: string[], x: number, y: number) {
    const transform = _getTransform(modules);

    modules.forEach(function (nodePath) {
      const sub_transform = _getTransform(nodePath);
      const diff_x = sub_transform.x - transform.x;
      const diff_y = sub_transform.y - transform.y;
      node.setCoord(nodePath, x + diff_x, y + diff_y);
    });
  }
}
