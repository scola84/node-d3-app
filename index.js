import './src/helper/style.css';
import Main from './src/main';
import Menu from './src/menu';

function main() {
  return new Main();
}

function menu() {
  return new Menu();
}

export {
  main,
  menu
};
