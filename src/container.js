import { select } from 'd3-selection';

export default class Container {
  constructor(options) {
    this.options = Object.assign({
      height: '48em',
      width: '64em'
    }, options);

    this.menus = new Set();
    this.build();
  }

  build() {
    this.outer = select(document.createElement('div'))
      .classed('scola app', true)
      .styles({
        'position': 'relative',
        'z-index': 0
      });

    this.media = this.outer
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

    this.inner = this.outer.append('div')
      .classed('scola inner', true)
      .styles({
        'height': '100%',
        'left': 0,
        'position': 'absolute',
        'right': 0
      });

    this.gesture = this.outer.gesture()
      .on('tap', () => {
        this.change();
      })
      .on('swiperight', () => {
        this.change('left');
      })
      .on('swipeleft', () => {
        this.change('right');
      });

    return this;
  }

  destroy() {
    this.gesture
      .off('tap swiperight swipeleft')
      .destroy();

    this.media.destroy();
    this.outer.remove();
  }

  node() {
    return this.outer.node();
  }

  append(menu) {
    this.menus.add(menu.container(this));
    this.node().appendChild(menu.reset().node());

    return this;
  }

  remove(menu) {
    this.menus.delete(menu);
    menu.node().remove();

    return this;
  }

  fixAll() {
    const style = {
      left: 0,
      right: 0
    };

    this.menus.forEach((menu) => {
      if (menu.fixed) {
        style[menu.position()] = menu.width();
      } else {
        menu.hide();
      }
    });

    this.inner.styles(style);
  }

  show(menu, callback) {
    if (menu.mode() === 'over') {
      return;
    }

    const opposite = this.opposite(menu.position());
    let oppositePosition = '-' + menu.width();

    this.menus.forEach((item) => {
      if (item.position() === opposite && item.fixed) {
        oppositePosition = '0';
      }
    });

    this.inner
      .transition()
      .style(menu.position(), menu.width())
      .style(opposite, oppositePosition)
      .on('end', callback);
  }

  hide(menu, callback) {
    if (menu.mode() === 'over') {
      return;
    }

    const opposite = this.opposite(menu.position());
    let oppositePosition = '0';

    this.menus.forEach((item) => {
      if (item.position() === opposite && item.fixed) {
        oppositePosition = item.width();
      }
    });

    this.inner
      .transition()
      .style(menu.position(), '0')
      .style(opposite, oppositePosition)
      .on('end', callback);
  }

  change(position) {
    let found = false;

    this.menus.forEach((menu) => {
      if (menu.position() === position) {
        return;
      }

      found = found || menu.hide();
    });

    if (found) {
      return;
    }

    this.menus.forEach((menu) => {
      if (found || menu.position() !== position) {
        return;
      }

      found = menu.show();
    });
  }

  opposite(position) {
    return position === 'left' ? 'right' : 'left';
  }
}
