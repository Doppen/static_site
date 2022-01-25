let breakpoint = '800px'

const allHideOnSmall = document.querySelectorAll(".in_hideOnSmall");
for (i = 0; i < allHideOnSmall.length; i++) {
}

const allHideOnBig = document.querySelectorAll(".in_HideOnBig");
for (i = 0; i < allHideOnBig.length; i++) {
}




function handleResponsive(isSmallscreen) {
  console.log(allHideOnSmall);
  if (isSmallscreen.matches) { // If media query matches
    for (i = 0; i < allHideOnSmall.length; i++) {
      allHideOnSmall[i].style.display = 'none';
    }
    for (j = 0; j < allHideOnBig.length; j++) {
      allHideOnBig[j].style.display = 'flex';
    }

  } else {
    for (i = 0; i < allHideOnBig.length; i++) {
      allHideOnBig[i].style.display = 'none';
    }
    for (j = 0; j < allHideOnSmall.length; j++) {
      allHideOnSmall[j].style.display = 'flex';
    }
  }
}


var isSmallscreen = window.matchMedia('(max-width: '+breakpoint+')')
handleResponsive(isSmallscreen) // Call listener function at run time
isSmallscreen.addListener(handleResponsive) // Attach listener function on state changes
