import React from 'react'
import ReactDOM from 'react-dom'
import domtoimage from 'dom-to-image'
import uuidv4 from 'uuid/v4'
import { Rnd } from 'react-rnd'
import DragDropContainer from './DragDropContainer'
import noimage from './img/noimage.png'

const fonts = [
  {type: '', name: '未選択'},
  {type: 'APJapanesefont', name: 'あんず文字'},
  {type: 'Kosugi', name: '小杉フォント'},
]

export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      items: {},
      element: null,
      imageUrl: null,
    }
    this.rnds = {}

    this.onAddItem = this.onAddItem.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDrag = this.onDrag.bind(this)
    this.onResizeStart = this.onResizeStart.bind(this)
    this.onResize = this.onResize.bind(this)
    this.onUpdatePos = this.onUpdatePos.bind(this)
    this.onUpdateSize = this.onUpdateSize.bind(this)
    this.onUpdateStyle = this.onUpdateStyle.bind(this)
    this.onUpdateAttr = this.onUpdateAttr.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onChangeBackgroundColor = this.onChangeBackgroundColor.bind(this)
    this.onLoadBackgroundFile = this.onLoadBackgroundFile.bind(this)
    this.onCapture = this.onCapture.bind(this)
    this.onDownload = this.onDownload.bind(this)
  }


  onAddItem(item, dropResult) {
    if (item.name === 'テキスト') {
      const newItem = {
        id: uuidv4(),
        type: 'text',
        zIndex: 0,
        text: 'ドラッグで移動',
        default: {x: dropResult.clientOffset.x - 50, y: dropResult.clientOffset.y - 20,  width: 120, height: 26},
        component: (id, text) => <div id={id} style={{width: '100%', height: '100%', border: (this.state.element || {}).id === id ? '1px dotted black' : 'none'}}>{text}</div>,
      }
      const items = this.state.items
      items[newItem.id] = newItem
      this.setState({items})
    } else if (item.name === '画像') {
      const newItem = {
        id: uuidv4(),
        type: 'image',
        zIndex: 0,
        src: noimage,
        default: {x: dropResult.clientOffset.x - 50, y: dropResult.clientOffset.y - 20, width: 128, height: 128},
        component: (id, src) => <img id={id} draggable='false' src={src} style={{display: 'block', width: '100%', height: '100%', border: (this.state.element || {}).id === id ? '1px dotted black' : 'none'}} />,
      }
      const items = this.state.items
      items[newItem.id] = newItem
      this.setState({items})
    }
  }

  onDragStart(e, d) {
    const width = e.target.getBoundingClientRect().right -  e.target.getBoundingClientRect().left
    const height = e.target.getBoundingClientRect().bottom -  e.target.getBoundingClientRect().top
    this.setState({ x: d.x, y: d.y, width, height, element: e.target })
  }

  onDrag(e, d) {
    if (e.target == this.state.element) {
      this.setState({ x: d.x, y: d.y, element: e.target })
    }
  }

  onResizeStart(e, direction, ref) {
    this.setState({ width: ref.offsetWidth, height: ref.offsetHeight })
  }

  onResize(e, direction, ref) {
    this.setState({ width: ref.offsetWidth, height: ref.offsetHeight })
  }

  onUpdatePos(value, type) {
    const { element } = this.state
    this.rnds[element.id].updatePosition({
      x: type === 'left' ? parseInt(value) : element.getBoundingClientRect().left,
      y: type === 'top' ? parseInt(value) : element.getBoundingClientRect().top,
    })
    this.setState({element})
  }

  onUpdateSize(value, type) {
    const { element } = this.state
    this.rnds[element.id].updateSize({
      width: type === 'width' ? parseInt(value) : element.getBoundingClientRect().right - element.getBoundingClientRect().left,
      height: type === 'height' ? parseInt(value) : element.getBoundingClientRect().bottom - element.getBoundingClientRect().top,
    })
    this.setState({element})
  }

  onUpdateAttr(value, type) {
    const items = this.state.items
    items[this.state.element.id][type] = value
    this.setState({items})
  }

  onUpdateStyle(value, type) {
    const element = this.state.element
    element.style[type] = value
    this.setState({element})
  }

  onDelete() {
    // delete
    const { element } = this.state
    if (element) {
      const items = this.state.items
      delete items[element.id]
      this.setState({element: null, items, x: 0, y: 0, width: 0, height: 0})
    }
  }

  onChangeBackgroundColor(e) {
    const color = e.target.value
    this.setState({backgroundColor: color})
  }

  onLoadBackgroundFile(e) {
    var file = e.target.files
    var reader = new FileReader()
    reader.readAsDataURL(file[0])
    reader.onload = () => {
      const dataUrl = reader.result
      this.setState({backgroundImage: dataUrl})
    }
  }

  onCapture() {
    this.setState({element: null})
    const node = document.getElementById('node')
    const nodeRect = node.getBoundingClientRect()
    const drags = document.querySelectorAll('.react-draggable')
    for (let i = 0; i < drags.length; i++) {
      const element = drags.item(i)
      const elementRect = element.getBoundingClientRect()
      element.style.transform = `translate(${elementRect.left - nodeRect.left}px, ${elementRect.top - nodeRect.top}px)`
    }
    const scale = 2 // ディスプレイの解像度による、macbook pro retinaディスプレイは２倍の解像度が必要
    domtoimage.toPng(node, {
      width: node.offsetWidth * scale,
      height: node.offsetHeight * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: node.offsetWidth + 'px',
        height: node.offsetHeight + 'px',
        left: -nodeRect.left + 'px',
        top: -nodeRect.top + 'px',
      },
    })
      .then((dataUrl) => {
        for (let i = 0; i < drags.length; i++) {
          const element = drags.item(i)
          const elementRect = element.getBoundingClientRect()
          element.style.transform = `translate(${elementRect.left + nodeRect.left}px, ${elementRect.top + nodeRect.top}px)`
        }
        this.setState({imageUrl: dataUrl, width: node.offsetWidth, height: node.offsetHeight})
      })
      .catch((error) => {
        console.error(error)
      })
  }

  onDownload() {
    const link = document.createElement('a')
    link.download = 'flyer.png'
    link.href = this.state.imageUrl
    link.click()
  }

  render () {
    const { items, element, imageUrl, x, y, width, height, backgroundColor, backgroundImage } = this.state

    const styles = {
      root: {
        padding: 10,
      },
      board: {
        width: 750,
        height: 562,
        border: '1px solid black',
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      },
      container: {
        display: 'flex',
      },
      itemStyle: {
        width: 80, textAlign: 'center', border: '1px dotted black', margin: 10,
      },
      output: {
        display: 'block',
      },
    }

    return (
      <div style={styles.root} >
        <style dangerouslySetInnerHTML={{__html: `
@font-face {
  font-family: 'APJapanesefont';
  font-display: swap;
  src: url('./font/APJapanesefont.ttf') format('truetype');
}

@font-face {
  font-family: 'Kosugi';
  font-display: swap;
  src: url('./font/Kosugi-Regular.ttf') format('truetype');
}
        `}}>
        </style>
        <div style={styles.container}>
          <DragDropContainer
            items={[
              {name: 'テキスト'},
              {name: '画像'},
            ]}
            itemStyle={styles.itemStyle}
            onDrop={(item, dropResult) => this.onAddItem(item, dropResult)}
            extras={
              <div style={{margin: 10}}>
                {element &&
                  <StyleController
                    element={element}
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    item={items[element.id]}
                    onUpdatePos={this.onUpdatePos}
                    onUpdateSize={this.onUpdateSize}
                    onUpdateStyle={this.onUpdateStyle}
                    onUpdateAttr={this.onUpdateAttr}
                    onDelete={this.onDelete}
                  />
                }
              </div>
            }
          >
            <section id='node'>
              <div style={styles.board}>
                {Object.values(items).map(item => (
                  <Rnd
                    key={item.id}
                    style={{zIndex: item.zIndex}}
                    ref={rnd => this.rnds[item.id] = rnd}
                    bounds='parent'
                    default={{x: item.default.x, y: item.default.y, width: item.default.width, height: item.default.height}}
                    onDragStart={this.onDragStart}
                    onDrag={this.onDrag}
                    onResizeStart={this.onResizeStart}
                    onResize={this.onResize}
                  >
                    {item.type =='text' ? item.component(item.id, item.text) : item.component(item.id, item.src)}
                  </Rnd>
                ))}
              </div>
            </section>
          </DragDropContainer>
        </div>
        <div>
          背景
          <input type='color' value={backgroundColor || '#ffffff'} onChange={this.onChangeBackgroundColor} />
          or
          <input type='file' accept='image/*' onChange={this.onLoadBackgroundFile} />
        </div>
        <div>
          <button onClick={this.onCapture}>画像作成</button>
          {!element && imageUrl &&
            <div style={{marginTop: 20}}>
              <img src={imageUrl} width={width} height={height} style={styles.output} />
              <button onClick={this.onDownload}>ダウンロード</button>
            </div>
          }
        </div>
      </div>
    )
  }
}

