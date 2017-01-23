import { event, select } from 'd3-selection';
import { slider } from '@scola/d3-slider';
import 'd3-selection-multi';
import 'd3-transition';
import '@scola/d3-gesture';
import '@scola/d3-media';

export default class Main {
  constructor() {
    this._height = null;
    this._styles = null;
    this._width = null;

    this._gesture = null;
    this._media = null;
    this._slider = null;
    this._menus = new Set();

    this._root = select('body')
      .append('div')
      .remove()
      .classed('scola app', true)
      .styles({
        'position': 'relative',
        'z-index': 0
      });

    this._inner = this._root.append('div')
      .classed('scola inner', true)
      .styles({
        'height': '100%',
        'left': '0px',
        'position': 'absolute',
        'right': '0px'
      });
  }

  destroy() {
    this._deleteGesture();
    this._deleteMedia();
    this._deleteSlider();

    this._menus.forEach((menu) => {
      menu.destroy();
    });

    this._menus.clear();

    this._root.dispatch('destroy');
    this._root.remove();
    this._root = null;
  }

  root() {
    return this._root;
  }

  height() {
    return this._height;
  }

  styles() {
    return this._styles;
  }

  width() {
    return this._width;
  }

  gesture(action = null) {
    if (action === null) {
      return this._gesture;
    }

    if (action === false) {
      return this._deleteGesture();
    }

    if (!this._gesture) {
      this._insertGesture();
    }

    return this;
  }

  media(width = '64em', height = '48em', styles = null) {
    if (width === null) {
      return this._media;
    }

    if (width === false) {
      return this._deleteMedia();
    }

    if (styles === null) {
      styles = {
        'border-radius': '1em',
        'overflow': 'hidden',
        'transform': 'scale(1)'
      };
    }

    if (!this._media) {
      this._insertMedia(width, height, styles);
    }

    return this;
  }

  slider(action = true) {
    if (action === false) {
      return this._deleteSlider();
    }

    if (!this._slider) {
      this._insertSlider();
    }

    return this._slider;
  }

  append(menu, action = true) {
    if (action === true) {
      this._appendMenu(menu);
    } else if (action === false) {
      this._removeMenu(menu);
    }

    return this;
  }

  attach() {
    this._root.style('opacity', 0);
    document.body.appendChild(this._root.node());

    this._root
      .transition()
      .style('opacity', 1);

    return this;
  }

  detach() {
    this._root
      .transition()
      .style('opacity', 0)
      .remove();

    return this;
  }

  _insertGesture() {
    this._gesture = this._root
      .gesture()
      .on('tap', () => this._change())
      .on('swiperight', () => this._change('left'))
      .on('swipeleft', () => this._change('right'));

    return this;
  }

  _deleteGesture() {
    if (this._gesture) {
      this._gesture.destroy();
      this._gesture = null;
    }

    return this;
  }

  _insertMedia(width, height, styles) {
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

  _deleteMedia() {
    if (this._media) {
      this._media.destroy();
      this._media = null;
    }

    return this;
  }

  _insertSlider() {
    this._slider = slider()
      .remove(true)
      .rotate(false);

    this._inner.node()
      .appendChild(this._slider.root().node());

    return this;
  }

  _deleteSlider() {
    if (this._slider) {
      this._slider.destroy();
      this._slider = null;
    }

    return this;
  }

  _appendMenu(menu) {
    this._root.node().appendChild(menu.root().node());
    this._menus.add(menu);
    this._bindMenu(menu);
    this._fixMenu();
  }

  _removeMenu(menu) {
    menu.root().remove();
    this._menus.delete(menu);
    this._unbindMenu(menu);
  }

  _bindMenu(menu) {
    menu.root().on('fix.scola-app', () => this._fixMenu());
    menu.root().on('unfix.scola-app', () => this._fixMenu());
    menu.root().on('show.scola-app', () => this._showMenu());
    menu.root().on('hide.scola-app', () => this._hideMenu());
  }

  _unbindMenu(menu) {
    menu.root().on('fix.scola-app', null);
    menu.root().on('unfix.scola-app', null);
    menu.root().on('show.scola-app', null);
    menu.root().on('hide.scola-app', null);
  }

  _fixMenu() {
    const style = {
      left: '0px',
      right: '0px'
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

  _showMenu() {
    if (event.detail.menu.mode() === 'over') {
      return this;
    }

    const opposite = this._opposite(event.detail.menu.position());
    let oppositePosition = '-' + event.detail.menu.width();

    this._menus.forEach((menu) => {
      if (menu.position() === opposite && menu.fixed()) {
        oppositePosition = '0px';
      }
    });

    this._inner
      .transition()
      .style(event.detail.menu.position(), event.detail.menu.width())
      .style(opposite, oppositePosition);

    return this;
  }

  _hideMenu() {
    if (event.detail.menu.mode() === 'over') {
      return this;
    }

    const opposite = this._opposite(event.detail.menu.position());
    let oppositePosition = '0px';

    this._menus.forEach((menu) => {
      if (menu.position() === opposite && menu.fixed()) {
        oppositePosition = menu.width();
      }
    });

    this._inner
      .transition()
      .style(event.detail.menu.position(), '0px')
      .style(opposite, oppositePosition);

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
