/* eslint prefer-reflect: "off" */

import { select } from 'd3';
import { slider } from '@scola/d3-slider';

export default class Menu {
  constructor() {
    this._mode = null;
    this._position = null;

    this._width = null;
    this._fixedAt = null;

    this._fixed = false;
    this._visible = false;

    this._moveStart = null;
    this._moveWidth = null;

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

    this._bindRoot();
  }

  destroy() {
    this._unbindRoot();
    this._deleteMedia();
    this._deleteSlider();

    this._root.dispatch('destroy');
    this._root.remove();
    this._root = null;
  }

  root() {
    return this._root;
  }

  fixedAt() {
    return this._fixedAt;
  }

  width() {
    return this._width;
  }

  mode(value = null) {
    if (value === null) {
      return this._mode;
    }

    this._root.style('z-index', value === 'under' ? -1 : 1);
    this._mode = value;

    this.reset();
    return this;
  }

  position(value = null) {
    if (value === null) {
      return this._position;
    }

    this._root.style(this._position, null);
    this._position = value;

    this.border();
    this.reset();

    return this;
  }

  border() {
    const opposite = this._position === 'left' ? 'right' : 'left';

    this._root
      .style('border-' + this._position + '-style', 'none')
      .style('border-' + opposite + '-style', 'solid');

    return this;
  }

  size(width = '21.333em', fixedAt = '64em') {
    if (width === null) {
      return this._media;
    }

    if (width === false) {
      return this._deleteMedia();
    }

    if (this._media === null) {
      this._insertMedia(width, fixedAt);
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

  fixed(value = null) {
    if (value === null) {
      return this._fixed;
    }

    this._fixed = value;
    this._visible = value;

    const position = value === true || this._mode === 'under' ?
      '0px' : '-' + this._width;

    this._root.style(this._position, position);

    this._root.dispatch('fix', { detail: value });
    return this;
  }

  show(value = null) {
    if (value === null) {
      return this._visible;
    }

    const cancel =
      this._fixed === true ||
      this._visible === value;

    if (cancel === true) {
      return false;
    }

    this._visible = value;

    if (this._mode !== 'under') {
      const width = this._root.style('width');
      const position = value === true ? '0px' : '-' + width;

      return this._root
        .transition()
        .style(this._position, position);
    }

    return true;
  }

  move(delta = null, end = false) {
    if (delta === null) {
      this._moveStart = null;
      this._moveWidth = null;

      return false;
    }

    if (this._fixed || this._mode === 'under') {
      return false;
    }

    if (this._position === 'right') {
      delta *= -1;
    }

    if (this._moveStart === null) {
      this._moveStart = parseFloat(this._root.style(this._position));
      this._moveWidth = parseFloat(this._root.style('width'));
    }

    let value = this._moveStart + delta;

    if (value < -this._moveWidth) {
      value = -this._moveWidth;
    } else if (value > 0) {
      value = 0;
    }

    if (end === false) {
      this._root.style(this._position, value + 'px');
    } else {
      this._visible = value <= -this._moveWidth / 2;
      this.show(!this._visible);
      this.move();
    }

    return true;
  }

  reset() {
    return this.fixed(this._fixed);
  }

  toggle() {
    this.show(!this._visible);
    return this;
  }

  _bindRoot() {
    this._gesture = this._root
      .gesture()
      .on('tap', (tapEvent) => {
        tapEvent.stopPropagation();
      });
  }

  _unbindRoot() {
    if (this._gesture) {
      this._gesture.destroy();
      this._gesture = null;
    }
  }

  _insertMedia(width, fixedAt) {
    this._width = width;
    this._fixedAt = fixedAt;

    this._root.style('width', width);

    this._media = this._root
      .media(`not all and (min-width: ${width})`)
      .style('width', '85%')
      .media(`not all and (min-width: ${fixedAt})`)
      .call(() => this.fixed(false))
      .media(`(min-width: ${fixedAt})`)
      .call(() => this.fixed(true))
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

    this._root
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
}
