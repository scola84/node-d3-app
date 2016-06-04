/* eslint prefer-reflect: "off" */

import { select } from 'd3-selection';

export default class Menu {
  constructor(options) {
    this.options = Object.assign({
      hideThreshold: '64em',
      menuWidth: '21em'
    }, options);

    this.fixed = false;
    this.build();
  }

  build() {
    this.outer = select(document.createElement('div'))
      .classed('scola menu', true)
      .styles({
        'border-right': '1px solid #CCC',
        'height': '100%',
        'position': 'absolute',
        'width': this.options.menuWidth,
        'z-index': 1
      })
      .media('not all and (min-width: ' + this.options.menuWidth + ')')
      .style('width', '90%')
      .media('not all and (min-width: ' + this.options.hideThreshold + ')')
      .style('left', '-' + this.options.menuWidth)
      .call(() => {
        this.fixed = false;
      })
      .media('(min-width: ' + this.options.hideThreshold + ')')
      .style('left', 0)
      .call(() => {
        this.fixed = true;
      })
      .start();

    this.outer.gesture().on('tap', (event) => {
      event.stopPropagation();
    });
  }

  destroy() {
    this.outer.remove();
  }

  node() {
    return this.outer.node();
  }

  show() {
    if (this.fixed || parseInt(this.outer.style('left'), 10) === 0) {
      return;
    }

    this.outer.transition().style('left', '0');
  }

  hide() {
    if (this.fixed || parseInt(this.outer.style('left'), 10) !== 0) {
      return;
    }

    this.outer.transition().style('left', '-' + this.options.menuWidth);
  }
}
