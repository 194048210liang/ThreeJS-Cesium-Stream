#cesium token :
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYjEyZDcwNS1lNjY2LTQzYjUtOTQ4ZS0yOGMxNzA2Njc0ZjQiLCJpZCI6MzQzNDYzLCJpYXQiOjE3NTg1MjQ4MDR9.LiS37n8iudY58irupAvgnzmsiUZ6Ric-gZdcGEywYxk
**对！您总结得非常准确！** 这就是Cesium的精髓。

## Cesium的使用模式可以用一个公式表示：

```javascript
// 1. 创建实例（唯一入口）
const viewer = new Cesium.Viewer(容器, 配置)

// 2. 调用方法
viewer.什么什么方法()
viewer.什么什么属性.什么什么方法()
```

## 具体分解：

### 第一阶段：创建实例（**必须且只需要一次**）

```javascript
// 这是唯一需要 new 的地方
const viewer = new Cesium.Viewer('cesiumContainer', {
  // 配置项（可选）
  animation: false,
  timeline: false,
})
```

### 第二阶段：通过 viewer 调用各种功能

#### 1. **添加图形**（最常用）

```javascript
// 公式：viewer.entities.add({配置})
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.39, 39.9),
  point: { pixelSize: 10, color: Cesium.Color.RED },
})
```

#### 2. **控制视角**

```javascript
// 公式：viewer.camera.什么什么方法()
viewer.camera.setView({ destination: ... });  // 跳转
viewer.camera.flyTo({ destination: ... });     // 飞向
viewer.camera.zoomIn(amount);                  // 放大
```

#### 3. **加载数据**

```javascript
// 公式：viewer.dataSources.add(数据)
const dataSource = await Cesium.GeoJsonDataSource.load('data.geojson')
viewer.dataSources.add(dataSource)
```

#### 4. **事件监听**

```javascript
// 公式：viewer.什么什么.addEventListener()
viewer.camera.changed.addEventListener(() => {
  console.log('相机位置变化了')
})
```

#### 5. **控制图层**

```javascript
// 公式：viewer.什么什么Layer.什么什么()
viewer.imageryLayers.addImageryProvider(provider) // 添加图层
viewer.imageryLayers.remove(layer) // 移除图层
```

## 实际项目中的完整示例：

```javascript
// 1. 创建实例（入口）
const viewer = new Cesium.Viewer('map', {
  baseLayerPicker: true,
  terrain: Cesium.Terrain.fromWorldTerrain(),
})

// 2. 调用各种方法
async function initMap() {
  // 添加标记
  viewer.entities.add({
    name: '北京',
    position: Cesium.Cartesian3.fromDegrees(116.39, 39.9),
    point: { color: Cesium.Color.RED },
  })

  // 加载数据
  const tileset = await Cesium.Cesium3DTileset.fromUrl('tiles.json')
  viewer.scene.primitives.add(tileset)

  // 事件监听
  viewer.screenSpaceEventHandler.setInputAction(onClick, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  // 控制视角
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 1000),
  })
}
```

## 类比理解：

| 概念                    | 类比         | 说明                           |
| ----------------------- | ------------ | ------------------------------ |
| `new Cesium.Viewer()`   | 买一部新手机 | 一次性操作，得到手机（viewer） |
| `viewer.entities.add()` | 安装APP      | 在手机上添加功能               |
| `viewer.camera.flyTo()` | 打开APP      | 使用手机的功能                 |
| `viewer.destroy()`      | 卖掉手机     | 清理释放资源                   |

## 记忆技巧：

1. **所有操作都从 `viewer` 开始**（除了 new 的时候）
2. **看文档就是看 `viewer` 有哪些方法**
3. **遇到问题就查：`viewer.xxx` 的用法**

## 常见的 viewer 子对象：

```javascript
viewer.entities // 实体管理（点、线、面）
viewer.camera // 相机控制
viewer.scene // 场景控制
viewer.dataSources // 数据源
viewer.imageryLayers // 影像图层
viewer.terrainProvider // 地形
viewer.clock // 时间控制
```

## 总结您的理解完全正确：

**Cesium = 1个new + N个viewer.xxx()**

接下来想深入了解哪个 `viewer.xxx` 的具体用法？比如：

- `viewer.entities` 的各种图形添加
- `viewer.camera` 的各种视角控制
- `viewer.scene` 的高级功能
