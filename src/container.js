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
    }

    if (this._media) {
      this._media.destroy();
    }

    this._root.remove();
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

  gesture(boolean) {
    if (typeof boolean === 'undefined') {
      return this._gesture;
    }

    if (!boolean) {
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

  media(width, height, styles = {}) {
    if (typeof width === 'undefined') {
      return this._media;
    }

    if (!width) {
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

  slider(boolean) {
    if (typeof boolean === 'undefined') {
      return this._slider;
    }

    if (!boolean) {
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

  append(menu) {
    this._menus.add(menu);
    this._root.node().appendChild(menu.reset().root().node());

    return this;
  }

  remove(menu) {
    this._menus.delete(menu);
    menu.root().node().remove();

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
