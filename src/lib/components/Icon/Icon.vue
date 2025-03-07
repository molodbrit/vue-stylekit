<template>
  <div
    :class="iconClassName"
    :style="iconStyle"
  >
    <svgicon
      v-if="iconPath"
      ref="iconSvg"
      :name="iconName"
      width="100%"
      height="100%"
      :original="true"
    />

    <div
      v-if="caption && isSpeedIcon"
      class="icon-speed__spinned-arrow"
    >
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        class="spinned-circle"
        transform-origin="center"
        :style="{ padding: '8px', transform: 'rotateZ(-70deg)' }"
      >
        <circle
          stroke-dasharray="300%"
          r="50%"
          cx="50%"
          cy="50%"
          fill="transparent"
          :style="{ strokeDashoffset: `${speedProgress().circle}%` }"
        ></circle>
      </svg>
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        class="spinned-arrow"
        transform-origin="center"
        :style="{ padding: '1px', transform: `rotateZ(${speedProgress().arrow}deg)` }"
      >
        <path
          stroke-width="1"
          fill="none"
          d="M29.9 50.3l-4.5-4 4-4.5"
        ></path>
      </svg>
    </div>

    <img
      v-if="!iconPath && image"
      :src="image"
      width="100%"
      height="100%"
      style="border: none;"
    />

    <svg
      v-if="value"
      class="rt-icon__value"
      width="100%" height="100%" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"
      :style="{
        fill: color,
        stroke: 'transparent'
      }"
    >
      <text x="15" y="20" v-html="value" text-anchor="middle"></text>
    </svg>

    <span
      v-if="caption"
      class="caption top"
      v-html="caption"
      :style="{background: iconCaptionColor}"
    ></span>
  </div>
</template>

<script>
import axios from 'axios/index'
import colors from "../../color.json";
import defaultValues from '../../defaultIconsSize.json';

const arrKey = 'RTK_ICONS'

export default {
  name: "RtIcon",
  data: function() {
    return {
      iconPath: null,
      iconCaptionColor: null
    }
  },
  props: {
    type: {
      type: String,
      default: "default"
    },
    image: {
      type: String,
      default: null
    },
    candy: {
      type: Boolean,
      default: false
    },
    caption: {},
    size: {},
    width: {
      type: String,
      default: '55px'
    },
    height: {
      type: String,
      default: '55px'
    },
    bg: {
      type: String,
      default: null
    },
    color: {
      type: String,
      default: null
    },
    captionColor: {
      type: String,
      default: null
    },
    value: {
      type: String,
      default: null
    }
  },
  computed: {
    classCandy() {
      return this.candy ? ' wc-icon wc-candy-icon' : ''
    },
    iconClassName() {
      return 'rt-icon ' + 'rt-icon__' + this.type + this.classCandy
    },
    iconName() {
      return this.type !== 'default' ? this.type : null
    },
    iconStyle() {
      const styles = {}
      styles.background = this.bg ? this.bg : (defaultValues[this.type] ? defaultValues[this.type].bg : null)
      styles.fill = this.fill ? this.fill : (defaultValues[this.type] ? defaultValues[this.type].fill : null)
      styles.stroke = this.color ? this.color : (defaultValues[this.type] ? defaultValues[this.type].color : null)
      if (this.size) {
        styles.width = `${this.size}px`
        styles.height = `${this.size}px`
      } else {
        styles.width = (this.width) ? this.width : (defaultValues[this.type] ? defaultValues[this.type].width : null)
        styles.height = (this.height) ? this.height : (defaultValues[this.type] ? defaultValues[this.type].height : null)
      }
      return styles
    },
    isSpeedIcon() {
      return [
        'icon_403',
        'icon_404',
        'icon_405',
        'icon_406',
        'INTERNET_SPEED_0'
      ].indexOf(this.type) > -1 && !isNaN(parseInt(this.caption, 10))
    }
  },
  methods: {
    fillCaption() {
      if (this.captionColor) {
        this.iconCaptionColor = this.captionColor
      } else if (!this.candy) {
        var el = this.$el
        var firstPath = el && typeof el.firstChild === 'function' && el.firstChild.querySelector('[pid="0"]')
        if (firstPath && firstPath.getAttribute('fill')) {
          this.iconCaptionColor = this.$el.querySelector('[pid="0"]').getAttribute('fill')
        } else {
          this.iconCaptionColor = defaultValues.default.captionColor
        }
      }
    },
    isUniqueIcon() {
      return window[arrKey] && typeof window[arrKey][this.iconName] === 'undefined'
    },
    getPath() {
      var name = this.iconName
      var base_path = window.RTK_STYLE && window.RTK_STYLE.base_path ? window.RTK_STYLE.base_path : '';
      var icons_path = window.RTK_STYLE && window.RTK_STYLE.icons_path ? window.RTK_STYLE.icons_path : 'https://cryingjoker.github.io/vue-stylekit/static/icons/';
      if (name) {
        window[arrKey][name] = {}
        return axios.request({
          url: `${base_path}${icons_path}${name}.js`,
        }).then(r => {
          var rIcon = eval(r.data)
          if (rIcon && rIcon[0][name]) {
            window[arrKey][name] = rIcon[0][name]
            this.setPath()
          }
        })
      } else {
        this.fillCaption()
      }
    },
    setPath() {
      let pathSource = window[arrKey][this.iconName]
      var icon = require('vue-svgicon')
      var arr = {}
      arr[this.iconName] = pathSource
      icon.register(arr)
      this.iconPath = true
      this.$nextTick(function(){
        this.fillCaption()
      })
    },
    speedProgress () {
      let speed = {
        circle: null,
        arrow: null
      }
      if (this.isSpeedIcon) {
        let val = parseInt(this.caption, 10)

        let maxSpeed = 300

        // Извлекаем процентное отношение шкалы скорости
        let proc = (val > maxSpeed) ? 100 : (val * 100 / maxSpeed)

        // Собираем диапозоны позиций для круга и стрелки
        let pos = this.getActualSpeedPos()

        speed.circle = pos.circle.max - ((pos.circle.max - pos.circle.min) / 100 * proc)
        speed.arrow = pos.arrow.min + ((pos.arrow.max - pos.arrow.min) / 100 * proc)
      }
      return speed
    },
    getActualSpeedPos () {
      // @TODO - При увеличении размера иконки необходимо расчитать другие координаты
      return {
        circle: {
          min: 20,
          max: 280
        },
        arrow: { // Для стрелочки инвертированное значение позиции
          min: -134,
          max: 165
        }
      }
    }
  },
  mounted() {
    if (!window[arrKey]) window[arrKey] = {}
    // @TODO - add watcher for loaded icons
    this.getPath()
  }
};
</script>
