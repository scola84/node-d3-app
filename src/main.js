import { select } from 'd3-selection';
import { slider } from '@scola/d3-slider';
import 'd3-selection-multi';
import 'd3-transition';
import '@scola/d3-gesture';
import '@scola/d3-media';

export default class Main {
  constructor() {
    this._fade = true;
    this._mode = 'over';

    this._height = null;
    this._styles = null;
    this._width = null;

    this._gesture = null;
    this._media = null;
    this._slider = null;
    this._menus = new Set();

    this._panning = false;
    this._moveStart = null;
    this._moveWidth = null;

    this._root = select('body')
      .append('div')
      .remove()
      .classed('scola app', true)
      .styles({
        'position': 'relative',
        'z-index': 0
      });

    this._main = this._root
      .append('div')
      .classed('scola main', true)
      .styles({
        'height': '100%',
        'left': '0px',
        'position': 'absolute',
        'right': '0px'
      });

    this._bindRoot();
  }

  destroy() {
    this._unbindRoot();
    this._deleteMedia();
    this._deleteSlider();

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

  fade(value = null) {
    if (value === null) {
      return this._fade;
    }

    this._fade = value;
    return this;
  }

  mode(value = null) {
    if (value === null) {
      return this._mode;
    }

    this._mode = value;
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
    if (action === false) {
      return this._deleteMenu(menu);
    }

    return this._insertMenu(menu);
  }

  hide(callback = () => {}) {
    if (!this._fade) {
      callback();
      return;
    }

    this._root
      .transition()
      .style('opacity', 0)
      .on('end', callback);
  }

  show(callback = () => {}) {
    if (!this._fade) {
      callback();
      return;
    }

    this._root
      .style('opacity', 0)
      .transition()
      .style('opacity', 1)
      .on('end', callback);
  }

  move(delta = null, end = false) {
    if (delta === null) {
      this._moveStart = null;
      this._moveWidth = null;

      return;
    }

    let menuLeft = null;
    let menuRight = null;

    this._menus.forEach((menu) => {
      if (!menuLeft && menu.position() === 'left' && menu.fixed() === false) {
        menuLeft = menu;
      }

      if (!menuRight && menu.position() === 'right' && menu.fixed() === false) {
        menuRight = menu;
      }
    });

    if (this._moveStart === null) {
      this._moveStart = {
        left: parseFloat(this._main.style('left')),
        right: parseFloat(this._main.style('right'))
      };

      this._moveWidth = {
        left: menuLeft ? parseFloat(menuLeft.root().style('width')) : 0,
        right: menuRight ? parseFloat(menuRight.root().style('width')) : 0
      };
    }

    let left = this._moveStart.left + delta;
    let right = this._moveStart.right - delta;

    if (delta > 0) {
      if (left > 0) {
        if (!menuLeft) {
          left = 0;
          right = 0;
        } else if (left > this._moveWidth.left) {
          left = this._moveWidth.left;
          right = -left;
        }
      }

      if (end === true) {
        if (left > this._moveWidth.left / 2) {
          this._transit('left');
        } else if (right > this._moveWidth.right / 2) {
          this._transit('right');
        } else {
          this._transit();
        }

        this.move();
      }
    } else if (delta < 0) {
      if (right > 0) {
        if (!menuRight) {
          left = 0;
          right = 0;
        } else if (right > this._moveWidth.right) {
          right = this._moveWidth.right;
          left = -right;
        }
      }

      if (end === true) {
        if (right > this._moveWidth.right / 2) {
          this._transit('right');
        } else if (left > this._moveWidth.left / 2) {
          this._transit('left');
        } else {
          this._transit();
        }

        this.move();
      }
    }

    if (end === false) {
      this._main.styles({
        left: left + 'px',
        right: right + 'px'
      });
    }
  }

  _bindRoot() {
    this._gesture = this._root
      .gesture()
      .on('panstart', (e) => this._pan(e))
      .on('panright', (e) => this._pan(e))
      .on('panleft', (e) => this._pan(e))
      .on('panend', (e) => this._pan(e))
      .on('swiperight', (e) => this._swipe(e))
      .on('swipeleft', (e) => this._swipe(e))
      .on('tap', (e) => this._swipe(e));
  }

  _unbindRoot() {
    if (this._gesture) {
      this._gesture.destroy();
      this._gesture = null;
    }
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

    this._main.node()
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

  _insertMenu(menu) {
    menu.mode(this._mode);

    if (menu.position() === 'left') {
      this._root.node()
        .insertBefore(menu.root().node(), this._main.node());
    } else {
      this._root.node()
        .appendChild(menu.root().node());
    }

    this._menus.add(menu);
    this._fixMenu();

    return menu;
  }

  _deleteMenu(menu) {
    menu.root().remove();
    this._menus.delete(menu);

    return menu;
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

    this._main.styles(style);
    return this;
  }

  _pan(panEvent) {
    if (panEvent.type === 'panstart') {
      this._panning = true;
    }

    this._panMenu(panEvent);

    if (this._mode !== 'over') {
      this._panMain(panEvent);
    }
  }

  _panMenu(panEvent) {
    let found = null;

    this._menus.forEach((menu) => {
      if (menu.visible()) {
        found = menu;
        return;
      }
    });

    const menus = found ? [found] : this._menus;

    menus.forEach((menu) => {
      if (this._panning === false) {
        menu.move();
      } else {
        menu.move(panEvent.deltaX,
          panEvent.type === 'panend');
      }
    });
  }

  _panMain(panEvent) {
    if (this._panning === false) {
      this.move();
    } else {
      this.move(panEvent.deltaX,
        panEvent.type === 'panend');
    }
  }

  _swipe(swipeEvent) {
    this._panning = false;

    let menuLeft = null;
    let menuRight = null;

    this._menus.forEach((menu) => {
      if (!menuLeft && menu.position() === 'left' &&
        menu.fixed() === false) {

        menuLeft = menu;
      }

      if (!menuRight && menu.position() === 'right' &&
        menu.fixed() === false) {

        menuRight = menu;
      }
    });

    if (!this._moveWidth) {
      this._moveWidth = {
        left: menuLeft ? parseFloat(menuLeft.root().style('width')) : 0,
        right: menuRight ? parseFloat(menuRight.root().style('width')) : 0
      };
    }

    if (swipeEvent.deltaX > 0) {
      if (menuRight && menuRight.visible()) {
        menuRight.hide();
        this._transit();
      } else if (menuLeft) {
        menuLeft.show();
        this._transit('left');
      }
    } else if (swipeEvent.deltaX < 0) {
      if (menuLeft && menuLeft.visible()) {
        menuLeft.hide();
        this._transit();
      } else if (menuRight) {
        menuRight.show();
        this._transit('right');
      }
    } else {
      if (this._mode !== 'over') {
        return;
      }

      if (menuLeft && menuLeft.visible()) {
        menuLeft.hide();
      } else if (menuRight && menuRight.visible()) {
        menuRight.hide();
      }
    }
  }

  _transit(position = null) {
    if (this._mode === 'over') {
      return;
    }

    const styles = {
      left: '0px',
      right: '0px'
    };

    if (position === 'left') {
      styles.left = this._moveWidth.left + 'px';
      styles.right = -this._moveWidth.left + 'px';
    }

    if (position === 'right') {
      styles.left = -this._moveWidth.right + 'px';
      styles.right = this._moveWidth.right + 'px';
    }

    this._main
      .transition()
      .styles(styles);
  }
}
