import { cloneDeep } from 'lodash'
import {
  GridHelper,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  Vector2,
  Vector3
} from 'three'

import {
  BOX,
  CellType,
  EMPTY,
  firstLevelDataSource,
  secondLevelDataSource,
  thirdLevelDataSource,
  WALL
} from '@/common/constants'
import theme from '@/common/theme'

import ElementManager from '../element-manager'
import SceneRenderManager from '../scene-render-manager'
import ThreeConfettiMulticolored from '../three-confetti-multicolored'

export type MoveDirection = 'up' | 'down' | 'left' | 'right'

const DIRECTIONS: Record<MoveDirection, Vector3> = {
  up: new Vector3(0, 0, -1),
  down: new Vector3(0, 0, 1),
  left: new Vector3(-1, 0, 0),
  right: new Vector3(1, 0, 0)
}

const KEY_DIRECTIONS: Record<string, MoveDirection> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right'
}

export default class GameSceneCreator {
  private scene: THREE.Scene
  private gridSize: Vector2
  private level: number
  private isPlaying: boolean
  private elementManager: ElementManager
  private sceneRenderManager: SceneRenderManager

  constructor(scene: Scene, gridSize: Vector2) {
    this.scene = scene
    this.gridSize = gridSize
    this.level = 1
    this.isPlaying = true
    this.elementManager = new ElementManager(
      scene,
      cloneDeep(firstLevelDataSource)
    )
    this.sceneRenderManager = new SceneRenderManager(
      scene,
      this.level,
      this.gridSize,
      this.elementManager
    )
    this.bindRefreshEvent()
  }

  public render() {
    this.createScenePlane()
    this.createGridHelper()
    this.sceneRenderManager.render()
    this.bindKeyboardEvent()
  }

  /**
   * 创建场景平面
   */
  private createScenePlane() {
    const { x, y } = this.gridSize
    const planeGeometry = new PlaneGeometry(x * 50, y * 50)
    planeGeometry.rotateX(-Math.PI * 0.5)
    const planMaterial = new MeshStandardMaterial({ color: theme.groundColor })
    const plane = new Mesh(planeGeometry, planMaterial)
    plane.position.x = x / 2 - 0.5
    plane.position.z = y / 2 - 0.5
    plane.position.y = -0.5
    plane.receiveShadow = true
    this.scene.add(plane)
  }

  /**
   * 创建网格辅助
   */
  private createGridHelper() {
    const gridHelper = new GridHelper(
      this.gridSize.x,
      this.gridSize.y,
      0xffffff,
      0xffffff
    )
    gridHelper.position.set(
      this.gridSize.x / 2 - 0.5,
      -0.49,
      this.gridSize.y / 2 - 0.5
    )
    const gridMaterial = gridHelper.material as MeshStandardMaterial
    gridMaterial.transparent = true
    gridMaterial.opacity = 0.3
    this.scene.add(gridHelper)
  }

  /**
   * 绑定键盘事件（WASD / 方向键）
   */
  private bindKeyboardEvent() {
    window.addEventListener('keyup', (event: KeyboardEvent) => {
      const direction = KEY_DIRECTIONS[event.code]

      if (!direction) return

      event.preventDefault()
      this.move(direction)
    })
  }

  /**
   * 移动玩家：键盘、滑动手势、屏幕方向键共用这一处逻辑
   */
  public move(direction: MoveDirection) {
    if (!this.isPlaying) return

    const vector = DIRECTIONS[direction]
    const playerPos = this.elementManager.playerPos
    const nextPos = playerPos.clone().add(vector)
    const nextTwoPos = nextPos.clone().add(vector)
    const nextElement = this.cellAt(nextPos)
    const nextTwoElement = this.cellAt(nextTwoPos)

    const mesh = this.sceneRenderManager.playerMesh
    mesh.lookAt(mesh.position.clone().add(vector))

    if (nextElement === EMPTY) {
      this.elementManager.movePlayer(nextPos)
    } else if (nextElement === BOX) {
      if (nextTwoElement === WALL || nextTwoElement === BOX) return
      this.elementManager.moveBox(nextPos, nextTwoPos)
      this.elementManager.movePlayer(nextPos)
    } else {
      // 撞墙或者越界，站着不动
      return
    }

    // 如果每一个箱子都在目标点上，那么游戏结束
    if (this.elementManager.isGameOver()) {
      this.isPlaying = false
      setTimeout(() => this.playFireworks(), 200)
      setTimeout(() => this.updateLevel(), 3800)
    }
  }

  /**
   * 读取格子类型，越界按墙处理（避免贴着边界滑动时索引报错）
   */
  private cellAt(position: Vector3): CellType {
    const row = this.elementManager.layout[position.z]

    if (!row) return WALL

    return row[position.x] || WALL
  }

  private playFireworks() {
    const threeConfettiMulticolored = new ThreeConfettiMulticolored(this.scene)

    for (let i = 0; i < 8; i++) {
      const position = new Vector3(
        Math.random() * this.gridSize.x,
        Math.random() * 6,
        Math.random() * this.gridSize.y
      )
      setTimeout(() => {
        threeConfettiMulticolored.animate(position)
      }, i * 400)
    }
  }

  private updateLevel() {
    const nextLevel = this.level === 1 ? 2 : this.level === 2 ? 3 : 1
    this.level = nextLevel
    const levelDataSource =
      nextLevel === 1
        ? firstLevelDataSource
        : nextLevel === 2
        ? secondLevelDataSource
        : thirdLevelDataSource
    this.sceneRenderManager.updateLevel(this.level, cloneDeep(levelDataSource))
    this.isPlaying = true
  }

  private bindRefreshEvent() {
    const refreshBtn = document.getElementById('refresh')
    refreshBtn?.addEventListener('click', () => {
      const levelDataSource =
        this.level === 1
          ? firstLevelDataSource
          : this.level === 2
          ? secondLevelDataSource
          : thirdLevelDataSource
      this.sceneRenderManager.updateLevel(
        this.level,
        cloneDeep(levelDataSource)
      )
    })
  }
}
