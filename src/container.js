import { select } from 'd3-selection';

export default class Container {
  constructor(options, main, menu) {
    this.options = Object.assign({
      height: '48em',
      width: '64em'
    }, options);

    this.main = main;
    this.menu = menu;

    this.build();
  }

  build() {
    this.outer = select(document.createElement('div'))
      .classed('scola app', true)
      .style('position', 'relative')
      .media('(min-height: ' + this.options.height + ')')
      .style('height', this.options.height)
      .media('not all and (min-height: ' + this.options.height + ')')
      .style('height', '100%')
      .media('(min-width: ' + this.options.width + ')')
      .style('width', this.options.width)
      .media('not all and (min-width: ' + this.options.width + ')')
      .styles({
        'width': '100%',
        'height': '100%'
      })
      .start();

    this.outer.gesture()
      .on('tap', () => {
        this.menu.hide();
      })
      .on('swiperight', () => {
        this.menu.show();
      })
      .on('swipeleft', () => {
        this.menu.hide();
      });

    this.outer.node().appendChild(this.menu.node());
    this.outer.node().appendChild(this.main.node());
  }

  destroy() {
    this.main.destroy();
    this.menu.destroy();
    this.outer.remove();
  }

  node() {
    return this.outer.node();
  }
}
