import { select } from 'd3-selection';
import { slider } from '@scola/d3-slider';

export default class Container {
  constructor() {
    this._menus = new Set();

    this._width = null;
    this._height = null;
    this._styles = null;

    this._gesture = null;
    this._media = null;
    this._slider = null;

    this._root = select('body')
      .append('div')
      .classed('scola app', true)
      .styles({
        'position': 'relative',
        'z-index': 0
      });

    this._inner = this._root.append('div')
      .classed('scola inner', true)
      .styles({
        'height': '100%',
        'left': 0,
        'position': 'absolute',
        'right': 0
      });
  }

  destroy() {
    this._menus.forEach((menu) => {
      menu.destroy();
    });

    if (this._gesture) {
      this._gesture.destroy();
      this._gesture = null;
    }

    if (this._media) {
      this._media.destroy();
      this._media = null;
    }

    if (this._slider) {
      this._slider.destroy();
      this._slider = null;
    }

    this._root.dispatch('destroy');
    this._root.remove();
    this._root = null;
  }

  height() {
    return this._height;
  }

  root() {
    return this._root;
  }

  styles() {
    return this._styles;
  }

  width() {
    return this._width;
  }

  append(menu, action = true) {
    if (action === true) {
      this._menus.add(menu);
      this._root.node().appendChild(menu.reset().root().node());
    } else if (action === false) {
      this._menus.delete(menu);
      menu.root().remove();
    }

    return this;
  }

  gesture(action) {
    if (typeof action === 'undefined') {
      return this._gesture;
    }

    if (action === false) {
      this._gesture.destroy();
      this._gesture = null;

      return this;
    }

    this._gesture = this._root
      .gesture()
      .on('tap', () => this._change())
      .on('swiperight', () => this._change('left'))
      .on('swipeleft', () => this._change('right'));

    return this;
  }

  media(width = '64em', height = '48em', styles = {}) {
    if (width === null) {
      return this._media;
    }

    if (width === false) {
      this._media.destroy();
      this._media = null;

      return this;
    }

    this._width = width;
    this._height = height;
    this._styles = styles;

    this._media = this._root
      .media(`(min-height: ${height}) and (min-width: ${width})`)
      .styles(styles)
      .media(`(min-height: ${height})`)
      .style('height', height)
      .media(`not all and (min-height: ${height})`)
      .style('height', '100%')
      .media(`(min-width: ${width})`)
      .style('width', width)
      .media(`not all and (min-width: ${width})`)
      .styles({
        'width': '100%',
        'height': '100%'
      })
      .start();

    return this;
  }

  slider(action) {
    if (typeof action === 'undefined') {
      return this._slider;
    }

    if (action === false) {
      this._slider.destroy();
      this._slider = null;

      return this;
    }

    this._slider = slider()
      .remove(true)
      .rotate(false);

    this._inner.node()
      .appendChild(this._slider.root().node());

    return this;
  }

  fixAll() {
    const style = {
      left: 0,
      right: 0
    };

    this._menus.forEach((menu) => {
      if (menu.fixed()) {
        style[menu.position()] = menu.width();
      } else {
        menu.hide();
      }
    });

    this._inner.styles(style);

    return this;
  }

  show(menu, callback) {
    if (menu.mode() === 'over') {
      return this;
    }

    const opposite = this._opposite(menu.position());
    let oppositePosition = '-' + menu.width();

    this._menus.forEach((item) => {
      if (item.position() === opposite && item.fixed) {
        oppositePosition = '0';
      }
    });

    this._inner
      .transition()
      .style(menu.position(), menu.width())
      .style(opposite, oppositePosition)
      .on('end', callback);

    return this;
  }

  hide(menu, callback) {
    if (menu.mode() === 'over') {
      return this;
    }

    const opposite = this._opposite(menu.position());
    let oppositePosition = '0';

    this._menus.forEach((item) => {
      if (item.position() === opposite && item.fixed) {
        oppositePosition = item.width();
      }
    });

    this._inner
      .transition()
      .style(menu.position(), '0')
      .style(opposite, oppositePosition)
      .on('end', callback);

    return this;
  }

  _change(position) {
    let found = false;

    this._menus.forEach((menu) => {
      if (menu.position() === position) {
        return;
      }

      found = found || menu.hide();
    });

    if (found) {
      return;
    }

    this._menus.forEach((menu) => {
      if (found || menu.position() !== position) {
        return;
      }

      found = menu.show();
    });
  }

  _opposite(position) {
    return position === 'left' ? 'right' : 'left';
  }
}
