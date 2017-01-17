/* eslint prefer-reflect: "off" */

import { select } from 'd3-selection';
import { slider } from '@scola/d3-slider';
import 'd3-selection-multi';
import 'd3-transition';
import '@scola/d3-gesture';
import '@scola/d3-media';

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
      .remove()
      .classed('scola menu', true)
      .styles({
        'border': '1px none #CCC',
        'height': '100%',
        'max-width': '85%',
        'position': 'absolute'
      });
  }

  destroy() {
    this._deleteGesture();
    this._deleteMedia();
    this._deleteSlider();

    this._root.dispatch('destroy');
    this._root.remove();
    this._root = null;
  }

  root() {
    return this._root;
  }

  fixed() {
    return this._fixed;
  }

  fixedAt() {
    return this._fixedAt;
  }

  visible() {
    return this._visible;
  }

  width() {
    return this._width;
  }

  border() {
    this._root
      .style('border-' + this._position + '-style', 'none')
      .style('border-' + this._opposite(this._position) + '-style', 'solid');

    return this;
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

  media(width = '21.333em', fixedAt = '64em') {
    if (width === null) {
      return this._media;
    }

    if (width === false) {
      return this._deleteMedia();
    }

    if (!this._media) {
      this._insertMedia(width, fixedAt);
    }

    return this;
  }

  mode(value = null) {
    if (value === null) {
      return this._mode;
    }

    this._root.style('z-index', value === 'under' ? -1 : 1);
    this._mode = value;

    return this;
  }

  position(value = null) {
    if (value === null) {
      return this._position;
    }

    this._root.style(this._position, null);
    this._position = value;

    return this;
  }

  fix() {
    this._root
      .style(this._position, '0px');

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
    this._root.style(this._position,
      this._mode === 'under' ? '0px' : '-' + this._width);

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
      this._root.transition().style(this._position, '0px');
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

  slider(action = true) {
    if (action === false) {
      return this._deleteSlider();
    }

    if (!this._slider) {
      this._insertSlider();
    }

    return this._slider;
  }

  _insertGesture() {
    this._gesture = this._root
      .gesture()
      .on('tap', (tapEvent) => {
        if (!this._fixed) {
          tapEvent.stopPropagation();
        }
      });

    return this;
  }

  _deleteGesture() {
    if (this._gesture) {
      this._gesture.destroy();
      this._gesture = null;
    }

    return this;
  }

  _insertMedia(width, fixedAt) {
    this._width = width;
    this._fixedAt = fixedAt;

    this._root.style('width', width);

    this._media = this._root
      .media(`not all and (min-width: ${width})`)
      .style('width', '85%')
      .media(`not all and (min-width: ${fixedAt})`)
      .call(() => this.unfix())
      .media(`(min-width: ${fixedAt})`)
      .call(() => this.fix())
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

    this._root.node()
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

  _opposite(position) {
    return position === 'left' ? 'right' : 'left';
  }
}
