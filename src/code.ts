const VOC_WIDTH = 500;
const VOC_HEIGHT = 380;
const MARGIN_H = 100;
const MARGIN_V = 200;
const VOC_PER_ROW = 5;
const VOC_LOCK_SIZE = 64;
const TEXT_STYLE_NAME = 'Description';

figma.showUI(__html__, {width: 400, height: 300});

figma.ui.onmessage = msg => {
  switch (msg.type) {
    case 'get-catIds':
      getCatIds();
      break;
    case 'create-cat':
      createCat(msg.catId, msg.catName);
      break;
    case 'create-voc':
      createVoc(msg.vocId, msg.position, msg.title, msg.wordClass, msg.svg);
      break;
    case 'get-export-vocIds':
      getExportSvg();
      break;
    case 'get-vocId-svg':
      getVocSvg(msg.vocId);
      break;
    default:
      return;
  }
};

let pageVocIds: number[] = [];
let pageNode: PageNode;
let textStyle: TextStyle = null;
const backgroundStyle: PaintStyle = figma.createPaintStyle();
backgroundStyle.name = 'white background';
const white: SolidPaint = {
  type: 'SOLID',
  color: {r: 1, g: 1, b: 1},
};
backgroundStyle.paints = [white];

figma.loadFontAsync({ family: "Roboto", style: "Regular" }).then(() => {
  figma.getLocalTextStyles().forEach(ts => {
    if (ts.name === TEXT_STYLE_NAME) {
      textStyle = ts;
    }
  });
  if (!textStyle) {
    textStyle = figma.createTextStyle();
    textStyle.fontSize= 22;
    textStyle.name = TEXT_STYLE_NAME;
  }
});


const getCatIds = () => {
  let catIds: number[] = [];

  figma.root
    .findAll((node: BaseNode) => node.type === 'TEXT')
    .forEach((textNode: TextNode) => {
      if (textNode.name === 'catIds') {
        catIds = textNode.characters.split(',').map(catId => parseInt(catId.trim()));
      }
    });

  figma.ui.postMessage({
    type: 'got-catIds',
    catIds
  });
};

const createCat = (catId: number, catName: string) => {
  pageNode = pageExists(catId);
  if (!pageNode) {
    pageNode = createPage(catId, catName);
  }
  figma.currentPage = pageNode;
  figma.ui.postMessage({
    type: 'created-cat',
    pageVocIds
  });
};

const pageExists = (catId: number) => {
  let pageFound: PageNode = null;
  figma.root.findAll((node: BaseNode) => node.type === 'PAGE').
    forEach((pageNode: PageNode) => {
    if (pageNode.name.indexOf(`[${catId}]`) !== -1) {
      pageFound = pageNode;
    }
  });
  pageVocIds = [];
  if (pageFound) {
    pageFound.findAll((node: BaseNode) => node.type === 'FRAME').
    forEach((frameNode: FrameNode) => {
      pageVocIds.push(parseInt(frameNode.name));
    });
  }

  return pageFound;
};

const createPage = (catId: number, catName: string) => {
  const pageNode = figma.createPage();
  pageNode.name = `[${catId}] ${catName}`;
  pageVocIds = [];
  return pageNode;
};

