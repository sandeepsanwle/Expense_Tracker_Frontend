import { AppRegistry } from 'react-native';
import App from './App';

// Load MaterialCommunityIcons font for web
import MaterialCommunityIcons from 'react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf';

const iconFontStyles = `@font-face {
  src: url(${MaterialCommunityIcons});
  font-family: MaterialCommunityIcons;
}`;

const style = document.createElement('style');
style.type = 'text/css';
style.appendChild(document.createTextNode(iconFontStyles));
document.head.appendChild(style);

AppRegistry.registerComponent('ExpenseTrackerApp', () => App);
AppRegistry.runApplication('ExpenseTrackerApp', {
  rootTag: document.getElementById('root'),
});