class StyleController extends React.Component {
  constructor (props) {
    super(props)
    this.onChange = this.onChange.bind(this)
    this.onChangeAttr = this.onChangeAttr.bind(this)
    this.createTransform = this.createTransform.bind(this)
    this.onLoadFile = this.onLoadFile.bind(this)
    this.addFilter = this.addFilter.bind(this)
    this.changeFilter = this.changeFilter.bind(this)
    this.removeFilter = this.removeFilter.bind(this)
  }

  onChange(value, type) {
    if (type === 'left' || type === 'top') {
      this.props.onUpdatePos(value, type)
    } else if (type === 'width' || type === 'height') {
      this.props.onUpdateSize(value, type)
    } else {
      this.props.onUpdateStyle(value, type)
    }
  }

  onChangeAttr(value, type) {
    this.props.onUpdateAttr(value, type)
  }

  createTransform(x, y, z) {
    return `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`
  }

  onLoadFile(e) {
    var file = e.target.files
    var reader = new FileReader()
    reader.readAsDataURL(file[0])
    reader.onload = () => {
      const dataUrl = reader.result
      this.onChangeAttr(dataUrl, 'src')
    }
  }

  addFilter(type) {
    let filter = this.props.element.style.filter
    if (type === 'brightness') {
      filter += 'brightness(150%)'
    }
    if (type === 'contrast') {
      filter += 'contrast(150%)'
    }
    if (type === 'saturate') {
      filter += 'saturate(50%)'
    }
    if (type === 'grayscale') {
      filter += 'grayscale(100%)'
    }
    if (type === 'sepia') {
      filter += 'sepia(100%)'
    }
    if (type === 'hue-rotate') {
      filter += 'hue-rotate(50deg)'
    }
    if (type === 'invert') {
      filter += 'invert(100%)'
    }
    if (type === 'blur') {
      filter += 'blur(3px)'
    }
    if (type === 'opacity') {
      filter += 'opacity(50%)'
    }
    if (type === 'drop-shadow') {
      filter += 'drop-shadow(5px 5px 10px #666)'
    }
    this.onChange(filter, 'filter')
  }