const  createVoc = (
  vocId: number,
  position: number,
  title: string,
  wordClass: string,
  svg: string
) => {
  let frameNode: FrameNode;
  if (svg === '' || svg.indexOf('<html>') !== -1) {
    //not valid svg
    frameNode = figma.createFrame();
  } else {
    frameNode = figma.createNodeFromSvg(svg);
  }
  frameNode.name = `${vocId}`;
  const [x, y] = getFramePos();
  frameNode.x = x;
  frameNode.y = y;
  frameNode.resize(VOC_WIDTH, VOC_HEIGHT);
  pageVocIds.push(vocId);

  let rectangleNode = figma.createRectangle();
  rectangleNode.x = frameNode.x;
  rectangleNode.y = frameNode.y + VOC_HEIGHT + 10;
  rectangleNode.resize(VOC_LOCK_SIZE, VOC_LOCK_SIZE);
  rectangleNode.fills = [{type: 'SOLID', color: {r: 1, g: 0.8, b: 0.8}}];

  createLock(frameNode);

  let textNode = figma.createText();
  textNode.x = x + VOC_LOCK_SIZE +10;
  textNode.y = y + VOC_HEIGHT + 10;
  textNode.textStyleId = textStyle.id;
  textNode.characters = wordClass;

  textNode = figma.createText();
  textNode.x = x + VOC_LOCK_SIZE +10;
  textNode.y = y + VOC_HEIGHT + 50;
  textNode.textStyleId = textStyle.id;
  textNode.characters = title;

  if (position < 1000) {
    textNode = figma.createText();
    textNode.x = x + VOC_WIDTH;
    textNode.y = y + VOC_HEIGHT + 10;
    textNode.textStyleId = textStyle.id;
    textNode.textAlignHorizontal = 'RIGHT';
    textNode.characters = position.toString();
  }
  cleanFrame(frameNode);
  whiteBackground(frameNode);

  figma.ui.postMessage({
    type: 'created-voc',
  });
};

const getFramePos = () => {
  const row = Math.floor(pageVocIds.length / VOC_PER_ROW);
  const column = pageVocIds.length % VOC_PER_ROW;

  return [column * (VOC_WIDTH + MARGIN_H), row * (VOC_HEIGHT + MARGIN_V)];
};

const createLock = (frameNode: FrameNode) => {
  let rectangleNode = figma.createRectangle();
  rectangleNode.x = frameNode.x;
  rectangleNode.y = frameNode.y + VOC_HEIGHT + 10;
  rectangleNode.resize(VOC_LOCK_SIZE, VOC_LOCK_SIZE);
  rectangleNode.fills = [{type: 'SOLID', color: {r: 0.8, g: 1, b: 0.8}}];
  rectangleNode.name = `lock_${frameNode.name}`;
};

const whiteBackground = (frameNode: FrameNode) => {
  let found = false;
  frameNode.findAll((node => node.type === 'GROUP')).forEach(groupNode => {
    if (!found && groupNode.name.toLowerCase() === 'background') {
      groupNode.remove();
      found = true;
    }
  });
  //frameNode.backgroundStyleId = backgroundStyle.id;
};

const cleanFrame = (frameNode: FrameNode) => {
  if (
    frameNode.children.length === 1 &&
    frameNode.children[0].type === 'GROUP'
  ) {
    const groupNode = frameNode.children[0] as FrameNode;
    groupNode.children.forEach(node => frameNode.appendChild(node));

    cleanFrame(frameNode);
  }

  //clean white background
  frameNode.children.forEach(node => {
    console.log(node.type);
    console.log(node.name);
    if (node.type === 'VECTOR' && node.name === 'Vector') {
      node.remove();
    }
  })

};

const getExportSvg = () => {
  const vocIds: number[] = [];
  figma.root.findAll((node: BaseNode) => node.type === 'FRAME').
  forEach((frameNode: FrameNode) => {
    vocIds.push(parseInt(frameNode.name));
  });

  figma.ui.postMessage({
    type: 'got-export-vocIds',
    vocIds,
  });
};

const getVocSvg = (vocId: number) => {
  let frameNode: FrameNode;
  figma.root.findAll((node: BaseNode) => node.type === 'FRAME').
  forEach((fn: FrameNode) => {
    if ( vocId === parseInt(fn.name)) {
      frameNode = fn;
    }
  });

  let svg: string = '';
  if (frameNode) {
    frameNode.exportAsync({format: "SVG",svgIdAttribute: true}).then((result) => {
      svg = String.fromCharCode.apply(null, new Uint16Array(result));
      figma.ui.postMessage({
        type: 'got-vocId-svg',
        svg,
      });
    });
  }else{
    figma.ui.postMessage({
      type: 'got-vocId-svg',
      svg,
    });
  }


};
