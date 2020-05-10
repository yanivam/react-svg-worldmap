import React from "react"
import { geoMercator, geoPath } from "d3-geo"
import geoData from "./countries.geo"
import { PathTooltip } from "react-path-tooltip"

const CDefaultColor = "#dddddd"

interface IData {
  country: string,
  value: number
}

interface IProps {
  data: IData[],
  title?: string,
  "value-prefix"?: string,
  "value-suffix"?: string,
  color?: string,
  tooltipBgColor?: string,
  tooltipTextColor?: string,
  size?: string // possile values are sm, md, lg
}

const CSizes: { [key: string]: number } = {
  "sm": 240,
  "md": 336,
  "lg": 480,
}

const CViewBox = "0 -200 960 760"
const CHeightRatio = 5/6

export const WorldMap: React.FC<IProps> = (props) => {

  // Inits
  const size = typeof (props.size) !== "undefined" ? props.size : "xs"
  const width = CSizes[size]
  const height = CSizes[size] * CHeightRatio
  const valuePrefix = (typeof(props["value-prefix"])==="undefined") ? "" : props["value-prefix"]
  const valueSuffix = (typeof(props["value-suffix"])==="undefined") ? "" : props["value-suffix"]
  const tooltipBgColor = (typeof(props.tooltipBgColor)==="undefined") ? "black" : props.tooltipBgColor
  const tooltipTextColor = (typeof(props.tooltipTextColor)==="undefined") ? "white" : props.tooltipTextColor
  const title = (typeof(props.title)==="undefined") ? "" : <p>{props.title}</p>

  const containerRef = React.createRef<SVGSVGElement>();

  // Calc min/max values and build country map for direct access
  const countryValueMap: { [key: string]: number } = {}
  let max: number = -Infinity
  let min: number = Infinity
  props.data.forEach(entry => {
    const key = entry["country"].toUpperCase()
    const value = entry.value
    min = (min > value) ? value : min
    max = (max < value) ? value : max
    countryValueMap[key] = value
  })

  // Build path for each country
  const projection = geoMercator()
  const pathGenerator = geoPath().projection(projection)

  const countriesPath = geoData.features
    .map((feature, idx) => {
      const triggerRef = React.createRef<SVGPathElement>();
      const isHighlight = typeof (countryValueMap[feature.properties.ISO_A2]) != "undefined"
      let color: string = CDefaultColor
      let opacityLevel = 0.1

      // Things to do if country is in data
      if (isHighlight) {
        color = props.color ? props.color : CDefaultColor
        opacityLevel += (0.9 * (countryValueMap[feature.properties.ISO_A2] - min) / (max - min))
      }
      
      const tooltip = (!isHighlight) ? "" :
        <PathTooltip fontSize={24} bgColor={tooltipBgColor} textColor={tooltipTextColor} pathRef={triggerRef} svgRef={containerRef} tip={feature.properties.NAME + " " + valuePrefix + " " + countryValueMap[feature.properties.ISO_A2].toLocaleString() + " " + valueSuffix} />

      // Build a path for a country
      const path = (
        <g key={feature.properties.NAME}>
          <path
            key={"path" + idx}
            ref={triggerRef}
            d={pathGenerator(feature as GeoJSON.Feature) as string}
            style={{ fill: color, fillOpacity: opacityLevel, stroke: "black", strokeWidth: 1, strokeOpacity: 0.1, cursor: "pointer" }}
          />
          {tooltip}
        </g>
      )
      return path
    })

  // Render the SVG
  return (
    <div style={{backgroundColor: "white", height: "auto", width: "auto", padding: "0px", margin: "0px"}}>
      {title}
      <svg ref={containerRef} height={height + "px"} width={width + "px"} viewBox={CViewBox}>
        {countriesPath}
      </svg>
    </div>
  )
}