  changeFilter(value, type) {
    let filter = this.props.element.style.filter
    if (type === 'brightness') {
      filter = filter.replace(/brightness\(\d+%\)/, `brightness(${value}%)`)
    }
    if (type === 'contrast') {
      filter = filter.replace(/contrast\(\d+%\)/, `contrast(${value}%)`)
    }
    if (type === 'saturate') {
      filter = filter.replace(/saturate\(\d+%\)/, `saturate(${value}%)`)
    }
    if (type === 'grayscale') {
      filter = filter.replace(/grayscale\(\d+%\)/, `grayscale(${value}%)`)
    }
    if (type === 'sepia') {
      filter = filter.replace(/sepia\(\d+%\)/, `sepia(${value}%)`)
    }
    if (type === 'hue-rotate') {
      filter = filter.replace(/hue-rotate\(\d+deg\)/, `hue-rotate(${value}deg)`)
    }
    if (type === 'invert') {
      filter = filter.replace(/invert\(\d+%\)/, `invert(${value}%)`)
    }
    if (type === 'blur') {
      filter = filter.replace(/blur\(\d+px\)/, `blur(${value}%)`)
    }
    if (type === 'opacity') {
      filter = filter.replace(/opacity\(\d+%\)/, `opacity(${value}%)`)
    }
    if (type === 'drop-shadow') {
      filter = filter.replace(/drop-shadow\(\d+\)/, `drop-shadow(${value})`)
    }
    this.onChange(filter, 'filter')
  }

