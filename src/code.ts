figma.showUI(__html__, {width: 400, height: 300});


figma.ui.onmessage = msg => {
  switch (msg.type) {
    case 'add-page':
      break;
    default:
      return;
  }
};
