import type { Data } from "react-svg-worldmap";

const populationData: Data = [
  { country: "cn", value: 1389618778 }, // china
  { country: "in", value: 1311559204 }, // india
  { country: "us", value: 331883986 }, // united states
  { country: "id", value: 264935824 }, // indonesia
  { country: "br", value: 210301591 }, // brazil
  { country: "ng", value: 208679114 }, // nigeria
  { country: "ru", value: 141944641 }, // russia
  { country: "mx", value: 127318112 }, // mexico
];

const GDPData: Data = [
  { country: "cn", value: 9770.8 }, // china
  { country: "in", value: 2010.0 }, // india
  { country: "us", value: 62794.6 }, // united states
  { country: "id", value: 3893.6 }, // indonesia
  { country: "br", value: 8920.8 }, // brazil
  { country: "ng", value: 2028.2 }, // nigeria
  { country: "ru", value: 11288.9 }, // russia
  { country: "mx", value: 9673.4 }, // mexico
];

export { populationData, GDPData };
