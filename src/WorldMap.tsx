import React, { useState, useLayoutEffect } from "react"
import { geoMercator, geoPath } from "d3-geo"
import geoData from "./countries.geo"
import { PathTooltip } from "react-path-tooltip"
import { PathMarker } from "react-path-marker"

const CDefaultColor = "#dddddd"

interface IData {
  country: string,
  value: number
}

interface ICountryContext {
  country: string,
  countryValue: number,
  color: string,
  minValue: number,
  maxValue: number
}

interface IProps {
  data: IData[],
  title?: string,
  valuePrefix?: string,
  valueSuffix?: string,
  color?: string,
  tooltipBgColor?: string,
  tooltipTextColor?: string,
  size?: string, // possile values are sm, md, lg
  frame?: boolean,
  frameColor?: string,
  type?: string,
  styleFunction?: (context: ICountryContext) => {},
  borderColor?: string
}

const CSizes: { [key: string]: number } = {
  "sm": 240,
  "md": 336,
  "lg": 480,
  "xl": 640
}

const CHeightRatio = 3 / 4

export const WorldMap: React.FC<IProps> = (props) => {

  //calculate window width
  const updateWindowWidth = () => {
    const [width, setWidth] = useState(0);
    useLayoutEffect(() => {
      const updateWidth = () => {
        setWidth(window.innerWidth);
      }
      window.addEventListener('resize', updateWidth);
      updateWidth();
      return () => window.removeEventListener('resize', updateWidth);
    }, []);
    return width;
  }
  const windowWidth = updateWindowWidth()

  //get input size
  const size = typeof (props.size) !== "undefined" ? props.size : "sm"

  //adjust responsive size
  const responsify = (size: string) => {
    let realSize = size
    while (CSizes[realSize] > windowWidth) {
      if (realSize == "sm") {
        return CSizes["sm"]
      }
      if (realSize === "md") {
        realSize = "sm"
      }
      else if (realSize === "lg") {
        realSize = "md"
      }
      else {
        realSize = "lg"
      }
    }
    return CSizes[realSize]
  }

  //inits
  const width = responsify(size)
  const height = responsify(size) * CHeightRatio
  const valuePrefix = (typeof (props.valuePrefix) === "undefined") ? "" : props.valuePrefix
  const valueSuffix = (typeof (props.valueSuffix) === "undefined") ? "" : props.valueSuffix
  const tooltipBgColor = (typeof (props.tooltipBgColor) === "undefined") ? "black" : props.tooltipBgColor
  const tooltipTextColor = (typeof (props.tooltipTextColor) === "undefined") ? "white" : props.tooltipTextColor
  const isFrame = (typeof (props.frame) === "undefined") ? false : props.frame
  const frameColor = (typeof (props.frameColor) === "undefined") ? "black" : props.frameColor
  const borderColor = (typeof (props.borderColor) === "undefined") ? "black" : props.borderColor
  const frame = isFrame ? <rect x={0} y={0} width={"100%"} height={"100%"} stroke={frameColor} fill="none" /> : <path></path>
  const title = (typeof (props.title) === "undefined") ? "" : <p>{props.title}</p>
  const scale = 0.5 / 480 * width
  const transformPaths = "scale(" + scale.toString() + ") translate (0,240)"

  const containerRef = React.createRef<SVGSVGElement>();

  const defaultCountryStyle = (context : ICountryContext) => {
    const contextCountryValue = context.countryValue ? context.countryValue : 0
    const opacityLevel = 0.2 + (0.6 * (contextCountryValue - context.minValue) / (context.maxValue - context.minValue))
    const style={ fill: context.color, fillOpacity: contextCountryValue === 0 ? contextCountryValue : opacityLevel, stroke: borderColor, strokeWidth: 1, strokeOpacity: 0.2, cursor: "pointer" }
    return style;
  }

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

  // Build a path & a tooltip for each country
  const projection = geoMercator()
  const pathGenerator = geoPath().projection(projection)

  const pathsAndToolstips = geoData.features.map((feature, idx) => {

    const triggerRef = React.createRef<SVGPathElement>();
    const isoCode = feature.properties.ISO_A2 === "US_child_path" ? "US" : feature.properties.ISO_A2 === "RU_child_path" ? "RU" : feature.properties.ISO_A2 === "FR_child_path" ? "FR" : feature.properties.ISO_A2 === "NO_child_path" ? "NO" : feature.properties.ISO_A2
    const countryName = feature.properties.ISO_A2 === "US_child_path" ? "United States" : feature.properties.ISO_A2 === "RU_child_path" ? "Russia" : feature.properties.ISO_A2 === "FR_child_path" ? "France" : feature.properties.ISO_A2 === "NO_child_path" ? "Norway" : feature.properties.NAME
    const isHighlight = typeof (countryValueMap[isoCode]) != "undefined"
    const style = props.styleFunction && isHighlight ? props.styleFunction({country: isoCode, countryValue: countryValueMap[isoCode], color: props.color ? props.color : CDefaultColor, minValue: min, maxValue: max}) : defaultCountryStyle({country: isoCode, countryValue: countryValueMap[isoCode], color: props.color ? props.color : CDefaultColor, minValue: min, maxValue: max})

    const path = <path
      key={"path" + idx}
      ref={triggerRef}
      d={pathGenerator(feature as GeoJSON.Feature) as string}
      style={style}
      onMouseOver={(event) => { event.currentTarget.style.strokeWidth = "2"; event.currentTarget.style.strokeOpacity = "0.5" }}
      onMouseOut={(event) => { event.currentTarget.style.strokeWidth = "1"; event.currentTarget.style.strokeOpacity = "0.2" }}
    />

    const marker = (typeof (countryValueMap[feature.properties.ISO_A2]) === "undefined") ? <g key={"path" + idx}></g>
    :
    <PathMarker 
        fontSize={12}
        bgColor={tooltipBgColor}
        textColor={tooltipBgColor}
        key={"path" + idx}
        pathRef={triggerRef}
        svgRef={containerRef}
        tooltipTextColor={tooltipTextColor}
        tooltipBgColor={tooltipBgColor}
        smallText={isoCode}
        bigText={countryName + " " + valuePrefix + " " + countryValueMap[isoCode].toLocaleString() + " " + valueSuffix}
    />

    const tooltip = (!isHighlight) ? <g key={"path" + idx}></g> :
      <PathTooltip
      fontSize={12}
      bgColor={tooltipBgColor}
      textColor={tooltipTextColor}
      key={"path" + idx}
      pathRef={triggerRef}
      svgRef={containerRef}
      tip={countryName + " " + valuePrefix + " " + countryValueMap[isoCode].toLocaleString() + " " + valueSuffix}
      />

    return { "path": path, "highlightedMarkerOrTooltip": props.type === "marker" ? marker : tooltip }
  })

  // build paths
  const paths = pathsAndToolstips.map(entry => {
    return entry.path
  })

  // build tooltips
  const markersOrTooltips = pathsAndToolstips.map(entry => {
    return entry.highlightedMarkerOrTooltip
  })

  // Render the SVG
  return (
    <div style={{ backgroundColor: "white", height: "auto", width: "auto", padding: "0px", margin: "0px" }}>
      {title}
      <svg ref={containerRef} height={height + "px"} width={width + "px"}>
        {frame}
        <g transform={transformPaths}>
          {paths}
        </g>
        {markersOrTooltips}
      </svg>
    </div>
  )
}