import { select } from 'd3';
import { slider } from '@scola/d3-slider';

export default class Main {
  constructor() {
    this._fade = true;
    this._mode = 'over';
    this._visible = true;

    this._height = null;
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
        'display': 'flex',
        'flex-direction': 'column',
        'overflow': 'hidden',
        'position': 'relative',
        'z-index': 0
      });

    this._body = this._root
      .append('div')
      .classed('scola body', true)
      .styles({
        'flex': 'auto',
        'position': 'relative'
      });

    this._main = this._body
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

  size(width = '64em', height = '48em') {
    if (width === null) {
      return this._media;
    }

    if (width === false) {
      return this._deleteMedia();
    }

    if (this._media === null) {
      this._insertMedia(width, height);
    }

    return this;
  }

  slider(action = true) {
    if (action === false) {
      return this._deleteSlider();
    }

    if (this._slider === null) {
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

  show(value = null) {
    if (this._fade === false) {
      return false;
    }

    if (value === null) {
      return this._visible;
    }

    this._visible = value;

    const begin = value === true ? 0 : 1;
    const end = value === true ? 1 : 0;

    return this._root
      .style('opacity', begin)
      .transition()
      .style('opacity', end);
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
      if (menuLeft === null &&
        menu.position() === 'left' &&
        menu.fixed() === false) {

        menuLeft = menu;
      }

      if (menuRight === null &&
        menu.position() === 'right' &&
        menu.fixed() === false) {

        menuRight = menu;
      }
    });

    if (this._moveStart === null) {
      this._moveStart = {
        left: this._main.computedStyle('left'),
        right: this._main.computedStyle('right')
      };

      this._moveWidth = {
        left: menuLeft === null ?
          0 : menuLeft.root().boundingRect('width'),
        right: menuRight === null ?
          0 : menuRight.root().boundingRect('width')
      };
    }

    let left = this._moveStart.left + delta;
    let right = this._moveStart.right - delta;

    if (delta > 0) {
      if (left > 0) {
        if (menuLeft === null) {
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
        if (menuRight === null) {
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

  _bindMenu(menu) {
    menu.root().on('fix.scola-app', () => this._fixMenu());
  }

  _unbindMenu(menu) {
    menu.root().on('fix.scola-app', null);
  }

  _insertMedia(width, height) {
    this._width = width;
    this._height = height;

    const minWidthHeight = {
      'border-radius': '1em'
    };

    const minHeight = {
      'border-bottom': '1px solid #CCC',
      'border-top': '1px solid #CCC',
      height
    };

    const maxHeight = {
      'border-top': 0,
      'border-bottom': 0,
      'height': '100%'
    };

    const minWidth = {
      'border-left': '1px solid #CCC',
      'border-right': '1px solid #CCC',
      width
    };

    const maxWidth = {
      'border-left': 0,
      'border-right': 0,
      'width': '100%'
    };

    if (width !== -1 && height !== -1) {
      this._media = this._root
        .media(`(min-height: ${height}) and (min-width: ${width})`)
        .styles(minWidthHeight);
    }

    if (height !== -1) {
      this._media = (this._media || this._root)
        .media(`(min-height: ${height})`)
        .styles(minHeight)
        .media(`not all and (min-height: ${height})`)
        .styles(maxHeight);
    } else {
      this._root.styles(maxHeight);
    }

    if (width !== -1) {
      this._media = (this._media || this._root)
        .media(`(min-width: ${width})`)
        .styles(minWidth)
        .media(`not all and (min-width: ${width})`)
        .styles(maxHeight)
        .styles(maxWidth);
    } else {
      this._root.styles(maxWidth);
    }

    if (this._media) {
      this._media.start();
    }

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

    this._main
      .append(() => this._slider.root().node());

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
      this._body.node()
        .insertBefore(menu.root().node(), this._main.node());
    } else {
      this._body
        .append(() => menu.root().node());
    }

    this._menus.add(menu);
    this._bindMenu(menu);
    this._fixMenu();

    return menu;
  }

  _deleteMenu(menu) {
    this._unbindMenu(menu);
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
      if (menu.fixed() === true) {
        style[menu.position()] = menu.width();
      } else {
        menu.show(false);
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
      if (menu.show() === true) {
        found = menu;
        return;
      }
    });

    const menus = found === null ?
      this._menus : [found];

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
      if (menuLeft === null &&
        menu.position() === 'left' &&
        menu.fixed() === false) {

        menuLeft = menu;
      }

      if (menuRight === null &&
        menu.position() === 'right' &&
        menu.fixed() === false) {

        menuRight = menu;
      }
    });

    if (this._moveWidth === null) {
      this._moveWidth = {
        left: menuLeft === null ? 0 : menuLeft.root().boundingRect('width'),
        right: menuRight === null ? 0 : menuRight.root().boundingRect('width')
      };
    }

    if (swipeEvent.type === 'tap') {
      if (this._mode !== 'over') {
        return;
      }

      if (menuLeft !== null && menuLeft.show() === true) {
        menuLeft.show(false);
      } else if (menuRight !== null && menuRight.show() === true) {
        menuRight.show(false);
      }
    } else if (swipeEvent.deltaX > 0) {
      if (menuRight !== null && menuRight.show() === true) {
        menuRight.show(false);
        this._transit();
      } else if (menuLeft !== null) {
        menuLeft.show(true);
        this._transit('left');
      }
    } else if (swipeEvent.deltaX < 0) {
      if (menuLeft !== null && menuLeft.show() === true) {
        menuLeft.show(false);
        this._transit();
      } else if (menuRight !== null) {
        menuRight.show(true);
        this._transit('right');
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
