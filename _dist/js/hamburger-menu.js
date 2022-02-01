

let hamburgerMenu = function (status) {
  if (status === 'show') {
    document.getElementById('in_menu-behind-hamburger').style.display = 'flex';
  }else if (status === 'hide') {
    document.getElementById('in_menu-behind-hamburger').style.display = 'none';
  }
}