  removeFilter(type) {
    let filter = this.props.element.style.filter
    if (type === 'brightness') {
      filter = filter.replace(/brightness\(\d+%\)/, '')
    }
    if (type === 'contrast') {
      filter = filter.replace(/contrast\(\d+%\)/, '')
    }
    if (type === 'saturate') {
      filter = filter.replace(/saturate\(\d+%\)/, '')
    }
    if (type === 'grayscale') {
      filter = filter.replace(/grayscale\(\d+%\)/, '')
    }
    if (type === 'sepia') {
      filter = filter.replace(/sepia\(\d+%\)/, '')
    }
    if (type === 'hue-rotate') {
      filter = filter.replace(/hue-rotate\(\d+deg\)/, '')
    }
    if (type === 'invert') {
      filter = filter.replace(/invert\(\d+%\)/, '')
    }
    if (type === 'blur') {
      filter = filter.replace(/blur\(\d+px\)/, '')
    }
    if (type === 'opacity') {
      filter = filter.replace(/opacity\(\d+%\)/, '')
    }
    if (type === 'drop-shadow') {
      filter = filter.replace(/drop-shadow\(\d+\)/, '')
    }
    this.onChange(filter, 'filter')
  }

  render() {
    const { x, y, width, height, element, item } = this.props

    const rotateX = parseInt((/\d+/.exec((element.style.transform.match(/rotateX\(\d+deg\)/) || [])[0]) || [])[0]) || 0
    const rotateY = parseInt((/\d+/.exec((element.style.transform.match(/rotateY\(\d+deg\)/) || [])[0]) || [])[0]) || 0
    const rotateZ = parseInt((/\d+/.exec((element.style.transform.match(/rotateZ\(\d+deg\)/) || [])[0]) || [])[0]) || 0

    let color = element.style.color || '#000000'
    let backgroundColor = element.style.backgroundColor || '#ffffff'
    if (item.type === 'text') {
      const rgbColor = ((element.style.color.match(/\d+,\s*\d+,\s*\d+/) || [])[0] || '').split(',').map(c => parseInt(c.trim()))
      if (rgbColor.length === 3) {
        color = '#' + rgbColor.map(value => ('0' + value.toString(16)).slice(-2)).join('')
      }
      const rgbBgColor = ((element.style.backgroundColor.match(/\d+,\s*\d+,\s*\d+/) || [])[0] || '').split(',').map(c => parseInt(c.trim()))
      if (rgbBgColor.length === 3) {
        backgroundColor = '#' + rgbBgColor.map(value => ('0' + value.toString(16)).slice(-2)).join('')
      }
    }

    const filters = []
    if (item.type === 'image') {
      const filterStrs = element.style.filter.split(' ') || []
      for (let filter of filterStrs) {
        const brightness = (filter.match(/brightness\(\d+%\)/) || [])[0]
        const contrast = (filter.match(/contrast\(\d+%\)/) || [])[0]
        const saturate = (filter.match(/saturate\(\d+%\)/) || [])[0]
        const grayscale = (filter.match(/grayscale\(\d+%\)/) || [])[0]
        const sepia = (filter.match(/sepia\(\d+%\)/) || [])[0]
        const hueRotate = (filter.match(/hue-rotate\(\d+deg\)/) || [])[0]
        const invert = (filter.match(/invert\(\d+%\)/) || [])[0]
        const blur = (filter.match(/blur\(\d+px\)/) || [])[0]
        const opacity = (filter.match(/opacity\(\d+%\)/) || [])[0]
        const dropShadow = (filter.match(/drop-shadow\(\.*\)/) || [])[0]

        if (brightness) {
          filters.push({type: 'brightness', value: (/\d+/.exec(brightness) || [])[0]})
        }
        if (contrast) {
          filters.push({type: 'contrast', value: (/\d+/.exec(contrast) || [])[0]})
        }
        if (saturate) {
          filters.push({type: 'saturate', value: (/\d+/.exec(saturate) || [])[0]})
        }
        if (grayscale) {
          filters.push({type: 'grayscale', value: (/\d+/.exec(grayscale) || [])[0]})
        }
        if (sepia) {
          filters.push({type: 'sepia', value: (/\d+/.exec(sepia) || [])[0]})
        }
        if (hueRotate) {
          filters.push({type: 'hue-rotate', value: (/\d+/.exec(hueRotate) || [])[0]})
        }
        if (invert) {
          filters.push({type: 'invert', value: (/\d+/.exec(invert) || [])[0]})
        }
        if (blur) {
          filters.push({type: 'blur', value: (/\d+/.exec(blur) || [])[0]})
        }
        if (opacity) {
          filters.push({type: 'opacity', value: (/\d+/.exec(opacity) || [])[0]})
        }
        if (dropShadow) {
          filters.push({type: 'drop-shadow', value: (/\d+/.exec(dropShadow) || [])[0]})
        }
      }
    }

    const styles = {
      input: {
        width: 50,
      },
    }

    return (
      <div>
        <div>
          <div style={{display: 'flex'}}>
            <div style={{width: 100}}>x:{parseInt(x)}</div>
            <div style={{width: 100}}>y:{parseInt(y)}</div>
          </div>
          <div style={{display: 'flex'}}>
            <div style={{width: 100}}>width:{parseInt(width)}</div>
            <div style={{width: 100}}>height:{parseInt(height)}</div>
          </div>
        </div>
        <div>
          <label>
            回転x:
            <input
              style={styles.input}
              type='number'
              value={rotateX}
              onChange={(e) => this.onChange(this.createTransform(e.target.value, rotateY, rotateZ), 'transform')} />
            y:
            <input
              style={styles.input}
              type='number'
              value={rotateY}
              onChange={(e) => this.onChange(this.createTransform(rotateX, e.target.value, rotateZ), 'transform')} />
            z:
            <input
              style={styles.input}
              type='number'
              value={rotateZ}
              onChange={(e) => this.onChange(this.createTransform(rotateX, rotateY, e.target.value), 'transform')} />
          </label>
        </div>
        <div>
          <label>
            zIndex:
            <input
              style={styles.input}
              type='number'
              value={parseInt(item.zIndex) || 0}
              onChange={(e) => this.onChangeAttr(e.target.value, 'zIndex')} />
          </label>
        </div>
        {item.type === 'text' &&
          <>
            <div>
              <label>
                テキスト:
                <input
                  type='text'
                  value={item.text}
                  onChange={(e) => this.onChangeAttr(e.target.value, 'text')} />
              </label>
            </div>
            <div>
              <label>
                フォントサイズ:
                <input
                  style={styles.input}
                  type='number'
                  value={(element.style.fontSize || '16').replace('px', '')}
                  onChange={(e) => this.onChange(`${e.target.value}px`, 'fontSize')} />
              </label>
            </div>
            <div>
              <label>
                書式:
                <select value={element.style.fontFamily} onChange={(e) => this.onChange(e.target.value, 'fontFamily')}>
                  {fonts.map((font) => <option key={font.type} value={font.type}>{font.name}</option>)}
                </select>
              </label>
            </div>
            <div>
              <label>
                文字色:
                <input
                  type='color'
                  value={color}
                  onChange={(e) => this.onChange(e.target.value, 'color')} />
              </label>
              <label>
                太字:
                <input type='checkbox' onChange={(e) => this.onChange(e.target.checked ? 'bold' : 'normal', 'fontWeight')} />
              </label>
              <label>
                イタリック:
                <input type='checkbox' onChange={(e) => this.onChange(e.target.checked ? 'italic' : 'normal', 'fontStyle')} />
              </label>
              <label>
                打ち消し線:
                <input type='checkbox' onChange={(e) => this.onChange(e.target.checked ? 'line-through' : 'none', 'textDecoration')} />
              </label>
            </div>
            <div>
              <label>
                背景色:
                <input
                  type='color'
                  value={backgroundColor}
                  onChange={(e) => this.onChange(e.target.value, 'backgroundColor')} />
              </label>
              <label>
                配置:
                <select onChange={(e) => this.onChange(e.target.value, 'textAlign')}>
                  {['left', 'center', 'right'].map(textAlign =>
                    <option key={textAlign} value={textAlign}>{textAlign}</option>
                  )}
                </select>
              </label>
            </div>
            <div>
              <label>
                余白上:
                <input
                  style={styles.input}
                  type='number'
                  value={(element.style.paddingTop || '0').replace('px', '')}
                  onChange={(e) => this.onChange(`${e.target.value}px`, 'paddingTop')} />
              </label>
              <label>
                下:
                <input
                  style={styles.input}
                  type='number'
                  value={(element.style.paddingBottom || '0').replace('px', '')}
                  onChange={(e) => this.onChange(`${e.target.value}px`, 'paddingBottom')} />
              </label>
              <label>
                左:
                <input
                  style={styles.input}
                  type='number'
                  value={(element.style.paddingLeft || '0').replace('px', '')}
                  onChange={(e) => this.onChange(`${e.target.value}px`, 'paddingLeft')} />
              </label>
              <label>
                右：
                <input
                  style={styles.input}
                  type='number'
                  value={(element.style.paddingRight || '0').replace('px', '')}
                  onChange={(e) => this.onChange(`${e.target.value}px`, 'paddingRight')} />
              </label>
            </div>
            <div>
              <label>
                角丸左上:
                <input
                  style={styles.input}
                  type='number'
                  value={(element.style.borderTopLeftRadius || '0').replace('px', '')}
                  onChange={(e) => this.onChange(`${e.target.value}px`, 'borderTopLeftRadius')} />
              </label>
              <label>
                右上:
                <input
                  style={styles.input}
                  type='number'
                  value={(element.style.borderTopRightRadius || '0').replace('px', '')}
                  onChange={(e) => this.onChange(`${e.target.value}px`, 'borderTopRightRadius')} />
              </label>
              <label>
                左下:
                <input
                  style={styles.input}
                  type='number'
                  value={(element.style.borderBottomLeftRadius || '0').replace('px', '')}
                  onChange={(e) => this.onChange(`${e.target.value}px`, 'borderBottomLeftRadius')} />
              </label>
              <label>
                右下:
                <input
                  style={styles.input}
                  type='number'
                  value={(element.style.borderBottomRightRadius || '0').replace('px', '')}
                  onChange={(e) => this.onChange(`${e.target.value}px`, 'borderBottomRightRadius')} />
              </label>
            </div>
          </>
        }
        {item.type === 'image' &&
          <>
            <div>
              <label>
                画像ソース:
                <input type='file' accept='image/*' onChange={this.onLoadFile} />
              </label>
            </div>
            <div>
              <label>
                フィルター:
                {filters.map(filter =>
                  <span key={filter.type}>
                    {filter.type}
                    <input
                      style={styles.input}
                      type='text'
                      value={filter.value}
                      onChange={(e) => this.changeFilter(e.target.value, filter.type)} />
                    <button style={{fontWeight: 'bold'}} onClick={() => this.removeFilter(filter.type)}>☓</button>
                  </span>
                )}
                <select onChange={(e) => this.addFilter(e.target.value)}>
                  <option value='未選択'>未選択</option>
                  {['brightness', 'contrast', 'saturate', 'grayscale', 'sepia', 'hue-rotate', 'invert', 'blur', 'opacity', 'drop-shadow'].filter(f => !filters.some(fi => fi.type === f)).map(f =>
                    <option key={f} value={f}>{f}</option>
                  )}
                </select>
              </label>
            </div>
          </>
        }
        <button style={{background: '#ff0000', color: '#ffffff'}} onClick={() => this.props.onDelete()}>削除</button>
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
)