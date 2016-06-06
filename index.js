import Container from './src/container';
import Menu from './src/menu';

export function menu(options) {
  return new Menu(options);
}

export function container(options) {
  return new Container(options);
}
