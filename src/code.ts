const VOC_WIDTH = 500;
const VOC_HEIGHT = 380;
const MARGIN_H = 100;
const MARGIN_V = 200;
const VOC_PER_ROW = 5;

figma.showUI(__html__, {width: 400, height: 300});

figma.ui.onmessage = msg => {
  switch (msg.type) {
    case 'create-cat':
      createCat(msg.catId, msg.catName);
      break;
    case 'create-voc':
      createVoc(msg.vocId, msg.position, msg.title, msg.wordClass, msg.svg);
      break;
    default:
      return;
  }
};

let pageVocIds: number[] = [];
let pageNode: PageNode;

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
  pageFound.findAll((node: BaseNode) => node.type === 'FRAME').
  forEach((frameNode: FrameNode) => {
    pageVocIds.push(parseInt(frameNode.name));
  });

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
  if (svg.indexOf('<html>') !== -1) {
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

  figma.ui.postMessage({
    type: 'created-voc',
  });
};

const getFramePos = () => {
  const row = Math.floor(pageVocIds.length / VOC_PER_ROW);
  const column = pageVocIds.length % VOC_PER_ROW;

  return [column * (VOC_WIDTH + MARGIN_H), row * (VOC_HEIGHT + MARGIN_V)];
};
