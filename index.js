import Container from './src/container';
import Main from './src/main';
import Menu from './src/menu';

export function main(options) {
  return new Main(options);
}

export function menu(options) {
  return new Menu(options);
}

export function container(options) {
  return new Container(options, main(options), menu(options));
}
