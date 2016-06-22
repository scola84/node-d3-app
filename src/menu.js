/* eslint prefer-reflect: "off" */

import { select } from 'd3-selection';
import { slider } from '@scola/d3-slider';

export default class Menu {
  constructor() {
    this._width = null;
    this._fixedAt = null;
    this._position = null;
    this._mode = null;

    this._fixed = false;
    this._visible = false;

    this._gesture = null;
    this._media = null;
    this._slider = null;

    this._root = select('body')
      .append('div')
      .classed('scola menu', true)
      .styles({
        'border': '0 solid #CCC',
        'height': '100%',
        'position': 'absolute'
      });
  }

  destroy() {
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

  fixed() {
    return this._fixed;
  }

  fixedAt() {
    return this._fixedAt;
  }

  root() {
    return this._root;
  }

  visible() {
    return this._visible;
  }

  width() {
    return this._width;
  }

  border() {
    this._root
      .style('border-' + this._position + '-width', 0)
      .style('border-' + this._opposite(this._position) + '-width', 1);

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
      .on('tap', (event) => {
        if (!this._fixed) {
          event.stopPropagation();
        }
      });

    return this;
  }

  media(width = '21.333em', fixedAt = '64em') {
    if (width === null) {
      return this._media;
    }

    if (width === false) {
      this._media.destroy();
      this._media = null;

      return this;
    }

    this._width = width;
    this._fixedAt = fixedAt;

    this._root.style('width', width);

    this._media = this._root
      .media(`not all and (min-width: ${width})`)
      .style('width', '90%')
      .media(`not all and (min-width: ${fixedAt})`)
      .call(() => this.unfix())
      .media(`(min-width: ${fixedAt})`)
      .call(() => this.fix())
      .start();

    return this;
  }

  mode(mode) {
    if (typeof mode === 'undefined') {
      return this._mode;
    }

    this._root.style('z-index', mode === 'under' ? -1 : 1);
    this._mode = mode;

    return this;
  }

  position(position) {
    if (typeof position === 'undefined') {
      return this._position;
    }

    this._root.style(this._position, null);
    this._position = position;

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

    this._root.node()
      .appendChild(this._slider.root().node());

    return this;
  }

  fix() {
    this._root
      .style(this._position, 0);

    this._fixed = true;
    this._visible = true;

    this._root.dispatch('fix', {
      detail: {
        menu: this
      }
    });

    return this;
  }

  unfix() {
    this._root
      .style(this._position, this._mode === 'under' ? 0 : '-' + this._width);

    this._fixed = false;
    this._visible = false;

    this._root.dispatch('unfix', {
      detail: {
        menu: this
      }
    });

    return this;
  }

  show() {
    if (this._fixed || this._visible) {
      return false;
    }

    if (this._mode !== 'under') {
      this._root.transition().style(this._position, '0');
    }

    this._visible = true;

    this._root.dispatch('show', {
      detail: {
        menu: this
      }
    });

    return true;
  }

  hide() {
    if (this._fixed || !this._visible) {
      return false;
    }

    if (this._mode !== 'under') {
      this._root.transition().style(this._position, '-' + this._width);
    }

    this._visible = false;

    this._root.dispatch('hide', {
      detail: {
        menu: this
      }
    });

    return true;
  }

  reset() {
    if (this._fixed) {
      this.fix();
    } else {
      this.unfix();
    }

    return this;
  }

  toggle() {
    if (this._visible) {
      this.hide();
    } else {
      this.show();
    }

    return this;
  }

  _opposite(position) {
    return position === 'left' ? 'right' : 'left';
  }
}
