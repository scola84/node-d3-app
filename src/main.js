/* eslint prefer-reflect: "off" */

import { select } from 'd3-selection';

export default class Main {
  constructor(options) {
    this.options = Object.assign({
      hideThreshold: '64em',
      menuWidth: '21em'
    }, options);

    this.build();
  }

  build() {
    this.outer = select(document.createElement('div'))
      .classed('scola main', true)
      .styles({
        'height': '100%',
        'left': this.options.menuWidth,
        'position': 'absolute',
        'right': 0
      })
      .media('not all and (min-width: ' + this.options.hideThreshold + ')')
      .style('left', 0)
      .start();
  }

  destroy() {
    this.outer.remove();
  }

  node() {
    return this.outer.node();
  }
}
